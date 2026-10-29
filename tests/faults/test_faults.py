"""Faults: effect on the state, end after the duration, replacement, schedules and error codes."""

from __future__ import annotations

from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from homeassistant.helpers.dispatcher import async_dispatcher_send
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_fire_time_changed

from custom_components.hass_test_data_creator.const import DOMAIN, SIGNAL_TICK
from custom_components.hass_test_data_creator.core.errors import ErrorCode, ScheduleError
from custom_components.hass_test_data_creator.data import get_data
from custom_components.hass_test_data_creator.faults.factory import FaultFactory

from ..conftest import create_devices, state_of


async def fault(hass: HomeAssistant, key: str, kind: str, **params: float) -> None:
    """Start a fault on an entity of "Plug 01" through the fire_event service."""
    await hass.services.async_call(
        DOMAIN,
        "fire_event",
        {"device": "Plug 01", "entity": key, "action": f"fault_{kind}", "params": params},
        blocking=True,
    )
    await hass.async_block_till_done()


async def advance(hass: HomeAssistant, freezer: FrozenDateTimeFactory, seconds: float) -> None:
    """Move the clock, let the timers fire and run one tick of the sensors."""
    freezer.tick(seconds)
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    async_dispatcher_send(hass, SIGNAL_TICK)
    await hass.async_block_till_done()


async def test_unavailable_ends_after_its_duration(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=1)
    await fault(hass, "power", "unavailable", duration_s=30)
    assert state_of(hass, "Plug 01", "power").state == "unavailable"
    assert state_of(hass, "Plug 01", "voltage").state != "unavailable"

    await advance(hass, freezer, 31)
    assert state_of(hass, "Plug 01", "power").state != "unavailable"


async def test_switch_can_become_unavailable(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=1)
    await fault(hass, "state", "unavailable", duration_s=10)
    assert state_of(hass, "Plug 01", "state").state == "unavailable"
    await advance(hass, freezer, 11)
    assert state_of(hass, "Plug 01", "state").state == "off"


async def test_frozen_keeps_the_value_until_the_end(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=1)
    await fault(hass, "power", "frozen", duration_s=600)
    frozen = state_of(hass, "Plug 01", "power").state

    await advance(hass, freezer, 300)
    assert state_of(hass, "Plug 01", "power").state == frozen
    await advance(hass, freezer, 301)
    assert state_of(hass, "Plug 01", "power").state != frozen


async def test_spike_and_fixed_levels_change_the_value(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=1)
    normal = float(state_of(hass, "Plug 01", "voltage").state)
    await fault(hass, "voltage", "spike", factor=2, duration_s=20)
    assert float(state_of(hass, "Plug 01", "voltage").state) == pytest.approx(normal * 2, rel=0.01)

    await fault(hass, "linkquality", "linkquality_drop", value=12)
    assert float(state_of(hass, "Plug 01", "linkquality").state) == 12
    await fault(hass, "current", "battery_low")
    assert float(state_of(hass, "Plug 01", "current").state) == 5

    await advance(hass, freezer, 21)
    assert float(state_of(hass, "Plug 01", "voltage").state) < normal * 1.5


async def test_a_new_fault_replaces_the_running_one(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=1)
    await fault(hass, "power", "unavailable", duration_s=1000)
    await fault(hass, "power", "dropout", duration_s=5)
    await advance(hass, freezer, 6)
    assert state_of(hass, "Plug 01", "power").state != "unavailable"


async def test_the_device_list_names_the_active_fault(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=1)
    await fault(hass, "power", "frozen")
    live = get_data(hass).live
    assert [e.fault_kind for e in live.values() if e.fault_kind] == ["frozen"]


async def test_faults_run_from_a_schedule(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    await create_devices(hass, count=1)
    data = {
        "name": "Drop",
        "target": {"device": "Plug 01"},
        "entity": "power",
        "action": "fault_dropout",
        "params": {"duration_s": 5},
        "trigger": {"type": "interval", "every_s": 3600},
    }
    response = await hass.services.async_call(
        DOMAIN, "add_schedule", data, blocking=True, return_response=True
    )
    schedules = get_data(hass).schedules.all_schedules()
    assert [(item.id, item.action) for item in schedules] == [(response["id"], "fault_dropout")]


async def test_fault_actions_are_listed_per_platform(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    actions = get_data(hass).action_runner.actions()
    assert "fault_unavailable" in actions["switch"]
    assert "fault_frozen" in actions["sensor"]
    assert "fault_frozen" not in actions["switch"]


async def test_errors_carry_their_codes(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    await create_devices(hass, count=1)
    with pytest.raises(ScheduleError) as wrong_platform:
        await fault(hass, "state", "frozen")
    assert wrong_platform.value.code is ErrorCode.SCH_UNKNOWN_ACTION
    with pytest.raises(ScheduleError) as bad_duration:
        await fault(hass, "power", "frozen", duration_s=0)
    assert bad_duration.value.code is ErrorCode.SCH_INVALID_FAULT
    with pytest.raises(ScheduleError) as unknown:
        FaultFactory().create("meltdown", {})
    assert unknown.value.code is ErrorCode.SCH_INVALID_FAULT
