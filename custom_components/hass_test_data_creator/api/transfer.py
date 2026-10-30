"""Commands about export and import (concept 8.2, 16.5)."""

from __future__ import annotations

from typing import Any

from homeassistant.components.websocket_api import ActiveConnection
from homeassistant.core import HomeAssistant
from homeassistant.loader import async_get_integration

from ..const import DOMAIN
from ..core.command import tdc_command
from ..data import get_data
from ..transfer.schema import EXPORT_FIELDS, FORMAT_VERSION


@tdc_command(f"{DOMAIN}/transfer/export", EXPORT_FIELDS)
async def ws_transfer_export(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Return a page of the entries of one category, with the version data of the file."""
    page = get_data(hass).transfer.page(msg["category"], msg["offset"], msg["limit"])
    integration = await async_get_integration(hass, DOMAIN)
    return {
        "format_version": FORMAT_VERSION,
        "integration_version": str(integration.version),
        **page,
    }
