"""The scheduler queue keeps its order, replans only what changed, and the caps and size limits hold."""

from __future__ import annotations

from typing import Any

from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry
import voluptuous as vol

from custom_components.hass_test_data_creator.core.errors import ErrorCode, GenerationError
from custom_components.hass_test_data_creator.core.limits import json_object
from custom_components.hass_test_data_creator.core.runtime import get_data
from custom_components.hass_test_data_creator.scenarios import manager as scenarios_module
from custom_components.hass_test_data_creator.scheduler import manager as manager_module

from ..conftest import create_devices
from .test_schedules import NOON, add_schedule


@pytest.fixture
def noon(freezer: FrozenDateTimeFactory) -> FrozenDateTimeFactory:
    """Freeze the clock at noon local time before the integration is set up."""
    freezer.move_to(NOON)
    return freezer


async def test_the_queue_fires_in_order_and_a_change_replans_only_that_schedule(
    hass: HomeAssistant,
    noon: FrozenDateTimeFactory,
    entry: MockConfigEntry,
) -> None:
    await create_devices(hass, count=1)
    late = await add_schedule(hass, name="Late", trigger={"type": "times", "times": ["22:00"]})
    early = await add_schedule(hass, name="Early", trigger={"type": "times", "times": ["13:00"]})
    schedules = get_data(hass).schedules
    assert schedules._queue[0].schedule_id == early
    before = [run for run in schedules._queue if run.schedule_id == late]

    await schedules.async_set_enabled(early, False)

    assert [run.schedule_id for run in schedules._queue] == [late]
    assert [run for run in schedules._queue if run.schedule_id == late] == before
    await schedules.async_remove(late)
    assert schedules._queue == []


async def test_the_number_of_schedules_is_capped(
    hass: HomeAssistant,
    noon: FrozenDateTimeFactory,
    entry: MockConfigEntry,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    await create_devices(hass, count=1)
    monkeypatch.setattr(manager_module, "MAX_SCHEDULES", 1)
    await add_schedule(hass)
    with pytest.raises(GenerationError) as error:
        await add_schedule(hass, name="Second")
    assert error.value.code is ErrorCode.GEN_SCHEDULE_LIMIT


@pytest.mark.parametrize("size", [10, 5000])
def test_json_object_bounds_the_stored_size(size: int) -> None:
    check = json_object(100)
    value: dict[str, Any] = {"text": "x" * size}
    if size > 100:
        with pytest.raises(vol.Invalid):
            check(value)
    else:
        assert check(value) == value
    with pytest.raises(vol.Invalid):
        check("not a dict")


async def test_the_number_of_scenarios_is_capped(
    hass: HomeAssistant, entry: MockConfigEntry, monkeypatch: pytest.MonkeyPatch
) -> None:
    await create_devices(hass, count=1)
    monkeypatch.setattr(scenarios_module, "MAX_SCENARIOS", 1)
    step = {"target": {"device": "Plug 01"}, "entity": "state", "action": "toggle"}
    scenarios = get_data(hass).scenarios
    await scenarios.async_add({"name": "One", "steps": [step]})
    with pytest.raises(GenerationError) as error:
        await scenarios.async_add({"name": "Two", "steps": [step]})
    assert error.value.code is ErrorCode.GEN_SCENARIO_LIMIT
