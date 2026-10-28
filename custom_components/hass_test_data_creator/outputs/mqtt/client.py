"""Access to the MQTT integration of the same instance: publish, subscribe, clean up (concept 7.3)."""

from __future__ import annotations

from collections.abc import Callable

from homeassistant.components import mqtt
from homeassistant.core import HomeAssistant

from ...core.errors import ErrorCode, OutputError
from ...store.store import TdcStore

MESSAGE_CALLBACK = Callable[[str, str], None]


class MqttClient:
    """Uses the broker of the MQTT integration and records every retained topic it publishes."""

    def __init__(self, hass: HomeAssistant, store: TdcStore) -> None:
        """Keep the instance and the store that holds `published_topics`."""
        self._hass = hass
        self._store = store

    def available(self) -> bool:
        """Whether the MQTT integration is set up and connected to its broker."""
        try:
            return mqtt.is_connected(self._hass)
        except KeyError:
            return False

    async def async_publish(
        self, topic: str, payload: str, *, retain: bool = True, device_id: str | None = None
    ) -> None:
        """Publish `payload`; a retained topic is recorded for `device_id` (None: shared topics)."""
        self._require()
        await mqtt.async_publish(self._hass, topic, payload, 0, retain)
        if retain:
            self._store.add_topic(topic, device_id)
            self._store.schedule_save()

    async def async_subscribe(self, topic: str, callback: MESSAGE_CALLBACK) -> Callable[[], None]:
        """Call `callback(topic, payload)` for every message on `topic`; return the unsubscribe."""
        self._require()

        def received(message: mqtt.ReceiveMessage) -> None:
            """Pass topic and text payload on."""
            callback(message.topic, str(message.payload))

        return await mqtt.async_subscribe(self._hass, topic, received)

    async def async_clear(self, topics: list[str]) -> None:
        """Delete the retained messages on `topics` and forget the topics."""
        self._require()
        for topic in topics:
            await mqtt.async_publish(self._hass, topic, "", 0, True)
        self._store.forget_topics(topics)

    def _require(self) -> None:
        """Raise TDC-OUT-002 unless MQTT is set up and connected."""
        if not self.available():
            raise OutputError(ErrorCode.OUT_MQTT_UNAVAILABLE)
