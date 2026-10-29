"""Plans a removal: what would be deleted (concept 10.2)."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry as ar, device_registry as dr, entity_registry as er

from ..const import DOMAIN
from ..core.errors import ErrorCode, ScheduleError
from ..core.keys import (
    KEY_AREAS,
    KEY_DEVICE,
    KEY_DEVICES,
    KEY_GROUPS,
    KEY_ID,
    KEY_NAME,
    KEY_RUN,
    KEY_RUNS,
    KEY_SCENARIOS,
    KEY_SCHEDULES,
    KEY_TARGET,
)
from ..devices.usage import KINDS, DeviceUsage
from ..model.models import DeviceDef
from ..store.store import TdcStore

TARGET_ALL = "all"
TARGET_DEVICE = "device"
TARGET_RUN = "run"
TARGETS = (TARGET_ALL, TARGET_DEVICE, TARGET_RUN)


@dataclass
class RemovalPlan:
    """What a removal would delete."""

    target: str
    devices: list[DeviceDef] = field(default_factory=list)
    orphans: list[dict[str, str]] = field(default_factory=list)
    runs: list[str] = field(default_factory=list)
    schedules: list[str] = field(default_factory=list)
    scenarios: list[str] = field(default_factory=list)
    groups: list[str] = field(default_factory=list)
    topics: list[str] = field(default_factory=list)
    statistics: list[str] = field(default_factory=list)
    areas: list[str] = field(default_factory=list)
    in_use: list[dict[str, Any]] = field(default_factory=list)

    def describe_in_use(self) -> str:
        """Return the devices that are still used, each with the names of its users."""
        return "; ".join(
            f"{item['device']}: "
            + ", ".join(user[KEY_NAME] for kind in KINDS for user in item["usage"][kind])
            for item in self.in_use
        )

    def to_dict(self) -> dict[str, Any]:
        """Return the plan as the panel shows it before the user confirms."""
        return {
            KEY_TARGET: self.target,
            KEY_DEVICES: [{KEY_ID: item.id, KEY_NAME: item.name} for item in self.devices],
            "orphans": self.orphans,
            KEY_RUNS: self.runs,
            KEY_SCHEDULES: self.schedules,
            KEY_SCENARIOS: self.scenarios,
            KEY_GROUPS: self.groups,
            "topics": self.topics,
            "statistics": self.statistics,
            KEY_AREAS: self.areas,
            "in_use": self.in_use,
        }


class RemovalPlanner:
    """Builds the plan for a target from the store and the registry markers."""

    def __init__(
        self, hass: HomeAssistant, entry: ConfigEntry, store: TdcStore, usage: DeviceUsage
    ) -> None:
        """Keep the instance, the config entry, the store and the finder of the users of devices."""
        self._hass = hass
        self._entry = entry
        self._store = store
        self._usage = usage

    def plan(self, target: str, target_id: str | None) -> RemovalPlan:
        """Return the plan to remove `target` (`all`, `device` or `run`) with `target_id`."""
        plan = RemovalPlan(target)
        if target == TARGET_ALL:
            plan.devices = self._store.devices()
            plan.orphans = self._orphans({item.id for item in plan.devices})
            plan.runs = [run.id for run in self._store.runs()]
            plan.scenarios = [item.id for item in self._store.scenarios()]
        elif target == TARGET_RUN:
            run = next((item for item in self._store.runs() if item.id == target_id), None)
            if run is None:
                raise ScheduleError(ErrorCode.SCH_TARGET_NOT_FOUND)
            plan.runs = [run.id]
            plan.devices = [
                device for device in self._store.devices() if device.id in run.device_ids
            ]
        else:
            device = self._store.device(target_id or "")
            if device is None:
                raise ScheduleError(ErrorCode.SCH_TARGET_NOT_FOUND)
            plan.devices = [device]
        plan.in_use = self._in_use(plan)
        plan.schedules = self._schedule_ids(plan)
        plan.groups = self._group_ids(plan)
        owners = None if target == TARGET_ALL else {d.id for d in plan.devices} | set(plan.groups)
        plan.topics = self._store.topics(owners)
        plan.statistics = self._store.statistics(owners)
        plan.areas = self._empty_areas(
            {item.id for item in plan.devices} | {item["identifier"] for item in plan.orphans}
        )
        return plan

    def _in_use(self, plan: RemovalPlan) -> list[dict[str, Any]]:
        """Return the devices of a plan that a schedule, scenario or group names; "all" has none."""
        if plan.target == TARGET_ALL:
            return []
        index = self._usage.index()
        found = [(device, index.of(device)) for device in plan.devices]
        return [
            {KEY_DEVICE: device.name, "usage": usage}
            for device, usage in found
            if self._usage.is_used(usage)
        ]

    def _group_ids(self, plan: RemovalPlan) -> list[str]:
        """Return the ids of the groups that go with the plan: all of them, or none."""
        if plan.target == TARGET_ALL:
            return [item.id for item in self._store.groups()]
        return []

    def _schedule_ids(self, plan: RemovalPlan) -> list[str]:
        """Return the ids of the schedules that go with the plan: all, or those aimed at its runs."""
        schedules = self._store.schedules()
        if plan.target == TARGET_ALL:
            return [item.id for item in schedules]
        return [item.id for item in schedules if item.target.get(KEY_RUN) in plan.runs]

    def _orphans(self, known: set[str]) -> list[dict[str, str]]:
        """Return registry devices of this entry that the store does not know (damaged store)."""
        registry = dr.async_get(self._hass)
        found: list[dict[str, str]] = []
        for entry in dr.async_entries_for_config_entry(registry, self._entry.entry_id):
            identifier = next((item[1] for item in entry.identifiers if item[0] == DOMAIN), None)
            if identifier is not None and identifier not in known:
                found.append(
                    {KEY_ID: entry.id, KEY_NAME: entry.name or "", "identifier": identifier}
                )
        return found

    def _empty_areas(self, removed: set[str]) -> list[str]:
        """Return the names of created areas that would be empty after removing `removed`."""
        areas = ar.async_get(self._hass)
        devices = dr.async_get(self._hass)
        entities = er.async_get(self._hass)
        names: list[str] = []
        for area_id in self._store.created_areas:
            area = areas.async_get_area(area_id)
            if area is None:
                continue
            others = [
                item
                for item in dr.async_entries_for_area(devices, area_id)
                if not any(identifier in removed for _, identifier in item.identifiers)
            ]
            if not others and not er.async_entries_for_area(entities, area_id):
                names.append(area.name)
        return names
