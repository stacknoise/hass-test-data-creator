"""The store keeps devices in memory and writes them when saved."""

from __future__ import annotations

from datetime import timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.hass_test_data_creator.const import STORE_KEY, STORE_VERSION
from custom_components.hass_test_data_creator.core.keys import KEY_DEVICES, KEY_TIME_LAPSE
from custom_components.hass_test_data_creator.data import get_data
from custom_components.hass_test_data_creator.store.migrate import migrate
from custom_components.hass_test_data_creator.store.store import TdcStore

from ..conftest import create_devices


async def test_saved_devices_come_back_equal_after_a_reload(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=3)
    store = get_data(hass).store
    before = store.devices()
    await store.async_save()

    reloaded = TdcStore(hass)
    await reloaded.async_load()

    assert reloaded.devices() == before
    assert reloaded.device_count() == 3
    assert reloaded.device_id_of(before[1].name) == before[1].id
    assert reloaded._snapshot()[KEY_DEVICES][before[0].id] == before[0].to_dict()


async def test_removing_a_device_drops_it_from_its_run(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=2)
    store = get_data(hass).store
    first, second = store.devices()

    store.remove_device(first.id)
    assert store.device(first.id) is None
    assert store.runs()[0].device_ids == [second.id]

    store.remove_device(second.id)
    assert store.runs() == []


def test_data_of_version_one_gets_the_time_lapse_key() -> None:
    migrated = migrate(1, {KEY_DEVICES: {}})
    assert migrated == {KEY_DEVICES: {}, KEY_TIME_LAPSE: None}
    assert migrate(STORE_VERSION, {KEY_DEVICES: {}}) == {KEY_DEVICES: {}}


async def test_a_stored_version_one_file_is_loaded_and_migrated(
    hass: HomeAssistant, hass_storage: dict[str, Any]
) -> None:
    hass_storage[STORE_KEY] = {"version": 1, "key": STORE_KEY, "data": {KEY_DEVICES: {}}}
    store = TdcStore(hass)
    await store.async_load()
    assert store._snapshot()[KEY_TIME_LAPSE] is None


async def test_the_time_lapse_keeps_its_start_while_the_factor_stays(hass: HomeAssistant) -> None:
    store = TdcStore(hass)
    await store.async_load()
    first = dt_util.utcnow()
    assert store.time_lapse_start(60.0, first) == first

    later = first + timedelta(hours=3)
    assert store.time_lapse_start(60.0, later) == first
    assert store.time_lapse_start(120.0, later) == later
    assert store.time_lapse_start(120.0, later + timedelta(hours=1)) == later
    assert store.time_lapse_start(60.0, later + timedelta(hours=1)) == later + timedelta(hours=1)
