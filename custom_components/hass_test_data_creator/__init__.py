"""HASS Test Data Creator: test devices and test data for test environments."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.loader import async_get_integration

from .api import async_register_commands
from .const import DOMAIN, PLATFORMS
from .core.runtime import build_data
from .panel import async_register_panel, async_remove_panel
from .removal.cleanup import async_cleanup_after_entry_removal
from .services import async_register_services, async_remove_services


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Load the store and templates, set up the platforms, start the tick, register the panel."""
    data = build_data(hass, entry)
    await data.store.async_load()
    await data.template_registry.async_load(hass)
    hass.data[DOMAIN] = data
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    data.tick.start()
    async_register_services(hass)
    async_register_commands(hass)
    integration = await async_get_integration(hass, DOMAIN)
    await async_register_panel(hass, str(integration.version))
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Stop the tick, unload the platforms and remove services and panel."""
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unloaded:
        data = hass.data.pop(DOMAIN)
        data.tick.stop()
        await data.store.async_save()
        async_remove_services(hass)
        async_remove_panel(hass)
    return unloaded


async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Delete everything left behind: created areas and the storage file."""
    await async_cleanup_after_entry_removal(hass, entry)
