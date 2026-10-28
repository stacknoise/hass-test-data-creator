"""Changing a scenario after it was created."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.hass_test_data_creator.const import DOMAIN
from custom_components.hass_test_data_creator.core.errors import ErrorCode, ScheduleError
from custom_components.hass_test_data_creator.core.runtime import get_data

from ..conftest import create_devices, state_of


def _data(action: str = "toggle", **fields: Any) -> dict[str, Any]:
    """Return a scenario with one step."""
    return {
        "name": "Scene",
        "steps": [
            {
                "after_s": 0,
                "target": {"all": True},
                "entity": "state",
                "action": action,
                "params": {},
            }
        ],
        **fields,
    }


async def test_a_changed_scenario_runs_its_new_steps(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=2)
    data = get_data(hass)
    scenario = await data.scenarios.async_add(_data("turn_off"))

    updated = await data.scenarios.async_update(scenario.id, _data("turn_on", name="Renamed"))

    assert (updated.id, updated.name, updated.created_at) == (
        scenario.id,
        "Renamed",
        scenario.created_at,
    )
    assert await data.scenarios.async_run(scenario.id) == 1
    await hass.async_block_till_done()
    assert state_of(hass, "Plug 01", "state").state == "on"
    assert len(data.store.scenarios()) == 1


async def test_a_wrong_request_changes_nothing(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    data = get_data(hass)
    scenario = await data.scenarios.async_add(_data())

    with pytest.raises(ScheduleError) as unknown_action:
        await data.scenarios.async_update(scenario.id, _data("nope", name="Other"))
    assert unknown_action.value.code is ErrorCode.SCH_UNKNOWN_ACTION
    with pytest.raises(ScheduleError) as missing:
        await data.scenarios.async_update("missing", _data())
    assert missing.value.code is ErrorCode.SCH_SCENARIO_NOT_FOUND

    unchanged = data.store.scenario(scenario.id)
    assert unchanged is not None
    assert (unchanged.name, unchanged.steps[0]["action"]) == ("Scene", "toggle")


async def test_the_panel_command_changes_a_scenario(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    scenario = await get_data(hass).scenarios.async_add(_data())
    client = await hass_ws_client(hass)

    await client.send_json_auto_id(
        {
            "type": f"{DOMAIN}/scenarios/update",
            "scenario_id": scenario.id,
            **_data("turn_on", name="Via panel"),
        }
    )
    reply = await client.receive_json()

    assert reply["success"]
    assert reply["result"]["name"] == "Via panel"
    assert reply["result"]["steps"][0]["action"] == "turn_on"
