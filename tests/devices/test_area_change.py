"""Putting a generated device into another area."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry as ar
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.hass_test_data_creator.const import DOMAIN
from custom_components.hass_test_data_creator.core.errors import ErrorCode
from custom_components.hass_test_data_creator.data import get_data

from ..conftest import create_devices, our_devices


async def _update(client: Any, device: str, area: str | None) -> dict[str, Any]:
    """Send devices/update and return the reply."""
    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/devices/update", "device": device, "area": area}
    )
    return await client.receive_json()


def _area_of(hass: HomeAssistant, entry: MockConfigEntry, name: str) -> str | None:
    """Return the area id of the registry device called `name`."""
    return next(item.area_id for item in our_devices(hass, entry) if item.name == name)


async def test_a_device_moves_between_areas_and_empty_created_areas_go(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=2)
    client = await hass_ws_client(hass)
    areas = ar.async_get(hass)
    assert _area_of(hass, entry, "Plug 01") is None

    reply = await _update(client, get_data(hass).store.devices()[0].id, " Kitchen ")
    assert reply["success"]
    assert reply["result"]["area"] == "Kitchen"
    kitchen = areas.async_get_area_by_name("Kitchen")
    assert kitchen is not None
    assert _area_of(hass, entry, "Plug 01") == kitchen.id
    assert get_data(hass).store.devices()[0].area == "Kitchen"
    assert _area_of(hass, entry, "Plug 02") is None

    reply = await _update(client, get_data(hass).store.devices()[0].id, "Hall")
    assert reply["success"]
    assert areas.async_get_area_by_name("Kitchen") is None
    assert areas.async_get_area_by_name("Hall") is not None

    reply = await _update(client, get_data(hass).store.devices()[0].id, None)
    assert reply["success"]
    assert _area_of(hass, entry, "Plug 01") is None
    assert get_data(hass).store.devices()[0].area is None
    assert areas.async_get_area_by_name("Hall") is None


async def test_an_existing_area_is_used_and_kept(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=1)
    existing = ar.async_get(hass).async_create("Cellar")
    client = await hass_ws_client(hass)

    await _update(client, get_data(hass).store.devices()[0].id, "Cellar")
    assert _area_of(hass, entry, "Plug 01") == existing.id
    await _update(client, get_data(hass).store.devices()[0].id, None)
    assert ar.async_get(hass).async_get_area(existing.id) is not None


async def test_an_unknown_device_is_refused(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    reply = await _update(client, "nope", "Kitchen")
    assert not reply["success"]
    assert reply["error"]["code"] == ErrorCode.SCH_TARGET_NOT_FOUND
