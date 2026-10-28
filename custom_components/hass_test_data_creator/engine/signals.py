"""Pure signal functions: the value of a signal is a function of time and seed (concept 5)."""

from __future__ import annotations

from bisect import bisect_right
from collections.abc import Callable
from dataclasses import dataclass
import math
from typing import Any

from ..core.keys import (
    KEY_DURATION_S,
    KEY_ENUM,
    KEY_MAX,
    KEY_MIN,
    KEY_NOISE,
    KEY_SHAPE,
    KEY_STATE_MACHINE,
    KEY_STATES,
    KEY_STEPS,
    KEY_VALUE,
    KEY_VALUES,
)

_MASK = (1 << 64) - 1
_GOLDEN = 0x9E3779B97F4A7C15
_MIX_A = 0xBF58476D1CE4E5B9
_MIX_B = 0x94D049BB133111EB
SECONDS_PER_HOUR = 3600
HALF = 0.5
SMOOTHSTEP_LINEAR = 3.0
PV_BELL_EXPONENT = 1.5
DEFAULT_MAX = 100.0
DEFAULT_PERIOD_S = 3600.0
DEFAULT_INTERVAL_S = 10.0
DEFAULT_STEP_S = 60.0
# The shifts of the SplitMix64 mixer and the bits of the mantissa of a double.
MIX_SHIFT_FIRST = 30
MIX_SHIFT_SECOND = 27
MIX_SHIFT_LAST = 31
UNIT_SHIFT = 11
UNIT_BITS = 53
SECONDS_PER_DAY = 86400
HOURS_PER_DAY = 24
LOAD_BASE = 0.12
LOAD_PEAKS = ((7.5, 1.2, 0.30), (12.5, 1.0, 0.25), (19.0, 2.2, 0.55))
LOAD_VARIATION = 0.12
LOAD_VARIATION_PERIOD_S = 600
SUNRISE_HOUR = 6.0
SUNSET_HOUR = 20.0
CLOUD_PERIOD_S = 900
CLOUD_DEPTH = 0.3
MIN_STEPS = 2
DISCHARGE_EXPONENT = 3.0


@dataclass(frozen=True)
class SignalSpec:
    """Parameters of one signal; `seed` and `origin` are set per entity."""

    shape: str = "sine"
    min: float = 0.0
    max: float = DEFAULT_MAX
    period_s: float = DEFAULT_PERIOD_S
    interval_s: float = DEFAULT_INTERVAL_S
    noise: float = 0.0
    decimals: int = 1
    phase: float = 0.0
    rate_per_hour: float = 0.0
    values: tuple[str, ...] = ()
    weights: tuple[float, ...] = ()
    states: tuple[tuple[str, float], ...] = ()
    file: str = ""
    step_s: float = DEFAULT_STEP_S
    table: tuple[tuple[float, float], ...] = ()
    loop_s: float = 0.0
    seed: int = 0
    origin: float = 0.0

    @classmethod
    def from_dict(cls, data: dict[str, Any], seed: int, origin: float) -> SignalSpec:
        """Return the spec of a template signal `data` for one entity."""
        known = {
            key: data[key]
            for key in (
                KEY_SHAPE,
                KEY_MIN,
                KEY_MAX,
                "period_s",
                "interval_s",
                KEY_NOISE,
                "decimals",
                "phase",
                "rate_per_hour",
                "file",
                "step_s",
                "loop_s",
            )
            if key in data
        }
        return cls(
            **known,
            values=tuple(str(item) for item in data.get(KEY_VALUES, ())),
            weights=tuple(float(item) for item in data.get("weights", ())),
            states=tuple(
                (str(item[KEY_VALUE]), float(item[KEY_DURATION_S]))
                for item in data.get(KEY_STATES, ())
            ),
            table=tuple((float(t), float(v)) for t, v in data.get("table", ())),
            seed=seed,
            origin=origin,
        )


