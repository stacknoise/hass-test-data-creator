"""Common setup of the entity platforms (concept 7.2)."""

from __future__ import annotations

from collections.abc import Awaitable, Callable

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from ..const import SIGNAL_DEVICES_ADDED
from ..core.runtime import get_data
from ..model.models import DeviceDef


def platform_setup(
    platform: str,
) -> Callable[[HomeAssistant, ConfigEntry, AddEntitiesCallback], Awaitable[None]]:
    """Return the `async_setup_entry` of the platform `platform`."""

    async def async_setup_entry(
        hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
    ) -> None:
        """Add the stored entities and the ones of devices created later."""
        data = get_data(hass)

        @callback
        def _add(devices: list[DeviceDef]) -> None:
            """Add the entities of this platform for `devices`."""
            entities = [
                data.entity_factory.create(device, definition)
                for device in devices
                for definition in device.entities
                if definition.platform == platform
            ]
            if entities:
                async_add_entities(entities)

        _add(data.store.devices())
        entry.async_on_unload(async_dispatcher_connect(hass, SIGNAL_DEVICES_ADDED, _add))

    return async_setup_entry
