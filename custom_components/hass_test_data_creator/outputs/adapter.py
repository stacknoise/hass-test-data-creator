"""Output adapters and their factory (concept 7.1, 13.2)."""

from __future__ import annotations

from abc import ABC, abstractmethod

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from ..const import OUTPUT_NATIVE
from ..core.errors import ErrorCode, OutputError
from ..model.models import DeviceDef


class OutputAdapter(ABC):
    """Turns a device description into Home Assistant objects or MQTT messages."""

    @abstractmethod
    def create(self, device: DeviceDef, area_id: str | None) -> None:
        """Register `device` in its output; `area_id` is the resolved area, if any."""

    @abstractmethod
    def announce(self, devices: list[DeviceDef]) -> None:
        """Make the entities of the registered `devices` appear."""

    @abstractmethod
    def remove(self, device: DeviceDef) -> None:
        """Remove `device` and everything it created from its output."""


class OutputAdapterFactory:
    """Creates the adapter for the output of a device."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Keep the instance and the config entry the adapters work for."""
        self._hass = hass
        self._entry = entry

    def create(self, output: str) -> OutputAdapter:
        """Return the adapter for `output`; MQTT outputs arrive in v0.3."""
        if output == OUTPUT_NATIVE:
            from .native.adapter import NativeAdapter  # noqa: PLC0415

            return NativeAdapter(self._hass, self._entry)
        raise OutputError(ErrorCode.OUT_UNSUPPORTED)
