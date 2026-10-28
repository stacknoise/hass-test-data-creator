"""Commands about the integration itself and the templates (concept 8.2)."""

from __future__ import annotations

from typing import Any

from homeassistant.components.websocket_api import ActiveConnection
from homeassistant.core import HomeAssistant
from homeassistant.loader import async_get_integration

from ..const import (
    API_VERSION,
    DOMAIN,
    FEATURES,
    MAX_BATCH,
    MAX_DEVICES,
    MAX_ENTITIES_PER_DEVICE,
    OUTPUT_NATIVE,
    PLATFORMS,
)
from ..core.command import tdc_command
from ..core.runtime import get_data
from ..engine.signals import SHAPE_NAMES
from ..scheduler.triggers import TRIGGER_TYPES


@tdc_command(f"{DOMAIN}/info")
async def ws_info(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Return version, API version, features, limits, outputs, shapes and platforms."""
    data = get_data(hass)
    integration = await async_get_integration(hass, DOMAIN)
    return {
        "version": str(integration.version),
        "api_version": API_VERSION,
        "features": list(FEATURES),
        "limits": {
            "max_devices": MAX_DEVICES,
            "max_batch": MAX_BATCH,
            "max_entities_per_device": MAX_ENTITIES_PER_DEVICE,
        },
        "outputs": [OUTPUT_NATIVE],
        "shapes": list(SHAPE_NAMES),
        "triggers": list(TRIGGER_TYPES),
        "platforms": list(PLATFORMS),
        "actions": data.action_runner.actions(),
        "tick_seconds": data.tick.seconds,
        "device_count": data.store.device_count(),
    }


@tdc_command(f"{DOMAIN}/templates/list")
async def ws_templates_list(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> list[dict[str, Any]]:
    """Return all templates with their entities."""
    return [item.to_summary() for item in get_data(hass).template_registry.all()]
