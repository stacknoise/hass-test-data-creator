"""Scenarios: timed steps, schedules that start them, removal and error codes."""

from __future__ import annotations

from typing import Any

from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_fire_time_changed
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.hass_test_data_creator.const import DOMAIN
from custom_components.hass_test_data_creator.core.errors import ErrorCode, ScheduleError
from custom_components.hass_test_data_creator.core.runtime import get_data

from ..conftest import create_devices, state_of

NOON = "2026-11-02 20:00:00+00:00"  # 12:00 in the time zone of the tests (PST)
STEPS = [
    {"target": {"device": "Plug 01"}, "entity": "state", "action": "turn_on"},
    {"after_s": 30, "target": {"device": "Plug 01"}, "entity": "state", "action": "turn_off"},
]


async def call(hass: HomeAssistant, service: str, **data: Any) -> dict[str, Any]:
    """Call a service of the integration and return its response."""
    return await hass.services.async_call(
        DOMAIN, service, data, blocking=True, return_response=True
    )


async def add_scenario(hass: HomeAssistant, steps: list[dict[str, Any]] | None = None) -> str:
    """Add a scenario and return its id."""
    return (await call(hass, "add_scenario", name="Test", steps=steps or STEPS))["id"]


async def advance(hass: HomeAssistant, freezer: FrozenDateTimeFactory, seconds: float) -> None:
    """Move the clock and let the timers of that moment fire."""
    freezer.tick(seconds)
    async_fire_time_changed(hass)
    await hass.async_block_till_done()


async def test_steps_run_one_after_the_other(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=1)
    scenario_id = await add_scenario(hass)

    assert (await call(hass, "run_scenario", scenario_id=scenario_id))["steps"] == 2
    assert state_of(hass, "Plug 01", "state").state == "on"
    await advance(hass, freezer, 29)
    assert state_of(hass, "Plug 01", "state").state == "on"
    await advance(hass, freezer, 2)
    assert state_of(hass, "Plug 01", "state").state == "off"


async def test_delays_add_up(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=1)
    step = {"target": {"device": "Plug 01"}, "entity": "state", "action": "toggle"}
    scenario_id = await add_scenario(
        hass, [{**step, "after_s": 10}, {**step, "after_s": 10}, {**step, "after_s": 10}]
    )
    await call(hass, "run_scenario", scenario_id=scenario_id)
    states = []
    for _ in range(3):
        await advance(hass, freezer, 10.5)
        states.append(state_of(hass, "Plug 01", "state").state)
    assert states == ["on", "off", "on"]


async def test_a_schedule_can_start_a_scenario(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, entry: MockConfigEntry
) -> None:
    freezer.move_to(NOON)
    await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()
    await create_devices(hass, count=1)
    scenario_id = await add_scenario(hass)
    await call(
        hass,
        "add_schedule",
        name="Start",
        scenario=scenario_id,
        trigger={"type": "times", "times": ["12:30"]},
    )

    await advance(hass, freezer, 31 * 60)
    assert state_of(hass, "Plug 01", "state").state == "on"
    await advance(hass, freezer, 31)
    assert state_of(hass, "Plug 01", "state").state == "off"


async def test_a_step_on_a_missing_device_does_not_stop_the_scenario(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=1)
    missing = {"target": {"device": "Nope"}, "entity": "state", "action": "turn_on"}
    scenario_id = await add_scenario(hass, [missing, *STEPS[:1]])
    await call(hass, "run_scenario", scenario_id=scenario_id)
    assert state_of(hass, "Plug 01", "state").state == "on"


async def test_remove_and_remove_all(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    await create_devices(hass, count=1)
    first = await add_scenario(hass)
    await add_scenario(hass)
    scenarios = get_data(hass).scenarios
    await hass.services.async_call(DOMAIN, "remove_scenario", {"scenario_id": first}, blocking=True)
    assert len(scenarios.all_scenarios()) == 1

    await hass.services.async_call(DOMAIN, "remove_all", {}, blocking=True)
    assert scenarios.all_scenarios() == []


async def test_commands_list_add_run_and_remove(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=1)
    client = await hass_ws_client(hass)
    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/scenarios/add", "name": "Panel", "steps": STEPS[:1]}
    )
    added = (await client.receive_json())["result"]
    assert added["steps"][0]["after_s"] == 0

    await client.send_json_auto_id({"type": f"{DOMAIN}/scenarios/list"})
    assert [item["id"] for item in (await client.receive_json())["result"]] == [added["id"]]
    await client.send_json_auto_id({"type": f"{DOMAIN}/scenarios/run", "scenario_id": added["id"]})
    assert (await client.receive_json())["result"] == {"steps": 1}
    await hass.async_block_till_done()
    assert state_of(hass, "Plug 01", "state").state == "on"
    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/scenarios/remove", "scenario_id": added["id"]}
    )
    assert (await client.receive_json())["success"]


async def test_errors_carry_their_codes(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    await create_devices(hass, count=1)
    with pytest.raises(ScheduleError) as missing:
        await call(hass, "run_scenario", scenario_id="nope")
    assert missing.value.code is ErrorCode.SCH_SCENARIO_NOT_FOUND
    with pytest.raises(ScheduleError) as unknown:
        await add_scenario(hass, [{**STEPS[0], "action": "explode"}])
    assert unknown.value.code is ErrorCode.SCH_UNKNOWN_ACTION

    trigger = {"type": "times", "times": ["12:30"]}
    with pytest.raises(ScheduleError) as no_scenario:
        await call(hass, "add_schedule", name="X", scenario="nope", trigger=trigger)
    assert no_scenario.value.code is ErrorCode.SCH_SCENARIO_NOT_FOUND
    with pytest.raises(ScheduleError) as no_work:
        await call(hass, "add_schedule", name="X", trigger=trigger)
    assert no_work.value.code is ErrorCode.SCH_INVALID_PARAMS
