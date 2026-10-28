"""Commands about groups (concept 8.2)."""

from __future__ import annotations

from typing import Any

from homeassistant.components.websocket_api import ActiveConnection
from homeassistant.core import HomeAssistant
import voluptuous as vol

from ..const import DOMAIN
from ..core.command import tdc_command
from ..core.runtime import get_data
from ..groups.schema import GROUP_FIELDS


@tdc_command(f"{DOMAIN}/groups/list")
async def ws_groups_list(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> list[dict[str, Any]]:
    """Return all groups."""
    return [item.to_dict() for item in get_data(hass).groups.all_groups()]


@tdc_command(f"{DOMAIN}/groups/add", GROUP_FIELDS)
async def ws_groups_add(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Add a group and return it."""
    group = await get_data(hass).groups.async_add(msg["name"], msg["members"])
    return group.to_dict()


@tdc_command(f"{DOMAIN}/groups/remove", {vol.Required("group_id"): str})
async def ws_groups_remove(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Delete a group."""
    await get_data(hass).groups.async_remove(msg["group_id"])
    return {}
