"""The tick: one signal time per tick, warnings measured to the end of the loop iteration."""

from __future__ import annotations

import time

from homeassistant.core import HomeAssistant
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.util import dt as dt_util

from custom_components.hass_test_data_creator.const import SIGNAL_TICK, SLOW_TICK_RATIO
from custom_components.hass_test_data_creator.engine.tick import Tick

SECONDS = 10


def make_tick(hass: HomeAssistant, slow: list[tuple[float, float]]) -> Tick:
    """Return a tick whose signal time is a fixed number and which collects slow warnings."""
    return Tick(hass, SECONDS, lambda: 123.0, lambda took, every: slow.append((took, every)))


async def test_every_listener_gets_the_same_signal_time(hass: HomeAssistant) -> None:
    first: list[float] = []
    second: list[float] = []
    async_dispatcher_connect(hass, SIGNAL_TICK, first.append)
    async_dispatcher_connect(hass, SIGNAL_TICK, second.append)

    make_tick(hass, [])._fire(dt_util.utcnow())
    await hass.async_block_till_done()

    assert first == second == [123.0]


async def test_the_slow_tick_warning_comes_again_after_a_fast_tick(hass: HomeAssistant) -> None:
    slow: list[tuple[float, float]] = []
    tick = make_tick(hass, slow)
    too_long = SECONDS * SLOW_TICK_RATIO + 1

    tick._measure(time.monotonic() - too_long)
    tick._measure(time.monotonic() - too_long)
    assert len(slow) == 1
    assert slow[0][0] >= too_long
    assert slow[0][1] == float(SECONDS)

    tick._measure(time.monotonic())
    tick._measure(time.monotonic() - too_long)
    assert len(slow) == 2
