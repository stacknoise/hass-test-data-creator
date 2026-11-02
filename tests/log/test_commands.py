"""The commands of the live log through the WebSocket API."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.hass_test_data_creator.const import DOMAIN, FEATURES, MAX_PAGE_SIZE

from ..conftest import create_devices

PREFIX = "hass_test_data_creator"


async def call(client: Any, command: str, **fields: Any) -> dict[str, Any]:
    """Send a command and return the whole reply."""
    await client.send_json_auto_id({"type": f"{PREFIX}/{command}", **fields})
    return await client.receive_json()


async def fault(hass: HomeAssistant, key: str, kind: str) -> None:
    """Start a fault on an entity of the first plug."""
    await hass.services.async_call(
        DOMAIN,
        "fire_event",
        {
            "device": "Plug 01",
            "entity": key,
            "action": f"fault_{kind}",
            "params": {"duration_s": 30},
        },
        blocking=True,
    )
    await hass.async_block_till_done()


async def test_the_feature_is_announced() -> None:
    assert "live_log" in FEATURES


async def test_nothing_is_logged_before_the_first_read(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=1)
    await fault(hass, "power", "unavailable")
    client = await hass_ws_client(hass)
    reply = await call(client, "log/get")
    assert reply["success"]
    assert reply["result"]["entries"] == []
    assert reply["result"]["capture"] is True


async def test_a_change_after_the_first_read_is_logged_and_read_incrementally(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=1)
    client = await hass_ws_client(hass)
    await call(client, "log/get")
    await fault(hass, "power", "unavailable")

    reply = await call(client, "log/get")
    entries = reply["result"]["entries"]
    assert [(e["device"], e["key"], e["new"], e["cause"]) for e in entries] == [
        ("Plug 01", "power", "unavailable", "fault")
    ]
    assert entries[0]["unit"] == "W"
    last = reply["result"]["last_seq"]
    assert entries[0]["seq"] == last

    again = await call(client, "log/get", since=last)
    assert again["result"]["entries"] == []


async def test_the_filter_narrows_the_entries(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=1)
    client = await hass_ws_client(hass)
    await call(client, "log/get")
    await fault(hass, "power", "unavailable")
    await fault(hass, "voltage", "unavailable")

    both = await call(client, "log/get")
    assert len(both["result"]["entries"]) == 2
    only = await call(client, "log/get", filter={"entities": ["voltage"]})
    assert [e["key"] for e in only["result"]["entries"]] == ["voltage"]
    newest = await call(client, "log/get", newest_first=True, limit=1)
    assert [e["key"] for e in newest["result"]["entries"]] == ["voltage"]


async def test_stopping_empties_the_log_and_clear_keeps_recording(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=1)
    client = await hass_ws_client(hass)
    await call(client, "log/get")
    await fault(hass, "power", "unavailable")

    cleared = await call(client, "log/clear")
    assert cleared["result"]["size"] == 0
    assert cleared["result"]["capture"] is True

    await fault(hass, "voltage", "unavailable")
    stopped = await call(client, "log/set", capture=False)
    assert stopped["result"]["capture"] is False
    assert stopped["result"]["size"] == 0
    await fault(hass, "current", "unavailable")
    after = await call(client, "log/get")
    assert after["result"]["entries"] == []


async def test_the_size_can_be_set_within_its_limits(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    ok = await call(client, "log/set", size=1000)
    assert ok["result"]["capacity"] == 1000
    too_small = await call(client, "log/set", size=10)
    assert too_small["success"] is False


async def test_bad_requests_are_refused(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    assert (await call(client, "log/get", limit=MAX_PAGE_SIZE + 1))["success"] is False
    assert (await call(client, "log/get", since=-1))["success"] is False
    assert (await call(client, "log/get", filter={"query": "x" * 500}))["success"] is False
    assert (await call(client, "log/get", filter={"causes": ["x"] * 100}))["success"] is False
