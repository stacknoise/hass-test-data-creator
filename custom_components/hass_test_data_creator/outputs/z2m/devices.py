"""The devices of the Zigbee2MQTT output: bridge topics, device states and commands (concept 7.4)."""

from __future__ import annotations

import asyncio
from dataclasses import dataclass
import json
from typing import Any, cast

from homeassistant.core import callback

from ...const import OUTPUT_Z2M
from ...core.errors import ErrorCode, OutputError, TdcError
from ...engine.behaviours import Behaviour
from ...model.models import DeviceDef, EntityDef, GroupDef
from ...store.store import TdcStore
from ...templates.registry import TemplateRegistry
from ..mqtt.runtime import BehaviourRuntime, RuntimeEntry, RuntimeParts
from .names import is_friendly_name
from .payloads import Z2mPayloadFactory
from .profiles import Z2mProfile, Z2mProfileFactory

FOREIGN_BASE_TOPIC = "zigbee2mqtt"
SET_SUFFIX = "/set"


@dataclass(frozen=True)
class Z2mSettings:
    """The options of the Zigbee2MQTT output."""

    base_topic: str
    confirmed_default_topic: bool = False


class _Entry(RuntimeEntry):
    """One entity published in the Zigbee2MQTT format: its profile."""

    def __init__(
        self, device: DeviceDef, definition: EntityDef, behaviour: Behaviour, profile: Z2mProfile
    ) -> None:
        """Keep the profile."""
        super().__init__(device, definition, behaviour)
        self.profile = profile


