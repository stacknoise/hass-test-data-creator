"""Groups of Zigbee2MQTT devices: a named list of members (concept 7.4)."""

from __future__ import annotations

from homeassistant.util import dt as dt_util

from ..const import OUTPUT_Z2M
from ..core.errors import ErrorCode, OutputError
from ..core.ids import new_id
from ..model.models import DeviceDef, GroupDef
from ..outputs.mqtt.client import MqttClient
from ..outputs.z2m.devices import Z2mDevices
from ..store.store import TdcStore

GROUP_COUNTER = "__group__"
RESERVED_NAMES = ("bridge",)
MAX_NAME_LENGTH = 64


class GroupManager:
    """Adds, changes and removes groups and keeps the Zigbee2MQTT bridge up to date."""

    def __init__(self, store: TdcStore, client: MqttClient, z2m: Z2mDevices) -> None:
        """Keep the store, the MQTT client and the Zigbee2MQTT runtime."""
        self._store = store
        self._client = client
        self._z2m = z2m

    def all_groups(self) -> list[GroupDef]:
        """Return all groups."""
        return self._store.groups()

    def load(self) -> None:
        """Hand the stored groups to the runtime, before the stored devices start."""
        self._z2m.set_groups(self._store.groups())

    def get(self, group_id: str) -> GroupDef:
        """Return the group or raise TDC-OUT-006."""
        group = self._store.group(group_id)
        if group is None:
            raise OutputError(ErrorCode.OUT_GROUP_NOT_FOUND)
        return group

    async def async_add(self, name: str, members: list[str]) -> GroupDef:
        """Add a group of Zigbee2MQTT devices given by id or name and publish it."""
        await self._z2m.async_check()
        devices = [self._member(reference) for reference in members]
        if not devices or not self._name_is_free(name):
            raise OutputError(ErrorCode.OUT_GROUP_INVALID)
        group = GroupDef(
            id=new_id(),
            name=name,
            number=self._store.next_index(GROUP_COUNTER, 1),
            members=list(dict.fromkeys(device.id for device in devices)),
            created_at=dt_util.utcnow().timestamp(),
        )
        self._store.put_group(group)
        await self._store.async_save()
        await self._z2m.async_groups_changed(self._store.groups())
        return group

    async def async_update(self, group_id: str, name: str, members: list[str]) -> GroupDef:
        """Rename a group and replace its members; the retained state under the old name goes.

        The id and the number stay. A wrong request raises TDC-OUT-005 and changes nothing.
        """
        group = self.get(group_id)
        await self._z2m.async_check()
        devices = [self._member(reference) for reference in members]
        if not devices or not self._name_is_free(name, group.id):
            raise OutputError(ErrorCode.OUT_GROUP_INVALID)
        old_topics = self._store.topics({group.id}) if name != group.name else []
        group.name = name
        group.members = list(dict.fromkeys(device.id for device in devices))
        self._store.put_group(group)
        await self._store.async_save()
        await self._client.async_clear(old_topics)
        await self._z2m.async_groups_changed(self._store.groups())
        return group

    async def async_remove(self, group_id: str) -> None:
        """Delete a group and its retained topics."""
        group = self.get(group_id)
        await self.async_drop([group.id], set())
        await self._client.async_clear(self._store.topics({group.id}))
        await self._store.async_save()

    async def async_drop(self, group_ids: list[str], device_ids: set[str]) -> None:
        """Delete groups and take removed devices out of the others; the topics are cleared later."""
        for group_id in group_ids:
            self._store.remove_group(group_id)
        for group in self._store.groups():
            remaining = [member for member in group.members if member not in device_ids]
            if remaining != group.members:
                group.members = remaining
                self._store.put_group(group)
        await self._z2m.async_groups_changed(self._store.groups())

    def _member(self, reference: str) -> DeviceDef:
        """Return the Zigbee2MQTT device with this id or name, or raise TDC-OUT-005."""
        for device in self._store.devices():
            if reference in (device.id, device.name) and device.output == OUTPUT_Z2M:
                return device
        raise OutputError(ErrorCode.OUT_GROUP_INVALID)

    def _name_is_free(self, name: str, own_id: str | None = None) -> bool:
        """Whether `name` can be a group name: not reserved and used by no device or other group."""
        taken = {device.name for device in self._store.devices()}
        taken |= {group.name for group in self._store.groups() if group.id != own_id}
        taken |= set(RESERVED_NAMES)
        return 0 < len(name) <= MAX_NAME_LENGTH and "/" not in name and name not in taken
