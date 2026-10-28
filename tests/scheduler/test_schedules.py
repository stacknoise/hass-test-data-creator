"""Schedules: running at the planned moment, preview, targets, removal and error codes."""

from __future__ import annotations

from typing import Any

from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_fire_time_changed

from custom_components.hass_test_data_creator.const import DOMAIN
from custom_components.hass_test_data_creator.core.errors import ErrorCode, ScheduleError
from custom_components.hass_test_data_creator.core.runtime import get_data

from ..conftest import create_devices, state_of

NOON = "2026-11-02 20:00:00+00:00"  # 12:00 in the time zone of the tests (PST)


@pytest.fixture
def noon(freezer: FrozenDateTimeFactory) -> FrozenDateTimeFactory:
    """Freeze the clock at noon local time before the integration is set up."""
    freezer.move_to(NOON)
    return freezer


async def add_schedule(hass: HomeAssistant, **fields: Any) -> str:
    """Call the add_schedule service and return the id of the new schedule."""
    data = {
        "name": "Test",
        "target": {"device": "Plug 01"},
        "entity": "state",
        "action": "toggle",
        "trigger": {"type": "times", "times": ["12:30"]},
        **fields,
    }
    response = await hass.services.async_call(
        DOMAIN, "add_schedule", data, blocking=True, return_response=True
    )
    return response["id"]


async def advance(hass: HomeAssistant, freezer: FrozenDateTimeFactory, to: str) -> None:
    """Move the clock and let the timers of that moment fire."""
    freezer.move_to(to)
    async_fire_time_changed(hass)
    await hass.async_block_till_done()


async def test_schedule_runs_once_at_the_planned_moment(
    hass: HomeAssistant, noon: FrozenDateTimeFactory, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=1)
    await add_schedule(hass)
    assert state_of(hass, "Plug 01", "state").state == "off"

    await advance(hass, noon, "2026-11-02 20:29:00+00:00")
    assert state_of(hass, "Plug 01", "state").state == "off"

    await advance(hass, noon, "2026-11-02 20:31:00+00:00")
    assert state_of(hass, "Plug 01", "state").state == "on"

    await advance(hass, noon, "2026-11-02 21:00:00+00:00")
    assert state_of(hass, "Plug 01", "state").state == "on"


async def test_template_target_reaches_every_device(
    hass: HomeAssistant, noon: FrozenDateTimeFactory, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=3)
    await add_schedule(hass, target={"template": "plug_metering"}, action="turn_on")
    await advance(hass, noon, "2026-11-02 20:31:00+00:00")
    for name in ("Plug 01", "Plug 02", "Plug 03"):
        assert state_of(hass, name, "state").state == "on"


async def test_disabled_schedule_does_not_run_until_enabled(
    hass: HomeAssistant, noon: FrozenDateTimeFactory, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=1)
    schedule_id = await add_schedule(hass, enabled=False)
    await advance(hass, noon, "2026-11-02 20:31:00+00:00")
    assert state_of(hass, "Plug 01", "state").state == "off"

    noon.move_to("2026-11-02 20:32:00+00:00")
    await hass.services.async_call(
        DOMAIN, "set_schedule_enabled", {"schedule_id": schedule_id, "enabled": True}, blocking=True
    )
    # the planned moment of today has passed, so nothing runs until tomorrow
    await advance(hass, noon, "2026-11-02 20:40:00+00:00")
    assert state_of(hass, "Plug 01", "state").state == "off"
    assert get_data(hass).schedules.get(schedule_id).enabled


async def test_preview_lists_the_next_runs_in_order(
    hass: HomeAssistant, noon: FrozenDateTimeFactory, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=1)
    hourly = {"type": "interval", "every_s": 3600, "start": "13:00", "end": "16:00"}
    await add_schedule(hass, name="Hourly", trigger=hourly)
    await add_schedule(hass, name="Late", trigger={"type": "times", "times": ["14:30"]})
    runs = get_data(hass).schedules.preview(6)
    assert [(item["name"], item["when"][11:16]) for item in runs] == [
        ("Hourly", "13:00"),
        ("Hourly", "14:00"),
        ("Late", "14:30"),
        ("Hourly", "15:00"),
    ]


async def test_random_times_are_reproducible_with_the_same_seed(
    hass: HomeAssistant, noon: FrozenDateTimeFactory, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=1)
    trigger = {"type": "random_window", "count": 4, "start": "13:00", "end": "23:00"}
    await add_schedule(hass, trigger=trigger, seed="fixed")
    manager = get_data(hass).schedules
    assert manager.preview(12) == manager.preview(12)
    assert len(manager.preview(12)) == 4


async def test_removing_devices_removes_the_schedules_aimed_at_them(
    hass: HomeAssistant, noon: FrozenDateTimeFactory, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=2)
    first = await add_schedule(hass, target={"device": "Plug 01"})
    other = await add_schedule(hass, target={"template": "plug_metering"})
    data = get_data(hass)
    device = next(item for item in data.store.devices() if item.name == "Plug 01")

    plan = data.removal_planner.plan("device", device.id)
    assert plan.schedules == [first]
    await data.removal_runner.async_run(plan)
    assert [item.id for item in data.schedules.all_schedules()] == [other]

    await hass.services.async_call(DOMAIN, "remove_all", {}, blocking=True)
    assert data.schedules.all_schedules() == []


async def test_errors_carry_their_codes(
    hass: HomeAssistant, noon: FrozenDateTimeFactory, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=1)
    with pytest.raises(ScheduleError) as trigger:
        await add_schedule(hass, trigger={"type": "times", "times": ["25:99"]})
    assert trigger.value.code is ErrorCode.SCH_INVALID_TRIGGER
    with pytest.raises(ScheduleError) as action:
        await add_schedule(hass, action="explode")
    assert action.value.code is ErrorCode.SCH_UNKNOWN_ACTION
    with pytest.raises(ScheduleError) as missing:
        await hass.services.async_call(
            DOMAIN, "remove_schedule", {"schedule_id": "nope"}, blocking=True
        )
    assert missing.value.code is ErrorCode.SCH_NOT_FOUND
