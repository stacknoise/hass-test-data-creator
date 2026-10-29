"""The deterministic hash that signals, triggers and area distribution share (concept 5)."""

from __future__ import annotations

_MASK = (1 << 64) - 1
_GOLDEN = 0x9E3779B97F4A7C15
_MIX_A = 0xBF58476D1CE4E5B9
_MIX_B = 0x94D049BB133111EB
MIX_SHIFT_FIRST = 30
MIX_SHIFT_SECOND = 27
MIX_SHIFT_LAST = 31
UNIT_SHIFT = 11
UNIT_BITS = 53


def hash01(seed: int, n: int) -> float:
    """Return a deterministic number in [0, 1) for the integers `seed` and `n` (SplitMix64)."""
    x = (seed * _GOLDEN + (n & _MASK) * _MIX_A + _MIX_B) & _MASK
    x = ((x ^ (x >> MIX_SHIFT_FIRST)) * _MIX_A) & _MASK
    x = ((x ^ (x >> MIX_SHIFT_SECOND)) * _MIX_B) & _MASK
    x ^= x >> MIX_SHIFT_LAST
    return (x >> UNIT_SHIFT) / (1 << UNIT_BITS)
