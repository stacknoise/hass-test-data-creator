"""Commands about export and import (concept 8.2, 16.5)."""

from __future__ import annotations

from typing import Any

from homeassistant.components.websocket_api import ActiveConnection
from homeassistant.core import HomeAssistant
from homeassistant.loader import async_get_integration

from ..const import DOMAIN
from ..core.command import tdc_command
from ..data import get_data
from ..transfer.plan import ImportRequest
from ..transfer.schema import EXPORT_FIELDS, FORMAT_VERSION, IMPORT_FIELDS, PHASE_PURGE


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


def _request(msg: dict[str, Any]) -> ImportRequest:
    """Return the import request that a validated message describes."""
    return ImportRequest(
        category=msg["category"],
        mode=msg["mode"],
        items=msg["items"],
        known={category: set(names) for category, names in msg["known"].items()},
        replacing=set(msg["replacing"]),
        first=msg["first"],
        file_name=msg["file_name"],
    )


@tdc_command(f"{DOMAIN}/transfer/plan", IMPORT_FIELDS)
async def ws_transfer_plan(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Return what importing a batch of entries would create, update, skip, delete or refuse."""
    return get_data(hass).importer.plan(_request(msg))


@tdc_command(f"{DOMAIN}/transfer/run", IMPORT_FIELDS)
async def ws_transfer_run(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Import a batch of entries, or remove the items of the category first (phase purge)."""
    importer = get_data(hass).importer
    if msg["phase"] == PHASE_PURGE:
        return await importer.async_purge(_request(msg))
    return await importer.async_run(_request(msg))
