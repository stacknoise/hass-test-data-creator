"""The hass_test_data_creator/* WebSocket commands of the panel (concept 8.2)."""

from __future__ import annotations

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant

from .devices import ws_devices_create, ws_devices_fire, ws_devices_list, ws_devices_update
from .groups import ws_groups_add, ws_groups_list, ws_groups_remove
from .history import ws_history_import
from .info import ws_info, ws_templates_list
from .removal import ws_removal_plan, ws_removal_run
from .scenarios import (
    ws_scenarios_add,
    ws_scenarios_list,
    ws_scenarios_remove,
    ws_scenarios_run,
)
from .schedules import (
    ws_schedules_add,
    ws_schedules_enable,
    ws_schedules_list,
    ws_schedules_preview,
    ws_schedules_remove,
)

COMMANDS = (
    ws_info,
    ws_templates_list,
    ws_devices_list,
    ws_devices_create,
    ws_devices_fire,
    ws_devices_update,
    ws_removal_plan,
    ws_removal_run,
    ws_schedules_list,
    ws_schedules_add,
    ws_schedules_remove,
    ws_schedules_enable,
    ws_schedules_preview,
    ws_scenarios_list,
    ws_scenarios_add,
    ws_scenarios_remove,
    ws_scenarios_run,
    ws_groups_list,
    ws_groups_add,
    ws_groups_remove,
    ws_history_import,
)


def async_register_commands(hass: HomeAssistant) -> None:
    """Register every panel command."""
    for command in COMMANDS:
        websocket_api.async_register_command(hass, command)
