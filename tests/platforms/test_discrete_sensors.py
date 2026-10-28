"""Sensors with states: the washer template, the enum device class and template checks."""

from __future__ import annotations

from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.hass_test_data_creator.core.errors import ErrorCode, TemplateError
from custom_components.hass_test_data_creator.templates.factory import TemplateFactory

from ..conftest import create_devices, state_of

PROGRAMS = {"idle", "wash", "rinse", "spin"}
BASE = {"key": "mode", "platform": "sensor", "name": "Mode"}
ENUM = {"shape": "enum", "values": ["a", "b"]}


async def test_washer_reports_states_as_enum_sensors(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    await create_devices(hass, template="washer", count=1, name_pattern="Washer {nn}")
    program = state_of(hass, "Washer 01", "program")
    assert program.state in PROGRAMS
    assert program.attributes["device_class"] == "enum"
    assert set(program.attributes["options"]) == PROGRAMS
    assert state_of(hass, "Washer 01", "door").state in {"closed", "open"}


async def test_a_fault_keeps_a_state_sensor_working(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    await create_devices(hass, template="washer", count=1, name_pattern="Washer {nn}")
    await hass.services.async_call(
        "hass_test_data_creator",
        "fire_event",
        {"device": "Washer 01", "entity": "program", "action": "fault_spike"},
        blocking=True,
    )
    assert state_of(hass, "Washer 01", "program").state in PROGRAMS


@pytest.mark.parametrize(
    "extra",
    [
        {"unit": "W"},
        {"state_class": "measurement"},
        {"device_class": "power"},
        {"signal": {"shape": "enum"}},
    ],
)
def test_templates_with_states_are_checked(extra: dict[str, object]) -> None:
    entity = {**BASE, "signal": ENUM, **extra}
    with pytest.raises((TemplateError,)) as error:
        TemplateFactory().entity(entity)
    assert error.value.code is ErrorCode.TPL_INVALID


def test_a_valid_state_sensor_is_accepted() -> None:
    assert TemplateFactory().entity({**BASE, "signal": ENUM, "device_class": "enum"}).key == "mode"
