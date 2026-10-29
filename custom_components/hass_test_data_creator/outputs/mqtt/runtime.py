"""Base of the MQTT outputs: runs the behaviours of their devices and publishes for them."""

from __future__ import annotations

from abc import ABC, abstractmethod
from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime
from typing import Any

from homeassistant.core import CALLBACK_TYPE, HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.event import async_call_later

from ...audit.factory import AuditEntryFactory
from ...audit.log import AuditLog
from ...const import SIGNAL_TICK
from ...engine.behaviour_factory import BehaviourFactory
from ...engine.behaviours import Behaviour, Live
from ...model.models import DeviceDef, EntityDef
from .client import MqttClient


class RuntimeEntry:
    """One entity of an MQTT output: its device, definition and behaviour."""

    def __init__(self, device: DeviceDef, definition: EntityDef, behaviour: Behaviour) -> None:
        """Keep the parts."""
        self.device = device
        self.definition = definition
        self.behaviour = behaviour


@dataclass(frozen=True)
class RuntimeParts:
    """What every MQTT output needs: the instance, the client, the factories and the audit log."""

    hass: HomeAssistant
    client: MqttClient
    behaviours: BehaviourFactory
    live: Live
    audit: AuditLog
    audit_factory: AuditEntryFactory


class BehaviourRuntime(ABC):
    """Starts the behaviours of devices, follows the tick and calls the output to publish."""

    def __init__(self, parts: RuntimeParts) -> None:
        """Keep the parts."""
        self._hass = parts.hass
        self._client = parts.client
        self._behaviours = parts.behaviours
        self._live = parts.live
        self._audit = parts.audit
        self._audit_factory = parts.audit_factory
        self._entries: dict[tuple[str, str], RuntimeEntry] = {}
        self._by_device: dict[str, dict[str, RuntimeEntry]] = {}
        self._unsubscribe: Callable[[], None] | None = None
        self._unsubscribe_tick: CALLBACK_TYPE | None = None
        self._late: dict[str, set[CALLBACK_TYPE]] = {}

    def require_connection(self) -> None:
        """Raise TDC-OUT-002 unless MQTT is usable."""
        self._client.require()

    async def async_check(self) -> None:
        """Raise unless the output may be used now; the default is a usable MQTT connection."""
        self.require_connection()

    def check_device(self, device: DeviceDef) -> None:
        """Raise if `device` cannot be published by this output; the default accepts every device."""
        return None

    async def async_start(self, devices: list[DeviceDef]) -> None:
        """Start the stored devices after a restart once MQTT is connected."""
        if await self._client.async_wait():
            await self.async_add(devices)
        else:
            self._audit.record(self._audit_factory.mqtt_failed("-", "MQTT is not set up"))

    async def async_add(self, devices: list[DeviceDef]) -> None:
        """Start the behaviours of `devices` and publish what the output publishes at the start."""
        await self._async_prepare()
        added = [
            self._start(device, definition) for device in devices for definition in device.entities
        ]
        await self._async_listen()
        await self._async_announce(added, devices)

    async def async_remove(self, device: DeviceDef) -> None:
        """Stop the behaviours of `device`; the removal deletes its retained topics."""
        for definition in device.entities:
            entry = self._entries.pop((device.id, definition.key), None)
            self._by_device.get(device.id, {}).pop(definition.key, None)
            if entry is not None:
                entry.behaviour.close()
                self._live.pop((device.id, definition.key), None)
        if not self._by_device.get(device.id):
            self._by_device.pop(device.id, None)
        self._cancel_late(device.id)
        if not self._entries:
            self._stop_listening()
        await self._async_removed(device)

    async def async_stop(self) -> None:
        """Mark everything offline, stop the behaviours and stop listening."""
        if self._client.available():
            await self._async_offline(list(self._entries.values()))
        for entry in self._entries.values():
            entry.behaviour.close()
            self._live.pop((entry.device.id, entry.definition.key), None)
        self._entries.clear()
        self._by_device.clear()
        for device_id in list(self._late):
            self._cancel_late(device_id)
        self._stop_listening()

    @abstractmethod
    def _make_entry(
        self, device: DeviceDef, definition: EntityDef, behaviour: Behaviour
    ) -> RuntimeEntry:
        """Return the entry of an entity, with what the output needs besides the behaviour."""

    @abstractmethod
    def _command_pattern(self) -> str:
        """Return the topic filter that receives every command of this output."""

    @abstractmethod
    def _on_message(self, topic: str, payload: str) -> None:
        """Apply a command message (runs on the event loop)."""

    @abstractmethod
    async def _async_announce(self, added: list[RuntimeEntry], devices: list[DeviceDef]) -> None:
        """Publish discovery, availability and states of the entities that were just started."""

    @abstractmethod
    async def _async_changed(self, entry: RuntimeEntry) -> None:
        """Publish what changed on an entity."""

    @abstractmethod
    async def _async_offline(self, entries: list[RuntimeEntry]) -> None:
        """Mark the entities offline."""

    @abstractmethod
    def _wire(self, entry: RuntimeEntry) -> None:
        """Connect the events of the behaviour to the output, if the platform has any."""

    async def _async_prepare(self) -> None:
        """Check or publish what has to be in place before devices start; default: nothing."""
        return None

    async def _async_removed(self, device: DeviceDef) -> None:
        """Update shared topics after a device was removed; default: nothing."""
        return None

    def _start(self, device: DeviceDef, definition: EntityDef) -> RuntimeEntry:
        """Create the behaviour of one entity and connect it to MQTT."""
        behaviour = self._behaviours.create(device, definition)
        entry = self._make_entry(device, definition, behaviour)
        behaviour.on_change = lambda: self._schedule(self._async_changed(entry))
        self._wire(entry)
        self._live[(device.id, definition.key)] = behaviour
        self._entries[(device.id, definition.key)] = entry
        self._by_device.setdefault(device.id, {})[definition.key] = entry
        return entry

    def _schedule(self, work: Any) -> None:
        """Run `work` on the event loop without waiting for it."""
        self._hass.async_create_task(work)

    def _device_entries(self, device_id: str) -> list[RuntimeEntry]:
        """Return the started entries of one device without scanning the others."""
        return list(self._by_device.get(device_id, {}).values())

    async def _async_listen(self) -> None:
        """Subscribe to the commands and follow the tick, once."""
        if self._unsubscribe is None:
            self._unsubscribe = await self._client.async_subscribe(
                self._command_pattern(), self._on_message
            )
        if self._unsubscribe_tick is None:
            self._unsubscribe_tick = async_dispatcher_connect(
                self._hass, SIGNAL_TICK, self._on_tick
            )

    def _stop_listening(self) -> None:
        """Cancel the subscription and the tick."""
        if self._unsubscribe is not None:
            self._unsubscribe()
            self._unsubscribe = None
        if self._unsubscribe_tick is not None:
            self._unsubscribe_tick()
            self._unsubscribe_tick = None

    @callback
    def _on_tick(self) -> None:
        """Publish the entities whose value changed."""
        for entry in list(self._entries.values()):
            if entry.behaviour.tick(entry.behaviour.now()):
                self._schedule(self._async_changed(entry))

    async def _async_deliver(
        self,
        behaviours: list[Behaviour],
        topic: str,
        payload: str,
        device_id: str,
        *,
        retain: bool = True,
    ) -> None:
        """Publish a state or an event, held back by a late fault and repeated by a duplicate one."""
        delay = max((item.message_delay_s for item in behaviours), default=0.0)
        copies = 1 + max((item.message_repeats for item in behaviours), default=0)
        if delay <= 0:
            await self._async_copies(topic, payload, device_id, copies, retain)
            return
        timers = self._late.setdefault(device_id, set())

        @callback
        def fire(_now: datetime) -> None:
            """Send the held back message."""
            timers.discard(cancel)
            self._schedule(self._async_copies(topic, payload, device_id, copies, retain))

        cancel = async_call_later(self._hass, delay, fire)
        timers.add(cancel)

    async def _async_copies(
        self, topic: str, payload: str, device_id: str, copies: int, retain: bool
    ) -> None:
        """Publish the same message `copies` times."""
        for _ in range(copies):
            await self._async_publish(topic, payload, device_id, retain=retain)

    def _cancel_late(self, device_id: str) -> None:
        """Drop the messages of a device that are still held back."""
        for cancel in self._late.pop(device_id, set()):
            cancel()

    async def _async_publish(
        self, topic: str, payload: str, device_id: str | None, *, retain: bool = True
    ) -> None:
        """Publish; a failure while the system runs is logged and does not stop the rest."""
        try:
            await self._client.async_publish(topic, payload, retain=retain, device_id=device_id)
        except HomeAssistantError, ValueError:
            self._audit.record(self._audit_factory.mqtt_failed(topic, "publish failed"))
