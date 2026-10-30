"""The `devices/list` filter, sort and facets over the WebSocket (concept 16.1)."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.hass_test_data_creator.const import DOMAIN, MAX_FILTER_VALUES, MAX_SHORT_TEXT

from ..conftest import create_devices


async def _list(client: Any, **fields: Any) -> dict[str, Any]:
    """Send `devices/list` and return the result; fail the test on an error."""
    await client.send_json_auto_id({"type": f"{DOMAIN}/devices/list", **fields})
    reply = await client.receive_json()
    assert reply["success"], reply
    return reply["result"]


async def _rejected(client: Any, **fields: Any) -> bool:
    """Send `devices/list` and return whether it was rejected."""
    await client.send_json_auto_id({"type": f"{DOMAIN}/devices/list", **fields})
    return not (await client.receive_json())["success"]


@pytest.fixture
async def client(hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry):
    """Return a client on an instance with plugs in two areas and two lights."""
    await create_devices(hass, count=3, name_pattern="Plug {nn}", areas=["Kitchen"])
    await create_devices(hass, template="light", count=2, name_pattern="Lamp {nn}")
    return await hass_ws_client(hass)


async def test_without_a_filter_the_reply_lists_everything(client: Any) -> None:
    result = await _list(client)
    assert result["total"] == result["matched"] == 5
    assert [d["name"] for d in result["devices"]][:2] == ["Plug 01", "Plug 02"]
    assert "facets" not in result


async def test_matched_counts_the_filter_and_the_page_is_cut_after_it(client: Any) -> None:
    result = await _list(client, query="plug", limit=2, offset=1)
    assert (result["total"], result["matched"]) == (5, 3)
    assert [d["name"] for d in result["devices"]] == ["Plug 02", "Plug 03"]


async def test_groups_combine_by_and_values_by_or(client: Any) -> None:
    result = await _list(client, templates=["light", "plug_metering"], areas=["Kitchen"])
    assert result["matched"] == 3
    result = await _list(client, templates=["light"], areas=["Kitchen"])
    assert result["matched"] == 0
    result = await _list(client, areas=[""])
    assert [d["name"] for d in result["devices"]] == ["Lamp 01", "Lamp 02"]


async def test_sort_and_direction(client: Any) -> None:
    result = await _list(client, sort="name", descending=True)
    assert result["devices"][0]["name"] == "Plug 03"


async def test_facets_come_only_on_request(client: Any) -> None:
    result = await _list(client, facets=True, query="lamp")
    assert result["facets"]["templates"] == [{"value": "light", "count": 2}]
    assert result["facets"]["areas"] == [{"value": "", "count": 2}]
    assert result["facets"]["runs"][0]["label"] is not None


async def test_state_unused_matches_devices_nobody_names(hass: HomeAssistant, client: Any) -> None:
    result = await _list(client, state="unused")
    assert result["matched"] == 5
    assert (await _list(client, state="used"))["matched"] == 0
    assert (await _list(client, state="fault"))["matched"] == 0


@pytest.mark.parametrize(
    "fields",
    [
        {"query": "x" * (MAX_SHORT_TEXT + 1)},
        {"templates": ["a"] * (MAX_FILTER_VALUES + 1)},
        {"areas": ["x" * (MAX_SHORT_TEXT + 1)]},
        {"state": "broken"},
        {"sort": "id"},
        {"custom": "yes"},
        {"limit": 501},
    ],
)
async def test_invalid_or_oversized_input_is_rejected(client: Any, fields: dict[str, Any]) -> None:
    assert await _rejected(client, **fields)