def hash01(seed: int, n: int) -> float:
    """Return a deterministic number in [0, 1) for the integers `seed` and `n` (SplitMix64)."""
    x = (seed * _GOLDEN + (n & _MASK) * _MIX_A + _MIX_B) & _MASK
    x = ((x ^ (x >> MIX_SHIFT_FIRST)) * _MIX_A) & _MASK
    x = ((x ^ (x >> MIX_SHIFT_SECOND)) * _MIX_B) & _MASK
    x ^= x >> MIX_SHIFT_LAST
    return (x >> UNIT_SHIFT) / (1 << UNIT_BITS)


def _cycle(spec: SignalSpec, t: float) -> float:
    """Return the position inside one period in [0, 1) including the phase."""
    return (t / spec.period_s + spec.phase) % 1.0


def _constant(spec: SignalSpec, t: float) -> float:
    """Return the middle of the range."""
    return HALF


def _sine(spec: SignalSpec, t: float) -> float:
    """Return a sine wave between 0 and 1."""
    return HALF + HALF * math.sin(2 * math.pi * _cycle(spec, t))


def _saw(spec: SignalSpec, t: float) -> float:
    """Return a rising saw tooth."""
    return _cycle(spec, t)


def _square(spec: SignalSpec, t: float) -> float:
    """Return a square wave: high in the first half of the period."""
    return 1.0 if _cycle(spec, t) < HALF else 0.0


def _triangle(spec: SignalSpec, t: float) -> float:
    """Return a triangle wave."""
    return 1.0 - abs(2.0 * _cycle(spec, t) - 1.0)


def _noise(spec: SignalSpec, t: float) -> float:
    """Return white noise that changes every `interval_s` seconds."""
    return hash01(spec.seed, math.floor(t / spec.interval_s))


def _smooth_noise(seed: int, x: float) -> float:
    """Return random points one unit apart, joined by a smooth curve."""
    index = math.floor(x)
    fraction = x - index
    smooth = fraction * fraction * (SMOOTHSTEP_LINEAR - 2.0 * fraction)
    low = hash01(seed, index)
    high = hash01(seed, index + 1)
    return low + (high - low) * smooth


def _random_walk(spec: SignalSpec, t: float) -> float:
    """Return smooth noise: random points one period apart, joined by a smooth curve."""
    return _smooth_noise(spec.seed, t / spec.period_s + spec.phase)


def _hour_of_day(t: float) -> float:
    """Return the local hour of the day in [0, 24) for signal time `t`."""
    return (t % SECONDS_PER_DAY) / SECONDS_PER_HOUR


def _peak(hour: float, centre: float, width: float) -> float:
    """Return a bell curve around `centre` hours that wraps around midnight."""
    distance = abs(hour - centre)
    distance = min(distance, HOURS_PER_DAY - distance)
    return math.exp(-HALF * (distance / width) ** 2)


def _household_load(spec: SignalSpec, t: float) -> float:
    """Return a household load: low at night, peaks in the morning, at noon and in the evening."""
    hour = _hour_of_day(t)
    level = LOAD_BASE + sum(weight * _peak(hour, c, w) for c, w, weight in LOAD_PEAKS)
    variation = _smooth_noise(spec.seed, t / LOAD_VARIATION_PERIOD_S) - HALF
    return level + LOAD_VARIATION * variation


def _pv_day(spec: SignalSpec, t: float) -> float:
    """Return photovoltaic power: zero at night, a bell between sunrise and sunset, with clouds."""
    x = (_hour_of_day(t) - SUNRISE_HOUR) / (SUNSET_HOUR - SUNRISE_HOUR)
    if not 0.0 < x < 1.0:
        return 0.0
    clouds = 1.0 - CLOUD_DEPTH * _smooth_noise(spec.seed, t / CLOUD_PERIOD_S)
    return math.sin(math.pi * x) ** PV_BELL_EXPONENT * clouds


def _steps(spec: SignalSpec, t: float) -> float:
    """Return a rising staircase: steps of `interval_s` seconds, one climb per period."""
    count = max(MIN_STEPS, round(spec.period_s / spec.interval_s))
    return min(1.0, math.floor(_cycle(spec, t) * count) / (count - 1))


def _discharge(spec: SignalSpec, t: float) -> float:
    """Return a battery discharge: from full to empty over the period, steeper at the end."""
    return 1.0 - _cycle(spec, t) ** DISCHARGE_EXPONENT


