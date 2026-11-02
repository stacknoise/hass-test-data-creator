"""One row of the live log (concept 17.1)."""

from __future__ import annotations

from dataclasses import dataclass
import math
from typing import Any


def number_of(text: str | None) -> float | None:
    """Return the number in `text`, or None if it is not a finite number."""
    if text is None:
        return None
    try:
        value = float(text)
    except ValueError:
        return None
    return value if math.isfinite(value) else None


@dataclass(frozen=True, slots=True)
class LogEntry:
    """A state change of one generated entity."""

    seq: int
    at: float
    device_id: str
    device: str
    key: str
    name: str
    template: str
    area: str
    run_id: str
    output: str
    platform: str
    device_class: str
    unit: str
    old: str | None
    new: str
    cause: str
    source_id: str = ""
    source: str = ""

    @property
    def delta(self) -> float | None:
        """The change of a numeric value, or None if either value is not a number."""
        old, new = number_of(self.old), number_of(self.new)
        return None if old is None or new is None else new - old

    def as_dict(self) -> dict[str, Any]:
        """Return the entry as the reply of `log/get` shows it."""
        return {
            "seq": self.seq,
            "at": self.at,
            "device_id": self.device_id,
            "device": self.device,
            "key": self.key,
            "name": self.name,
            "template": self.template,
            "area": self.area,
            "run_id": self.run_id,
            "output": self.output,
            "platform": self.platform,
            "device_class": self.device_class,
            "unit": self.unit,
            "old": self.old,
            "new": self.new,
            "delta": self.delta,
            "cause": self.cause,
            "source_id": self.source_id,
            "source": self.source,
        }
