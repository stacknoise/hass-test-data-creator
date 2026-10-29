"""Output adapters and their factory (concept 7.1, 13.2)."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from ..const import OUTPUT_MQTT, OUTPUT_NATIVE, OUTPUT_Z2M
from ..core.errors import ErrorCode, OutputError
from ..core.protocols import GroupPublisher
from .base import OutputAdapter
from .mqtt.adapter import MqttAdapter
from .mqtt.client import MqttClient
from .mqtt.devices import MqttDevices
from .mqtt.runtime import BehaviourRuntime
from .native.adapter import NativeAdapter
from .z2m.devices import Z2mDevices


class OutputAdapterFactory:
    """Creates the adapter for the output of a device."""

    def __init__(
        self,
        hass: HomeAssistant,
        entry: ConfigEntry,
        mqtt: MqttClient,
        devices: MqttDevices,
        z2m_devices: Z2mDevices,
        groups: GroupPublisher,
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

    def runtime_for(self, output: str) -> BehaviourRuntime | None:
        """Return the runtime of an MQTT-based output, or None for the native output."""
        if output == OUTPUT_MQTT:
            return self._mqtt_devices
        if output == OUTPUT_Z2M:
            return self._z2m_devices
        return None

    def runtimes(self) -> dict[str, BehaviourRuntime]:
        """Return the runtimes of all MQTT-based outputs by output name."""
        return {
            output: runtime
            for output in (OUTPUT_MQTT, OUTPUT_Z2M)
            if (runtime := self.runtime_for(output)) is not None
        }

    def create(self, output: str) -> OutputAdapter:
        """Return the adapter for `output`; native, MQTT discovery or Zigbee2MQTT."""
        if output == OUTPUT_NATIVE:
            return NativeAdapter(self._hass, self._entry)
        if output == OUTPUT_MQTT:
            return MqttAdapter(self._mqtt_devices)
        if output == OUTPUT_Z2M:
            return MqttAdapter(self._z2m_devices)
        raise OutputError(ErrorCode.OUT_UNSUPPORTED)
