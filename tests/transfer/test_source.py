"""Export and import carry the source of a copy by its name (concept 17.6)."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.hass_test_data_creator.data import get_data

from ..sources.test_binding import create_copies, set_source
from ..sources.test_commands import REAL, call, real_device
from .test_import import send


async def exported_copy(hass: HomeAssistant, client: Any, entry: MockConfigEntry) -> dict[str, Any]:
    """Create two copies with a seed of their own and return the export entry of the first."""
    device_id = real_device(hass, entry)
    set_source(hass, "sensor.hum", "40", "%")
    await create_copies(hass, client, device_id, deviation={"offset": 2.0})
    await hass.async_block_till_done()
    copy = next(d for d in get_data(hass).store.devices() if d.name == "Copy 01")
    await call(client, "devices/set_seed", devices=[copy.id], entity="temperature", seed=9)
    reply = await call(client, "transfer/export", category="devices")
    return next(item for item in reply["result"]["items"] if item["name"] == "Copy 01")


async def test_a_copy_is_exported_with_the_name_of_its_source(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    item = await exported_copy(hass, client, entry)

    assert item["source"]["name"] == REAL
    assert set(item["source"]["mapping"].values()) == {"sensor.temp", "sensor.hum"}
    assert item["source"]["deviation"]["offset"] == 2.0
    assert item["source"]["seeds"] == {"temperature": 9}
    assert "device_id" not in item["source"]
    assert item["template"] == "climate_sensor"


async def test_the_source_comes_back_by_name_with_its_seeds(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    item = await exported_copy(hass, client, entry)
    await call(client, "removal/run", target="all")
    assert get_data(hass).store.device_count() == 0

    plan = (await send(client, "plan", category="devices", mode="add", items=[item]))["result"]
    assert (plan["create"], plan["problems"]) == (1, [])
    done = await send(client, "run", category="devices", mode="add", items=[item], file_name="f")
    assert done["success"] is True
    await hass.async_block_till_done()

    (restored,) = get_data(hass).store.devices()
    assert restored.source is not None
    assert restored.source["name"] == REAL
    assert restored.source["seeds"] == {"temperature": 9}
    assert restored.source["mapping"] == item["source"]["mapping"]


async def test_a_missing_source_creates_the_device_without_it_and_says_so(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    item = await exported_copy(hass, client, entry)
    await call(client, "removal/run", target="all")
    item["source"]["name"] = "No such device"

    done = (await send(client, "run", category="devices", mode="add", items=[item], file_name="f"))[
        "result"
    ]
    await hass.async_block_till_done()

    assert done["create"] == 1
    assert [problem["code"] for problem in done["problems"]] == ["TDC-SRC-008"]
    (restored,) = get_data(hass).store.devices()
    assert restored.source is None
    assert restored.entities
