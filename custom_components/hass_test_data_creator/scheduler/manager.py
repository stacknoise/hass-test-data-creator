"""Stores schedules and runs their actions at the planned moments (concept 6)."""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

from homeassistant.core import CALLBACK_TYPE, HomeAssistant, callback
from homeassistant.helpers.event import async_track_point_in_utc_time, async_track_time_change
from homeassistant.util import dt as dt_util

from ..audit.factory import AuditEntryFactory
from ..audit.log import AuditLog
from ..core.errors import ErrorCode, ScheduleError, TdcError
from ..core.ids import new_id
from ..model.models import DeviceDef, ScheduleDef
from ..store.store import TdcStore
from .actions import ActionFactory
from .planner import PlannedRun, SchedulePlanner
from .runner import ActionRunner
from .triggers import TriggerFactory

TARGET_KEYS = ("device", "template", "run", "all")
MIDNIGHT_SECOND = 5


class ScheduleManager:
    """Adds, removes and enables schedules and fires them with a single timer."""

    def __init__(
        self,
        hass: HomeAssistant,
        store: TdcStore,
        triggers: TriggerFactory,
        planner: SchedulePlanner,
        actions: ActionFactory,
        runner: ActionRunner,
        audit: AuditLog,
        audit_factory: AuditEntryFactory,
    ) -> None:
        """Keep the collaborators."""
        self._hass = hass
        self._store = store
        self._triggers = triggers
        self._planner = planner
        self._actions = actions
        self._runner = runner
        self._audit = audit
        self._audit_factory = audit_factory
        self._queue: list[PlannedRun] = []
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
        """Validate and store a new schedule; `data` has name, target, entity, action, trigger."""
        self._triggers.create(data["trigger"])
        if not any(data["action"] in names for names in self._actions.names().values()):
            raise ScheduleError(ErrorCode.SCH_UNKNOWN_ACTION)
        schedule = ScheduleDef(
            id=new_id(),
            name=data["name"],
            target=data["target"],
            entity=data["entity"],
            action=data["action"],
            trigger=data["trigger"],
            seed=data.get("seed", default_seed),
            created_at=dt_util.utcnow().timestamp(),
            params=data.get("params", {}),
            enabled=data.get("enabled", True),
        )
        self._store.put_schedule(schedule)
        await self._store.async_save()
        self._replan()
        return schedule

    async def async_remove(self, schedule_id: str) -> None:
        """Delete a schedule."""
        self.get(schedule_id)
        self._store.remove_schedule(schedule_id)
        await self._store.async_save()
        self._replan()

    async def async_set_enabled(self, schedule_id: str, enabled: bool) -> ScheduleDef:
        """Switch a schedule on or off."""
        schedule = self.get(schedule_id)
        schedule.enabled = enabled
        self._store.put_schedule(schedule)
        await self._store.async_save()
        self._replan()
        return schedule

    def preview(self, hours: int) -> list[dict[str, str]]:
        """Return the planned runs of the next `hours` hours with the schedule names."""
        now = dt_util.now()
        runs = self._planner.plan(self._store.schedules(), now, now + timedelta(hours=hours))
        names = {item.id: item.name for item in self._store.schedules()}
        return [
            {
                "when": run.when.isoformat(),
                "schedule_id": run.schedule_id,
                "name": names[run.schedule_id],
            }
            for run in runs
        ]

    def devices_for(self, target: dict[str, Any]) -> list[DeviceDef]:
        """Return the devices a target selects: a device, a template, a run or all."""
        devices = self._store.devices()
        if "all" in target:
            return devices
        if "device" in target:
            return [d for d in devices if target["device"] in (d.id, d.name)]
        if "template" in target:
            return [d for d in devices if d.template == target["template"]]
        return [d for d in devices if d.run_id == target.get("run")]

    def ids_targeting(self, device: DeviceDef) -> list[str]:
        """Return the ids of the schedules that target exactly this device."""
        return [
            item.id
            for item in self._store.schedules()
            if item.target.get("device") in (device.id, device.name)
        ]

    def forget(self, schedule_ids: list[str]) -> None:
        """Delete schedules without saving; the removal saves the store afterwards."""
        for schedule_id in schedule_ids:
            self._store.remove_schedule(schedule_id)
        self._replan()

    def _cancel(self) -> None:
        """Cancel the timer of the next run."""
        if self._cancel_timer:
            self._cancel_timer()
            self._cancel_timer = None

    @callback
    def _on_midnight(self, _now: datetime) -> None:
        """Plan the new day."""
        self._replan()

    def _replan(self) -> None:
        """Plan the rest of today and arm the timer for the first run."""
        self._cancel()
        now = dt_util.now()
        end = dt_util.start_of_local_day(now.date() + timedelta(days=1))
        self._queue = self._planner.plan(self._store.schedules(), now, end)
        if self._queue:
            self._cancel_timer = async_track_point_in_utc_time(
                self._hass, self._fire, dt_util.as_utc(self._queue[0].when)
            )

    async def _fire(self, now: datetime) -> None:
        """Run every planned run that is due, then arm the timer for the next one."""
        self._cancel_timer = None
        due = [run for run in self._queue if run.when <= now]
        self._queue = [run for run in self._queue if run.when > now]
        for run in due:
            await self._execute(run)
        if self._queue:
            self._cancel_timer = async_track_point_in_utc_time(
                self._hass, self._fire, dt_util.as_utc(self._queue[0].when)
            )

    async def _execute(self, run: PlannedRun) -> None:
        """Run the action of one planned run on all devices of its target."""
        schedule = self._store.schedule(run.schedule_id)
        if schedule is None or not schedule.enabled:
            return
        for device in self.devices_for(schedule.target):
            try:
                await self._runner.async_run(
                    device.id, schedule.entity, schedule.action, schedule.params
                )
            except TdcError as error:
                self._audit.record(
                    self._audit_factory.schedule_failed(
                        schedule.name, device.name, error.code.value
                    )
                )
        self._audit.record(self._audit_factory.schedule_ran(schedule.name, schedule.action))
