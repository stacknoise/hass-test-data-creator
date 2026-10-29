"""Access to the MQTT integration of the same instance: publish, subscribe, clean up (concept 7.3)."""

from __future__ import annotations

import asyncio
from collections.abc import Callable

from homeassistant.components import mqtt
from homeassistant.components.mqtt.util import async_wait_for_mqtt_client
from homeassistant.core import HomeAssistant, callback as hass_callback

from ...core.errors import ErrorCode, OutputError
from ...store.store import TdcStore

MESSAGE_CALLBACK = Callable[[str, str], None]
FOREIGN_PROBE_SECONDS = 3.0


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

    async def async_wait(self) -> bool:
        """Wait until the MQTT integration is connected; False if it is not set up."""
        return await async_wait_for_mqtt_client(self._hass)

    async def async_foreign_topic(self, base: str) -> str | None:
        """Return a retained topic under `base` that this integration did not publish, if one shows up.

        The probe listens to `<base>/#` for `FOREIGN_PROBE_SECONDS`; a broker that delivers its
        retained messages later than that is not noticed.
        """
        self.require()
        ours = set(self._store.topics())
        found: asyncio.Future[str] = self._hass.loop.create_future()

        @hass_callback
        def received(message: mqtt.ReceiveMessage) -> None:
            """Take the first retained message of a topic that is not ours."""
            if (
                message.retain
                and message.payload
                and message.topic not in ours
                and not found.done()
            ):
                found.set_result(message.topic)

        unsubscribe = await mqtt.async_subscribe(self._hass, f"{base}/#", received)
        try:
            async with asyncio.timeout(FOREIGN_PROBE_SECONDS):
                return await found
        except TimeoutError:
            return None
        finally:
            unsubscribe()

    async def async_publish(
        self, topic: str, payload: str, *, retain: bool = True, device_id: str | None = None
    ) -> None:
        """Publish `payload`; a retained topic is recorded for `device_id` (None: shared topics)."""
        self.require()
        await mqtt.async_publish(self._hass, topic, payload, 0, retain)
        if retain and self._store.add_topic(topic, device_id):
            self._store.schedule_save()

    async def async_subscribe(self, topic: str, callback: MESSAGE_CALLBACK) -> Callable[[], None]:
        """Call `callback(topic, payload)` for every message on `topic`; return the unsubscribe."""
        self.require()

        @hass_callback
        def received(message: mqtt.ReceiveMessage) -> None:
            """Pass topic and text payload on, on the event loop."""
            callback(message.topic, str(message.payload))

        return await mqtt.async_subscribe(self._hass, topic, received)

    async def async_clear(self, topics: list[str]) -> None:
        """Delete the retained messages on `topics` and forget the topics."""
        self.require()
        for topic in topics:
            await mqtt.async_publish(self._hass, topic, "", 0, True)
        self._store.forget_topics(topics)

    def require(self) -> None:
        """Raise TDC-OUT-002 unless MQTT is set up and connected."""
        if not self.available():
            raise OutputError(ErrorCode.OUT_MQTT_UNAVAILABLE)
