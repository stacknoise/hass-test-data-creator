"""Persistent storage of devices, runs and markers (concept 4.3, 4.4)."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from ..const import SAVE_DELAY_SECONDS, STORE_KEY, STORE_VERSION
from ..core.keys import (
    KEY_CREATED_AREAS,
    KEY_CREATED_STATISTICS,
    KEY_DEVICE_IDS,
    KEY_DEVICES,
    KEY_GROUPS,
    KEY_PUBLISHED_TOPICS,
    KEY_RUNS,
    KEY_SCENARIOS,
    KEY_SCHEDULES,
)
from ..model.models import DeviceDef, GroupDef, RunRecord, ScenarioDef, ScheduleDef


def _empty() -> dict[str, Any]:
    """Return the content of a new store."""
    return {
        KEY_DEVICES: {},
        KEY_RUNS: {},
        KEY_SCHEDULES: {},
        KEY_SCENARIOS: {},
        KEY_PUBLISHED_TOPICS: {},
        KEY_CREATED_STATISTICS: {},
        KEY_GROUPS: {},
        KEY_CREATED_AREAS: [],
        "counters": {},
    }


class TdcStore:
    """Holds the generated devices, the runs and the list of areas the integration created."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Create the store; call `async_load` before use."""
        self._store: Store[dict[str, Any]] = Store(hass, STORE_VERSION, STORE_KEY)
        self._data: dict[str, Any] = _empty()
        self._devices: dict[str, DeviceDef] = {}

    async def async_load(self) -> None:
        """Load the stored content, if any."""
        loaded = await self._store.async_load()
        if loaded:
            self._data = {**_empty(), **loaded}
        self._devices = {
            device_id: DeviceDef.from_dict(item)
            for device_id, item in self._data[KEY_DEVICES].items()
        }

    def _snapshot(self) -> dict[str, Any]:
        """Return the content to write: the devices are serialised here, not on every change."""
        return {**self._data, KEY_DEVICES: {i: d.to_dict() for i, d in self._devices.items()}}

    def devices(self) -> list[DeviceDef]:
        """Return all stored devices in creation order; they are the working copy, so copy to edit."""
        return list(self._devices.values())

    def device(self, device_id: str) -> DeviceDef | None:
        """Return the stored device with `device_id`, or None."""
        return self._devices.get(device_id)

    def device_id_of(self, reference: str) -> str | None:
        """Return the id of the device whose id or name is `reference`."""
        if reference in self._devices:
            return reference
        return next((i for i, item in self._devices.items() if item.name == reference), None)

    def device_count(self) -> int:
        """Return the number of stored devices."""
        return len(self._devices)

    def add_device(self, device: DeviceDef) -> None:
        """Store `device`, replacing one with the same id."""
        self._devices[device.id] = device

    def remove_device(self, device_id: str) -> None:
        """Delete the device and its id in the run it belongs to."""
        item = self._devices.pop(device_id, None)
        run = self._data[KEY_RUNS].get(item.run_id) if item else None
        if item and run and device_id in run[KEY_DEVICE_IDS]:
            run[KEY_DEVICE_IDS].remove(device_id)
            if not run[KEY_DEVICE_IDS]:
                del self._data[KEY_RUNS][item.run_id]

    def runs(self) -> list[RunRecord]:
        """Return all runs."""
        return [RunRecord.from_dict(item) for item in self._data[KEY_RUNS].values()]

    def add_run(self, run: RunRecord) -> None:
        """Store `run`."""
        self._data[KEY_RUNS][run.id] = run.to_dict()

    def schedules(self) -> list[ScheduleDef]:
        """Return all schedules in creation order."""
        return [ScheduleDef.from_dict(item) for item in self._data[KEY_SCHEDULES].values()]

    def schedule_count(self) -> int:
        """Return the number of stored schedules."""
        return len(self._data[KEY_SCHEDULES])

    def schedule(self, schedule_id: str) -> ScheduleDef | None:
        """Return the schedule with `schedule_id`, or None."""
        item = self._data[KEY_SCHEDULES].get(schedule_id)
        return ScheduleDef.from_dict(item) if item else None

    def put_schedule(self, schedule: ScheduleDef) -> None:
        """Store `schedule`, replacing one with the same id."""
        self._data[KEY_SCHEDULES][schedule.id] = schedule.to_dict()

    def remove_schedule(self, schedule_id: str) -> None:
        """Delete the schedule `schedule_id`."""
        self._data[KEY_SCHEDULES].pop(schedule_id, None)

    def scenarios(self) -> list[ScenarioDef]:
        """Return all scenarios in creation order."""
        return [ScenarioDef.from_dict(item) for item in self._data[KEY_SCENARIOS].values()]

    def scenario_count(self) -> int:
        """Return the number of stored scenarios."""
        return len(self._data[KEY_SCENARIOS])

    def scenario(self, scenario_id: str) -> ScenarioDef | None:
        """Return the scenario with `scenario_id`, or None."""
        item = self._data[KEY_SCENARIOS].get(scenario_id)
        return ScenarioDef.from_dict(item) if item else None

    def put_scenario(self, scenario: ScenarioDef) -> None:
        """Store `scenario`, replacing one with the same id."""
        self._data[KEY_SCENARIOS][scenario.id] = scenario.to_dict()

    def remove_scenario(self, scenario_id: str) -> None:
        """Delete the scenario `scenario_id`."""
        self._data[KEY_SCENARIOS].pop(scenario_id, None)

    def groups(self) -> list[GroupDef]:
        """Return all groups in creation order."""
        return [GroupDef.from_dict(item) for item in self._data[KEY_GROUPS].values()]

    def group_count(self) -> int:
        """Return the number of stored groups."""
        return len(self._data[KEY_GROUPS])

    def group(self, group_id: str) -> GroupDef | None:
        """Return the group with `group_id`, or None."""
        item = self._data[KEY_GROUPS].get(group_id)
        return GroupDef.from_dict(item) if item else None

    def put_group(self, group: GroupDef) -> None:
        """Store `group`, replacing one with the same id."""
        self._data[KEY_GROUPS][group.id] = group.to_dict()

    def remove_group(self, group_id: str) -> None:
        """Delete the group `group_id`."""
        self._data[KEY_GROUPS].pop(group_id, None)

    def add_topic(self, topic: str, device_id: str | None) -> bool:
        """Record a retained MQTT topic and its device (None: shared); True if it was new."""
        known = topic in self._data[KEY_PUBLISHED_TOPICS]
        self._data[KEY_PUBLISHED_TOPICS][topic] = device_id
        return not known

    def topics(self, device_ids: set[str] | None = None) -> list[str]:
        """Return the recorded topics: all, or those of the given devices."""
        return [
            topic
            for topic, owner in self._data[KEY_PUBLISHED_TOPICS].items()
            if device_ids is None or owner in device_ids
        ]

    def forget_topics(self, topics: list[str]) -> None:
        """Forget recorded topics, for example after their retained messages were deleted."""
        for topic in topics:
            self._data[KEY_PUBLISHED_TOPICS].pop(topic, None)

    def add_statistic(self, statistic_id: str, device_id: str) -> None:
        """Record a statistic id the integration imported and the device it belongs to."""
        self._data[KEY_CREATED_STATISTICS][statistic_id] = device_id

    def statistics(self, device_ids: set[str] | None = None) -> list[str]:
        """Return the imported statistic ids: all, or those of the given devices."""
        return [
            statistic_id
            for statistic_id, owner in self._data[KEY_CREATED_STATISTICS].items()
            if device_ids is None or owner in device_ids
        ]

    def forget_statistics(self, statistic_ids: list[str]) -> None:
        """Forget imported statistic ids, for example after they were cleared."""
        for statistic_id in statistic_ids:
            self._data[KEY_CREATED_STATISTICS].pop(statistic_id, None)

    def remove_run(self, run_id: str) -> None:
        """Delete the run record `run_id`."""
        self._data[KEY_RUNS].pop(run_id, None)

    def next_index(self, template_id: str, count: int) -> int:
        """Reserve `count` device numbers of a template and return the first one (from 1)."""
        counters = self._data["counters"]
        first = counters.get(template_id, 0) + 1
        counters[template_id] = first + count - 1
        return first

    @property
    def created_areas(self) -> list[str]:
        """Return the ids of the areas the integration created itself."""
        return list(self._data[KEY_CREATED_AREAS])

    def add_created_area(self, area_id: str) -> None:
        """Remember that the integration created the area."""
        if area_id not in self._data[KEY_CREATED_AREAS]:
            self._data[KEY_CREATED_AREAS].append(area_id)

    def forget_area(self, area_id: str) -> None:
        """Forget an area, for example after it was deleted."""
        if area_id in self._data[KEY_CREATED_AREAS]:
            self._data[KEY_CREATED_AREAS].remove(area_id)

    def schedule_save(self) -> None:
        """Save after a short delay; used for frequent writes."""
        self._store.async_delay_save(self._snapshot, SAVE_DELAY_SECONDS)

    async def async_save(self) -> None:
        """Save at once; used for changes made by the user."""
        await self._store.async_save(self._snapshot())

    async def async_remove(self) -> None:
        """Delete the storage file."""
        await self._store.async_remove()
        self._data = _empty()
        self._devices = {}
