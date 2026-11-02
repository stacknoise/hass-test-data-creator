"""Commands of the live log (concept 17.2)."""

from __future__ import annotations

from typing import Any

from homeassistant.components.websocket_api import ActiveConnection
from homeassistant.core import HomeAssistant

from ..const import DOMAIN
from ..core.command import tdc_command
from ..data import get_data
from ..log.filters import LogFilter
from ..log.schema import LOG_GET_FIELDS, LOG_SET_FIELDS


@tdc_command(f"{DOMAIN}/log/get", LOG_GET_FIELDS)
async def ws_log_get(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Return the log entries after `since`; the call also starts or keeps the recording."""
    return get_data(hass).log.get(
        msg["since"], msg["limit"], LogFilter.from_request(msg.get("filter")), msg["newest_first"]
    )


@tdc_command(f"{DOMAIN}/log/set", LOG_SET_FIELDS)
async def ws_log_set(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Stop the recording, set the filter in front of the buffer or the size of the buffer."""
    flt = msg.get("capture_filter")
    return get_data(hass).log.configure(
        msg.get("capture"), None if flt is None else LogFilter.from_request(flt), msg.get("size")
    )


@tdc_command(f"{DOMAIN}/log/clear")
async def ws_log_clear(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Empty the log buffer."""
    return get_data(hass).log.clear()
