"""Schedule triggers and their factory (concept 6.1, 13.2)."""

from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import date, datetime
import math
from typing import Any

import voluptuous as vol

from ..core.errors import ErrorCode, ScheduleError
from ..engine.signals import hash01

SECONDS_PER_DAY = 86400
MAX_EVENTS_PER_DAY = 5000


def parse_clock(text: str) -> int:
    """Return the seconds after midnight of a clock time `HH:MM` or `HH:MM:SS` (24:00 allowed)."""
    try:
        parts = [int(part) for part in text.split(":")]
    except ValueError as err:
        raise ScheduleError(ErrorCode.SCH_INVALID_TRIGGER) from err
    if len(parts) not in (2, 3) or any(part < 0 for part in parts):
        raise ScheduleError(ErrorCode.SCH_INVALID_TRIGGER)
    seconds = parts[0] * 3600 + parts[1] * 60 + (parts[2] if len(parts) == 3 else 0)
    if seconds > SECONDS_PER_DAY:
        raise ScheduleError(ErrorCode.SCH_INVALID_TRIGGER)
    return seconds


class Trigger(ABC):
    """Computes the times of one day at which a schedule runs."""

    @abstractmethod
    def seconds_for_day(self, day: date, seed: int) -> list[float]:
        """Return the sorted seconds after local midnight of `day` at which the trigger fires."""


class TimesTrigger(Trigger):
    """Fixed times of the day, optionally only on some weekdays (Monday is 0)."""

    def __init__(self, times: list[str], weekdays: list[int] | None) -> None:
        """Parse the clock times."""
        self._seconds = sorted(parse_clock(item) for item in times)
        self._weekdays = weekdays

    def seconds_for_day(self, day: date, seed: int) -> list[float]:
        """Return the fixed times if the weekday matches."""
        if self._weekdays is not None and day.weekday() not in self._weekdays:
            return []
        return [float(item) for item in self._seconds]


class IntervalTrigger(Trigger):
    """Every N seconds inside a daily window."""

    def __init__(self, every_s: int, start: str, end: str) -> None:
        """Keep the step and the window."""
        self._every = every_s
        self._start = parse_clock(start)
        self._end = parse_clock(end)
        if (self._end - self._start) / every_s > MAX_EVENTS_PER_DAY:
            raise ScheduleError(ErrorCode.SCH_INVALID_TRIGGER)

    def seconds_for_day(self, day: date, seed: int) -> list[float]:
        """Return start, start + step, … while inside the window."""
        return [float(s) for s in range(self._start, self._end, self._every)]


class OnceTrigger(Trigger):
    """One moment, given as a local date and time."""

    def __init__(self, at: datetime) -> None:
        """Keep the moment."""
        self._at = at

    def seconds_for_day(self, day: date, seed: int) -> list[float]:
        """Return the time of day if `day` is the day of the moment."""
        if self._at.date() != day:
            return []
        return [self._at.hour * 3600 + self._at.minute * 60 + self._at.second + 0.0]


class RandomWindowTrigger(Trigger):
    """N moments at random inside a daily window; the seed decides where."""

    def __init__(self, count: int, start: str, end: str) -> None:
        """Keep the number and the window."""
        self._count = count
        self._start = parse_clock(start)
        self._end = parse_clock(end)
        if self._end <= self._start:
            raise ScheduleError(ErrorCode.SCH_INVALID_TRIGGER)

    def seconds_for_day(self, day: date, seed: int) -> list[float]:
        """Return `count` seconds in the window, drawn from the seed of the day."""
        span = self._end - self._start
        return sorted(
            float(int(self._start + hash01(seed, index) * span)) for index in range(self._count)
        )


class PoissonTrigger(Trigger):
    """Events at an average rate; the gaps between them are exponentially distributed."""

    def __init__(self, per_day: float) -> None:
        """Keep the average number of events per day."""
        self._rate = per_day / SECONDS_PER_DAY

    def seconds_for_day(self, day: date, seed: int) -> list[float]:
        """Return the event times of the day, drawn from the seed of the day."""
        moments: list[float] = []
        elapsed = 0.0
        index = 0
        while len(moments) < MAX_EVENTS_PER_DAY:
            elapsed += -math.log(1.0 - hash01(seed, index)) / self._rate
            if elapsed >= SECONDS_PER_DAY:
                break
            moments.append(float(int(elapsed)))
            index += 1
        return moments


_COUNT = vol.All(int, vol.Range(min=1, max=MAX_EVENTS_PER_DAY))
_CLOCK = vol.All(str, vol.Length(min=4, max=8))
_SCHEMAS: dict[str, vol.Schema] = {
    "times": vol.Schema(
        {
            vol.Required("type"): "times",
            vol.Required("times"): vol.All([_CLOCK], vol.Length(min=1, max=200)),
            vol.Optional("weekdays"): [vol.All(int, vol.Range(min=0, max=6))],
        }
    ),
    "interval": vol.Schema(
        {
            vol.Required("type"): "interval",
            vol.Required("every_s"): vol.All(int, vol.Range(min=1, max=SECONDS_PER_DAY)),
            vol.Optional("start", default="00:00"): _CLOCK,
            vol.Optional("end", default="24:00"): _CLOCK,
        }
    ),
    "once": vol.Schema(
        {vol.Required("type"): "once", vol.Required("at"): vol.All(str, vol.Length(min=10))}
    ),
    "random_window": vol.Schema(
        {
            vol.Required("type"): "random_window",
            vol.Required("count"): _COUNT,
            vol.Required("start"): _CLOCK,
            vol.Required("end"): _CLOCK,
        }
    ),
    "poisson": vol.Schema(
        {
            vol.Required("type"): "poisson",
            vol.Required("per_day"): vol.All(
                vol.Coerce(float), vol.Range(min=0.01, max=MAX_EVENTS_PER_DAY)
            ),
        }
    ),
}
TRIGGER_TYPES = tuple(_SCHEMAS)


class TriggerFactory:
    """Creates the trigger for a trigger description."""

    def create(self, data: dict[str, Any]) -> Trigger:
        """Return the trigger for `data` or raise SCH_INVALID_TRIGGER."""
        schema = _SCHEMAS.get(str(data.get("type")))
        if schema is None:
            raise ScheduleError(ErrorCode.SCH_INVALID_TRIGGER)
        try:
            checked = schema(data)
        except vol.Invalid as err:
            raise ScheduleError(ErrorCode.SCH_INVALID_TRIGGER) from err
        kind = checked["type"]
        if kind == "times":
            return TimesTrigger(checked["times"], checked.get("weekdays"))
        if kind == "interval":
            return IntervalTrigger(checked["every_s"], checked["start"], checked["end"])
        if kind == "once":
            return OnceTrigger(self._moment(checked["at"]))
        if kind == "random_window":
            return RandomWindowTrigger(checked["count"], checked["start"], checked["end"])
        return PoissonTrigger(checked["per_day"])

    def _moment(self, text: str) -> datetime:
        """Return the local date and time of an ISO text like `2026-11-01T18:30`."""
        try:
            return datetime.fromisoformat(text)
        except ValueError as err:
            raise ScheduleError(ErrorCode.SCH_INVALID_TRIGGER) from err
