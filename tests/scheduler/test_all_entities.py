"""An action without an entity runs on every entity of the device that can do it."""

from __future__ import annotations

from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.hass_test_data_creator.core.errors import ErrorCode, ScheduleError
from custom_components.hass_test_data_creator.data import get_data

from ..conftest import create_devices, state_of
from .test_schedules import advance, noon  # noqa: F401


def _faults(hass: HomeAssistant, name: str) -> dict[str, str | None]:
    """Return the active fault of every entity of the device called `name`."""
    data = get_data(hass)
    device = next(item for item in data.store.devices() if item.name == name)
    return {
        item.key: getattr(data.live[(device.id, item.key)], "fault_kind", None)
        for item in device.entities
    }


async def test_a_plain_action_without_an_entity_finds_its_entity(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=1)
    runner = get_data(hass).action_runner

    await runner.async_run("Plug 01", "", "turn_on")

    assert state_of(hass, "Plug 01", "state").state == "on"


async def test_a_fault_without_an_entity_hits_every_entity_that_it_applies_to(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=1)
    runner = get_data(hass).action_runner

    await runner.async_run("Plug 01", "", "fault_dropout", {"duration_s": 60})

    faults = _faults(hass, "Plug 01")
    assert faults["state"] is None
    assert {kind for key, kind in faults.items() if key != "state"} == {"dropout"}


async def test_an_action_that_no_entity_can_do_is_refused(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=1)
    with pytest.raises(ScheduleError) as error:
        await get_data(hass).action_runner.async_run(
            "Plug 01", "", "set_brightness", {"brightness": 5}
        )
    assert error.value.code is ErrorCode.SCH_UNKNOWN_ACTION


async def test_a_schedule_without_an_entity_runs(
    hass: HomeAssistant,
    noon: FrozenDateTimeFactory,  # noqa: F811
    entry: MockConfigEntry,
) -> None:
    await create_devices(hass, count=2)
    await hass.services.async_call(
        "hass_test_data_creator",
        "add_schedule",
        {
            "name": "No entity",
            "target": {"all": True},
            "action": "turn_on",
            "trigger": {"type": "times", "times": ["12:30"]},
        },
        blocking=True,
    )

    await advance(hass, noon, "2026-11-02 20:31:00+00:00")

    assert [state_of(hass, f"Plug 0{n}", "state").state for n in (1, 2)] == ["on", "on"]


async def test_a_scenario_step_without_an_entity_runs(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=1)
    data = get_data(hass)
    scenario = await hass.services.async_call(
        "hass_test_data_creator",
        "add_scenario",
        {"name": "On", "steps": [{"target": {"all": True}, "action": "turn_on"}]},
        blocking=True,
        return_response=True,
    )

    await data.scenarios.async_run(scenario["id"])

    assert state_of(hass, "Plug 01", "state").state == "on"


async def test_an_action_on_many_devices_builds_no_device_per_lookup(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=5)
    data = get_data(hass)
    calls = 0
    original = data.store.devices

    def counting() -> list:
        nonlocal calls
        calls += 1
        return original()

    data.store.devices = counting  # type: ignore[method-assign]
    devices = data.action_runner.devices_for({"all": True})
    await data.action_runner.async_run_on(devices, "", "turn_on", {}, "all")

    assert calls == 1
    assert data.action_runner.find_device_id("Plug 02") == devices[1].id
    with pytest.raises(ScheduleError):
        data.action_runner.find_device_id("missing")
