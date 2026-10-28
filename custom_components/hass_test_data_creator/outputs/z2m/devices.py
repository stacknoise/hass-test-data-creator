"""The devices of the Zigbee2MQTT output: bridge topics, device states and commands (concept 7.4)."""

from __future__ import annotations

import asyncio
from dataclasses import dataclass
import json
from typing import Any, cast

from homeassistant.core import callback

from ...core.errors import ErrorCode, OutputError, TdcError
from ...engine.behaviours import Behaviour
from ...model.models import DeviceDef, EntityDef
from ...templates.registry import TemplateRegistry
from ..mqtt.runtime import BehaviourRuntime, RuntimeEntry, RuntimeParts
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
    ) -> None:
        """Keep the factories, the template registry and the settings."""
        super().__init__(parts)
        self._profiles = profiles
        self._payloads = payloads
        self._templates = templates
        self._base = settings.base_topic
        self._confirmed = settings.confirmed_default_topic
        self._devices: dict[str, DeviceDef] = {}
        self._pending: set[str] = set()
        self._bridge_ready = False

    async def async_check(self) -> None:
        """Raise unless MQTT is usable and the base topic may be used; then publish the bridge."""
        self.require_connection()
        await self._ensure_bridge()

    async def _ensure_bridge(self) -> None:
        """Refuse a foreign base topic, then publish `bridge/state` and `bridge/info`."""
        if self._bridge_ready:
            return
        if self._base == FOREIGN_BASE_TOPIC and not self._confirmed:
            raise OutputError(ErrorCode.OUT_Z2M_DEFAULT_TOPIC)
        state_topic = f"{self._base}/bridge/state"
        retained = await self._client.async_retained(state_topic)
        if retained is not None and not self._client.is_ours(state_topic):
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
                self._async_publish(
                    f"{self._base}/{name}/action", action, mine.device.id, retain=False
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
        entries = [self._z2m(item) for item in self._entries.values() if item.device.name == name]
        if not entries:
            return
        try:
            data = json.loads(payload)
            for entry in entries:
                entry.profile.apply(entry.definition, entry.behaviour, data)
        except ValueError, KeyError, TypeError, AttributeError:
            self._audit.record(self._audit_factory.mqtt_failed(topic, "invalid command"))

    async def _async_announce(self, added: list[RuntimeEntry], devices: list[DeviceDef]) -> None:
        """Publish `bridge/devices` and the state and availability of the new devices."""
        for device in devices:
            self._devices[device.id] = device
        await self._async_bridge_devices()
        for device in devices:
            await self._async_publish_device(device.id)

    async def _async_changed(self, entry: RuntimeEntry) -> None:
        """Publish the state of the device once, however many of its entities changed."""
        device_id = entry.device.id
        if device_id in self._pending:
            return
        self._pending.add(device_id)
        await asyncio.sleep(0)
        self._pending.discard(device_id)
        await self._async_publish_device(device_id)

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

    async def _async_removed(self, device: DeviceDef) -> None:
        """Publish `bridge/devices` without the removed device."""
        self._devices.pop(device.id, None)
        if self._bridge_ready and self._client.available():
            await self._async_bridge_devices()

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
        entries = [
            self._z2m(item) for item in self._entries.values() if item.device.id == device_id
        ]
        if not entries:
            return
        name = entries[0].device.name
        properties: dict[str, Any] = {}
        for entry in entries:
            properties.update(entry.profile.values(entry.definition, entry.behaviour))
        online = all(entry.behaviour.available for entry in entries)
        await self._async_publish(
            f"{self._base}/{name}/availability", self._payloads.availability(online), device_id
        )
        await self._async_publish(
            f"{self._base}/{name}", self._payloads.device_state(properties), device_id
        )

    def _z2m(self, entry: RuntimeEntry) -> _Entry:
        """Return the entry as one of this output."""
        return cast(_Entry, entry)
