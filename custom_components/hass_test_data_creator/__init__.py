"""HASS Test Data Creator: test devices and test data for test environments."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.loader import async_get_integration
from homeassistant.util import dt as dt_util

from .api import async_register_commands
from .bootstrap import build_data
from .const import DOMAIN, PLATFORMS
from .panel import async_register_panel, async_remove_panel
from .removal.cleanup import async_cleanup_after_entry_removal
from .services import async_register_services, async_remove_services


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Load the store and templates, set up the platforms, start the tick, register the panel."""
    data = build_data(hass, entry)
    await data.store.async_load()
    data.clock.resume(data.store.time_lapse_start(data.clock.factor, dt_util.now()))
    await data.template_registry.async_load(hass)
    await data.csv.async_refresh()
    data.groups.load()
    hass.data[DOMAIN] = data
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    data.tick.start()
    data.schedules.async_start()
    data.labeler.start()
    for output, runtime in data.outputs.runtimes().items():
        stored = [item for item in data.store.devices() if item.output == output]
        if stored:
            entry.async_create_background_task(
                hass, runtime.async_start(stored), f"tdc_{output}_start"
            )
    entry.async_on_unload(entry.add_update_listener(_reload_after_options))
    async_register_services(hass)
    async_register_commands(hass)
    integration = await async_get_integration(hass, DOMAIN)
    await async_register_panel(hass, str(integration.version))
    return True


async def _reload_after_options(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload the entry when the options changed, so that new base topics take effect."""
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Stop the tick, unload the platforms and remove services and panel."""
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unloaded:
        data = hass.data.pop(DOMAIN)
        data.tick.stop()
        data.labeler.stop()
        data.schedules.async_stop()
        data.scenarios.async_stop()
        for runtime in data.outputs.runtimes().values():
            await runtime.async_stop()
        await data.store.async_save()
        async_remove_services(hass)
        async_remove_panel(hass)
    return unloaded


async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Delete everything left behind: created areas and the storage file."""
    await async_cleanup_after_entry_removal(hass, entry)
