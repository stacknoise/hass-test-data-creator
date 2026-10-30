"""Export: the entries of every category, selective and paged (concept 16.5)."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.hass_test_data_creator.data import get_data

from ..conftest import create_devices


async def export(client: Any, category: str, **fields: Any) -> dict[str, Any]:
    """Send `transfer/export` and return the whole reply."""
    await client.send_json_auto_id(
        {"type": "hass_test_data_creator/transfer/export", "category": category, **fields}
    )
    return await client.receive_json()


async def test_devices_are_exported_with_their_overrides(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=2, areas=["Bath"])
    client = await hass_ws_client(hass)
    await client.send_json_auto_id(
        {
            "type": "hass_test_data_creator/devices/signal",
            "device": get_data(hass).store.devices()[0].id,
            "entity": "power",
            "signal": {"shape": "constant", "min": 5, "max": 5},
        }
    )
    assert (await client.receive_json())["success"]

    reply = await export(client, "devices")
    assert reply["success"]
    result = reply["result"]
    assert result["format_version"] == 1
    assert result["total"] == 2
    first, second = result["items"]
    assert first["name"] == "Plug 01"
    assert first["template"] == "plug_metering"
    assert first["area"] == "Bath"
    assert first["overrides"]["power"]["signal"] == {"shape": "constant", "min": 5, "max": 5}
    assert "entities" not in first
    assert "overrides" not in second
    assert "id" not in first
    assert "run_id" not in first


async def test_a_custom_device_is_exported_with_all_entities(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    entities = [
        {"key": "level", "platform": "sensor", "name": "Level", "signal": {"shape": "sine"}}
    ]
    await create_devices(hass, template="custom", count=1, name_pattern="Mine", entities=entities)
    client = await hass_ws_client(hass)

    result = (await export(client, "devices"))["result"]
    (item,) = result["items"]
    assert item["template"] == "custom"
    assert [entity["key"] for entity in item["entities"]] == ["level"]
    assert "overrides" not in item


async def test_templates_export_only_own_templates(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    entry: MockConfigEntry,
    tmp_path: Any,
) -> None:
    hass.config.config_dir = str(tmp_path)
    client = await hass_ws_client(hass)
    await client.send_json_auto_id(
        {
            "type": "hass_test_data_creator/templates/save",
            "template_id": "mine",
            "name": "Mine",
            "entities": [
                {"key": "level", "platform": "sensor", "name": "Level", "signal": {"shape": "sine"}}
            ],
        }
    )
    assert (await client.receive_json())["success"]

    result = (await export(client, "templates"))["result"]
    assert [item["id"] for item in result["items"]] == ["mine"]


async def test_references_are_written_by_name(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=2)
    client = await hass_ws_client(hass)
    data = get_data(hass)
    device = data.store.devices()[0]
    await data.scenarios.async_add(
        {
            "name": "Burst",
            "steps": [
                {
                    "after_s": 0,
                    "target": {"device": device.id},
                    "entity": "",
                    "action": "turn_on",
                    "params": {},
                }
            ],
        }
    )
    scenario = data.store.scenarios()[0]
    await data.schedules.async_add(
        {
            "name": "Nightly",
            "scenario": scenario.id,
            "trigger": {"type": "times", "times": ["22:00"]},
        },
        "seed",
    )

    scenarios = (await export(client, "scenarios"))["result"]["items"]
    assert scenarios[0]["steps"][0]["target"] == {"device": device.name}
    schedules = (await export(client, "schedules"))["result"]["items"]
    assert schedules[0]["scenario"] == "Burst"
    assert "id" not in schedules[0]


async def test_a_page_and_a_count_without_items(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=3)
    client = await hass_ws_client(hass)

    page = (await export(client, "devices", offset=1, limit=1))["result"]
    assert page["total"] == 3
    assert [item["name"] for item in page["items"]] == ["Plug 02"]
    counted = (await export(client, "devices", limit=0))["result"]
    assert counted["total"] == 3
    assert counted["items"] == []


async def test_a_wrong_request_is_refused(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    assert (await export(client, "areas"))["error"]["code"] == "TDC-WS-001"
    assert (await export(client, "devices", limit=501))["error"]["code"] == "TDC-WS-001"
    assert (await export(client, "devices", offset=-1))["error"]["code"] == "TDC-WS-001"
