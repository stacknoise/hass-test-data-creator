"""Faults of generated entities and their factory (concept 6.3, 13.2)."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

import voluptuous as vol

from ..core.errors import ErrorCode, ScheduleError
from ..core.keys import KEY_DURATION_S, KEY_VALUE

MAX_DURATION_SECONDS = 86400
ALL_PLATFORMS = ("sensor", "binary_sensor", "switch", "event", "light", "cover", "climate")
SENSOR_ONLY = ("sensor",)
DEFAULT_SPIKE_FACTOR = 5.0
DEFAULT_BATTERY_LOW = 5.0
DEFAULT_LINKQUALITY_DROP = 20.0
DEFAULT_MESSAGE_DELAY_S = 30.0
MAX_MESSAGE_DELAY_S = 3600
DEFAULT_COPIES = 1
MAX_COPIES = 10

Transform = Callable[[float], float]


@dataclass(frozen=True)
class Fault:
    """A fault that is active on one entity until `duration_s` has passed."""

    kind: str
    duration_s: float
    unavailable: bool = False
    frozen: bool = False
    transform: Transform | None = None
    message_delay_s: float = 0.0
    message_repeats: int = 0


@dataclass(frozen=True)
class FaultSpec:
    """What a kind of fault does, where it applies and which parameters it takes."""

    platforms: tuple[str, ...]
    default_duration_s: float
    extra: dict[Any, Any]


_DURATION = vol.All(vol.Coerce(float), vol.Range(min=1, max=MAX_DURATION_SECONDS))
_NUMBER = vol.Coerce(float)
_DELAY = vol.All(vol.Coerce(float), vol.Range(min=1, max=MAX_MESSAGE_DELAY_S))
_COPIES = vol.All(int, vol.Range(min=1, max=MAX_COPIES))
_SPECS: dict[str, FaultSpec] = {
    "unavailable": FaultSpec(ALL_PLATFORMS, 60, {}),
    "dropout": FaultSpec(SENSOR_ONLY, 10, {}),
    "frozen": FaultSpec(SENSOR_ONLY, 300, {}),
    "spike": FaultSpec(SENSOR_ONLY, 30, {vol.Optional("factor"): _NUMBER}),
    "battery_low": FaultSpec(SENSOR_ONLY, 3600, {vol.Optional(KEY_VALUE): _NUMBER}),
    "linkquality_drop": FaultSpec(SENSOR_ONLY, 600, {vol.Optional(KEY_VALUE): _NUMBER}),
    "late": FaultSpec(ALL_PLATFORMS, 120, {vol.Optional("delay_s"): _DELAY}),
    "duplicate": FaultSpec(ALL_PLATFORMS, 120, {vol.Optional("copies"): _COPIES}),
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


def _plain(**flags: bool) -> Callable[[str, float, dict[str, Any]], Fault]:
    """Return the builder of a fault that only sets flags."""
    return lambda kind, duration, checked: Fault(kind, duration, **flags)


def _spike(kind: str, duration: float, checked: dict[str, Any]) -> Fault:
    """Return the fault that multiplies the values."""
    factor = checked.get("factor", DEFAULT_SPIKE_FACTOR)
    return Fault(kind, duration, transform=_scaled(factor))


def _late(kind: str, duration: float, checked: dict[str, Any]) -> Fault:
    """Return the fault that holds messages back."""
    return Fault(kind, duration, message_delay_s=checked.get("delay_s", DEFAULT_MESSAGE_DELAY_S))


def _duplicate(kind: str, duration: float, checked: dict[str, Any]) -> Fault:
    """Return the fault that publishes messages again."""
    return Fault(kind, duration, message_repeats=checked.get("copies", DEFAULT_COPIES))


def _fixed_level(default: float) -> Callable[[str, float, dict[str, Any]], Fault]:
    """Return the builder of a fault that replaces the values by a level."""
    return lambda kind, duration, checked: Fault(
        kind, duration, transform=_fixed(checked.get(KEY_VALUE, default))
    )


_BUILDERS: dict[str, Callable[[str, float, dict[str, Any]], Fault]] = {
    "unavailable": _plain(unavailable=True),
    "dropout": _plain(unavailable=True),
    "frozen": _plain(frozen=True),
    "spike": _spike,
    "battery_low": _fixed_level(DEFAULT_BATTERY_LOW),
    "linkquality_drop": _fixed_level(DEFAULT_LINKQUALITY_DROP),
    "late": _late,
    "duplicate": _duplicate,
}


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
        schema = vol.Schema({vol.Optional(KEY_DURATION_S): _DURATION, **spec.extra})
        try:
            checked = schema({key: value for key, value in params.items() if key in schema.schema})
        except vol.Invalid as err:
            raise ScheduleError(ErrorCode.SCH_INVALID_FAULT) from err
        duration = checked.get(KEY_DURATION_S, spec.default_duration_s)
        return _BUILDERS[kind](kind, duration, checked)
