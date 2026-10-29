"""The store keeps devices in memory and writes them when saved."""

from __future__ import annotations

from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.hass_test_data_creator.core.keys import KEY_DEVICES
from custom_components.hass_test_data_creator.core.runtime import get_data
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
