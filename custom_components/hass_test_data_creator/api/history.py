"""Commands about the statistics backfill (concept 8.2)."""

from __future__ import annotations

from typing import Any

from homeassistant.components.websocket_api import ActiveConnection
from homeassistant.core import HomeAssistant

from ..const import DOMAIN
from ..core.command import tdc_command
from ..core.keys import KEY_DAYS, KEY_DEVICE, KEY_ENTITY
from ..core.runtime import get_data
from ..history.schema import HISTORY_FIELDS


@tdc_command(f"{DOMAIN}/history/import", HISTORY_FIELDS)
async def ws_history_import(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Write hourly statistics for the past days and return how many were written."""
    return await get_data(hass).history.async_import(
        msg[KEY_DAYS], msg.get(KEY_DEVICE), msg.get(KEY_ENTITY)
    )
