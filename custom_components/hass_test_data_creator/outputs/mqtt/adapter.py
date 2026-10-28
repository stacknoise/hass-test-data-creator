"""The adapter of the MQTT outputs: discovery and Zigbee2MQTT share it."""

from __future__ import annotations

from ...model.models import DeviceDef
from ..adapter import OutputAdapter
from .runtime import BehaviourRuntime


class MqttAdapter(OutputAdapter):
    """Hands the devices to the runtime of its output, which publishes their topics."""

    def __init__(self, devices: BehaviourRuntime) -> None:
        """Keep the runtime of the output."""
        self._devices = devices

    async def create(self, device: DeviceDef, area_id: str | None) -> None:
        """Check that the output may be used; the area travels as `suggested_area` in discovery."""
        await self._devices.async_check()

    async def announce(self, devices: list[DeviceDef]) -> None:
        """Start the devices and publish their topics."""
        await self._devices.async_add(devices)

    async def remove(self, device: DeviceDef) -> None:
        """Stop the behaviours of the device; the removal deletes its retained topics."""
        await self._devices.async_remove(device)
