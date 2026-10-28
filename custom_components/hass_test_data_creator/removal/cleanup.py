"""Cleanup when the config entry is removed (concept 10.3)."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr

from ..areas.assigner import AreaAssigner
from ..store.store import TdcStore


async def async_cleanup_after_entry_removal(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Remove the devices of the entry, then the created areas that are empty and the store.

    Home Assistant removes the devices only after this hook, so they are removed here first;
    otherwise their areas would not be empty.
    """
    registry = dr.async_get(hass)
    for device in dr.async_entries_for_config_entry(registry, entry.entry_id):
        registry.async_remove_device(device.id)
    store = TdcStore(hass)
    await store.async_load()
    AreaAssigner(hass, store).delete_empty_created()
    await store.async_remove()
