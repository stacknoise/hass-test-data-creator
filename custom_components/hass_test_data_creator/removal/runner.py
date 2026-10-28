"""Runs a removal plan step by step; every step can be repeated (concept 10.3)."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr

from ..areas.assigner import AreaAssigner
from ..audit.factory import AuditEntryFactory
from ..audit.log import AuditLog
from ..outputs.adapter import OutputAdapterFactory
from ..scenarios.manager import ScenarioManager
from ..scheduler.manager import ScheduleManager
from ..store.store import TdcStore
from .planner import RemovalPlan


class RemovalRunner:
    """Removes devices, run records and empty created areas."""

    def __init__(
        self,
        hass: HomeAssistant,
        store: TdcStore,
        outputs: OutputAdapterFactory,
        areas: AreaAssigner,
        schedules: ScheduleManager,
        scenarios: ScenarioManager,
        audit: AuditLog,
        audit_factory: AuditEntryFactory,
    ) -> None:
        """Keep the collaborators."""
        self._hass = hass
        self._store = store
        self._outputs = outputs
        self._areas = areas
        self._schedules = schedules
        self._scenarios = scenarios
        self._audit = audit
        self._audit_factory = audit_factory

    async def async_run(self, plan: RemovalPlan) -> dict[str, Any]:
        """Execute `plan` and return what was removed (concept 10.3).

        A missing MQTT connection stops the removal before anything is gone; the retained
        topics are deleted last, when nothing publishes any more.
        """
        self._outputs.check_clearable(plan.topics)
        self._schedules.forget(plan.schedules)
        self._scenarios.forget(plan.scenarios)
        for device in plan.devices:
            await self._outputs.create(device.output).remove(device)
            self._store.remove_device(device.id)
        await self._outputs.async_clear_topics(plan.topics)
        registry = dr.async_get(self._hass)
        for orphan in plan.orphans:
            if registry.async_get(orphan["id"]) is not None:
                registry.async_remove_device(orphan["id"])
        for run_id in plan.runs:
            self._store.remove_run(run_id)
        areas = self._areas.delete_empty_created()
        await self._store.async_save()
        self._audit.record(
            self._audit_factory.removal_done(plan.target, len(plan.devices), len(areas))
        )
        return {
            "devices": len(plan.devices),
            "orphans": len(plan.orphans),
            "schedules": len(plan.schedules),
            "scenarios": len(plan.scenarios),
            "topics": len(plan.topics),
            "areas": areas,
        }
