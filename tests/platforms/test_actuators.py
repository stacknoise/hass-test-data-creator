"""Light, cover and thermostat templates: states, actions, parameters and faults."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.hass_test_data_creator.const import DOMAIN
from custom_components.hass_test_data_creator.core.errors import ErrorCode, ScheduleError

from ..conftest import create_devices, state_of


async def fire(hass: HomeAssistant, name: str, key: str, action: str, **params: Any) -> None:
    """Run an action on an entity through the fire_event service."""
    await hass.services.async_call(
        DOMAIN,
        "fire_event",
        {"device": name, "entity": key, "action": action, "params": params},
        blocking=True,
    )
    await hass.async_block_till_done()


async def test_light_switches_and_dims(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    await create_devices(hass, template="light", count=1, name_pattern="Lamp {nn}")
    assert state_of(hass, "Lamp 01", "light").state == "off"

    await fire(hass, "Lamp 01", "light", "toggle")
    assert state_of(hass, "Lamp 01", "light").state == "on"
    await fire(hass, "Lamp 01", "light", "set_brightness", brightness=100)
    assert state_of(hass, "Lamp 01", "light").attributes["brightness"] == 100
    await fire(hass, "Lamp 01", "light", "set_brightness", brightness=0)
    assert state_of(hass, "Lamp 01", "light").state == "off"


async def test_cover_moves_to_positions(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    await create_devices(hass, template="cover", count=1, name_pattern="Blind {nn}")
    assert state_of(hass, "Blind 01", "cover").state == "open"

    await fire(hass, "Blind 01", "cover", "close")
    assert state_of(hass, "Blind 01", "cover").state == "closed"
    await fire(hass, "Blind 01", "cover", "set_position", position=40)
    state = state_of(hass, "Blind 01", "cover")
    assert state.state == "open"
    assert state.attributes["current_position"] == 40
    await fire(hass, "Blind 01", "cover", "open")
    assert state_of(hass, "Blind 01", "cover").attributes["current_position"] == 100


async def test_thermostat_target_mode_and_measured_value(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    await create_devices(hass, template="thermostat", count=1, name_pattern="Heater {nn}")
    state = state_of(hass, "Heater 01", "thermostat")
    assert state.state == "heat"
    assert state.attributes["temperature"] == 21.0
    assert 17 <= state.attributes["current_temperature"] <= 24

    await fire(hass, "Heater 01", "thermostat", "set_temperature", temperature=23.5)
    assert state_of(hass, "Heater 01", "thermostat").attributes["temperature"] == 23.5
    await fire(hass, "Heater 01", "thermostat", "turn_off")
    assert state_of(hass, "Heater 01", "thermostat").state == "off"


async def test_parameters_are_checked(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    await create_devices(hass, template="thermostat", count=1, name_pattern="Heater {nn}")
    for params in ({}, {"temperature": 99}, {"temperature": "warm"}):
        with pytest.raises(ScheduleError) as error:
            await fire(hass, "Heater 01", "thermostat", "set_temperature", **params)
        assert error.value.code is ErrorCode.SCH_INVALID_PARAMS


async def test_actuators_can_become_unavailable(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    await create_devices(hass, template="cover", count=1, name_pattern="Blind {nn}")
    await fire(hass, "Blind 01", "cover", "fault_unavailable", duration_s=30)
    assert state_of(hass, "Blind 01", "cover").state == "unavailable"
