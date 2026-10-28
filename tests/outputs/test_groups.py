"""Groups of Zigbee2MQTT devices: bridge list, derived state, set, removal and restart."""

from __future__ import annotations

import json
from typing import Any
from unittest.mock import MagicMock

from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_fire_mqtt_message
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.hass_test_data_creator.const import DOMAIN
from custom_components.hass_test_data_creator.core.errors import ErrorCode, OutputError
from custom_components.hass_test_data_creator.core.runtime import get_data

from ..conftest import create_devices

BASE = "tdc_z2m"


@pytest.fixture
def expected_lingering_timers() -> bool:
    """Let the periodic timer of the MQTT client of Home Assistant run past the test."""
    return True


def sent(mqtt_mock: MagicMock) -> dict[str, str]:
    """Return the last payload published on every topic."""
    return {call.args[0]: call.args[1] for call in mqtt_mock.async_publish.call_args_list}


def json_of(mqtt_mock: MagicMock, topic: str) -> Any:
    """Return the last payload of a topic as JSON."""
    return json.loads(sent(mqtt_mock)[topic])


async def lamps(hass: HomeAssistant, count: int = 2, output: str = "z2m") -> None:
    """Create `count` lights named "Lamp 01", "Lamp 02", … with the given output."""
    await create_devices(
        hass, template="light", count=count, name_pattern="Lamp {nn}", output=output
    )


async def group(hass: HomeAssistant, name: str = "Lights", *members: str) -> dict[str, Any]:
    """Add a group through the service and return its response."""
    return await hass.services.async_call(
        DOMAIN,
        "add_group",
        {"name": name, "members": list(members) or ["Lamp 01", "Lamp 02"]},
        blocking=True,
        return_response=True,
    )


async def test_the_bridge_lists_the_group_with_its_members(
    hass: HomeAssistant, mqtt_mock: MagicMock, entry: MockConfigEntry
) -> None:
    await lamps(hass)
    response = await group(hass)
    assert response["number"] == 1

    groups = json_of(mqtt_mock, f"{BASE}/bridge/groups")
    assert [(item["id"], item["friendly_name"]) for item in groups] == [(1, "Lights")]
    devices = json_of(mqtt_mock, f"{BASE}/bridge/devices")
    ieee = {item["friendly_name"]: item["ieee_address"] for item in devices[1:]}
    assert {member["ieee_address"] for member in groups[0]["members"]} == set(ieee.values())
    assert response["id"] in get_data(hass).store.groups()[0].id
    assert f"{BASE}/Lights" in get_data(hass).store.topics({response["id"]})


async def test_the_group_state_follows_its_members(
    hass: HomeAssistant, mqtt_mock: MagicMock, entry: MockConfigEntry
) -> None:
    await lamps(hass)
    await group(hass)
    assert json_of(mqtt_mock, f"{BASE}/Lights")["state"] == "OFF"

    async_fire_mqtt_message(hass, f"{BASE}/Lamp 01/set", '{"brightness": 100}')
    await hass.async_block_till_done()
    state = json_of(mqtt_mock, f"{BASE}/Lights")
    assert state["state"] == "ON"
    assert state["brightness"] == round((100 + 254) / 2)


async def test_set_on_the_group_reaches_every_member(
    hass: HomeAssistant, mqtt_mock: MagicMock, entry: MockConfigEntry
) -> None:
    await lamps(hass)
    await group(hass)
    async_fire_mqtt_message(hass, f"{BASE}/Lights/set", '{"state": "ON", "brightness": 60}')
    await hass.async_block_till_done()
    for name in ("Lamp 01", "Lamp 02"):
        state = json_of(mqtt_mock, f"{BASE}/{name}")
        assert (state["state"], state["brightness"]) == ("ON", 60)
    assert json_of(mqtt_mock, f"{BASE}/Lights")["state"] == "ON"


async def test_removing_a_group_deletes_its_topic_and_updates_the_bridge(
    hass: HomeAssistant, mqtt_mock: MagicMock, entry: MockConfigEntry
) -> None:
    await lamps(hass)
    response = await group(hass)
    await hass.services.async_call(
        DOMAIN, "remove_group", {"group_id": response["id"]}, blocking=True
    )
    assert json_of(mqtt_mock, f"{BASE}/bridge/groups") == []
    assert sent(mqtt_mock)[f"{BASE}/Lights"] == ""
    assert get_data(hass).store.groups() == []
    assert len(get_data(hass).store.devices()) == 2


