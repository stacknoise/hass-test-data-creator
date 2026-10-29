"""The clock of the signals, with an optional time lapse (concept 5.1)."""

from __future__ import annotations

from datetime import datetime

from homeassistant.util import dt as dt_util

from .tick import signal_time


class Clock:
    """Maps real moments to signal time; from its start on, signal time runs `factor` times faster."""

    def __init__(self, factor: float = 1.0, start: datetime | None = None) -> None:
        """Start the clock at `start` (default: now); up to then signal time equals real time."""
        self.factor = factor
        self._base = signal_time(dt_util.as_local(start) if start else None)

    def resume(self, start: datetime) -> None:
        """Continue a time lapse that began at `start`, for example before a restart."""
        self._base = signal_time(dt_util.as_local(start))

    def at(self, moment: datetime) -> float:
        """Return the signal time in seconds that belongs to the real `moment`."""
        return self._base + (signal_time(dt_util.as_local(moment)) - self._base) * self.factor

    def now(self) -> float:
        """Return the current signal time in seconds."""
        return self.at(dt_util.now())
