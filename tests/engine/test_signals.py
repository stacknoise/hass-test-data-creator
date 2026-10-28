"""Signals: the shared vectors, determinism, ranges and the factory checks."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from custom_components.hass_test_data_creator.core.errors import ErrorCode, SignalError
from custom_components.hass_test_data_creator.engine.signal_factory import SignalFactory
from custom_components.hass_test_data_creator.engine.signals import (
    DISCRETE_SHAPES,
    SHAPE_NAMES,
    SignalSpec,
    hash01,
    options_of,
    value_at,
)

VECTORS = json.loads(
    (Path(__file__).parent.parent / "vectors" / "signals.json").read_text(encoding="utf-8")
)


def test_hash_matches_the_shared_vectors() -> None:
    for item in VECTORS["hashes"]:
        assert hash01(item["seed"], item["n"]) == item["value"]


def test_values_match_the_shared_vectors() -> None:
    for item in VECTORS["values"]:
        spec = SignalSpec.from_dict(
            item["spec"], item["spec"].get("seed", 0), item["spec"].get("origin", 0.0)
        )
        value = value_at(spec, item["t"])
        assert (
            value == item["value"]
            if isinstance(value, str)
            else value == pytest.approx(item["value"], abs=1e-9)
        )


@pytest.mark.parametrize(
    "shape", [name for name in SHAPE_NAMES if name not in ("counter", *DISCRETE_SHAPES)]
)
def test_values_stay_inside_the_range(shape: str) -> None:
    spec = SignalSpec(shape=shape, min=10, max=20, noise=0.2, seed=5, decimals=3)
    for second in range(0, 200_000, 997):
        assert 10 <= value_at(spec, float(second)) <= 20


def test_same_seed_gives_same_values_and_other_seed_differs() -> None:
    first = SignalSpec(shape="noise", seed=1)
    other = SignalSpec(shape="noise", seed=2)
    series = [value_at(first, t * 10.0) for t in range(20)]
    assert series == [value_at(first, t * 10.0) for t in range(20)]
    assert series != [value_at(other, t * 10.0) for t in range(20)]


def test_counter_only_rises() -> None:
    spec = SignalSpec(shape="counter", rate_per_hour=2.0, decimals=3, origin=100.0)
    assert value_at(spec, 100.0) == 0.0
    assert value_at(spec, 100.0 + 3600) == 2.0
    assert value_at(spec, 50.0) == 0.0


def test_factory_rejects_unknown_shape_and_bad_range() -> None:
    factory = SignalFactory()
    with pytest.raises(SignalError) as unknown:
        factory.create({"shape": "zigzag"}, 1, 0.0)
    assert unknown.value.code is ErrorCode.SIG_UNKNOWN_SHAPE
    with pytest.raises(SignalError) as bad_range:
        factory.create({"shape": "sine", "min": 5, "max": 1}, 1, 0.0)
    assert bad_range.value.code is ErrorCode.SIG_INVALID_RANGE


def _at(shape: str, hour: float, **fields: float) -> float:
    """Return the value of `shape` at `hour` of a day, scaled to 0..1000 with three decimals."""
    spec = SignalSpec(shape=shape, min=0, max=1000, seed=9, decimals=3, **fields)
    return value_at(spec, hour * 3600)


def test_pv_day_is_dark_at_night_and_peaks_around_noon() -> None:
    assert _at("pv_day", 3) == 0
    assert _at("pv_day", 22) == 0
    assert _at("pv_day", 13) > 300
    assert _at("pv_day", 13) > _at("pv_day", 8)


def test_household_load_is_low_at_night_and_highest_in_the_evening() -> None:
    assert _at("household_load", 3) < _at("household_load", 7.5) < _at("household_load", 19)
    assert _at("household_load", 3) == _at("household_load", 3)


def test_steps_hold_a_level_and_climb_once_per_period() -> None:
    fields = {"period_s": 600, "interval_s": 60}
    spec = SignalSpec(shape="steps", min=0, max=90, decimals=3, **fields)
    assert value_at(spec, 0) == value_at(spec, 59) == 0
    assert value_at(spec, 60) == 10
    assert value_at(spec, 599) == 90
    assert value_at(spec, 600) == 0


def test_discharge_falls_from_full_to_empty() -> None:
    spec = SignalSpec(shape="discharge", min=3, max=4, period_s=1000, decimals=4)
    values = [value_at(spec, t) for t in range(0, 1000, 100)]
    assert values[0] == 4
    assert values == sorted(values, reverse=True)
    assert values[-1] < 3.3


WASHER = {
    "shape": "state_machine",
    "states": [
        {"value": "idle", "duration_s": 100},
        {"value": "wash", "duration_s": 50},
        {"value": "spin", "duration_s": 25},
    ],
}


def test_state_machine_follows_its_durations_and_repeats() -> None:
    spec = SignalSpec.from_dict(WASHER, 1, 0.0)
    assert [value_at(spec, t) for t in (0, 99, 100, 149, 150, 174, 175)] == [
        "idle",
        "idle",
        "wash",
        "wash",
        "spin",
        "spin",
        "idle",
    ]
    shifted = SignalSpec.from_dict({**WASHER, "phase": 0.6}, 1, 0.0)
    assert value_at(shifted, 0) == "wash"
    assert options_of(spec) == ["idle", "wash", "spin"]


def test_enum_draws_by_weight_and_is_reproducible() -> None:
    fields = {"shape": "enum", "interval_s": 10, "values": ["a", "b"], "weights": [9, 1]}
    spec = SignalSpec.from_dict(fields, 3, 0.0)
    draws = [value_at(spec, slot * 10.0) for slot in range(2000)]
    assert set(draws) == {"a", "b"}
    assert 1500 < draws.count("a") < 1950
    assert draws == [value_at(spec, slot * 10.0) for slot in range(2000)]
    assert value_at(spec, 0) == value_at(spec, 9.9)


@pytest.mark.parametrize(
    "fields",
    [
        {"shape": "enum"},
        {"shape": "enum", "values": ["a", "b"], "weights": [1]},
        {"shape": "enum", "values": ["a"], "weights": [0]},
        {"shape": "state_machine"},
        {"shape": "state_machine", "states": [{"value": "a", "duration_s": 0}]},
    ],
)
def test_factory_rejects_invalid_states(fields: dict[str, object]) -> None:
    with pytest.raises(SignalError) as error:
        SignalFactory().create(fields, 1, 0.0)
    assert error.value.code is ErrorCode.SIG_INVALID_STATES
