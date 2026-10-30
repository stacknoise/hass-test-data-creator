"""Bulk actions on the device list: remove, area, group and action (concept 16.3)."""

from __future__ import annotations

from typing import Any
from unittest.mock import MagicMock

from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry as ar
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.hass_test_data_creator.const import MAX_BATCH
from custom_components.hass_test_data_creator.core.errors import ErrorCode
from custom_components.hass_test_data_creator.data import get_data

from ..conftest import create_devices, our_devices, state_of
from .test_commands import call


@pytest.fixture
def expected_lingering_timers() -> bool:
    """Let the periodic timer of the MQTT client of Home Assistant run past the test."""
    return True


@pytest.fixture
async def client(hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry):
    """Return a client on an instance with three plugs and two lights."""
    await create_devices(hass, count=3, name_pattern="Plug {nn}")
    await create_devices(hass, template="light", count=2, name_pattern="Lamp {nn}")
    return await hass_ws_client(hass)


def _names(hass: HomeAssistant) -> list[str]:
    """Return the names of the devices in the store."""
    return [item.name for item in get_data(hass).store.devices()]


def _id(hass: HomeAssistant, name: str) -> str:
    """Return the id of the device called `name`."""
    return next(item.id for item in get_data(hass).store.devices() if item.name == name)


async def test_remove_by_filter_plans_first_and_then_removes_only_the_matches(
    hass: HomeAssistant, client: Any, entry: MockConfigEntry
) -> None:
    plan = await call(client, "devices/bulk_remove", filter={"query": "lamp"}, plan_only=True)
    assert plan["success"]
    assert plan["result"]["count"] == 2
    assert _names(hass) == ["Plug 01", "Plug 02", "Plug 03", "Lamp 01", "Lamp 02"]

    reply = await call(client, "devices/bulk_remove", filter={"query": "lamp"}, expected=2)
    assert reply["success"], reply
    assert reply["result"]["devices"] == 2
    assert _names(hass) == ["Plug 01", "Plug 02", "Plug 03"]
    assert len(our_devices(hass, entry)) == 3


async def test_remove_by_ids_leaves_the_others(hass: HomeAssistant, client: Any) -> None:
    ids = [_id(hass, "Plug 01"), _id(hass, "Plug 03"), "unknown"]
    reply = await call(client, "devices/bulk_remove", ids=ids)
    assert reply["success"], reply
    assert _names(hass) == ["Plug 02", "Lamp 01", "Lamp 02"]


async def test_a_changed_selection_is_refused_and_nothing_is_removed(
    hass: HomeAssistant, client: Any
) -> None:
    reply = await call(client, "devices/bulk_remove", filter={"query": "plug"}, expected=2)
    assert reply["error"]["code"] == ErrorCode.WS_SELECTION_CHANGED
    assert len(_names(hass)) == 5


async def test_a_device_that_is_used_blocks_the_removal(hass: HomeAssistant, client: Any) -> None:
    added = await call(
        client,
        "schedules/add",
        name="Off",
        trigger={"type": "times", "times": ["12:00"]},
        action="turn_off",
        target={"device": _id(hass, "Plug 01")},
    )
    assert added["success"], added
    reply = await call(client, "devices/bulk_remove", filter={})
    assert reply["error"]["code"] == ErrorCode.REM_IN_USE
    assert len(_names(hass)) == 5


async def test_the_area_of_many_devices_changes_with_one_save(
    hass: HomeAssistant, client: Any, entry: MockConfigEntry
) -> None:
    reply = await call(client, "devices/bulk_area", filter={"templates": ["light"]}, area=" Hall ")
    assert reply["result"] == {"devices": 2, "area": "Hall"}
    assert [d.area for d in get_data(hass).store.devices()] == [None] * 3 + ["Hall"] * 2
    assert ar.async_get(hass).async_get_area_by_name("Hall") is not None

    reply = await call(client, "devices/bulk_area", filter={}, area=None)
    assert reply["result"]["devices"] == 5
    assert ar.async_get(hass).async_get_area_by_name("Hall") is None


async def test_an_action_runs_on_every_selected_device(hass: HomeAssistant, client: Any) -> None:
    reply = await call(client, "devices/bulk_action", filter={"query": "plug"}, action="turn_off")
    assert reply["result"] == {"devices": 3, "failed": 0}
    assert state_of(hass, "Plug 02", "state").state == "off"  # type: ignore[union-attr]


async def test_a_device_that_cannot_do_the_action_counts_as_failed(
    hass: HomeAssistant, client: Any
) -> None:
    reply = await call(client, "devices/bulk_action", filter={}, action="open")
    assert reply["success"]
    assert reply["result"]["failed"] == 5


async def test_a_new_group_takes_the_selected_devices(
    hass: HomeAssistant, mqtt_mock: MagicMock, hass_ws_client: WebSocketGenerator, entry: Any
) -> None:
    await create_devices(hass, template="light", count=2, name_pattern="Lamp {nn}", output="z2m")
    client = await hass_ws_client(hass)

    reply = await call(client, "devices/bulk_group", filter={"outputs": ["z2m"]}, name="Lights")
    assert reply["success"], reply
    assert len(reply["result"]["members"]) == 2
    assert [item.name for item in get_data(hass).store.groups()] == ["Lights"]

    await create_devices(hass, template="light", count=1, name_pattern="Spot {nn}", output="z2m")
    group_id = reply["result"]["id"]
    spot = next(name for name in _names(hass) if name.startswith("Spot"))
    reply = await call(client, "devices/bulk_group", ids=[_id(hass, spot)], group_id=group_id)
    assert reply["success"], reply
    assert len(reply["result"]["members"]) == 3


async def test_a_device_without_z2m_cannot_join_a_group(client: Any) -> None:
    reply = await call(client, "devices/bulk_group", filter={}, name="Mix")
    assert not reply["success"]


@pytest.mark.parametrize(
    ("command", "fields"),
    [
        ("devices/bulk_remove", {}),
        ("devices/bulk_remove", {"ids": ["a"], "filter": {}}),
        ("devices/bulk_remove", {"ids": []}),
        ("devices/bulk_remove", {"ids": ["a"] * (MAX_BATCH + 1)}),
        ("devices/bulk_remove", {"filter": {"state": "broken"}}),
        ("devices/bulk_remove", {"filter": {}, "expected": -1}),
        ("devices/bulk_area", {"filter": {}}),
        ("devices/bulk_area", {"filter": {}, "area": "a" * 500}),
        ("devices/bulk_group", {"filter": {}}),
        ("devices/bulk_group", {"filter": {}, "name": "a", "group_id": "b"}),
        ("devices/bulk_action", {"filter": {}}),
        ("devices/bulk_action", {"filter": {}, "action": "x" * 500}),
    ],
)
async def test_invalid_input_is_rejected(
    hass: HomeAssistant, client: Any, command: str, fields: dict[str, Any]
) -> None:
    reply = await call(client, command, **fields)
    assert not reply["success"]
    assert reply["error"]["code"] == ErrorCode.WS_INVALID_REQUEST
    assert len(_names(hass)) == 5
