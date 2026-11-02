"""The recorder of the live log: takes the changes of the behaviours while someone looks (concept 17.1)."""

from __future__ import annotations

from collections.abc import Callable
import time

from ..const import LOG_IDLE_S, MAX_LOG_RATE
from ..core.protocols import LoggedBehaviour
from ..store.store import TdcStore
from .buffer import LogBuffer
from .factory import LogEntryFactory
from .filters import LogFilter


class LogRecorder:
    """Records state changes into the buffer; it runs only while a reader keeps asking for them."""

    def __init__(
        self,
        store: TdcStore,
        factory: LogEntryFactory,
        buffer: LogBuffer,
        wall: Callable[[], float] = time.time,
        monotonic: Callable[[], float] = time.monotonic,
    ) -> None:
        """Keep the collaborators and the two clocks; the log starts switched off."""
        self._store = store
        self._factory = factory
        self._buffer = buffer
        self._wall = wall
        self._monotonic = monotonic
        self._capturing = False
        self._last_touch = 0.0
        self._filter = LogFilter()
        self._last: dict[tuple[str, str], str] = {}
        self._window = 0.0
        self._in_window = 0
        self.discarded = 0

    @property
    def active(self) -> bool:
        """Whether the log records now; it stops by itself when nobody has asked for `LOG_IDLE_S`."""
        if self._capturing and self._monotonic() - self._last_touch > LOG_IDLE_S:
            self.stop()
        return self._capturing

    @property
    def capture_filter(self) -> LogFilter:
        """The filter in front of the buffer."""
        return self._filter

    def touch(self) -> None:
        """Note that a reader is there; this starts the recording if it was off."""
        self._capturing = True
        self._last_touch = self._monotonic()

    def stop(self) -> None:
        """Stop recording and forget everything, as the log is never kept."""
        self._capturing = False
        self._last.clear()
        self._buffer.clear()
        self._in_window = 0
        self.discarded = 0

    def set_filter(self, flt: LogFilter) -> None:
        """Record only the entries that pass `flt` from now on."""
        self._filter = flt

    def changed(self, behaviour: LoggedBehaviour, cause: str, value: str | None = None) -> None:
        """Record the change of `behaviour` unless the rate is too high or the filter says no."""
        device = self._store.device(behaviour.device_id)
        if device is None:
            return
        definition = behaviour.definition
        new = behaviour.state_text() if value is None else value
        place = (device.id, definition.key)
        old = self._last.get(place)
        self._last[place] = new
        entry = self._factory.create(0, self._wall(), device, definition, old, new, cause)
        if not self._filter.matches(entry):
            return
        if not self._within_rate():
            self.discarded += 1
            return
        self._buffer.append(
            self._factory.create(
                self._buffer.next_seq(), entry.at, device, definition, old, new, cause
            )
        )

    def _within_rate(self) -> bool:
        """Count one entry in the current second and say whether it is below `MAX_LOG_RATE`."""
        now = self._monotonic()
        if now - self._window >= 1.0:
            self._window = now
            self._in_window = 0
        self._in_window += 1
        return self._in_window <= MAX_LOG_RATE
