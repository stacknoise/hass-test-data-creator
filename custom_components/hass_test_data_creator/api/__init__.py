"""The hass_test_data_creator/* WebSocket commands of the panel (concept 8.2)."""

from __future__ import annotations

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant

from .devices import ws_devices_create, ws_devices_fire, ws_devices_list
from .info import ws_info, ws_templates_list
from .removal import ws_removal_plan, ws_removal_run

COMMANDS = (
    ws_info,
    ws_templates_list,
    ws_devices_list,
    ws_devices_create,
    ws_devices_fire,
    ws_removal_plan,
    ws_removal_run,
)


def async_register_commands(hass: HomeAssistant) -> None:
    """Register every panel command."""
    for command in COMMANDS:
        websocket_api.async_register_command(hass, command)
