"""Stores scenarios and runs their steps one after the other (concept 6.2)."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from homeassistant.core import CALLBACK_TYPE, HomeAssistant
from homeassistant.helpers.event import async_call_later
from homeassistant.util import dt as dt_util

from ..audit.factory import AuditEntryFactory
from ..audit.log import AuditLog
from ..core.errors import ErrorCode, ScheduleError
from ..core.ids import new_id
from ..core.keys import KEY_ACTION, KEY_ENTITY, KEY_NAME, KEY_PARAMS, KEY_STEPS, KEY_TARGET
from ..model.models import ScenarioDef
from ..scheduler.actions import ActionFactory
from ..scheduler.runner import ActionRunner
from ..store.store import TdcStore


class ScenarioManager:
    """Adds, changes and removes scenarios and runs one: each step waits `after_s` after the step before."""

    def __init__(
        self,
        hass: HomeAssistant,
        store: TdcStore,
        actions: ActionFactory,
        runner: ActionRunner,
        audit: AuditLog,
        audit_factory: AuditEntryFactory,
    ) -> None:
        """Keep the collaborators."""
        self._hass = hass
        self._store = store
        self._actions = actions
        self._runner = runner
        self._audit = audit
        self._audit_factory = audit_factory
        self._timers: set[CALLBACK_TYPE] = set()

    def async_stop(self) -> None:
        """Cancel the steps that still wait."""
        for cancel in list(self._timers):
            cancel()
        self._timers.clear()

    def all_scenarios(self) -> list[ScenarioDef]:
        """Return all scenarios."""
        return self._store.scenarios()

    def get(self, scenario_id: str) -> ScenarioDef:
        """Return the scenario or raise SCH_SCENARIO_NOT_FOUND."""
        scenario = self._store.scenario(scenario_id)
        if scenario is None:
            raise ScheduleError(ErrorCode.SCH_SCENARIO_NOT_FOUND)
        return scenario

    def _check_steps(self, data: dict[str, Any]) -> None:
        """Raise TDC-SCH-001 unless every step names an action that exists."""
        known = {name for names in self._actions.names().values() for name in names}
        if any(step[KEY_ACTION] not in known for step in data[KEY_STEPS]):
            raise ScheduleError(ErrorCode.SCH_UNKNOWN_ACTION)

    async def async_add(self, data: dict[str, Any]) -> ScenarioDef:
        """Validate and store a scenario; `data` has a name and the list of steps."""
        self._check_steps(data)
        scenario = ScenarioDef(
            id=new_id(),
            name=data[KEY_NAME],
            steps=data[KEY_STEPS],
            created_at=dt_util.utcnow().timestamp(),
        )
        self._store.put_scenario(scenario)
        await self._store.async_save()
        return scenario

    async def async_update(self, scenario_id: str, data: dict[str, Any]) -> ScenarioDef:
        """Replace the name and the steps of a scenario; a wrong request changes nothing."""
        scenario = self.get(scenario_id)
        self._check_steps(data)
        scenario.name = data[KEY_NAME]
        scenario.steps = data[KEY_STEPS]
        self._store.put_scenario(scenario)
        await self._store.async_save()
        self._audit.record(self._audit_factory.scenario_changed(scenario.name))
        return scenario

    async def async_remove(self, scenario_id: str) -> None:
        """Delete a scenario."""
        self.get(scenario_id)
        self._store.remove_scenario(scenario_id)
        await self._store.async_save()

    def forget(self, scenario_ids: list[str]) -> None:
        """Delete scenarios without saving; the removal saves the store afterwards."""
        for scenario_id in scenario_ids:
            self._store.remove_scenario(scenario_id)

    async def async_run(self, scenario_id: str) -> int:
        """Start the scenario and return the number of steps; waiting steps run in the background."""
        scenario = self.get(scenario_id)
        self._audit.record(self._audit_factory.scenario_started(scenario.name, len(scenario.steps)))
        delay = 0.0
        for step in scenario.steps:
            delay += step["after_s"]
            if delay > 0:
                self._run_later(delay, scenario.name, step)
            else:
                await self._run_step(scenario.name, step)
        return len(scenario.steps)

    def _run_later(self, delay: float, name: str, step: dict[str, Any]) -> None:
        """Run `step` after `delay` seconds."""
        cancels: list[CALLBACK_TYPE] = []

        async def fire(_now: datetime) -> None:
            """Run the step and forget its timer."""
            self._timers.discard(cancels[0])
            await self._run_step(name, step)

        cancels.append(async_call_later(self._hass, delay, fire))
        self._timers.add(cancels[0])

    async def _run_step(self, name: str, step: dict[str, Any]) -> None:
        """Run the action of one step on all devices of its target."""
        await self._runner.async_run_on(
            self._runner.devices_for(step[KEY_TARGET]),
            step[KEY_ENTITY],
            step[KEY_ACTION],
            step[KEY_PARAMS],
            name,
        )
