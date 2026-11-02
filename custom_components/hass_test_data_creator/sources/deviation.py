"""Pure functions that turn the value of a source into the value of one copy (concept 17.5)."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from ..core.hashing import hash01

SALT_OFFSET = 0x01
SALT_SCALE = 0x02
SALT_NOISE = 0x03
SALT_LAG = 0x04
SALT_DROPOUT = 0x05
MAX_DECIMALS = 6
SECONDS_PER_BUCKET_MIN = 1.0


@dataclass(frozen=True)
class Deviation:
    """The optional deviation parameters of a job; zero or `None` switches a part off."""

    offset: float = 0.0
    scale: float = 0.0
    noise: float = 0.0
    lag_s: float = 0.0
    dropout: float = 0.0
    decimals: int | None = None
    clamp_min: float | None = None
    clamp_max: float | None = None

    def to_dict(self) -> dict[str, Any]:
        """Return the JSON-serialisable form."""
        return {
            "offset": self.offset,
            "scale": self.scale,
            "noise": self.noise,
            "lag_s": self.lag_s,
            "dropout": self.dropout,
            "decimals": self.decimals,
            "clamp_min": self.clamp_min,
            "clamp_max": self.clamp_max,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any] | None) -> Deviation:
        """Return the parameters stored in `data`; missing or unknown fields use the defaults."""
        known = (data or {}).items()
        names = cls.__dataclass_fields__
        return cls(**{key: value for key, value in known if key in names})


def signed(seed: int, salt: int, n: int = 0) -> float:
    """Return a deterministic number in [-1, 1) for `seed`, one parameter `salt` and a step `n`."""
    return hash01(seed ^ salt, n) * 2.0 - 1.0


def lag_of(seed: int, deviation: Deviation) -> float:
    """Return the delay in seconds of one copy: fixed per seed, between 0 and `lag_s`."""
    return hash01(seed ^ SALT_LAG, 0) * max(deviation.lag_s, 0.0)


def is_dropout(seed: int, bucket: int, deviation: Deviation) -> bool:
    """Return True if the copy holds its last value in this time bucket."""
    return deviation.dropout > 0 and hash01(seed ^ SALT_DROPOUT, bucket) < deviation.dropout


def deviate(value: float, seed: int, bucket: int, deviation: Deviation, span: float = 0.0) -> float:
    """Return the value of a copy for a source `value`.

    The offset and the scale are fixed per seed, the noise changes with the time `bucket` and is a
    fraction of `span` (the range of the sensor); the same arguments always give the same result.
    """
    shifted = value * (1.0 + signed(seed, SALT_SCALE) * deviation.scale)
    shifted += signed(seed, SALT_OFFSET) * deviation.offset
    shifted += signed(seed, SALT_NOISE, bucket) * deviation.noise * span
    return rounded(clamped(shifted, deviation), deviation)


def clamped(value: float, deviation: Deviation) -> float:
    """Return `value` kept within the limits of the deviation."""
    if deviation.clamp_min is not None:
        value = max(value, deviation.clamp_min)
    if deviation.clamp_max is not None:
        value = min(value, deviation.clamp_max)
    return value


def rounded(value: float, deviation: Deviation) -> float:
    """Return `value` rounded to the decimals of the deviation, if it has any."""
    if deviation.decimals is None:
        return value
    return round(value, max(0, min(deviation.decimals, MAX_DECIMALS)))


def bucket_of(at: float, interval_s: float) -> int:
    """Return the number of the time bucket that `at` falls in, for buckets of `interval_s`."""
    return int(at // max(interval_s, SECONDS_PER_BUCKET_MIN))
