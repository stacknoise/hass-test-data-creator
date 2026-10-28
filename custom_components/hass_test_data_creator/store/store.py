"""Persistent storage of devices, runs and markers (concept 4.3, 4.4)."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from ..const import SAVE_DELAY_SECONDS, STORE_KEY, STORE_VERSION
from ..model.models import DeviceDef, RunRecord


def _empty() -> dict[str, Any]:
    """Return the content of a new store."""
    return {"devices": {}, "runs": {}, "created_areas": [], "counters": {}}


class TdcStore:
    """Holds the generated devices, the runs and the list of areas the integration created."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Create the store; call `async_load` before use."""
        self._store: Store[dict[str, Any]] = Store(hass, STORE_VERSION, STORE_KEY)
        self._data: dict[str, Any] = _empty()

    async def async_load(self) -> None:
        """Load the stored content, if any."""
        loaded = await self._store.async_load()
        if loaded:
            self._data = {**_empty(), **loaded}

    def devices(self) -> list[DeviceDef]:
        """Return all stored devices in creation order."""
        return [DeviceDef.from_dict(item) for item in self._data["devices"].values()]

    def device(self, device_id: str) -> DeviceDef | None:
        """Return the device with `device_id`, or None."""
        item = self._data["devices"].get(device_id)
        return DeviceDef.from_dict(item) if item else None

    def device_count(self) -> int:
        """Return the number of stored devices."""
        return len(self._data["devices"])

    def add_device(self, device: DeviceDef) -> None:
        """Store `device`."""
        self._data["devices"][device.id] = device.to_dict()

    def remove_device(self, device_id: str) -> None:
        """Delete the device and its id in the run it belongs to."""
        item = self._data["devices"].pop(device_id, None)
        run = self._data["runs"].get(item["run_id"]) if item else None
        if run and device_id in run["device_ids"]:
            run["device_ids"].remove(device_id)
            if not run["device_ids"]:
                del self._data["runs"][item["run_id"]]

    def runs(self) -> list[RunRecord]:
        """Return all runs."""
        return [RunRecord.from_dict(item) for item in self._data["runs"].values()]

    def add_run(self, run: RunRecord) -> None:
        """Store `run`."""
        self._data["runs"][run.id] = run.to_dict()

    def remove_run(self, run_id: str) -> None:
        """Delete the run record `run_id`."""
        self._data["runs"].pop(run_id, None)

    def next_index(self, template_id: str, count: int) -> int:
        """Reserve `count` device numbers of a template and return the first one (from 1)."""
        counters = self._data["counters"]
        first = counters.get(template_id, 0) + 1
        counters[template_id] = first + count - 1
        return first

    @property
    def created_areas(self) -> list[str]:
        """Return the ids of the areas the integration created itself."""
        return list(self._data["created_areas"])

    def add_created_area(self, area_id: str) -> None:
        """Remember that the integration created the area."""
        if area_id not in self._data["created_areas"]:
            self._data["created_areas"].append(area_id)

    def forget_area(self, area_id: str) -> None:
        """Forget an area, for example after it was deleted."""
        if area_id in self._data["created_areas"]:
            self._data["created_areas"].remove(area_id)

    def schedule_save(self) -> None:
        """Save after a short delay; used for frequent writes."""
        self._store.async_delay_save(lambda: self._data, SAVE_DELAY_SECONDS)

    async def async_save(self) -> None:
        """Save at once; used for changes made by the user."""
        await self._store.async_save(self._data)

    async def async_remove(self) -> None:
        """Delete the storage file."""
        await self._store.async_remove()
        self._data = _empty()
