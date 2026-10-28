"""A schedule that aims at several devices, by name or by id."""

from __future__ import annotations

from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry
import voluptuous as vol

from custom_components.hass_test_data_creator.core.runtime import get_data

from ..conftest import create_devices, state_of
from .test_schedules import add_schedule, advance, noon  # noqa: F401


async def test_a_list_of_devices_runs_on_exactly_those_devices(
    hass: HomeAssistant,
    noon: FrozenDateTimeFactory,  # noqa: F811
    entry: MockConfigEntry,
) -> None:
    await create_devices(hass, count=4)
    third = get_data(hass).store.devices()[2]
    await add_schedule(hass, target={"device": ["Plug 01", third.id]})

    await advance(hass, noon, "2026-11-02 20:31:00+00:00")

    states = [state_of(hass, f"Plug 0{n}", "state").state for n in (1, 2, 3, 4)]
    assert states == ["on", "off", "on", "off"]


async def test_an_empty_list_is_refused(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    with pytest.raises(vol.Invalid):
        await add_schedule(hass, target={"device": []})


async def test_removal_drops_a_schedule_only_when_all_its_devices_go(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=3)
    data = get_data(hass)
    first, second, _third = data.store.devices()
    await add_schedule(hass, target={"device": [first.id, second.name]})

    plan = data.removal_planner.plan("device", first.id)
    assert plan.schedules == []

    await data.removal_runner.async_run(plan)
    assert len(data.store.schedules()) == 1

    await data.removal_runner.async_run(data.removal_planner.plan("device", second.id))
    assert data.store.schedules() == []
