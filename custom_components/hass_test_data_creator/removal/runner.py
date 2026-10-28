"""Runs a removal plan step by step; every step can be repeated (concept 10.3)."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr

from ..areas.assigner import AreaAssigner
from ..audit.factory import AuditEntryFactory
from ..audit.log import AuditLog
from ..core.errors import ErrorCode, RemovalError
from ..core.keys import KEY_AREAS, KEY_DEVICES, KEY_GROUPS, KEY_ID, KEY_SCENARIOS, KEY_SCHEDULES
from ..history.manager import HistoryManager
from ..outputs.adapter import OutputAdapterFactory
from ..scenarios.manager import ScenarioManager
from ..scheduler.manager import ScheduleManager
from ..store.store import TdcStore
from .planner import RemovalPlan


@dataclass
class Forgetters:
    """The managers that forget what a plan removes: schedules, scenarios and statistics."""

    schedules: ScheduleManager
    scenarios: ScenarioManager
    history: HistoryManager


class RemovalRunner:
    """Removes devices, run records, statistics and empty created areas."""

    def __init__(
        self,
        hass: HomeAssistant,
        store: TdcStore,
        outputs: OutputAdapterFactory,
        areas: AreaAssigner,
        forgetters: Forgetters,
        audit: AuditLog,
        audit_factory: AuditEntryFactory,
    ) -> None:
        """Keep the collaborators."""
        self._hass = hass
        self._store = store
        self._outputs = outputs
        self._areas = areas
        self._schedules = forgetters.schedules
        self._scenarios = forgetters.scenarios
        self._history = forgetters.history
        self._audit = audit
        self._audit_factory = audit_factory

    async def async_run(self, plan: RemovalPlan) -> dict[str, Any]:
        """Execute `plan` and return what was removed (concept 10.3).

        A device that is still used, a missing MQTT connection or a missing recorder stops the
        removal before anything is gone; the retained topics are deleted last, when nothing
        publishes any more.
        """
        if plan.in_use:
            raise RemovalError(ErrorCode.REM_IN_USE, usage=plan.describe_in_use())
        self._outputs.check_clearable(plan.topics)
        self._history.check_clearable(plan.statistics)
        self._schedules.forget(plan.schedules)
        self._scenarios.forget(plan.scenarios)
        await self._outputs.async_drop_groups(plan.groups, {item.id for item in plan.devices})
        for device in plan.devices:
            await self._outputs.create(device.output).remove(device)
            self._store.remove_device(device.id)
        await self._outputs.async_clear_topics(plan.topics)
        self._history.forget(plan.statistics)
        registry = dr.async_get(self._hass)
        for orphan in plan.orphans:
            if registry.async_get(orphan[KEY_ID]) is not None:
                registry.async_remove_device(orphan[KEY_ID])
        for run_id in plan.runs:
            self._store.remove_run(run_id)
        areas = self._areas.delete_empty_created()
        await self._store.async_save()
        self._audit.record(
            self._audit_factory.removal_done(plan.target, len(plan.devices), len(areas))
        )
        return {
            KEY_DEVICES: len(plan.devices),
            "orphans": len(plan.orphans),
            KEY_SCHEDULES: len(plan.schedules),
            KEY_SCENARIOS: len(plan.scenarios),
            KEY_GROUPS: len(plan.groups),
            "topics": len(plan.topics),
            "statistics": len(plan.statistics),
            KEY_AREAS: areas,
        }
