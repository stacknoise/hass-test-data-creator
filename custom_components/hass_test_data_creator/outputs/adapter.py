"""Output adapters and their factory (concept 7.1, 13.2)."""

from __future__ import annotations

from abc import ABC, abstractmethod

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from ..const import OUTPUT_MQTT, OUTPUT_NATIVE, OUTPUT_Z2M
from ..core.errors import ErrorCode, OutputError
from ..groups.manager import GroupManager
from ..model.models import DeviceDef
from .mqtt.client import MqttClient
from .mqtt.devices import MqttDevices
from .z2m.devices import Z2mDevices


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
        self,
        hass: HomeAssistant,
        entry: ConfigEntry,
        mqtt: MqttClient,
        devices: MqttDevices,
        z2m_devices: Z2mDevices,
        groups: GroupManager,
    ) -> None:
        """Keep the instance, the config entry, the MQTT client and the runtimes of the outputs."""
        self._hass = hass
        self._entry = entry
        self._mqtt = mqtt
        self._mqtt_devices = devices
        self._z2m_devices = z2m_devices
        self._groups = groups

    async def async_drop_groups(self, group_ids: list[str], device_ids: set[str]) -> None:
        """Delete groups and take removed devices out of the other groups."""
        await self._groups.async_drop(group_ids, device_ids)

    def check_clearable(self, topics: list[str]) -> None:
        """Raise TDC-OUT-002 if there are topics to clear and MQTT is not usable."""
        if topics:
            self._mqtt.require()

    async def async_clear_topics(self, topics: list[str]) -> None:
        """Delete the retained messages on `topics`; raises TDC-OUT-002 if MQTT is not usable."""
        if topics:
            await self._mqtt.async_clear(topics)

    def create(self, output: str) -> OutputAdapter:
        """Return the adapter for `output`; native, MQTT discovery or Zigbee2MQTT."""
        if output == OUTPUT_NATIVE:
            from .native.adapter import NativeAdapter  # noqa: PLC0415

            return NativeAdapter(self._hass, self._entry)
        if output == OUTPUT_MQTT:
            from .mqtt.adapter import MqttAdapter  # noqa: PLC0415

            return MqttAdapter(self._mqtt_devices)
        if output == OUTPUT_Z2M:
            from .mqtt.adapter import MqttAdapter  # noqa: PLC0415

            return MqttAdapter(self._z2m_devices)
        raise OutputError(ErrorCode.OUT_UNSUPPORTED)
