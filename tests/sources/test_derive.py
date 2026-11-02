"""The entities of a copy come from the source device: no template is needed."""

from __future__ import annotations

from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.hass_test_data_creator.data import get_data

from ..conftest import state_of
from .test_binding import set_source
from .test_commands import call, real_device


async def test_the_source_gives_its_entities_and_the_mapping_to_them(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    device_id = real_device(hass, entry)
    set_source(hass, "sensor.hum", "40", "%")
    client = await hass_ws_client(hass)

    reply = (await call(client, "sources/derive", device_id=device_id))["result"]
    keys = {item["key"]: item for item in reply["entities"]}
    assert set(keys) == set(reply["mapping"])
    assert set(reply["mapping"].values()) == {"sensor.temp", "sensor.hum"}
    humidity = keys[next(k for k, v in reply["mapping"].items() if v == "sensor.hum")]
    assert humidity["platform"] == "sensor"
    assert humidity["unit"] == "%"
    assert humidity["signal"]["min"] < 40 < humidity["signal"]["max"]


async def test_copies_made_from_the_derived_entities_follow_the_source(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    device_id = real_device(hass, entry)
    set_source(hass, "sensor.hum", "40", "%")
    client = await hass_ws_client(hass)
    derived = (await call(client, "sources/derive", device_id=device_id))["result"]

    created = await call(
        client,
        "devices/create",
        template="custom",
        entities=derived["entities"],
        count=2,
        name_pattern="Twin {nn}",
        source={"device_id": device_id, "mapping": derived["mapping"]},
    )
    assert created["success"] is True, created
    await hass.async_block_till_done()
    assert len(get_data(hass).store.devices()) == 2
    key = next(k for k, v in derived["mapping"].items() if v == "sensor.hum")
    state = state_of(hass, "Twin 01", key)
    assert state is not None
    assert float(state.state) == 40.0
