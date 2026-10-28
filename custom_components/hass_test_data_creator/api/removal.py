"""Commands about removal (concept 8.2, 10)."""

from __future__ import annotations

from typing import Any

from homeassistant.components.websocket_api import ActiveConnection
from homeassistant.core import HomeAssistant
import voluptuous as vol

from ..const import DOMAIN
from ..core.command import tdc_command
from ..core.keys import KEY_TARGET, KEY_TARGET_ID
from ..core.runtime import get_data
from ..removal.planner import TARGETS

REMOVAL_FIELDS = {
    vol.Required(KEY_TARGET): vol.In(TARGETS),
    vol.Optional(KEY_TARGET_ID): str,
}


@tdc_command(f"{DOMAIN}/removal/plan", REMOVAL_FIELDS)
async def ws_removal_plan(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Return what a removal of the target would delete."""
    plan = get_data(hass).removal_planner.plan(msg[KEY_TARGET], msg.get(KEY_TARGET_ID))
    return plan.to_dict()


@tdc_command(f"{DOMAIN}/removal/run", REMOVAL_FIELDS)
async def ws_removal_run(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Remove the target and return what was removed."""
    data = get_data(hass)
    plan = data.removal_planner.plan(msg[KEY_TARGET], msg.get(KEY_TARGET_ID))
    return await data.removal_runner.async_run(plan)
