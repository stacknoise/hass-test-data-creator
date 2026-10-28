"""The devices of the MQTT discovery output: behaviours, state publishing and commands (concept 7.3)."""

from __future__ import annotations

from collections.abc import Callable
import json
import logging
from typing import Any

from homeassistant.core import CALLBACK_TYPE, HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.dispatcher import async_dispatcher_connect

from ...audit.factory import AuditEntryFactory
from ...audit.log import AuditLog
from ...const import DISCOVERY_PREFIX, SIGNAL_TICK
from ...engine.behaviour_factory import BehaviourFactory
from ...engine.behaviours import Behaviour, Live
from ...engine.tick import signal_time
from ...model.models import DeviceDef, EntityDef
from .client import MqttClient
from .profiles import OFFLINE, ONLINE, SET, MqttProfile, MqttProfileFactory, Topics, mqtt_unique_id

_LOGGER = logging.getLogger(__name__)
COMMAND_PARTS = 4


class _Entry:
    """One entity published over MQTT: its behaviour, profile and topics."""

    def __init__(
        self,
        device: DeviceDef,
        definition: EntityDef,
        behaviour: Behaviour,
        profile: MqttProfile,
        base: str,
    ) -> None:
        """Keep the parts and build the topics."""
        self.device = device
        self.definition = definition
        self.behaviour = behaviour
        self.profile = profile
        self.topics = Topics(base, device.id, definition.key)


class MqttDevices:
    """Runs the behaviours of the devices with the output `mqtt` and talks to the broker for them."""

    def __init__(
        self,
        hass: HomeAssistant,
        client: MqttClient,
        behaviours: BehaviourFactory,
        live: Live,
        profiles: MqttProfileFactory,
        base_topic: str,
        audit: AuditLog,
        audit_factory: AuditEntryFactory,
    ) -> None:
        """Keep the collaborators."""
        self._hass = hass
        self._client = client
        self._behaviours = behaviours
        self._live = live
        self._profiles = profiles
        self._base = base_topic
        self._audit = audit
        self._audit_factory = audit_factory
        self._entries: dict[tuple[str, str], _Entry] = {}
        self._unsubscribe: Callable[[], None] | None = None
        self._unsubscribe_tick: CALLBACK_TYPE | None = None

    def require_connection(self) -> None:
        """Raise TDC-OUT-002 unless MQTT is usable."""
        self._client.require()

    async def async_start(self, devices: list[DeviceDef]) -> None:
        """Start the stored devices after a restart once MQTT is connected."""
        if await self._client.async_wait():
            await self.async_add(devices)
        else:
            self._audit.record(self._audit_factory.mqtt_failed("-", "MQTT is not set up"))

    async def async_add(self, devices: list[DeviceDef]) -> None:
        """Start the behaviours of `devices`, publish their discovery, availability and states."""
        added: list[_Entry] = []
        for device in devices:
            for definition in device.entities:
                added.append(self._start(device, definition))
        await self._async_listen()
        for entry in added:
            await self._async_publish_config(entry)
            await self._async_publish_all(entry)

    async def async_remove(self, device: DeviceDef) -> None:
        """Stop the behaviours of `device`; the removal deletes its retained topics."""
        for definition in device.entities:
            entry = self._entries.pop((device.id, definition.key), None)
            if entry is not None:
                entry.behaviour.close()
                self._live.pop((device.id, definition.key), None)
        if not self._entries:
            self._stop_listening()

    async def async_stop(self) -> None:
        """Mark every entity offline, stop the behaviours and stop listening."""
        if self._client.available():
            for entry in self._entries.values():
                await self._async_send(entry, "availability", OFFLINE)
        for entry in self._entries.values():
            entry.behaviour.close()
            self._live.pop((entry.device.id, entry.definition.key), None)
        self._entries.clear()
        self._stop_listening()

    def _start(self, device: DeviceDef, definition: EntityDef) -> _Entry:
        """Create the behaviour of one entity and connect it to MQTT."""
        behaviour = self._behaviours.create(device, definition)
        entry = _Entry(
            device, definition, behaviour, self._profiles.create(definition.platform), self._base
        )
        behaviour.on_change = lambda: self._schedule(self._async_publish_all(entry))
        entry.profile.attach(
            behaviour,
            lambda facet, payload: self._schedule(
                self._async_send(entry, facet, payload, retain=False)
            ),
        )
        self._live[(device.id, definition.key)] = behaviour
        self._entries[(device.id, definition.key)] = entry
        return entry

    def _schedule(self, work: Any) -> None:
        """Run `work` on the event loop without waiting for it."""
        self._hass.async_create_task(work)

    async def _async_listen(self) -> None:
        """Subscribe to the commands and follow the tick, once."""
        if self._unsubscribe is None:
            pattern = f"{self._base}/+/+/+/{SET}"
            self._unsubscribe = await self._client.async_subscribe(pattern, self._on_message)
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
        now = signal_time()
        for entry in list(self._entries.values()):
            if entry.behaviour.tick(now):
                self._schedule(self._async_publish_all(entry))

    @callback
    def _on_message(self, topic: str, payload: str) -> None:
        """Apply a command received on `<base>/<device>/<key>/<facet>/set`."""
        parts = topic.removeprefix(f"{self._base}/").split("/")
        if len(parts) != COMMAND_PARTS or parts[-1] != SET:
            return
        device_id, key, facet = parts[0], parts[1], parts[2]
        entry = self._entries.get((device_id, key))
        if entry is None:
            return
        try:
            entry.profile.command(entry.behaviour, facet, payload)
        except ValueError, KeyError, TypeError, AttributeError:
            self._audit.record(self._audit_factory.mqtt_failed(topic, "invalid command"))

    async def _async_publish_config(self, entry: _Entry) -> None:
        """Publish the retained discovery config of an entity."""
        topic = f"{DISCOVERY_PREFIX}/{entry.profile.component}/tdc_{entry.device.id}/{entry.definition.key}/config"
        payload = entry.profile.config(entry.topics, entry.device, entry.definition)
        await self._async_publish(topic, json.dumps(payload), entry.device.id, retain=True)

    async def _async_publish_all(self, entry: _Entry) -> None:
        """Publish availability and every state of an entity."""
        await self._async_send(
            entry, "availability", ONLINE if entry.behaviour.available else OFFLINE
        )
        for facet, payload in entry.profile.states(entry.behaviour).items():
            await self._async_send(entry, facet, payload)

    async def _async_send(
        self, entry: _Entry, facet: str, payload: str, *, retain: bool = True
    ) -> None:
        """Publish `payload` on the topic of `facet`."""
        await self._async_publish(
            entry.topics.facet(facet), payload, entry.device.id, retain=retain
        )

    async def _async_publish(
        self, topic: str, payload: str, device_id: str, *, retain: bool
    ) -> None:
        """Publish; a failure while the system runs is logged and does not stop the rest."""
        try:
            await self._client.async_publish(topic, payload, retain=retain, device_id=device_id)
        except HomeAssistantError as error:
            _LOGGER.debug("MQTT publish failed on %s: %s", topic, error)
            self._audit.record(self._audit_factory.mqtt_failed(topic, "publish failed"))


def unique_id_of(device: DeviceDef, definition: EntityDef) -> str:
    """Return the MQTT unique id of an entity; used to find its entity in the registry."""
    return mqtt_unique_id(device.id, definition.key)
