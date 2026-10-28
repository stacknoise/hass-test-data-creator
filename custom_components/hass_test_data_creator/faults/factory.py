"""Faults of generated entities and their factory (concept 6.3, 13.2)."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

import voluptuous as vol

from ..core.errors import ErrorCode, ScheduleError

MAX_DURATION_SECONDS = 86400
ALL_PLATFORMS = ("sensor", "binary_sensor", "switch", "event")
SENSOR_ONLY = ("sensor",)
DEFAULT_SPIKE_FACTOR = 5.0
DEFAULT_BATTERY_LOW = 5.0
DEFAULT_LINKQUALITY_DROP = 20.0

Transform = Callable[[float], float]


@dataclass(frozen=True)
class Fault:
    """A fault that is active on one entity until `duration_s` has passed."""

    kind: str
    duration_s: float
    unavailable: bool = False
    frozen: bool = False
    transform: Transform | None = None


@dataclass(frozen=True)
class FaultSpec:
    """What a kind of fault does, where it applies and which parameters it takes."""

    platforms: tuple[str, ...]
    default_duration_s: float
    extra: dict[Any, Any]


_DURATION = vol.All(vol.Coerce(float), vol.Range(min=1, max=MAX_DURATION_SECONDS))
_NUMBER = vol.Coerce(float)
_SPECS: dict[str, FaultSpec] = {
    "unavailable": FaultSpec(ALL_PLATFORMS, 60, {}),
    "dropout": FaultSpec(SENSOR_ONLY, 10, {}),
    "frozen": FaultSpec(SENSOR_ONLY, 300, {}),
    "spike": FaultSpec(SENSOR_ONLY, 30, {vol.Optional("factor"): _NUMBER}),
    "battery_low": FaultSpec(SENSOR_ONLY, 3600, {vol.Optional("value"): _NUMBER}),
    "linkquality_drop": FaultSpec(SENSOR_ONLY, 600, {vol.Optional("value"): _NUMBER}),
}
FAULT_KINDS = tuple(_SPECS)
ACTION_PREFIX = "fault_"


def _scaled(factor: float) -> Transform:
    """Return the transformation that multiplies a value by `factor`."""

    def apply(value: float) -> float:
        """Return the value multiplied by the factor."""
        return value * factor

    return apply


def _fixed(level: float) -> Transform:
    """Return the transformation that replaces every value by `level`."""

    def apply(value: float) -> float:
        """Return the fixed level."""
        return level

    return apply


class FaultFactory:
    """Creates the fault for a kind and its parameters."""

    def kinds(self) -> tuple[str, ...]:
        """Return the names of all kinds of fault."""
        return FAULT_KINDS

    def platforms(self, kind: str) -> tuple[str, ...]:
        """Return the platforms a kind of fault applies to; empty if the kind is unknown."""
        spec = _SPECS.get(kind)
        return spec.platforms if spec else ()

    def create(self, kind: str, params: dict[str, Any]) -> Fault:
        """Return the fault or raise SCH_INVALID_FAULT for unknown kinds and bad parameters."""
        spec = _SPECS.get(kind)
        if spec is None:
            raise ScheduleError(ErrorCode.SCH_INVALID_FAULT)
        schema = vol.Schema({vol.Optional("duration_s"): _DURATION, **spec.extra})
        try:
            checked = schema({key: value for key, value in params.items() if key in schema.schema})
        except vol.Invalid as err:
            raise ScheduleError(ErrorCode.SCH_INVALID_FAULT) from err
        duration = checked.get("duration_s", spec.default_duration_s)
        if kind in ("unavailable", "dropout"):
            return Fault(kind, duration, unavailable=True)
        if kind == "frozen":
            return Fault(kind, duration, frozen=True)
        if kind == "spike":
            return Fault(
                kind, duration, transform=_scaled(checked.get("factor", DEFAULT_SPIKE_FACTOR))
            )
        default = DEFAULT_BATTERY_LOW if kind == "battery_low" else DEFAULT_LINKQUALITY_DROP
        return Fault(kind, duration, transform=_fixed(checked.get("value", default)))
