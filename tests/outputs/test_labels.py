"""The label "test data" on the registry devices that MQTT discovery creates."""

from __future__ import annotations

from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr, label_registry as lr
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.hass_test_data_creator.const import LABEL_NAME
from custom_components.hass_test_data_creator.data import get_data

DISCOVERED = ("mqtt", "tdc_0123456789abcdef")
FOREIGN = ("mqtt", "some_other_device")


def create_device(hass: HomeAssistant, identifier: tuple[str, str]) -> dr.DeviceEntry:
    """Register a device as the MQTT integration does when it processes a discovery message."""
    mqtt_entry = MockConfigEntry(domain="mqtt")
    mqtt_entry.add_to_hass(hass)
    return dr.async_get(hass).async_get_or_create(
        config_entry_id=mqtt_entry.entry_id, identifiers={identifier}, name=identifier[1]
    )


def label_ids(hass: HomeAssistant, device: dr.DeviceEntry) -> set[str]:
    """Return the label ids the registry holds for `device` now."""
    entry = dr.async_get(hass).async_get(device.id)
    assert entry is not None
    return set(entry.labels)


async def test_a_device_that_discovery_creates_gets_the_label(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    ours = create_device(hass, DISCOVERED)
    foreign = create_device(hass, FOREIGN)
    await hass.async_block_till_done()

    label = lr.async_get(hass).async_get_label_by_name(LABEL_NAME)
    assert label is not None
    assert label_ids(hass, ours) == {label.label_id}
    assert label_ids(hass, foreign) == set()


async def test_devices_that_exist_at_the_start_are_labelled(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    labeler = get_data(hass).labeler
    labeler.stop()
    ours = create_device(hass, DISCOVERED)
    await hass.async_block_till_done()
    assert label_ids(hass, ours) == set()

    labeler.start()
    assert len(label_ids(hass, ours)) == 1
