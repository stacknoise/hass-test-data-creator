"""Where a device is used, and that a device in use cannot be removed."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.hass_test_data_creator.const import DOMAIN
from custom_components.hass_test_data_creator.core.errors import ErrorCode, RemovalError
from custom_components.hass_test_data_creator.data import get_data

from ..conftest import create_devices

STEP = {"after_s": 0, "entity": "state", "action": "toggle", "params": {}}


async def _used(client: Any) -> dict[str, dict[str, Any]]:
    """Return the `used_by` of every device in the panel list, by device name."""
    await client.send_json_auto_id({"type": f"{DOMAIN}/devices/list"})
    reply = await client.receive_json()
    return {item["name"]: item["used_by"] for item in reply["result"]["devices"]}


async def test_the_list_says_where_a_device_is_used(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=3)
    data = get_data(hass)
    first, second, _third = data.store.devices()
    schedule = await data.schedules.async_add(
        {
            "name": "Evening",
            "target": {"device": [first.id, second.name]},
            "entity": "state",
            "action": "toggle",
            "trigger": {"type": "times", "times": ["19:00"]},
        },
        "seed",
    )
    scenario = await data.scenarios.async_add(
        {"name": "Leaving", "steps": [{**STEP, "target": {"device": first.name}}]}
    )
    await data.scenarios.async_add(
        {"name": "Everything", "steps": [{**STEP, "target": {"all": True}}]}
    )
    client = await hass_ws_client(hass)

    used = await _used(client)

    assert used["Plug 01"] == {
        "schedules": [{"id": schedule.id, "name": "Evening"}],
        "scenarios": [{"id": scenario.id, "name": "Leaving"}],
        "groups": [],
    }
    assert [item["name"] for item in used["Plug 02"]["schedules"]] == ["Evening"]
    assert used["Plug 02"]["scenarios"] == []
    assert used["Plug 03"] == {"schedules": [], "scenarios": [], "groups": []}


async def test_a_device_in_a_scenario_cannot_be_removed(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=2)
    data = get_data(hass)
    first = data.store.devices()[0]
    scenario = await data.scenarios.async_add(
        {"name": "Leaving", "steps": [{**STEP, "target": {"device": first.id}}]}
    )

    plan = data.removal_planner.plan("device", first.id)
    assert plan.to_dict()["in_use"][0]["usage"]["scenarios"] == [
        {"id": scenario.id, "name": "Leaving"}
    ]
    with pytest.raises(RemovalError) as error:
        await hass.services.async_call(
            DOMAIN, "remove", {"target": "device", "target_id": first.id}, blocking=True
        )
    assert error.value.code is ErrorCode.REM_IN_USE
    assert error.value.translation_placeholders == {"usage": "Plug 01: Leaving"}
    assert len(data.store.devices()) == 2


async def test_a_creation_with_a_used_device_cannot_be_removed(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    run = await create_devices(hass, count=2)
    data = get_data(hass)
    await data.scenarios.async_add(
        {"name": "One", "steps": [{**STEP, "target": {"device": "Plug 02"}}]}
    )

    with pytest.raises(RemovalError):
        await data.removal_runner.async_run(data.removal_planner.plan("run", run["run_id"]))
    assert len(data.store.devices()) == 2


async def test_removing_everything_is_not_blocked(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=2)
    data = get_data(hass)
    await data.scenarios.async_add(
        {"name": "One", "steps": [{**STEP, "target": {"device": "Plug 01"}}]}
    )

    result = await hass.services.async_call(
        DOMAIN, "remove_all", {}, blocking=True, return_response=True
    )

    assert result["devices"] == 2
    assert data.store.scenarios() == []
