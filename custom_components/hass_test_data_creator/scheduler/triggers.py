"""Schedule triggers and their factory (concept 6.1, 13.2)."""

from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import date, datetime
import math
from typing import Any

import voluptuous as vol

from ..const import SECONDS_PER_HOUR, SECONDS_PER_MINUTE
from ..core.errors import ErrorCode, ScheduleError
from ..core.hashing import hash01
from ..core.keys import (
    KEY_COUNT,
    KEY_END,
    KEY_INTERVAL,
    KEY_ONCE,
    KEY_RANDOM_WINDOW,
    KEY_START,
    KEY_TIMES,
    KEY_TYPE,
)

SECONDS_PER_DAY = 86400
TIME_PARTS = (2, 3)
HMS_PARTS = 3
MAX_EVENTS_PER_DAY = 5000


def parse_clock(text: str) -> int:
    """Return the seconds after midnight of a clock time `HH:MM` or `HH:MM:SS` (24:00 allowed)."""
    try:
        parts = [int(part) for part in text.split(":")]
    except ValueError as err:
        raise ScheduleError(ErrorCode.SCH_INVALID_TRIGGER) from err
    if len(parts) not in TIME_PARTS or any(part < 0 for part in parts):
        raise ScheduleError(ErrorCode.SCH_INVALID_TRIGGER)
    seconds = (
        parts[0] * SECONDS_PER_HOUR
        + parts[1] * SECONDS_PER_MINUTE
        + (parts[2] if len(parts) == HMS_PARTS else 0)
    )
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
        return [
            self._at.hour * SECONDS_PER_HOUR
            + self._at.minute * SECONDS_PER_MINUTE
            + self._at.second
            + 0.0
        ]


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
    KEY_TIMES: vol.Schema(
        {
            vol.Required(KEY_TYPE): KEY_TIMES,
            vol.Required(KEY_TIMES): vol.All([_CLOCK], vol.Length(min=1, max=200)),
            vol.Optional("weekdays"): [vol.All(int, vol.Range(min=0, max=6))],
        }
    ),
    KEY_INTERVAL: vol.Schema(
        {
            vol.Required(KEY_TYPE): KEY_INTERVAL,
            vol.Required("every_s"): vol.All(int, vol.Range(min=1, max=SECONDS_PER_DAY)),
            vol.Optional(KEY_START, default="00:00"): _CLOCK,
            vol.Optional(KEY_END, default="24:00"): _CLOCK,
        }
    ),
    KEY_ONCE: vol.Schema(
        {vol.Required(KEY_TYPE): KEY_ONCE, vol.Required("at"): vol.All(str, vol.Length(min=10))}
    ),
    KEY_RANDOM_WINDOW: vol.Schema(
        {
            vol.Required(KEY_TYPE): KEY_RANDOM_WINDOW,
            vol.Required(KEY_COUNT): _COUNT,
            vol.Required(KEY_START): _CLOCK,
            vol.Required(KEY_END): _CLOCK,
        }
    ),
    "poisson": vol.Schema(
        {
            vol.Required(KEY_TYPE): "poisson",
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
        schema = _SCHEMAS.get(str(data.get(KEY_TYPE)))
        if schema is None:
            raise ScheduleError(ErrorCode.SCH_INVALID_TRIGGER)
        try:
            checked = schema(data)
        except vol.Invalid as err:
            raise ScheduleError(ErrorCode.SCH_INVALID_TRIGGER) from err
        kind = checked[KEY_TYPE]
        if kind == KEY_TIMES:
            return TimesTrigger(checked[KEY_TIMES], checked.get("weekdays"))
        if kind == KEY_INTERVAL:
            return IntervalTrigger(checked["every_s"], checked[KEY_START], checked[KEY_END])
        if kind == KEY_ONCE:
            return OnceTrigger(self._moment(checked["at"]))
        if kind == KEY_RANDOM_WINDOW:
            return RandomWindowTrigger(checked[KEY_COUNT], checked[KEY_START], checked[KEY_END])
        return PoissonTrigger(checked["per_day"])

    def _moment(self, text: str) -> datetime:
        """Return the local date and time of an ISO text like `2026-11-01T18:30`."""
        try:
            return datetime.fromisoformat(text)
        except ValueError as err:
            raise ScheduleError(ErrorCode.SCH_INVALID_TRIGGER) from err
