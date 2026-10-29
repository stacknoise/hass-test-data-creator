"""Changing a schedule after it was created."""

from __future__ import annotations

from typing import Any

from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.hass_test_data_creator.const import DOMAIN
from custom_components.hass_test_data_creator.core.errors import ErrorCode, ScheduleError
from custom_components.hass_test_data_creator.data import get_data

from ..conftest import create_devices, state_of
from .test_schedules import add_schedule, advance, noon  # noqa: F401


def _request(**fields: Any) -> dict[str, Any]:
    """Return a full update request with `fields` changed."""
    return {
        "name": "Changed",
        "target": {"device": "Plug 01"},
        "entity": "state",
        "action": "toggle",
        "trigger": {"type": "times", "times": ["13:00"]},
        **fields,
    }


async def test_a_changed_schedule_runs_at_its_new_time_and_keeps_the_rest(
    hass: HomeAssistant,
    noon: FrozenDateTimeFactory,  # noqa: F811
    entry: MockConfigEntry,
) -> None:
    await create_devices(hass, count=1)
    schedule_id = await add_schedule(hass, seed="mine", enabled=False)
    data = get_data(hass)
    created = data.store.schedule(schedule_id)
    assert created is not None

    await data.schedules.async_update(schedule_id, _request(name="Later"))

    changed = data.store.schedule(schedule_id)
    assert changed is not None
    assert (changed.name, changed.trigger["times"]) == ("Later", ["13:00"])
    assert (changed.id, changed.created_at, changed.seed) == (
        schedule_id,
        created.created_at,
        "mine",
    )
    assert changed.enabled is False

    await data.schedules.async_update(schedule_id, _request(enabled=True))
    await advance(hass, noon, "2026-11-02 20:45:00+00:00")
    assert state_of(hass, "Plug 01", "state").state == "off"
    await advance(hass, noon, "2026-11-02 21:01:00+00:00")
    assert state_of(hass, "Plug 01", "state").state == "on"


async def test_a_schedule_can_switch_to_a_scenario(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=1)
    schedule_id = await add_schedule(hass)
    data = get_data(hass)
    scenario = await data.scenarios.async_add(
        {"name": "S", "steps": [{"target": {"all": True}, "entity": "state", "action": "toggle"}]}
    )

    await data.schedules.async_update(
        schedule_id,
        {
            "name": "Via scenario",
            "scenario": scenario.id,
            "trigger": {"type": "times", "times": ["13:00"]},
        },
    )

    changed = data.store.schedule(schedule_id)
    assert changed is not None
    assert (changed.scenario, changed.target, changed.entity, changed.action) == (
        scenario.id,
        {},
        "",
        "",
    )


async def test_a_wrong_request_changes_nothing(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    await create_devices(hass, count=1)
    schedule_id = await add_schedule(hass)
    data = get_data(hass)

    cases = (
        (schedule_id, {"trigger": {"type": "nope"}}, ErrorCode.SCH_INVALID_TRIGGER),
        (schedule_id, {"action": "nope"}, ErrorCode.SCH_UNKNOWN_ACTION),
        ("missing", {}, ErrorCode.SCH_NOT_FOUND),
    )
    for target_id, fields, code in cases:
        with pytest.raises(ScheduleError) as error:
            await data.schedules.async_update(target_id, _request(**fields))
        assert error.value.code is code

    unchanged = data.store.schedule(schedule_id)
    assert unchanged is not None
    assert (unchanged.name, unchanged.action) == ("Test", "toggle")


async def test_the_panel_command_changes_a_schedule(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=1)
    schedule_id = await add_schedule(hass)
    client = await hass_ws_client(hass)

    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/schedules/update", "schedule_id": schedule_id, **_request()}
    )
    reply = await client.receive_json()

    assert reply["success"]
    assert reply["result"]["name"] == "Changed"
    assert reply["result"]["enabled"] is True
