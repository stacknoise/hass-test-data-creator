"""The source of a copy is visible in the device list, its filters and facets, and can be removed."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.hass_test_data_creator.data import get_data

from ..conftest import create_devices
from .test_binding import create_copies, set_source
from .test_commands import REAL, call, real_device


async def listing(client: Any, **flt: Any) -> dict[str, Any]:
    """Return the result of `devices/list` with facets for a filter."""
    reply = await call(client, "devices/list", facets=True, **flt)
    return reply["result"]


async def setup_copies(hass: HomeAssistant, client: Any, entry: MockConfigEntry) -> str:
    """Create two plugs without source and two climate sensors that follow a source."""
    await create_devices(hass, count=2)
    device_id = real_device(hass, entry)
    set_source(hass, "sensor.hum", "40", "%")
    await create_copies(hass, client, device_id)
    await hass.async_block_till_done()
    return device_id


async def test_every_device_carries_its_source_and_the_filter_finds_the_copies(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    device_id = await setup_copies(hass, client, entry)

    everything = await listing(client)
    by_name = {item["name"]: item for item in everything["devices"]}
    assert by_name["Plug 01"]["source"] is None
    assert by_name["Copy 01"]["source"] == {
        "id": device_id,
        "name": REAL,
        "state": "ok",
        "dismissed": False,
    }
    assert {"value": device_id, "count": 2, "label": REAL} in everything["facets"]["sources"]
    assert {"value": "", "count": 2, "label": ""} in everything["facets"]["sources"]

    assert {d["name"] for d in (await listing(client, sources=[device_id]))["devices"]} == {
        "Copy 01",
        "Copy 02",
    }
    assert {d["name"] for d in (await listing(client, sources=[""]))["devices"]} == {
        "Plug 01",
        "Plug 02",
    }
    assert (await listing(client, source_state="with"))["matched"] == 2
    assert (await listing(client, source_state="without"))["matched"] == 2
    assert (await listing(client, query="boiler"))["matched"] == 2


async def test_an_offline_source_shows_in_the_state_and_its_filter(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    await setup_copies(hass, client, entry)

    set_source(hass, "sensor.temp", "unavailable", "°F")
    await hass.async_block_till_done()
    offline = await listing(client, source_state="offline")
    assert offline["matched"] == 2
    assert offline["devices"][0]["source"]["state"] == "offline"
    assert (await listing(client, source_state="removed"))["matched"] == 0


async def test_a_removed_source_is_reported_and_the_copies_stay_offline(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    device_id = await setup_copies(hass, client, entry)

    dr.async_get(hass).async_remove_device(device_id)
    hass.states.async_remove("sensor.temp")
    await hass.async_block_till_done()

    removed = await listing(client, source_state="removed")
    assert removed["matched"] == 2
    assert removed["devices"][0]["source"]["name"] == REAL
    pending = (await call(client, "sources/removed"))["result"]["sources"]
    assert [group["id"] for group in pending] == [device_id]
    assert {item["name"] for item in pending[0]["devices"]} == {"Copy 01", "Copy 02"}


async def test_keeping_the_copies_asks_no_more_and_removing_goes_through_the_plan(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    device_id = await setup_copies(hass, client, entry)
    dr.async_get(hass).async_remove_device(device_id)
    await hass.async_block_till_done()

    kept = await call(client, "devices/confirm_source_removed", source=device_id, remove=False)
    assert kept["result"] == {"kept": 2}
    assert (await call(client, "sources/removed"))["result"]["sources"] == []
    assert (await listing(client, source_state="removed"))["matched"] == 2

    gone = await call(client, "devices/confirm_source_removed", source=device_id, remove=True)
    assert gone["success"] is True
    assert {d.name for d in get_data(hass).store.devices()} == {"Plug 01", "Plug 02"}
