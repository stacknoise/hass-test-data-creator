"""Pure signal functions: the value of a signal is a function of time and seed (concept 5)."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
import math
from typing import Any

_MASK = (1 << 64) - 1
_GOLDEN = 0x9E3779B97F4A7C15
_MIX_A = 0xBF58476D1CE4E5B9
_MIX_B = 0x94D049BB133111EB
SECONDS_PER_HOUR = 3600
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
    max: float = 100.0
    period_s: float = 3600.0
    interval_s: float = 10.0
    noise: float = 0.0
    decimals: int = 1
    phase: float = 0.0
    rate_per_hour: float = 0.0
    seed: int = 0
    origin: float = 0.0

    @classmethod
    def from_dict(cls, data: dict[str, Any], seed: int, origin: float) -> SignalSpec:
        """Return the spec of a template signal `data` for one entity."""
        known = {
            key: data[key]
            for key in (
                "shape",
                "min",
                "max",
                "period_s",
                "interval_s",
                "noise",
                "decimals",
                "phase",
                "rate_per_hour",
            )
            if key in data
        }
        return cls(**known, seed=seed, origin=origin)


def hash01(seed: int, n: int) -> float:
    """Return a deterministic number in [0, 1) for the integers `seed` and `n` (SplitMix64)."""
    x = (seed * _GOLDEN + (n & _MASK) * _MIX_A + _MIX_B) & _MASK
    x = ((x ^ (x >> 30)) * _MIX_A) & _MASK
    x = ((x ^ (x >> 27)) * _MIX_B) & _MASK
    x ^= x >> 31
    return (x >> 11) / (1 << 53)


def _cycle(spec: SignalSpec, t: float) -> float:
    """Return the position inside one period in [0, 1) including the phase."""
    return (t / spec.period_s + spec.phase) % 1.0


def _constant(spec: SignalSpec, t: float) -> float:
    """Return the middle of the range."""
    return 0.5


def _sine(spec: SignalSpec, t: float) -> float:
    """Return a sine wave between 0 and 1."""
    return 0.5 + 0.5 * math.sin(2 * math.pi * _cycle(spec, t))


def _saw(spec: SignalSpec, t: float) -> float:
    """Return a rising saw tooth."""
    return _cycle(spec, t)


def _square(spec: SignalSpec, t: float) -> float:
    """Return a square wave: high in the first half of the period."""
    return 1.0 if _cycle(spec, t) < 0.5 else 0.0


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
    smooth = fraction * fraction * (3.0 - 2.0 * fraction)
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
    return math.exp(-0.5 * (distance / width) ** 2)


def _household_load(spec: SignalSpec, t: float) -> float:
    """Return a household load: low at night, peaks in the morning, at noon and in the evening."""
    hour = _hour_of_day(t)
    level = LOAD_BASE + sum(weight * _peak(hour, c, w) for c, w, weight in LOAD_PEAKS)
    variation = _smooth_noise(spec.seed, t / LOAD_VARIATION_PERIOD_S) - 0.5
    return level + LOAD_VARIATION * variation


def _pv_day(spec: SignalSpec, t: float) -> float:
    """Return photovoltaic power: zero at night, a bell between sunrise and sunset, with clouds."""
    x = (_hour_of_day(t) - SUNRISE_HOUR) / (SUNSET_HOUR - SUNRISE_HOUR)
    if not 0.0 < x < 1.0:
        return 0.0
    clouds = 1.0 - CLOUD_DEPTH * _smooth_noise(spec.seed, t / CLOUD_PERIOD_S)
    return math.sin(math.pi * x) ** 1.5 * clouds


def _steps(spec: SignalSpec, t: float) -> float:
    """Return a rising staircase: steps of `interval_s` seconds, one climb per period."""
    count = max(MIN_STEPS, round(spec.period_s / spec.interval_s))
    return min(1.0, math.floor(_cycle(spec, t) * count) / (count - 1))


def _discharge(spec: SignalSpec, t: float) -> float:
    """Return a battery discharge: from full to empty over the period, steeper at the end."""
    return 1.0 - _cycle(spec, t) ** DISCHARGE_EXPONENT


SHAPES: dict[str, Callable[[SignalSpec, float], float]] = {
    "constant": _constant,
    "sine": _sine,
    "saw": _saw,
    "square": _square,
    "triangle": _triangle,
    "noise": _noise,
    "random_walk": _random_walk,
    "household_load": _household_load,
    "pv_day": _pv_day,
    "steps": _steps,
    "discharge": _discharge,
}
COUNTER_SHAPE = "counter"
SHAPE_NAMES = (*SHAPES, COUNTER_SHAPE)


def value_at(spec: SignalSpec, t: float) -> float:
    """Return the value of the signal at signal time `t` (seconds), scaled to min..max."""
    if spec.shape == COUNTER_SHAPE:
        elapsed = max(0.0, t - spec.origin)
        return round(spec.min + spec.rate_per_hour * elapsed / SECONDS_PER_HOUR, spec.decimals)
    base = SHAPES[spec.shape](spec, t)
    if spec.noise:
        base += (hash01(spec.seed + 1, math.floor(t)) - 0.5) * 2.0 * spec.noise
    base = min(1.0, max(0.0, base))
    return round(spec.min + base * (spec.max - spec.min), spec.decimals)
