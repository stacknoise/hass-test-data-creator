"""Unit conversion between a source entity and a copy, with the converters of Home Assistant."""

from __future__ import annotations

from collections.abc import Callable

from homeassistant.components.sensor.const import UNIT_CONVERTERS


def converter(
    device_class: str | None, source_unit: str | None, target_unit: str | None
) -> Callable[[float], float] | None:
    """Return the function that converts source values, or None if the units do not fit.

    Equal units, or a missing unit on either side, need no conversion and give the identity.
    """
    if not source_unit or not target_unit or source_unit == target_unit:
        return _identity
    unit_converter = UNIT_CONVERTERS.get(device_class) if device_class else None
    if unit_converter is None:
        return None
    if (
        source_unit not in unit_converter.VALID_UNITS
        or target_unit not in unit_converter.VALID_UNITS
    ):
        return None
    return unit_converter.converter_factory(source_unit, target_unit)


def _identity(value: float) -> float:
    """Return `value` unchanged."""
    return value
