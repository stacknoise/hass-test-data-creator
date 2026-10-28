"""Factory that creates a signal per shape (concept 13.2)."""

from __future__ import annotations

from typing import Any

from ..core.errors import ErrorCode, SignalError
from .signals import SHAPE_NAMES, SignalSpec, has_invalid_states, value_at


class Signal:
    """A configured signal that returns its value for a point in time."""

    def __init__(self, spec: SignalSpec) -> None:
        """Keep the validated spec."""
        self.spec = spec

    def value(self, t: float) -> float | str:
        """Return the value or state at signal time `t` in seconds."""
        return value_at(self.spec, t)


class SignalFactory:
    """Creates validated signals from the signal block of a template."""

    def shapes(self) -> tuple[str, ...]:
        """Return the names of all shapes."""
        return SHAPE_NAMES

    def create(self, definition: dict[str, Any], seed: int, origin: float) -> Signal:
        """Return the signal for `definition` of one entity with its `seed` and time `origin`."""
        spec = SignalSpec.from_dict(definition, seed, origin)
        if spec.shape not in SHAPE_NAMES:
            raise SignalError(ErrorCode.SIG_UNKNOWN_SHAPE)
        if spec.min > spec.max:
            raise SignalError(ErrorCode.SIG_INVALID_RANGE)
        if has_invalid_states(spec):
            raise SignalError(ErrorCode.SIG_INVALID_STATES)
        return Signal(spec)
