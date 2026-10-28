"""The clock and the timers of the native output (concept 7.2)."""

from __future__ import annotations

from collections.abc import Callable
from datetime import datetime

from homeassistant.core import HomeAssistant, callback as hass_callback
from homeassistant.helpers.event import async_call_later

from ..engine.behaviours import Cancel
from ..engine.clock import Clock


class HassScheduler:
    """Gives the behaviours the signal time and timers of Home Assistant."""

    def __init__(self, hass: HomeAssistant, clock: Clock) -> None:
        """Keep the instance the timers run in and the clock of the signals."""
        self._hass = hass
        self._clock = clock

    def now(self) -> float:
        """Return the signal time in seconds."""
        return self._clock.now()

    def at(self, moment: datetime) -> float:
        """Return the signal time in seconds that belongs to the real `moment`."""
        return self._clock.at(moment)

    def call_later(self, delay_s: float, callback: Callable[[], None]) -> Cancel:
        """Run `callback` after `delay_s` seconds and return the function that cancels it."""

        @hass_callback
        def fire(_now: datetime) -> None:
            """Run the callback on the event loop."""
            callback()

        return async_call_later(self._hass, delay_s, fire)
