"""Stores schedules and runs their actions at the planned moments (concept 6)."""

from __future__ import annotations

from datetime import datetime, timedelta
import heapq
from typing import Any

from homeassistant.core import CALLBACK_TYPE, HomeAssistant, callback
from homeassistant.helpers.event import async_track_point_in_utc_time, async_track_time_change
from homeassistant.util import dt as dt_util

from ..audit.factory import AuditEntryFactory
from ..audit.log import AuditLog
from ..const import CONF_SEED, MAX_SCHEDULES
from ..core.errors import ErrorCode, GenerationError, ScheduleError, TdcError
from ..core.ids import new_id
from ..core.keys import (
    KEY_ACTION,
    KEY_ENABLED,
    KEY_ENTITY,
    KEY_NAME,
    KEY_PARAMS,
    KEY_SCENARIO,
    KEY_SCHEDULE_ID,
    KEY_TARGET,
    KEY_TRIGGER,
)
from ..core.protocols import ScenarioRunner
from ..model.models import ScheduleDef
from ..store.store import TdcStore
from .planner import PlannedRun, SchedulePlanner
from .runner import ActionRunner
from .triggers import TriggerFactory

TARGET_KEYS = ("device", "template", "run", "all")
MIDNIGHT_SECOND = 5


class ScheduleManager:
    """Adds, changes, removes and enables schedules and fires them with a single timer."""

    def __init__(
        self,
        hass: HomeAssistant,
        store: TdcStore,
        triggers: TriggerFactory,
        planner: SchedulePlanner,
        runner: ActionRunner,
        scenarios: ScenarioRunner,
        audit: AuditLog,
        audit_factory: AuditEntryFactory,
    ) -> None:
        """Keep the collaborators."""
        self._hass = hass
        self._store = store
        self._triggers = triggers
        self._planner = planner
        self._runner = runner
        self._scenarios = scenarios
        self._audit = audit
        self._audit_factory = audit_factory
        self._queue: list[PlannedRun] = []  # a heap: the next run is `_queue[0]`
        self._cancel_timer: CALLBACK_TYPE | None = None
        self._cancel_midnight: CALLBACK_TYPE | None = None

    def async_start(self) -> None:
        """Plan the rest of today, arm the timer and replan after every midnight."""
        self._cancel_midnight = async_track_time_change(
            self._hass, self._on_midnight, hour=0, minute=0, second=MIDNIGHT_SECOND
        )
        self._replan()

    def async_stop(self) -> None:
        """Cancel the timers."""
        self._cancel()
        if self._cancel_midnight:
            self._cancel_midnight()
            self._cancel_midnight = None

    def all_schedules(self) -> list[ScheduleDef]:
        """Return all schedules."""
        return self._store.schedules()

    def get(self, schedule_id: str) -> ScheduleDef:
        """Return the schedule or raise SCH_NOT_FOUND."""
        schedule = self._store.schedule(schedule_id)
        if schedule is None:
            raise ScheduleError(ErrorCode.SCH_NOT_FOUND)
        return schedule

    async def async_add(self, data: dict[str, Any], default_seed: str) -> ScheduleDef:
        """Validate and store a schedule: a scenario, or a target with entity and action."""
        if self._store.schedule_count() >= MAX_SCHEDULES:
            raise GenerationError(ErrorCode.GEN_SCHEDULE_LIMIT)
        self._triggers.create(data[KEY_TRIGGER])
        self._check_work(data)
        schedule = ScheduleDef(
            id=new_id(),
            name=data[KEY_NAME],
            target=data.get(KEY_TARGET, {}),
            entity=data.get(KEY_ENTITY, ""),
            action=data.get(KEY_ACTION, ""),
            scenario=data.get(KEY_SCENARIO),
            trigger=data[KEY_TRIGGER],
            seed=data.get(CONF_SEED, default_seed),
            created_at=dt_util.utcnow().timestamp(),
            params=data.get(KEY_PARAMS, {}),
            enabled=data.get(KEY_ENABLED, True),
        )
        self._store.put_schedule(schedule)
        await self._store.async_save()
        self._replan([schedule.id])
        return schedule

    async def async_update(self, schedule_id: str, data: dict[str, Any]) -> ScheduleDef:
        """Replace the work, trigger and name of a schedule; a wrong request changes nothing.

        The id, the creation time, the seed (unless given) and `enabled` (unless given) stay.
        """
        schedule = self.get(schedule_id)
        self._triggers.create(data[KEY_TRIGGER])
        self._check_work(data)
        schedule.name = data[KEY_NAME]
        schedule.target = data.get(KEY_TARGET, {})
        schedule.entity = data.get(KEY_ENTITY, "")
        schedule.action = data.get(KEY_ACTION, "")
        schedule.scenario = data.get(KEY_SCENARIO)
        schedule.params = data.get(KEY_PARAMS, {})
        schedule.trigger = data[KEY_TRIGGER]
        schedule.seed = data.get(CONF_SEED, schedule.seed)
        schedule.enabled = data.get(KEY_ENABLED, schedule.enabled)
        self._store.put_schedule(schedule)
        await self._store.async_save()
        self._replan([schedule.id])
        self._audit.record(self._audit_factory.schedule_changed(schedule.name))
        return schedule

    async def async_remove(self, schedule_id: str) -> None:
        """Delete a schedule."""
        self.get(schedule_id)
        self._store.remove_schedule(schedule_id)
        await self._store.async_save()
        self._replan([schedule_id])

    async def async_set_enabled(self, schedule_id: str, enabled: bool) -> ScheduleDef:
        """Switch a schedule on or off."""
        schedule = self.get(schedule_id)
        schedule.enabled = enabled
        self._store.put_schedule(schedule)
        await self._store.async_save()
        self._replan([schedule_id])
        return schedule

    def preview(self, hours: int) -> list[dict[str, str]]:
        """Return the planned runs of the next `hours` hours with the schedule names."""
        now = dt_util.now()
        runs = self._planner.plan(self._store.schedules(), now, now + timedelta(hours=hours))
        names = {item.id: item.name for item in self._store.schedules()}
        return [
            {
                "when": run.when.isoformat(),
                KEY_SCHEDULE_ID: run.schedule_id,
                KEY_NAME: names[run.schedule_id],
            }
            for run in runs
        ]

    def _check_work(self, data: dict[str, Any]) -> None:
        """Raise unless `data` names an existing scenario or a target with a known action.

        The entity is optional: without one the action runs on every entity that can do it.
        """
        if data.get(KEY_SCENARIO) is not None:
            self._scenarios.get(data[KEY_SCENARIO])
        elif not all(key in data for key in (KEY_TARGET, KEY_ACTION)):
            raise ScheduleError(ErrorCode.SCH_INVALID_PARAMS)
        elif not any(data[KEY_ACTION] in names for names in self._runner.actions().values()):
            raise ScheduleError(ErrorCode.SCH_UNKNOWN_ACTION)

    def forget(self, schedule_ids: list[str]) -> None:
        """Delete schedules without saving; the removal saves the store afterwards."""
        for schedule_id in schedule_ids:
            self._store.remove_schedule(schedule_id)
        self._replan(schedule_ids)

    def _cancel(self) -> None:
        """Cancel the timer of the next run."""
        if self._cancel_timer:
            self._cancel_timer()
            self._cancel_timer = None

    @callback
    def _on_midnight(self, _now: datetime) -> None:
        """Plan the new day."""
        self._replan()

    def _replan(self, schedule_ids: list[str] | None = None) -> None:
        """Plan the rest of today for all schedules, or only for `schedule_ids`, and arm the timer."""
        self._cancel()
        now = dt_util.now()
        end = dt_util.start_of_local_day(now.date() + timedelta(days=1))
        if schedule_ids is None:
            self._queue = []
            schedules = self._store.schedules()
        else:
            changed = set(schedule_ids)
            self._queue = [run for run in self._queue if run.schedule_id not in changed]
            heapq.heapify(self._queue)
            found = (self._store.schedule(item) for item in schedule_ids)
            schedules = [item for item in found if item is not None]
        for run in self._planner.plan(schedules, now, end):
            heapq.heappush(self._queue, run)
        self._arm()

    def _arm(self) -> None:
        """Arm the timer for the first planned run, if there is one."""
        if self._queue:
            self._cancel_timer = async_track_point_in_utc_time(
                self._hass, self._fire, dt_util.as_utc(self._queue[0].when)
            )

    async def _fire(self, now: datetime) -> None:
        """Run every planned run that is due, then arm the timer for the next one."""
        self._cancel_timer = None
        due: list[PlannedRun] = []
        while self._queue and self._queue[0].when <= now:
            due.append(heapq.heappop(self._queue))
        try:
            for run in due:
                await self._execute(run)
        finally:
            self._arm()

    async def _execute(self, run: PlannedRun) -> None:
        """Run the action of one planned run on all devices of its target."""
        schedule = self._store.schedule(run.schedule_id)
        if schedule is None or not schedule.enabled:
            return
        if schedule.scenario is not None:
            await self._run_scenario(schedule)
        else:
            await self._runner.async_run_on(
                self._runner.devices_for(schedule.target),
                schedule.entity,
                schedule.action,
                schedule.params,
                schedule.name,
            )
        self._audit.record(
            self._audit_factory.schedule_ran(schedule.name, schedule.action or KEY_SCENARIO)
        )

    async def _run_scenario(self, schedule: ScheduleDef) -> None:
        """Start the scenario of a schedule; a missing scenario is logged."""
        try:
            await self._scenarios.async_run(schedule.scenario or "")
        except TdcError as error:
            self._audit.record(
                self._audit_factory.schedule_failed(schedule.name, "-", error.code.value)
            )
