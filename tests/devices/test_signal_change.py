"""Changing the curve of a sensor of a generated device."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.hass_test_data_creator.const import DOMAIN
from custom_components.hass_test_data_creator.core.errors import ErrorCode
from custom_components.hass_test_data_creator.core.runtime import get_data

from ..conftest import create_devices, state_of

CONSTANT = {"shape": "constant", "min": 100, "max": 100, "decimals": 1}


async def _set(client: Any, device: str, entity: str, signal: dict[str, Any]) -> dict[str, Any]:
    """Send devices/signal and return the reply."""
    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/devices/signal", "device": device, "entity": entity, "signal": signal}
    )
    return await client.receive_json()


def _stored_shape(hass: HomeAssistant, index: int, key: str) -> str:
    """Return the shape stored for entity `key` of the device at `index`."""
    device = get_data(hass).store.devices()[index]
    return next(item for item in device.entities if item.key == key).signal["shape"]


async def test_a_new_curve_replaces_the_old_one_at_once(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=2)
    client = await hass_ws_client(hass)
    device_id = get_data(hass).store.devices()[0].id

    reply = await _set(client, device_id, "power", CONSTANT)
    await hass.async_block_till_done()

    assert reply["success"]
    assert reply["result"]["signal"] == CONSTANT
    assert float(state_of(hass, "Plug 01", "power").state) == 100.0
    assert _stored_shape(hass, 0, "power") == "constant"
    assert _stored_shape(hass, 1, "power") != "constant"


async def test_the_device_list_shows_the_signal(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=1)
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": f"{DOMAIN}/devices/list"})
    reply = await client.receive_json()
    entities = {item["key"]: item for item in reply["result"]["devices"][0]["entities"]}
    assert entities["power"]["signal"]["shape"] == "random_walk"
    assert entities["state"]["signal"] is None


async def test_wrong_requests_leave_the_curve_as_it_was(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=1)
    client = await hass_ws_client(hass)
    device_id = get_data(hass).store.devices()[0].id
    before = _stored_shape(hass, 0, "power")

    cases = (
        (
            device_id,
            "power",
            {"shape": "constant", "min": 5, "max": 1},
            ErrorCode.SIG_INVALID_RANGE,
        ),
        (device_id, "power", {"shape": "nope"}, ErrorCode.SIG_UNKNOWN_SHAPE),
        (device_id, "power", {"shape": "enum", "values": ["a"]}, ErrorCode.TPL_INVALID),
        (device_id, "state", CONSTANT, ErrorCode.SCH_TARGET_NOT_FOUND),
        (device_id, "missing", CONSTANT, ErrorCode.SCH_TARGET_NOT_FOUND),
        ("nope", "power", CONSTANT, ErrorCode.SCH_TARGET_NOT_FOUND),
    )
    for device, entity, signal, code in cases:
        reply = await _set(client, device, entity, signal)
        assert not reply["success"], signal
        assert reply["error"]["code"] == code

    assert _stored_shape(hass, 0, "power") == before
