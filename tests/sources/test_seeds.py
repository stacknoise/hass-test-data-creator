"""Copies are locked; only their seed changes, per sensor, and it takes effect at once."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.hass_test_data_creator.data import get_data

from ..conftest import state_of
from .test_binding import create_copies, set_source
from .test_commands import call, real_device

DEVIATION = {"offset": 5.0}


async def setup_copies(hass: HomeAssistant, client: Any, entry: MockConfigEntry) -> str:
    """Create two copies with an offset deviation and return the id of the first."""
    device_id = real_device(hass, entry)
    set_source(hass, "sensor.hum", "40", "%")
    await create_copies(hass, client, device_id, deviation=DEVIATION)
    await hass.async_block_till_done()
    return next(d.id for d in get_data(hass).store.devices() if d.name == "Copy 01")


async def test_the_curve_of_a_copy_cannot_be_edited(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    copy = await setup_copies(hass, client, entry)
    reply = await call(
        client,
        "devices/signal",
        device=copy,
        entity="temperature",
        signal={"shape": "sine", "min": 0, "max": 10},
    )
    assert reply["success"] is False
    assert "TDC-SRC-005" in str(reply["error"])


async def test_a_new_seed_changes_the_deviation_of_one_sensor_at_once(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    copy = await setup_copies(hass, client, entry)
    before = state_of(hass, "Copy 01", "temperature")
    humidity = state_of(hass, "Copy 01", "humidity")
    assert before is not None and humidity is not None

    seen = set()
    for seed in range(1, 6):
        reply = await call(
            client, "devices/set_seed", devices=[copy], entity="temperature", seed=seed
        )
        assert reply["result"] == {"changed": 1}
        await hass.async_block_till_done()
        state = state_of(hass, "Copy 01", "temperature")
        assert state is not None
        seen.add(state.state)
    assert len(seen) > 1

    stored = get_data(hass).store.device(copy)
    assert stored is not None and stored.source is not None
    assert stored.source["seeds"] == {"temperature": 5}
    assert state_of(hass, "Copy 01", "humidity").state == humidity.state  # type: ignore[union-attr]


async def test_random_gives_every_sensor_its_own_seed_and_checks_the_request(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    copy = await setup_copies(hass, client, entry)
    await call(client, "devices/create", template="plug_metering", count=1, name_pattern="Plain")
    plain = next(d.id for d in get_data(hass).store.devices() if d.name == "Plain")

    reply = await call(client, "devices/set_seed", devices=[copy], seed="random")
    assert reply["result"] == {"changed": 1}
    seeds = get_data(hass).store.device(copy).source["seeds"]  # type: ignore[union-attr]
    assert set(seeds) == {"temperature", "humidity"}

    no_source = await call(client, "devices/set_seed", devices=[plain], seed=1)
    assert "TDC-SRC-006" in str(no_source["error"])
    not_mapped = await call(client, "devices/set_seed", devices=[copy], entity="pressure", seed=1)
    assert "TDC-SRC-003" in str(not_mapped["error"])


async def test_actions_on_a_copy_with_an_offline_source_fail_and_work_again_with_it(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    copy = await setup_copies(hass, client, entry)
    fault = {"device": copy, "entity": "temperature", "action": "fault_spike"}

    assert (await call(client, "devices/fire", **fault))["success"] is True

    set_source(hass, "sensor.temp", "unavailable", "°C")
    await hass.async_block_till_done()
    refused = await call(client, "devices/fire", **fault)
    assert "TDC-SRC-007" in str(refused["error"])

    set_source(hass, "sensor.temp", "20", "°C")
    await hass.async_block_till_done()
    assert (await call(client, "devices/fire", **fault))["success"] is True
