"""The devices of the MQTT discovery output: discovery, states and commands (concept 7.3)."""

from __future__ import annotations

import json
from typing import cast

from homeassistant.core import callback

from ...const import DISCOVERY_PREFIX
from ...core.keys import KEY_AVAILABILITY
from ...engine.behaviours import Behaviour
from ...model.models import DeviceDef, EntityDef
from .profiles import OFFLINE, ONLINE, SET, MqttProfile, MqttProfileFactory, Topics
from .runtime import BehaviourRuntime, RuntimeEntry, RuntimeParts

COMMAND_PARTS = 4


class _Entry(RuntimeEntry):
    """One entity published over MQTT discovery: its profile and topics."""

    def __init__(
        self,
        device: DeviceDef,
        definition: EntityDef,
        behaviour: Behaviour,
        profile: MqttProfile,
        base: str,
    ) -> None:
        """Keep the profile and build the topics."""
        super().__init__(device, definition, behaviour)
        self.profile = profile
        self.topics = Topics(base, device.id, definition.key)


class MqttDevices(BehaviourRuntime):
    """Runs the behaviours of the devices with the output `mqtt` and talks to the broker for them."""

    def __init__(self, parts: RuntimeParts, profiles: MqttProfileFactory, base_topic: str) -> None:
        """Keep the profiles and the base topic."""
        super().__init__(parts)
        self._profiles = profiles
        self._base = base_topic

    def _make_entry(
        self, device: DeviceDef, definition: EntityDef, behaviour: Behaviour
    ) -> RuntimeEntry:
        """Return the entry with the profile of the platform."""
        return _Entry(
            device, definition, behaviour, self._profiles.create(definition.platform), self._base
        )

    def _wire(self, entry: RuntimeEntry) -> None:
        """Let the profile publish events of the behaviour without retain."""
        entry = self._mqtt(entry)
        entry.profile.attach(
            entry.behaviour,
            lambda facet, payload: self._schedule(
                self._async_send(entry, facet, payload, retain=False)
            ),
        )

    def _command_pattern(self) -> str:
        """Return the filter for `<base>/<device>/<key>/<facet>/set`."""
        return f"{self._base}/+/+/+/{SET}"

    @callback
    def _on_message(self, topic: str, payload: str) -> None:
        """Apply a command received on `<base>/<device>/<key>/<facet>/set`."""
        parts = topic.removeprefix(f"{self._base}/").split("/")
        if len(parts) != COMMAND_PARTS or parts[-1] != SET:
            return
        device_id, key, facet = parts[0], parts[1], parts[2]
        found = self._entries.get((device_id, key))
        if found is None:
            return
        entry = self._mqtt(found)
        try:
            entry.profile.command(entry.behaviour, facet, payload)
        except ValueError, KeyError, TypeError, AttributeError:
            self._audit.record(self._audit_factory.mqtt_failed(topic, "invalid command"))

    async def _async_announce(self, added: list[RuntimeEntry], devices: list[DeviceDef]) -> None:
        """Publish the discovery config, availability and states of the started entities."""
        for found in added:
            entry = self._mqtt(found)
            component = entry.profile.component
            topic = f"{DISCOVERY_PREFIX}/{component}/tdc_{entry.device.id}/{entry.definition.key}/config"
            payload = entry.profile.config(entry.topics, entry.device, entry.definition)
            await self._async_publish(topic, json.dumps(payload), entry.device.id)
            await self._async_changed(entry)

    async def _async_changed(self, entry: RuntimeEntry) -> None:
        """Publish availability and every state of an entity."""
        mine = self._mqtt(entry)
        available = ONLINE if mine.behaviour.available else OFFLINE
        await self._async_send(mine, KEY_AVAILABILITY, available)
        for facet, payload in mine.profile.states(mine.behaviour).items():
            await self._async_send(mine, facet, payload)

    async def _async_offline(self, entries: list[RuntimeEntry]) -> None:
        """Mark the entities offline."""
        for entry in entries:
            await self._async_send(self._mqtt(entry), KEY_AVAILABILITY, OFFLINE)

    async def _async_send(
        self, entry: _Entry, facet: str, payload: str, *, retain: bool = True
    ) -> None:
        """Publish `payload` on the topic of `facet`."""
        topic = entry.topics.facet(facet)
        if facet == KEY_AVAILABILITY:
            await self._async_publish(topic, payload, entry.device.id, retain=retain)
        else:
            await self._async_deliver(
                [entry.behaviour], topic, payload, entry.device.id, retain=retain
            )

    def _mqtt(self, entry: RuntimeEntry) -> _Entry:
        """Return the entry as one of this output."""
        return cast(_Entry, entry)
