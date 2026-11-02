"""Copies follow their source: values, units, deviation, offline rule and clean-up."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.hass_test_data_creator.core.keys import CAUSE_SOURCE
from custom_components.hass_test_data_creator.data import get_data
from custom_components.hass_test_data_creator.log.filters import LogFilter

from ..conftest import fire_tick, state_of
from .test_commands import call, real_device


async def create_copies(
    hass: HomeAssistant, client: Any, device_id: str, **extra: Any
) -> dict[str, Any]:
    """Create two climate sensors that follow the temperature and the humidity of a source."""
    return await call(
        client,
        "devices/create",
        template="climate_sensor",
        count=2,
        name_pattern="Copy {nn}",
        source={
            "device_id": device_id,
            "mapping": {"temperature": "sensor.temp", "humidity": "sensor.hum"},
            **extra,
        },
    )


def set_source(hass: HomeAssistant, entity_id: str, state: str, unit: str) -> None:
    """Set the state of a source entity."""
    hass.states.async_set(entity_id, state, {"unit_of_measurement": unit})


async def test_copies_follow_the_converted_value_at_their_next_tick(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    device_id = real_device(hass, entry)
    set_source(hass, "sensor.hum", "40", "%")
    client = await hass_ws_client(hass)
    assert (await create_copies(hass, client, device_id))["success"] is True
    await hass.async_block_till_done()

    first = state_of(hass, "Copy 01", "temperature")
    assert first is not None
    assert float(first.state) == 20.0

    set_source(hass, "sensor.temp", "86", "°F")
    await hass.async_block_till_done()
    changed = state_of(hass, "Copy 01", "temperature")
    assert changed is not None
    assert float(changed.state) == 30.0


async def test_copies_go_offline_with_the_source_at_once_and_return_with_it(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    device_id = real_device(hass, entry)
    set_source(hass, "sensor.hum", "40", "%")
    client = await hass_ws_client(hass)
    await create_copies(hass, client, device_id)
    await hass.async_block_till_done()
    log = get_data(hass).log
    log.get(0, 1, LogFilter.from_request(None), False)

    set_source(hass, "sensor.temp", "unavailable", "°F")
    await hass.async_block_till_done()
    for name in ("Copy 01", "Copy 02"):
        offline = state_of(hass, name, "temperature")
        assert offline is not None
        assert offline.state == "unavailable"
        humidity = state_of(hass, name, "humidity")
        assert humidity is not None
        assert humidity.state == "40.0"

    set_source(hass, "sensor.temp", "50", "°F")
    await hass.async_block_till_done()
    back = state_of(hass, "Copy 01", "temperature")
    assert back is not None
    assert float(back.state) == 10.0
    causes = {
        entry["cause"] for entry in log.get(0, 100, LogFilter.from_request(None), False)["entries"]
    }
    assert causes == {CAUSE_SOURCE}


async def test_the_seed_gives_each_copy_its_own_reproducible_deviation(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    device_id = real_device(hass, entry)
    set_source(hass, "sensor.hum", "40", "%")
    client = await hass_ws_client(hass)
    await create_copies(hass, client, device_id, deviation={"offset": 2.0, "decimals": 2})
    await hass.async_block_till_done()

    values = [float(state_of(hass, name, "temperature").state) for name in ("Copy 01", "Copy 02")]  # type: ignore[union-attr]
    assert values[0] != values[1]
    assert all(abs(value - 20.0) <= 2.0 for value in values)


async def test_one_subscription_serves_all_copies_and_removal_releases_it(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    device_id = real_device(hass, entry)
    set_source(hass, "sensor.hum", "40", "%")
    client = await hass_ws_client(hass)
    await create_copies(hass, client, device_id)
    await hass.async_block_till_done()
    follower = get_data(hass).follower
    assert follower.subscriptions() == 2

    for behaviour in list(get_data(hass).live.values()):
        behaviour.close()
    assert follower.subscriptions() == 0


async def test_a_source_that_does_not_fit_is_refused_before_anything_is_created(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    device_id = real_device(hass, entry)
    client = await hass_ws_client(hass)

    wrong = await call(
        client,
        "devices/create",
        template="climate_sensor",
        count=1,
        source={"device_id": device_id, "mapping": {"temperature": "sensor.nope"}},
    )
    assert wrong["success"] is False
    assert wrong["error"]["message"] == "The mapping does not fit the source device"
    swapped = await call(
        client,
        "devices/create",
        template="climate_sensor",
        count=1,
        source={"device_id": device_id, "mapping": {"humidity": "sensor.temp"}},
    )
    assert swapped["success"] is False
    assert swapped["error"]["message"] == "The mapping does not fit the source device"
    missing = await call(
        client, "devices/create", template="climate_sensor", count=1, source={"device_id": "x"}
    )
    assert missing["error"]["message"] == "The source device was not found"
    assert get_data(hass).store.devices() == []


async def test_a_duplicate_keeps_the_source_and_starts_without_own_seeds(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    device_id = real_device(hass, entry)
    set_source(hass, "sensor.hum", "40", "%")
    client = await hass_ws_client(hass)
    await create_copies(hass, client, device_id)
    store = get_data(hass).store
    original = store.devices()[0]
    original.source["seeds"] = {"temperature": 7}  # type: ignore[index]

    duplicated = await call(client, "devices/duplicate", device=original.id, count=1)
    assert duplicated["success"] is True
    newest = store.devices()[-1]
    assert newest.id != original.id
    assert newest.source is not None
    assert newest.source["device_id"] == device_id
    assert newest.source["mapping"] == original.source["mapping"]  # type: ignore[index]
    assert newest.source["seeds"] == {}
    fire_tick(hass)


async def test_a_unit_that_cannot_be_converted_is_refused(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    device_id = real_device(hass, entry)
    set_source(hass, "sensor.temp", "1", "W")
    client = await hass_ws_client(hass)

    refused = await create_copies(hass, client, device_id)
    assert refused["success"] is False
    assert refused["error"]["message"] == "The unit of the source cannot be converted"


async def test_the_log_names_the_source_and_filters_by_it(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    device_id = real_device(hass, entry)
    set_source(hass, "sensor.hum", "40", "%")
    client = await hass_ws_client(hass)
    await create_copies(hass, client, device_id)
    await hass.async_block_till_done()
    log = get_data(hass).log
    log.get(0, 1, LogFilter.from_request(None), False)

    set_source(hass, "sensor.temp", "unavailable", "°F")
    await hass.async_block_till_done()
    mine = log.get(0, 100, LogFilter.from_request({"sources": [device_id]}), False)["entries"]
    assert mine
    assert {item["source_id"] for item in mine} == {device_id}
    assert {item["source"] for item in mine} == {"Boiler room sensor"}
    other = log.get(0, 100, LogFilter.from_request({"sources": ["nope"]}), False)["entries"]
    assert other == []
    by_text = log.get(0, 100, LogFilter.from_request({"query": "boiler"}), False)["entries"]
    assert len(by_text) == len(mine)
