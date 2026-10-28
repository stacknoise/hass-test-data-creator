"""The tick that drives all signals with one timer (concept 5.3)."""

from __future__ import annotations

from collections.abc import Callable
from datetime import datetime, timedelta
import time

from homeassistant.core import CALLBACK_TYPE, HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.util import dt as dt_util

from ..const import SIGNAL_TICK, SLOW_TICK_RATIO


def signal_time(now: datetime | None = None) -> float:
    """Return the signal time: seconds of the local wall clock, so daily curves follow the day."""
    moment = now or dt_util.now()
    offset = moment.utcoffset()
    return moment.timestamp() + (offset.total_seconds() if offset else 0.0)


class Tick:
    """Sends one dispatcher signal per interval and reports a tick that takes too long."""

    def __init__(
        self,
        hass: HomeAssistant,
        seconds: int,
        on_slow: Callable[[float, float], None],
    ) -> None:
        """Keep the interval in seconds and the callback `on_slow(duration, interval)`."""
        self._hass = hass
        self.seconds = seconds
        self._on_slow = on_slow
        self._unsub: CALLBACK_TYPE | None = None
        self._warned = False

    def start(self) -> None:
        """Start the timer."""
        self._unsub = async_track_time_interval(
            self._hass, self._fire, timedelta(seconds=self.seconds)
        )

    def stop(self) -> None:
        """Stop the timer."""
        if self._unsub:
            self._unsub()
            self._unsub = None

    @callback
    def _fire(self, _now: datetime) -> None:
        """Send the tick signal and warn once if it took more than the allowed share."""
        started = time.monotonic()
        async_dispatcher_send(self._hass, SIGNAL_TICK)
        duration = time.monotonic() - started
        if duration > self.seconds * SLOW_TICK_RATIO and not self._warned:
            self._warned = True
            self._on_slow(duration, float(self.seconds))
