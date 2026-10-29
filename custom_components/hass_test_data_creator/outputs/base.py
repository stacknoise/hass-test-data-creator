"""The interface of an output adapter (concept 7.1)."""

from __future__ import annotations

from abc import ABC, abstractmethod

from ..model.models import DeviceDef


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
