"""Factory that creates a signal per shape (concept 13.2)."""

from __future__ import annotations

from dataclasses import replace
from typing import Any, Protocol

from ..core.errors import ErrorCode, SignalError
from .signals import CSV_SHAPE, SHAPE_NAMES, SignalSpec, has_invalid_states, value_at


class Signal:
    """A configured signal that returns its value for a point in time."""

    def __init__(self, spec: SignalSpec) -> None:
        """Keep the validated spec."""
        self.spec = spec

    def value(self, t: float) -> float | str:
        """Return the value or state at signal time `t` in seconds."""
        return value_at(self.spec, t)


class TableSource(Protocol):
    """Where the tables of csv signals come from."""

    def table(self, file: str, step_s: float) -> tuple[tuple[tuple[float, float], ...], float]:
        """Return the table of `(seconds, value)` points and the loop length of `file`."""


class SignalFactory:
    """Creates validated signals from the signal block of a template."""

    def __init__(self, tables: TableSource | None = None) -> None:
        """Keep the source of the tables of csv signals."""
        self._tables = tables

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
        if spec.shape == CSV_SHAPE and self._tables is not None:
            table, loop_s = self._tables.table(spec.file, spec.step_s)
            spec = replace(spec, table=table, loop_s=loop_s)
        return Signal(spec)