def _enum(spec: SignalSpec, t: float) -> str:
    """Return a value drawn by weight; a new draw every `interval_s` seconds."""
    total = sum(spec.weights) if spec.weights else float(len(spec.values))
    pick = hash01(spec.seed, math.floor(t / spec.interval_s)) * total
    reached = 0.0
    for index, value in enumerate(spec.values):
        reached += spec.weights[index] if spec.weights else 1.0
        if pick < reached:
            return value
    return spec.values[-1]


def _state_machine(spec: SignalSpec, t: float) -> str:
    """Return the state of a cycle of states with durations; `phase` shifts the start."""
    total = sum(duration for _, duration in spec.states)
    position = (t + spec.phase * total) % total
    reached = 0.0
    for value, duration in spec.states:
        reached += duration
        if position < reached:
            return value
    return spec.states[-1][0]


DISCRETE_SHAPES: dict[str, Callable[[SignalSpec, float], str]] = {
    KEY_ENUM: _enum,
    KEY_STATE_MACHINE: _state_machine,
}


def options_of(spec: SignalSpec) -> list[str]:
    """Return the distinct states of a discrete signal in the order they are defined."""
    names = spec.values if spec.shape == KEY_ENUM else tuple(name for name, _ in spec.states)
    return list(dict.fromkeys(names))


def has_invalid_states(spec: SignalSpec) -> bool:
    """Whether a discrete shape lacks its states or has a weight or duration that is not positive."""
    if spec.shape == KEY_ENUM:
        wrong_weights = bool(spec.weights) and (
            len(spec.weights) != len(spec.values) or any(w <= 0 for w in spec.weights)
        )
        return not spec.values or wrong_weights or spec.interval_s <= 0
    if spec.shape == KEY_STATE_MACHINE:
        return not spec.states or any(duration <= 0 for _, duration in spec.states)
    return False


SHAPES: dict[str, Callable[[SignalSpec, float], float]] = {
    "constant": _constant,
    "sine": _sine,
    "saw": _saw,
    "square": _square,
    "triangle": _triangle,
    KEY_NOISE: _noise,
    "random_walk": _random_walk,
    "household_load": _household_load,
    "pv_day": _pv_day,
    KEY_STEPS: _steps,
    "discharge": _discharge,
}
COUNTER_SHAPE = "counter"
CSV_SHAPE = "csv"
SHAPE_NAMES = (*SHAPES, COUNTER_SHAPE, CSV_SHAPE, *DISCRETE_SHAPES)


def _csv_value(spec: SignalSpec, t: float) -> float:
    """Return the replayed value: the table loops every `loop_s` seconds from the origin, joined linearly."""
    if not spec.table or spec.loop_s <= 0:
        return spec.min
    position = (t - spec.origin + spec.phase * spec.loop_s) % spec.loop_s
    index = bisect_right(spec.table, position, key=lambda point: point[0]) - 1
    start_t, start_v = spec.table[max(index, 0)]
    if index + 1 < len(spec.table):
        end_t, end_v = spec.table[index + 1]
    else:
        end_t, end_v = spec.loop_s, spec.table[0][1]
    return start_v + (end_v - start_v) * (position - start_t) / (end_t - start_t)


def value_at(spec: SignalSpec, t: float) -> float | str:
    """Return the value at signal time `t` (seconds): a number scaled to min..max or a state name."""
    if spec.shape in DISCRETE_SHAPES:
        return DISCRETE_SHAPES[spec.shape](spec, t)
    if spec.shape == COUNTER_SHAPE:
        elapsed = max(0.0, t - spec.origin)
        return round(spec.min + spec.rate_per_hour * elapsed / SECONDS_PER_HOUR, spec.decimals)
    if spec.shape == CSV_SHAPE:
        return round(_csv_value(spec, t), spec.decimals)
    base = SHAPES[spec.shape](spec, t)
    if spec.noise:
        base += (hash01(spec.seed + 1, math.floor(t)) - HALF) * 2.0 * spec.noise
    base = min(1.0, max(0.0, base))
    return round(spec.min + base * (spec.max - spec.min), spec.decimals)
