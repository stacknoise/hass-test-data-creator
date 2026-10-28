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


def _random_walk(spec: SignalSpec, t: float) -> float:
    """Return smooth noise: random points one period apart, joined by a smooth curve."""
    x = t / spec.period_s + spec.phase
    index = math.floor(x)
    fraction = x - index
    smooth = fraction * fraction * (3.0 - 2.0 * fraction)
    low = hash01(spec.seed, index)
    high = hash01(spec.seed, index + 1)
    return low + (high - low) * smooth


SHAPES: dict[str, Callable[[SignalSpec, float], float]] = {
    "constant": _constant,
    "sine": _sine,
    "saw": _saw,
    "square": _square,
    "triangle": _triangle,
    "noise": _noise,
    "random_walk": _random_walk,
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
