"""The MQTT discovery output: devices appear in Home Assistant through the MQTT integration."""

from __future__ import annotations

from ...model.models import DeviceDef
from ..adapter import OutputAdapter
from .devices import MqttDevices


class MqttAdapter(OutputAdapter):
    """Hands the devices to MqttDevices, which publishes their discovery and states."""

    def __init__(self, devices: MqttDevices) -> None:
        """Keep the runtime of the MQTT devices."""
        self._devices = devices

    async def create(self, device: DeviceDef, area_id: str | None) -> None:
        """Check that MQTT is usable; the area travels as `suggested_area` in the discovery."""
        self._devices.require_connection()

    async def announce(self, devices: list[DeviceDef]) -> None:
        """Start the devices and publish their discovery config and states."""
        await self._devices.async_add(devices)

    async def remove(self, device: DeviceDef) -> None:
        """Stop the behaviours of the device; the removal deletes its retained topics."""
        await self._devices.async_remove(device)
