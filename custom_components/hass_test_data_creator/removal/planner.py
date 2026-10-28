"""Plans a removal: what would be deleted (concept 10.2)."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry as ar, device_registry as dr, entity_registry as er

from ..const import DOMAIN
from ..core.errors import ErrorCode, ScheduleError
from ..model.models import DeviceDef
from ..scheduler.schema import device_references
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

    def to_dict(self) -> dict[str, Any]:
        """Return the plan as the panel shows it before the user confirms."""
        return {
            "target": self.target,
            "devices": [{"id": item.id, "name": item.name} for item in self.devices],
            "orphans": self.orphans,
            "runs": self.runs,
            "schedules": self.schedules,
            "scenarios": self.scenarios,
            "groups": self.groups,
            "topics": self.topics,
            "statistics": self.statistics,
            "areas": self.areas,
        }


class RemovalPlanner:
    """Builds the plan for a target from the store and the registry markers."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry, store: TdcStore) -> None:
        """Keep the instance, the config entry and the store."""
        self._hass = hass
        self._entry = entry
        self._store = store

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
        plan.schedules = self._schedule_ids(plan)
        plan.groups = self._group_ids(plan)
        owners = None if target == TARGET_ALL else {d.id for d in plan.devices} | set(plan.groups)
        plan.topics = self._store.topics(owners)
        plan.statistics = self._store.statistics(owners)
        plan.areas = self._empty_areas(
            {item.id for item in plan.devices} | {item["identifier"] for item in plan.orphans}
        )
        return plan

    def _group_ids(self, plan: RemovalPlan) -> list[str]:
        """Return the ids of the groups that go with the plan: all, or those left without members."""
        groups = self._store.groups()
        if plan.target == TARGET_ALL:
            return [item.id for item in groups]
        removed = {device.id for device in plan.devices}
        return [item.id for item in groups if set(item.members) <= removed]

    def _schedule_ids(self, plan: RemovalPlan) -> list[str]:
        """Return the ids of the schedules that go with the plan: all, or those aimed at it."""
        schedules = self._store.schedules()
        if plan.target == TARGET_ALL:
            return [item.id for item in schedules]
        names = {name for device in plan.devices for name in (device.id, device.name)}
        existing = {name for device in self._store.devices() for name in (device.id, device.name)}
        return [
            item.id
            for item in schedules
            if self._aims_only_at(item.target.get("device"), names, existing)
            or item.target.get("run") in plan.runs
        ]

    @staticmethod
    def _aims_only_at(device: str | list[str] | None, names: set[str], existing: set[str]) -> bool:
        """Whether a target names devices that still exist and all of them are being removed."""
        alive = device_references(device) & existing
        return bool(alive) and alive <= names

    def _orphans(self, known: set[str]) -> list[dict[str, str]]:
        """Return registry devices of this entry that the store does not know (damaged store)."""
        registry = dr.async_get(self._hass)
        found: list[dict[str, str]] = []
        for entry in dr.async_entries_for_config_entry(registry, self._entry.entry_id):
            identifier = next((item[1] for item in entry.identifiers if item[0] == DOMAIN), None)
            if identifier is not None and identifier not in known:
                found.append({"id": entry.id, "name": entry.name or "", "identifier": identifier})
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
