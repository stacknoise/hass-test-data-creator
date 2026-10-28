"""Where a generated device is used: the schedules, scenarios and groups that name it (concept 10)."""

from __future__ import annotations

from ..core.keys import (
    KEY_DEVICE,
    KEY_GROUPS,
    KEY_ID,
    KEY_NAME,
    KEY_SCENARIOS,
    KEY_SCHEDULES,
    KEY_TARGET,
)
from ..model.models import DeviceDef
from ..scheduler.schema import device_references
from ..store.store import TdcStore

KINDS = ("schedules", "scenarios", "groups")
Usage = dict[str, list[dict[str, str]]]


class DeviceUsage:
    """Finds the schedules, scenarios and groups that name a device itself.

    A target by template, creation or "all devices" does not count: it reaches the device without
    naming it, and it keeps working when the device is gone.
    """

    def __init__(self, store: TdcStore) -> None:
        """Keep the store."""
        self._store = store

    def of(self, device: DeviceDef) -> Usage:
        """Return `{kind: [{id, name}]}` for the three kinds of user of `device`."""
        names = {device.id, device.name}
        return {
            KEY_SCHEDULES: [
                {KEY_ID: item.id, KEY_NAME: item.name}
                for item in self._store.schedules()
                if device_references(item.target.get(KEY_DEVICE)) & names
            ],
            KEY_SCENARIOS: [
                {KEY_ID: item.id, KEY_NAME: item.name}
                for item in self._store.scenarios()
                if any(
                    device_references(step[KEY_TARGET].get(KEY_DEVICE)) & names
                    for step in item.steps
                )
            ],
            KEY_GROUPS: [
                {KEY_ID: item.id, KEY_NAME: item.name}
                for item in self._store.groups()
                if device.id in item.members
            ],
        }

    @staticmethod
    def is_used(usage: Usage) -> bool:
        """Whether anything uses the device."""
        return any(usage[kind] for kind in KINDS)
