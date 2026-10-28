"""Native output: devices in the registry and entities on the Home Assistant platforms."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr, label_registry as lr
from homeassistant.helpers.dispatcher import async_dispatcher_send

from ...const import DOMAIN, LABEL_NAME, MANUFACTURER, SIGNAL_DEVICES_ADDED
from ...model.models import DeviceDef
from ..adapter import OutputAdapter


class NativeAdapter(OutputAdapter):
    """Registers devices with markers (concept 4.4) and lets the platforms add the entities."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Keep the instance and the config entry that owns the devices."""
        self._hass = hass
        self._entry = entry

    def create(self, device: DeviceDef, area_id: str | None) -> None:
        """Add `device` to the device registry with the entry, manufacturer and test label."""
        labels = lr.async_get(self._hass)
        label = labels.async_get_label_by_name(LABEL_NAME) or labels.async_create(LABEL_NAME)
        registry = dr.async_get(self._hass)
        entry = registry.async_get_or_create(
            config_entry_id=self._entry.entry_id,
            identifiers={(DOMAIN, device.id)},
            name=device.name,
            manufacturer=MANUFACTURER,
            model=device.model,
        )
        registry.async_update_device(entry.id, area_id=area_id, labels={label.label_id})

    def announce(self, devices: list[DeviceDef]) -> None:
        """Tell the platforms to add the entities of `devices`."""
        async_dispatcher_send(self._hass, SIGNAL_DEVICES_ADDED, devices)

    def remove(self, device: DeviceDef) -> None:
        """Remove the registry device of `device`; Home Assistant removes its entities."""
        registry = dr.async_get(self._hass)
        entry = registry.async_get_device(identifiers={(DOMAIN, device.id)})
        if entry is not None:
            registry.async_remove_device(entry.id)
