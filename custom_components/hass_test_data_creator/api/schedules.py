"""Commands about schedules (concept 8.2)."""

from __future__ import annotations

from typing import Any

from homeassistant.components.websocket_api import ActiveConnection
from homeassistant.core import HomeAssistant
import voluptuous as vol

from ..const import CONF_SEED, DEFAULT_SEED, DOMAIN
from ..core.command import tdc_command
from ..core.keys import KEY_ENABLED, KEY_SCHEDULE_ID
from ..core.runtime import get_data
from ..scheduler.schema import SCHEDULE_FIELDS, SCHEDULE_UPDATE_FIELDS

MAX_PREVIEW_HOURS = 72
DEFAULT_PREVIEW_HOURS = 24


@tdc_command(f"{DOMAIN}/schedules/list")
async def ws_schedules_list(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> list[dict[str, Any]]:
    """Return all schedules."""
    return [item.to_dict() for item in get_data(hass).schedules.all_schedules()]


@tdc_command(f"{DOMAIN}/schedules/add", SCHEDULE_FIELDS)
async def ws_schedules_add(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Add a schedule and return it."""
    data = get_data(hass)
    seed = data.entry.data.get(CONF_SEED, DEFAULT_SEED)
    schedule = await data.schedules.async_add(msg, seed)
    return schedule.to_dict()


@tdc_command(f"{DOMAIN}/schedules/update", SCHEDULE_UPDATE_FIELDS)
async def ws_schedules_update(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Change a schedule and return it."""
    schedule = await get_data(hass).schedules.async_update(msg[KEY_SCHEDULE_ID], msg)
    return schedule.to_dict()


@tdc_command(f"{DOMAIN}/schedules/remove", {vol.Required(KEY_SCHEDULE_ID): str})
async def ws_schedules_remove(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Delete a schedule."""
    await get_data(hass).schedules.async_remove(msg[KEY_SCHEDULE_ID])
    return {}


@tdc_command(
    f"{DOMAIN}/schedules/enable",
    {vol.Required(KEY_SCHEDULE_ID): str, vol.Required(KEY_ENABLED): bool},
)
async def ws_schedules_enable(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Switch a schedule on or off and return it."""
    schedule = await get_data(hass).schedules.async_set_enabled(
        msg[KEY_SCHEDULE_ID], msg[KEY_ENABLED]
    )
    return schedule.to_dict()


@tdc_command(
    f"{DOMAIN}/schedules/preview",
    {
        vol.Optional("hours", default=DEFAULT_PREVIEW_HOURS): vol.All(
            int, vol.Range(min=1, max=MAX_PREVIEW_HOURS)
        )
    },
)
async def ws_schedules_preview(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> list[dict[str, str]]:
    """Return the planned runs of the next hours."""
    return get_data(hass).schedules.preview(msg["hours"])