async def test_removing_a_member_shrinks_the_group_and_the_last_one_ends_it(
    hass: HomeAssistant, mqtt_mock: MagicMock, entry: MockConfigEntry
) -> None:
    await lamps(hass)
    await group(hass)
    first, second = get_data(hass).store.devices()

    await hass.services.async_call(
        DOMAIN, "remove", {"target": "device", "target_id": first.id}, blocking=True
    )
    await hass.async_block_till_done()
    assert get_data(hass).store.groups()[0].members == [second.id]
    assert len(json_of(mqtt_mock, f"{BASE}/bridge/groups")[0]["members"]) == 1

    await hass.services.async_call(
        DOMAIN, "remove", {"target": "device", "target_id": second.id}, blocking=True
    )
    await hass.async_block_till_done()
    assert get_data(hass).store.groups() == []
    assert sent(mqtt_mock)[f"{BASE}/Lights"] == ""
    assert json_of(mqtt_mock, f"{BASE}/bridge/groups") == []


async def test_remove_all_deletes_the_groups_too(
    hass: HomeAssistant, mqtt_mock: MagicMock, entry: MockConfigEntry
) -> None:
    await lamps(hass)
    await group(hass)
    plan = get_data(hass).removal_planner.plan("all", None)
    assert len(plan.groups) == 1
    assert plan.to_dict()["groups"] == plan.groups

    result = await hass.services.async_call(
        DOMAIN, "remove_all", {}, blocking=True, return_response=True
    )
    assert result["groups"] == 1
    assert get_data(hass).store.groups() == []
    assert get_data(hass).store.topics() == []


async def test_a_reload_publishes_the_groups_again(
    hass: HomeAssistant, mqtt_mock: MagicMock, entry: MockConfigEntry
) -> None:
    await lamps(hass)
    await group(hass)
    assert await hass.config_entries.async_unload(entry.entry_id)

    mqtt_mock.async_publish.reset_mock()
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done(wait_background_tasks=True)
    assert json_of(mqtt_mock, f"{BASE}/bridge/groups")[0]["friendly_name"] == "Lights"
    assert json_of(mqtt_mock, f"{BASE}/Lights")["state"] == "OFF"


async def test_invalid_groups_are_refused(
    hass: HomeAssistant, mqtt_mock: MagicMock, entry: MockConfigEntry
) -> None:
    await lamps(hass)
    await create_devices(
        hass, template="light", count=1, name_pattern="Native {nn}", output="native"
    )
    cases = [
        ("Lights", ["Nobody"]),
        ("Lights", ["Native 01"]),
        ("Lamp 01", ["Lamp 02"]),
        ("bridge", ["Lamp 02"]),
        ("a/b", ["Lamp 02"]),
    ]
    for name, members in cases:
        with pytest.raises(OutputError) as error:
            await group(hass, name, *members)
        assert error.value.code is ErrorCode.OUT_GROUP_INVALID

    await group(hass)
    with pytest.raises(OutputError):
        await group(hass)
    with pytest.raises(OutputError) as missing:
        await hass.services.async_call(DOMAIN, "remove_group", {"group_id": "nope"}, blocking=True)
    assert missing.value.code is ErrorCode.OUT_GROUP_NOT_FOUND


async def test_the_commands_list_add_and_remove(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    mqtt_mock: MagicMock,
    entry: MockConfigEntry,
) -> None:
    await lamps(hass)
    client = await hass_ws_client(hass)
    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/groups/add", "name": "Pair", "members": ["Lamp 01", "Lamp 02"]}
    )
    added = (await client.receive_json())["result"]
    assert (added["name"], added["number"]) == ("Pair", 1)

    await client.send_json_auto_id({"type": f"{DOMAIN}/groups/list"})
    assert [item["id"] for item in (await client.receive_json())["result"]] == [added["id"]]
    await client.send_json_auto_id({"type": f"{DOMAIN}/groups/remove", "group_id": added["id"]})
    assert (await client.receive_json())["success"]
