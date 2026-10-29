"""The clock of the signals and the time lapse option."""

from __future__ import annotations

from collections.abc import AsyncIterator
from datetime import UTC, datetime, timedelta

from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import InvalidData
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.util import dt as dt_util
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.hass_test_data_creator.const import (
    CONF_SEED,
    CONF_TICK_SECONDS,
    CONF_TIME_LAPSE,
    DOMAIN,
    SIGNAL_TICK,
)
from custom_components.hass_test_data_creator.data import get_data
from custom_components.hass_test_data_creator.engine.clock import Clock
from custom_components.hass_test_data_creator.engine.tick import signal_time

from ..conftest import SEED, create_devices, state_of

START = datetime(2026, 10, 28, 12, 0, tzinfo=UTC)


def test_without_a_lapse_the_clock_follows_real_time() -> None:
    clock = Clock(1.0, START)
    moment = START + timedelta(minutes=5)
    assert clock.at(moment) == signal_time(dt_util.as_local(moment))


def test_with_a_lapse_signal_time_runs_faster_from_the_start_on() -> None:
    clock = Clock(60.0, START)
    base = signal_time(dt_util.as_local(START))
    assert clock.at(START) == base
    assert clock.at(START + timedelta(minutes=1)) == base + 3600
    assert clock.at(START - timedelta(minutes=1)) == base - 3600


@pytest.fixture
async def lapse_entry(
    hass: HomeAssistant, mock_panel: None, freezer: FrozenDateTimeFactory
) -> AsyncIterator[MockConfigEntry]:
    """Return a set up config entry with a time lapse of 3600."""
    config_entry = MockConfigEntry(
        domain=DOMAIN,
        data={CONF_SEED: SEED, CONF_TICK_SECONDS: 10},
        options={CONF_TIME_LAPSE: 3600.0},
    )
    config_entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(config_entry.entry_id)
    await hass.async_block_till_done()
    yield config_entry


async def test_a_counter_runs_faster_with_a_lapse(
    hass: HomeAssistant, lapse_entry: MockConfigEntry, freezer: FrozenDateTimeFactory
) -> None:
    assert get_data(hass).clock.factor == 3600.0
    await create_devices(hass, count=1)
    before = float(state_of(hass, "Plug 01", "energy").state)

    freezer.tick(timedelta(seconds=10))
    async_dispatcher_send(hass, SIGNAL_TICK)
    await hass.async_block_till_done()

    # 10 s of real time are 10 hours of signal time at 0.35 kWh per hour
    assert float(state_of(hass, "Plug 01", "energy").state) == pytest.approx(before + 3.5, abs=0.01)


async def test_the_options_flow_takes_a_lapse_from_1_to_10000(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    flow = await hass.config_entries.options.async_init(entry.entry_id)
    topics = {
        "mqtt_base_topic": "tdc",
        "z2m_base_topic": "tdc_z2m",
        "z2m_confirm_default_topic": False,
    }

    for wrong in (0.5, 20000):
        with pytest.raises(InvalidData):
            await hass.config_entries.options.async_configure(
                flow["flow_id"], {**topics, CONF_TIME_LAPSE: wrong}
            )
    saved = await hass.config_entries.options.async_configure(
        flow["flow_id"], {**topics, CONF_TIME_LAPSE: 60}
    )
    assert saved["type"] == "create_entry"
    assert saved["data"][CONF_TIME_LAPSE] == 60.0
    await hass.async_block_till_done()
    assert get_data(hass).clock.factor == 60.0
