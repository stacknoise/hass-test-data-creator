"""Shared fixtures: a loaded config entry with the panel registration replaced."""

from __future__ import annotations

from collections.abc import AsyncIterator, Iterator
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

from homeassistant.core import HomeAssistant, State
from homeassistant.helpers import device_registry as dr, entity_registry as er
from homeassistant.helpers.dispatcher import async_dispatcher_send
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry, mock_component

from custom_components.hass_test_data_creator.const import (
    CONF_SEED,
    CONF_TICK_SECONDS,
    DOMAIN,
    SIGNAL_TICK,
)
from custom_components.hass_test_data_creator.data import get_data

SEED = "tdc-test"


@pytest.fixture(autouse=True)
def _enable_custom_integrations(enable_custom_integrations: None) -> None:
    """Let Home Assistant find the integration in custom_components."""


@pytest.fixture(autouse=True)
def _short_foreign_probe(monkeypatch: pytest.MonkeyPatch) -> None:
    """Shorten the wait for foreign retained topics; the mocked broker never answers."""
    client = "custom_components.hass_test_data_creator.outputs.mqtt.client"
    monkeypatch.setattr(f"{client}.FOREIGN_PROBE_SECONDS", 0.3)
    monkeypatch.setattr(f"{client}.FOREIGN_PROBE_LONG_SECONDS", 0.6)
    monkeypatch.setattr(f"{client}.SCAN_SECONDS", 0.3)


@pytest.fixture
def mock_panel(hass: HomeAssistant) -> Iterator[None]:
    """Replace the panel registration; the frontend is not part of the tests."""
    mock_component(hass, "frontend")
    mock_component(hass, "panel_custom")
    base = "custom_components.hass_test_data_creator"
    with (
        patch(f"{base}.async_register_panel", AsyncMock()),
        patch(f"{base}.async_remove_panel", MagicMock()),
    ):
        yield


@pytest.fixture
async def entry(hass: HomeAssistant, mock_panel: None) -> AsyncIterator[MockConfigEntry]:
    """Return a set up config entry of the integration."""
    config_entry = MockConfigEntry(
        domain=DOMAIN,
        data={CONF_SEED: SEED, CONF_TICK_SECONDS: 10},
        title="HASS Test Data Creator",
    )
    config_entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(config_entry.entry_id)
    await hass.async_block_till_done()
    yield config_entry


async def create_devices(hass: HomeAssistant, **fields: Any) -> dict[str, Any]:
    """Call the create_devices service and return its response."""
    data = {"template": "plug_metering", "count": 4, "name_pattern": "Plug {nn}", **fields}
    response = await hass.services.async_call(
        DOMAIN, "create_devices", data, blocking=True, return_response=True
    )
    await hass.async_block_till_done()
    return response


def our_devices(hass: HomeAssistant, entry: MockConfigEntry) -> list[dr.DeviceEntry]:
    """Return the registry devices of the config entry."""
    return dr.async_entries_for_config_entry(dr.async_get(hass), entry.entry_id)


def state_of(hass: HomeAssistant, device_name: str, key: str) -> State | None:
    """Return the state of an entity found by device name and key, whatever its entity id."""
    store = hass.data[DOMAIN].store
    device = next(item for item in store.devices() if item.name == device_name)
    definition = next(item for item in device.entities if item.key == key)
    entity_id = er.async_get(hass).async_get_entity_id(
        definition.platform, DOMAIN, f"{device.id}_{key}"
    )
    return hass.states.get(entity_id) if entity_id else None


def fire_tick(hass: HomeAssistant) -> None:
    """Send one tick with the current signal time, as the timer does."""
    async_dispatcher_send(hass, SIGNAL_TICK, get_data(hass).clock.now())
