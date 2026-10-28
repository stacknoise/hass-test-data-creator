"""Triggers: the times of one day, determinism, and validation."""

from __future__ import annotations

from datetime import date

import pytest

from custom_components.hass_test_data_creator.core.errors import ErrorCode, ScheduleError
from custom_components.hass_test_data_creator.scheduler.triggers import (
    TriggerFactory,
    parse_clock,
)

MONDAY = date(2026, 11, 2)
TUESDAY = date(2026, 11, 3)
FACTORY = TriggerFactory()


def seconds(data: dict, day: date = MONDAY, seed: int = 1) -> list[float]:
    """Return the times of one day for a trigger description."""
    return FACTORY.create(data).seconds_for_day(day, seed)


def test_clock_parsing() -> None:
    assert parse_clock("07:30") == 27000
    assert parse_clock("07:30:15") == 27015
    assert parse_clock("24:00") == 86400
    for bad in ("25:00", "7", "ab:cd", "-1:00", "12:00:00:00"):
        with pytest.raises(ScheduleError):
            parse_clock(bad)


def test_times_are_sorted_and_respect_weekdays() -> None:
    data = {"type": "times", "times": ["17:30", "07:00"], "weekdays": [0]}
    assert MONDAY.weekday() == 0
    assert seconds(data) == [25200.0, 63000.0]
    assert seconds(data, TUESDAY) == []


def test_interval_stays_inside_the_window() -> None:
    data = {"type": "interval", "every_s": 3600, "start": "08:00", "end": "12:00"}
    assert seconds(data) == [28800.0, 32400.0, 36000.0, 39600.0]


def test_once_fires_only_on_its_day() -> None:
    data = {"type": "once", "at": "2026-11-02T18:30:15"}
    assert seconds(data) == [66615.0]
    assert seconds(data, TUESDAY) == []


def test_random_window_is_deterministic_and_inside_the_window() -> None:
    data = {"type": "random_window", "count": 5, "start": "18:00", "end": "23:00"}
    first = seconds(data, seed=42)
    assert first == seconds(data, seed=42)
    assert first != seconds(data, seed=43)
    assert first == sorted(first)
    assert len(first) == 5
    assert all(64800 <= value < 82800 for value in first)


def test_poisson_has_the_requested_average() -> None:
    data = {"type": "poisson", "per_day": 24}
    counts = [len(seconds(data, seed=seed)) for seed in range(300)]
    assert 21 < sum(counts) / len(counts) < 27
    one_day = seconds(data, seed=7)
    assert one_day == seconds(data, seed=7)
    assert one_day == sorted(one_day)
    assert all(0 <= value < 86400 for value in one_day)


@pytest.mark.parametrize(
    "data",
    [
        {"type": "nope"},
        {"type": "times"},
        {"type": "times", "times": ["99:00"]},
        {"type": "interval", "every_s": 0},
        {"type": "interval", "every_s": 1},
        {"type": "random_window", "count": 3, "start": "20:00", "end": "08:00"},
        {"type": "poisson", "per_day": 0},
        {"type": "once", "at": "yesterday"},
        {"type": "times", "times": ["07:00"], "weekdays": [9]},
    ],
)
def test_invalid_triggers_are_refused(data: dict) -> None:
    with pytest.raises(ScheduleError) as error:
        FACTORY.create(data)
    assert error.value.code is ErrorCode.SCH_INVALID_TRIGGER
