"""The commands that read real devices for the source feature."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr, entity_registry as er
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from ..conftest import create_devices

PREFIX = "hass_test_data_creator"
REAL = "Boiler room sensor"


async def call(client: Any, command: str, **fields: Any) -> dict[str, Any]:
    """Send a command and return the whole reply."""
    await client.send_json_auto_id({"type": f"{PREFIX}/{command}", **fields})
    return await client.receive_json()


def real_device(hass: HomeAssistant, config_entry: MockConfigEntry) -> str:
    """Register a real device of another integration with a temperature and a humidity sensor."""
    other = MockConfigEntry(domain="other")
    other.add_to_hass(hass)
    device = dr.async_get(hass).async_get_or_create(
        config_entry_id=other.entry_id,
        identifiers={("other", "boiler")},
        name=REAL,
        manufacturer="Acme",
        model="B1",
    )
    entities = er.async_get(hass)
    for key, device_class, unit, state in (
        ("temp", "temperature", "°F", "68"),
        ("hum", "humidity", "%", "unavailable"),
    ):
        entity = entities.async_get_or_create(
            "sensor",
            "other",
            key,
            device_id=device.id,
            original_device_class=device_class,
            suggested_object_id=key,
        )
        hass.states.async_set(
            entity.entity_id, state, {"device_class": device_class, "unit_of_measurement": unit}
        )
    return device.id


async def test_the_search_finds_real_devices_and_never_generated_ones(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=2)
    real_device(hass, entry)
    client = await hass_ws_client(hass)

    found = (await call(client, "sources/list"))["result"]["devices"]
    assert [item["name"] for item in found] == [REAL]
    assert found[0]["entities"] == 2
    assert found[0]["usable"] == 2
    assert (await call(client, "sources/list", query="acme"))["result"]["devices"] == found
    assert (await call(client, "sources/list", query="plug"))["result"]["devices"] == []


async def test_a_device_without_followable_entities_is_marked_unusable(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    other = MockConfigEntry(domain="other")
    other.add_to_hass(hass)
    dr.async_get(hass).async_get_or_create(
        config_entry_id=other.entry_id, identifiers={("other", "empty")}, name="Empty"
    )
    client = await hass_ws_client(hass)
    found = (await call(client, "sources/list"))["result"]["devices"]
    assert [(item["name"], item["usable"]) for item in found] == [("Empty", 0)]


async def test_inspect_lists_entities_and_proposes_a_mapping(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    device_id = real_device(hass, entry)
    client = await hass_ws_client(hass)

    reply = (await call(client, "sources/inspect", device_id=device_id, template="climate_sensor"))[
        "result"
    ]
    assert [item["entity_id"] for item in reply["entities"]] == ["sensor.hum", "sensor.temp"]
    proposal = {item["key"]: item for item in reply["proposal"]}
    assert proposal["temperature"]["entity_id"] == "sensor.temp"
    assert proposal["humidity"]["entity_id"] == "sensor.hum"
    assert proposal["pressure"]["reason"] == "none"


async def test_a_generated_or_missing_device_is_refused(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=1)
    ours = list(dr.async_get(hass).devices)
    generated = next(item for item in ours if item.name == "Plug 01")
    client = await hass_ws_client(hass)

    refused = await call(client, "sources/inspect", device_id=generated.id)
    assert refused["success"] is False
    assert refused["error"]["message"] == "A generated device cannot be a source"
    missing = await call(client, "sources/inspect", device_id="nope")
    assert missing["success"] is False
    assert missing["error"]["message"] == "The source device was not found"


async def test_the_preview_shows_the_deviations_without_creating_anything(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    device_id = real_device(hass, entry)
    before = len(dr.async_get(hass).devices)
    client = await hass_ws_client(hass)
    temp = next(
        item["entity_id"]
        for item in (await call(client, "sources/inspect", device_id=device_id))["result"][
            "entities"
        ]
        if item["entity_id"] == "sensor.temp"
    )

    reply = (
        await call(
            client,
            "sources/preview",
            entity_id=temp,
            count=4,
            deviation={"offset": 0.5, "decimals": 2},
        )
    )["result"]
    assert reply["source"] == 68.0
    assert len(reply["copies"]) == 4
    assert len({item["value"] for item in reply["copies"]}) > 1
    assert all(abs(item["value"] - 68.0) <= 0.5 for item in reply["copies"])
    again = (
        await call(
            client,
            "sources/preview",
            entity_id=temp,
            count=4,
            deviation={"offset": 0.5, "decimals": 2},
        )
    )["result"]
    assert again == reply
    assert len(dr.async_get(hass).devices) == before

    offline = next(
        item["entity_id"]
        for item in (await call(client, "sources/inspect", device_id=device_id))["result"][
            "entities"
        ]
        if item["entity_id"] == "sensor.hum"
    )
    assert (await call(client, "sources/preview", entity_id=offline))["success"] is False
