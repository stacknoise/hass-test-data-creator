"""Commands about scenarios (concept 8.2)."""

from __future__ import annotations

from typing import Any

from homeassistant.components.websocket_api import ActiveConnection
from homeassistant.core import HomeAssistant
import voluptuous as vol

from ..const import DOMAIN
from ..core.command import tdc_command
from ..core.keys import KEY_SCENARIO_ID, KEY_STEPS
from ..data import get_data
from ..scenarios.schema import SCENARIO_FIELDS


@tdc_command(f"{DOMAIN}/scenarios/list")
async def ws_scenarios_list(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> list[dict[str, Any]]:
    """Return all scenarios."""
    return [item.to_dict() for item in get_data(hass).scenarios.all_scenarios()]


@tdc_command(f"{DOMAIN}/scenarios/add", SCENARIO_FIELDS)
async def ws_scenarios_add(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Add a scenario and return it."""
    scenario = await get_data(hass).scenarios.async_add(msg)
    return scenario.to_dict()


@tdc_command(f"{DOMAIN}/scenarios/update", {vol.Required(KEY_SCENARIO_ID): str, **SCENARIO_FIELDS})
async def ws_scenarios_update(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Change a scenario and return it."""
    scenario = await get_data(hass).scenarios.async_update(msg[KEY_SCENARIO_ID], msg)
    return scenario.to_dict()


@tdc_command(f"{DOMAIN}/scenarios/remove", {vol.Required(KEY_SCENARIO_ID): str})
async def ws_scenarios_remove(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Delete a scenario."""
    await get_data(hass).scenarios.async_remove(msg[KEY_SCENARIO_ID])
    return {}


@tdc_command(f"{DOMAIN}/scenarios/run", {vol.Required(KEY_SCENARIO_ID): str})
async def ws_scenarios_run(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Start a scenario and return the number of its steps."""
    steps = await get_data(hass).scenarios.async_run(msg[KEY_SCENARIO_ID])
    return {KEY_STEPS: steps}
