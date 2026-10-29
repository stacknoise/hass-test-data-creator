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


class UsageIndex:
    """The users of devices, looked up by device id or name; build it once per request."""

    def __init__(self, store: TdcStore) -> None:
        """Read the schedules, scenarios and groups once."""
        self._schedules: dict[str, list[tuple[int, dict[str, str]]]] = {}
        self._scenarios: dict[str, list[tuple[int, dict[str, str]]]] = {}
        self._groups: dict[str, list[tuple[int, dict[str, str]]]] = {}
        for position, schedule in enumerate(store.schedules()):
            references = device_references(schedule.target.get(KEY_DEVICE))
            self._add(self._schedules, references, position, schedule.id, schedule.name)
        for position, scenario in enumerate(store.scenarios()):
            references = set().union(
                *(device_references(step[KEY_TARGET].get(KEY_DEVICE)) for step in scenario.steps)
            )
            self._add(self._scenarios, references, position, scenario.id, scenario.name)
        for position, group in enumerate(store.groups()):
            self._add(self._groups, set(group.members), position, group.id, group.name)

    @staticmethod
    def _add(
        table: dict[str, list[tuple[int, dict[str, str]]]],
        references: set[str],
        position: int,
        item_id: str,
        name: str,
    ) -> None:
        """Record that the item at `position` names each of `references`."""
        for reference in references:
            table.setdefault(reference, []).append((position, {KEY_ID: item_id, KEY_NAME: name}))

    def of(self, device: DeviceDef) -> Usage:
        """Return `{kind: [{id, name}]}` for the three kinds of user of `device`."""
        return {
            KEY_SCHEDULES: self._users(self._schedules, device.id, device.name),
            KEY_SCENARIOS: self._users(self._scenarios, device.id, device.name),
            KEY_GROUPS: self._users(self._groups, device.id),
        }

    @staticmethod
    def _users(
        table: dict[str, list[tuple[int, dict[str, str]]]], *references: str
    ) -> list[dict[str, str]]:
        """Return the items that name one of `references`, once each, in creation order."""
        found = {position: item for key in references for position, item in table.get(key, [])}
        return [found[position] for position in sorted(found)]


class DeviceUsage:
    """Finds the schedules, scenarios and groups that name a device itself.

    A target by template, creation or "all devices" does not count: it reaches the device without
    naming it, and it keeps working when the device is gone.
    """

    def __init__(self, store: TdcStore) -> None:
        """Keep the store."""
        self._store = store

    def index(self) -> UsageIndex:
        """Return the users of all devices, read once."""
        return UsageIndex(self._store)

    def of(self, device: DeviceDef) -> Usage:
        """Return `{kind: [{id, name}]}` for the three kinds of user of `device`."""
        return self.index().of(device)

    @staticmethod
    def is_used(usage: Usage) -> bool:
        """Whether anything uses the device."""
        return any(usage[kind] for kind in KINDS)
