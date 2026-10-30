"""Commands about the integration itself and the templates (concept 8.2)."""

from __future__ import annotations

from typing import Any

from homeassistant.components.websocket_api import ActiveConnection
from homeassistant.core import HomeAssistant
from homeassistant.loader import async_get_integration
import voluptuous as vol

from ..const import (
    API_VERSION,
    DEFAULT_MODEL,
    DOMAIN,
    FEATURES,
    MAX_BATCH,
    MAX_DEVICES,
    MAX_ENTITIES_PER_DEVICE,
    MAX_TRANSFER_BYTES,
    OUTPUT_MQTT,
    OUTPUT_NATIVE,
    OUTPUT_Z2M,
    PLATFORMS,
)
from ..core.command import tdc_command
from ..core.keys import KEY_ENTITIES, KEY_FEATURES, KEY_ID, KEY_MODEL, KEY_NAME, KEY_TEMPLATE_ID
from ..data import get_data
from ..engine.signals import SHAPE_NAMES
from ..scheduler.triggers import TRIGGER_TYPES


@tdc_command(f"{DOMAIN}/info")
async def ws_info(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Return version, API version, features, limits, outputs, shapes and platforms.

    The MQTT and Zigbee2MQTT outputs are listed only while the MQTT integration is connected.
    """
    data = get_data(hass)
    await data.csv.async_refresh()
    mqtt = data.mqtt.available()
    integration = await async_get_integration(hass, DOMAIN)
    return {
        "version": str(integration.version),
        "api_version": API_VERSION,
        KEY_FEATURES: list(FEATURES),
        "limits": {
            "max_devices": MAX_DEVICES,
            "max_batch": MAX_BATCH,
            "max_entities_per_device": MAX_ENTITIES_PER_DEVICE,
            "max_transfer_bytes": MAX_TRANSFER_BYTES,
        },
        "outputs": [OUTPUT_NATIVE, *([OUTPUT_MQTT, OUTPUT_Z2M] if mqtt else [])],
        OUTPUT_MQTT: mqtt,
        "shapes": list(SHAPE_NAMES),
        "triggers": list(TRIGGER_TYPES),
        "platforms": list(PLATFORMS),
        "actions": data.action_runner.actions(),
        "tick_seconds": data.tick.seconds,
        "time_lapse": data.clock.factor,
        "csv_files": data.csv.names(),
        "device_count": data.store.device_count(),
    }


@tdc_command(f"{DOMAIN}/templates/list")
async def ws_templates_list(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> list[dict[str, Any]]:
    """Return all templates with their entities."""
    return [item.to_summary() for item in get_data(hass).template_registry.all()]


@tdc_command(
    f"{DOMAIN}/templates/save",
    {
        vol.Required(KEY_TEMPLATE_ID): str,
        vol.Required(KEY_NAME): str,
        vol.Optional(KEY_MODEL, default=DEFAULT_MODEL): str,
        vol.Required(KEY_ENTITIES): [dict],
    },
)
async def ws_templates_save(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Save an own template (new or replacing one of the same id) and return it."""
    data = {key: msg[key] for key in (KEY_NAME, KEY_MODEL, KEY_ENTITIES)}
    data[KEY_ID] = msg[KEY_TEMPLATE_ID]
    template = await get_data(hass).template_registry.async_save(hass, data)
    return template.to_summary()


@tdc_command(f"{DOMAIN}/templates/delete", {vol.Required(KEY_TEMPLATE_ID): str})
async def ws_templates_delete(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Delete an own template; built-in templates cannot be deleted."""
    await get_data(hass).template_registry.async_delete(hass, msg[KEY_TEMPLATE_ID])
    return {}
