"""Output adapters and their factory (concept 7.1, 13.2)."""

from __future__ import annotations

from abc import ABC, abstractmethod

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from ..const import OUTPUT_MQTT, OUTPUT_NATIVE
from ..core.errors import ErrorCode, OutputError
from ..model.models import DeviceDef
from .mqtt.client import MqttClient
from .mqtt.devices import MqttDevices


class OutputAdapter(ABC):
    """Turns a device description into Home Assistant objects or MQTT messages."""

    @abstractmethod
    async def create(self, device: DeviceDef, area_id: str | None) -> None:
        """Register `device` in its output; `area_id` is the resolved area, if any."""

    @abstractmethod
    async def announce(self, devices: list[DeviceDef]) -> None:
        """Make the entities of the registered `devices` appear."""

    @abstractmethod
    async def remove(self, device: DeviceDef) -> None:
        """Remove `device` and everything it created from its output."""


class OutputAdapterFactory:
    """Creates the adapter for the output of a device."""

    def __init__(
        self, hass: HomeAssistant, entry: ConfigEntry, mqtt: MqttClient, devices: MqttDevices
    ) -> None:
        """Keep the instance, the config entry, the MQTT client and the MQTT devices."""
        self._hass = hass
        self._entry = entry
        self._mqtt = mqtt
        self._mqtt_devices = devices

    def check_clearable(self, topics: list[str]) -> None:
        """Raise TDC-OUT-002 if there are topics to clear and MQTT is not usable."""
        if topics:
            self._mqtt.require()

    async def async_clear_topics(self, topics: list[str]) -> None:
        """Delete the retained messages on `topics`; raises TDC-OUT-002 if MQTT is not usable."""
        if topics:
            await self._mqtt.async_clear(topics)

    def create(self, output: str) -> OutputAdapter:
        """Return the adapter for `output`; the Zigbee2MQTT output follows."""
        if output == OUTPUT_NATIVE:
            from .native.adapter import NativeAdapter  # noqa: PLC0415

            return NativeAdapter(self._hass, self._entry)
        if output == OUTPUT_MQTT:
            from .mqtt.adapter import MqttAdapter  # noqa: PLC0415

            return MqttAdapter(self._mqtt_devices)
        raise OutputError(ErrorCode.OUT_UNSUPPORTED)
