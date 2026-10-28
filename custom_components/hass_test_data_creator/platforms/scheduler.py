"""The clock and the timers of the native output (concept 7.2)."""

from __future__ import annotations

from collections.abc import Callable
from datetime import datetime

from homeassistant.core import HomeAssistant, callback as hass_callback
from homeassistant.helpers.event import async_call_later

from ..engine.behaviours import Cancel
from ..engine.tick import signal_time


class HassScheduler:
    """Gives the behaviours the signal time and timers of Home Assistant."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Keep the instance the timers run in."""
        self._hass = hass

    def now(self) -> float:
        """Return the signal time in seconds."""
        return signal_time()

    def call_later(self, delay_s: float, callback: Callable[[], None]) -> Cancel:
        """Run `callback` after `delay_s` seconds and return the function that cancels it."""

        @hass_callback
        def fire(_now: datetime) -> None:
            """Run the callback on the event loop."""
            callback()

        return async_call_later(self._hass, delay_s, fire)