class Z2mDevices(BehaviourRuntime):
    """Behaves like a Zigbee2MQTT bridge for the devices with the output `z2m`."""

    def __init__(
        self,
        parts: RuntimeParts,
        profiles: Z2mProfileFactory,
        payloads: Z2mPayloadFactory,
        templates: TemplateRegistry,
        settings: Z2mSettings,
        store: TdcStore,
    ) -> None:
        """Keep the factories, the template registry, the settings and the store."""
        super().__init__(parts)
        self._store = store
        self._profiles = profiles
        self._payloads = payloads
        self._templates = templates
        self._base = settings.base_topic
        self._confirmed = settings.confirmed_default_topic
        self._devices: dict[str, DeviceDef] = {}
        self._groups: dict[str, GroupDef] = {}
        self._pending: set[str] = set()
        self._active = 0
        self._idle = asyncio.Event()
        self._idle.set()
        self._values: dict[str, dict[str, Any]] = {}
        self._dirty_groups: set[str] = set()
        self._flush_scheduled = False
        self._bridge_ready = False

    def set_groups(self, groups: list[GroupDef]) -> None:
        """Hand over the stored groups; they are published when the devices start."""
        self._groups = {group.id: group for group in groups}

    async def async_groups_changed(self, groups: list[GroupDef]) -> None:
        """Publish the groups after one was added, removed or lost a member."""
        self.set_groups(groups)
        if not self._bridge_ready:
            return
        await self._async_bridge_groups()
        for group in groups:
            await self._async_publish_group(group)

    def check_device(self, device: DeviceDef) -> None:
        """Raise TDC-OUT-007 unless the name is a valid friendly name, TDC-OUT-008 if it is taken."""
        if not is_friendly_name(device.name):
            raise OutputError(ErrorCode.OUT_INVALID_NAME)
        taken = {item.name for item in self._store.devices() if item.output == OUTPUT_Z2M}
        taken |= {group.name for group in self._store.groups()}
        if device.name in taken:
            raise OutputError(ErrorCode.OUT_DUPLICATE_NAME)

    async def async_check(self) -> None:
        """Raise unless MQTT is usable and the base topic may be used; then publish the bridge."""
        self.require_connection()
        await self._ensure_bridge()

    async def _ensure_bridge(self) -> None:
        """Refuse a foreign base topic or retained topics that are not ours, then publish `bridge/state` and `bridge/info`."""
        if self._bridge_ready:
            return
        if self._base == FOREIGN_BASE_TOPIC and not self._confirmed:
            raise OutputError(ErrorCode.OUT_Z2M_DEFAULT_TOPIC)
        state_topic = f"{self._base}/bridge/state"
        if await self._client.async_foreign_topic(
            self._base, long=self._base == FOREIGN_BASE_TOPIC
        ):
            raise OutputError(ErrorCode.OUT_FOREIGN_BRIDGE)
        await self._async_publish(state_topic, self._payloads.bridge_state(True), None)
        await self._async_publish(
            f"{self._base}/bridge/info", self._payloads.bridge_info(self._base), None
        )
        self._bridge_ready = True

    async def _async_prepare(self) -> None:
        """Make sure the bridge is up before devices start."""
        await self._ensure_bridge()

    def _make_entry(
        self, device: DeviceDef, definition: EntityDef, behaviour: Behaviour
    ) -> RuntimeEntry:
        """Return the entry with the profile of the platform."""
        return _Entry(device, definition, behaviour, self._profiles.create(definition.platform))

    def _wire(self, entry: RuntimeEntry) -> None:
        """Publish the events of the behaviour as actions."""
        mine = self._z2m(entry)
        name = mine.device.name
        mine.profile.attach(
            mine.definition,
            mine.behaviour,
            lambda action: self._schedule(
                self._async_deliver(
                    [mine.behaviour],
                    f"{self._base}/{name}/action",
                    action,
                    mine.device.id,
                    retain=False,
                )
            ),
        )

    def _command_pattern(self) -> str:
        """Return the filter for `<base>/<friendly name>/set`."""
        return f"{self._base}/+{SET_SUFFIX}"

    @callback
    def _on_message(self, topic: str, payload: str) -> None:
        """Apply a `/set` message to every entity of the device with that friendly name."""
        name = topic.removeprefix(f"{self._base}/").removesuffix(SET_SUFFIX)
        entries = self._targets(name)
        if not entries:
            return
        try:
            data = json.loads(payload)
            for entry in entries:
                entry.profile.apply(entry.definition, entry.behaviour, data)
        except ValueError, KeyError, TypeError, AttributeError, OverflowError:
            self._audit.record(self._audit_factory.mqtt_failed(topic, "invalid command"))

    def _targets(self, name: str) -> list[_Entry]:
        """Return the entries a `/set` to `name` reaches: one device, or the members of a group."""
        group = next((item for item in self._groups.values() if item.name == name), None)
        if group is not None:
            ids = list(group.members)
        else:
            ids = [device.id for device in self._devices.values() if device.name == name]
        return [self._z2m(item) for device_id in ids for item in self._device_entries(device_id)]

    async def _async_announce(self, added: list[RuntimeEntry], devices: list[DeviceDef]) -> None:
        """Publish `bridge/devices` and the state and availability of the new devices."""
        for device in devices:
            self._devices[device.id] = device
        await self._async_bridge_devices()
        await self._async_bridge_groups()
        for device in devices:
            await self._async_publish_device(device.id)
        self._dirty_groups.clear()
        for group in self._groups.values():
            await self._async_publish_group(group)

    async def _async_changed_many(self, entries: list[RuntimeEntry]) -> None:
        """Publish each changed device once, however many of its entities changed."""
        self._enter()
        try:
            for device_id in dict.fromkeys(entry.device.id for entry in entries):
                await self._async_publish_device(device_id)
        finally:
            self._leave()

    async def _async_changed(self, entry: RuntimeEntry) -> None:
        """Publish the state of the device once, however many of its entities changed."""
        device_id = entry.device.id
        if device_id in self._pending:
            return
        self._pending.add(device_id)
        self._enter()
        try:
            await asyncio.sleep(0)
            self._pending.discard(device_id)
            await self._async_publish_device(device_id)
        finally:
            self._pending.discard(device_id)
            self._leave()

    def _enter(self) -> None:
        """Note that a device publish is under way."""
        self._active += 1
        self._idle.clear()

    def _leave(self) -> None:
        """Note that a device publish is over; wake the group flush when none is left."""
        self._active -= 1
        if self._active == 0:
            self._idle.set()

    async def _async_offline(self, entries: list[RuntimeEntry]) -> None:
        """Mark the devices and the bridge offline."""
        for name in {entry.device.name for entry in entries}:
            await self._async_publish(
                f"{self._base}/{name}/availability", self._payloads.availability(False), None
            )
        if self._bridge_ready:
            await self._async_publish(
                f"{self._base}/bridge/state", self._payloads.bridge_state(False), None
            )
        self._bridge_ready = False
        self._values.clear()

    async def _async_removed(self, device: DeviceDef) -> None:
        """Publish `bridge/devices` without the removed device."""
        self._devices.pop(device.id, None)
        self._values.pop(device.id, None)
        if self._bridge_ready and self._client.available():
            await self._async_bridge_devices()

    async def _async_bridge_groups(self) -> None:
        """Publish the group list of the bridge."""
        entries = [
            self._payloads.group_entry(
                group, [self._devices[item] for item in group.members if item in self._devices]
            )
            for group in self._groups.values()
        ]
        await self._async_publish(
            f"{self._base}/bridge/groups", self._payloads.bridge_groups(entries), None
        )

    async def _async_publish_group(self, group: GroupDef) -> None:
        """Publish the state of a group, derived from the states of its started members."""
        members = [self._values.get(device_id) for device_id in group.members]
        states = [item for item in members if item]
        if not states:
            return
        properties = self._payloads.group_state(states)
        await self._async_publish(
            f"{self._base}/{group.name}", self._payloads.device_state(properties), group.id
        )

    async def _async_bridge_devices(self) -> None:
        """Publish the device list of the bridge."""
        entries = [self._bridge_entry(device) for device in self._devices.values()]
        await self._async_publish(
            f"{self._base}/bridge/devices", self._payloads.bridge_devices(entries), None
        )

    def _bridge_entry(self, device: DeviceDef) -> dict[str, Any]:
        """Return the description of a device for `bridge/devices`."""
        try:
            meta = self._templates.get(device.template).z2m
        except TdcError:
            meta = {}
        exposes = [
            self._profiles.create(definition.platform).expose(definition)
            for definition in device.entities
        ]
        return self._payloads.device_entry(device, meta, exposes)

    async def _async_publish_device(self, device_id: str) -> None:
        """Publish availability and the state of a device; it is offline if any entity is."""
        entries = [self._z2m(item) for item in self._device_entries(device_id)]
        if not entries:
            return
        await self._async_publish_entries(device_id, entries)
        self._mark_groups(device_id)

    async def _async_publish_entries(self, device_id: str, entries: list[_Entry]) -> None:
        """Publish availability and state of one device from its started entries."""
        name = entries[0].device.name
        properties: dict[str, Any] = {}
        for entry in entries:
            properties.update(entry.profile.values(entry.definition, entry.behaviour))
        self._values[device_id] = properties
        online = all(entry.behaviour.available for entry in entries)
        await self._async_publish(
            f"{self._base}/{name}/availability", self._payloads.availability(online), device_id
        )
        await self._async_deliver(
            [entry.behaviour for entry in entries],
            f"{self._base}/{name}",
            self._payloads.device_state(properties),
            device_id,
        )

    def _mark_groups(self, device_id: str) -> None:
        """Mark the groups of a device dirty and flush them once the devices are published."""
        self._dirty_groups.update(
            group.id for group in self._groups.values() if device_id in group.members
        )
        if self._dirty_groups and not self._flush_scheduled:
            self._flush_scheduled = True
            self._schedule(self._async_flush_groups())

    async def _async_flush_groups(self) -> None:
        """Publish each dirty group once, after the device publishes of this round are done."""
        try:
            await self._idle.wait()
            dirty, self._dirty_groups = self._dirty_groups, set()
            for group_id in dirty:
                group = self._groups.get(group_id)
                if group is not None and self._bridge_ready:
                    await self._async_publish_group(group)
        finally:
            self._flush_scheduled = False

    def _z2m(self, entry: RuntimeEntry) -> _Entry:
        """Return the entry as one of this output."""
        return cast(_Entry, entry)
