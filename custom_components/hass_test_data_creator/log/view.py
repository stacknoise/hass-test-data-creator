"""What the commands of the live log do: read, set and clear (concept 17.2)."""

from __future__ import annotations

from typing import Any

from .buffer import LogBuffer
from .filters import LogFilter
from .recorder import LogRecorder


class LogView:
    """The read and write side of the live log for the WebSocket commands."""

    def __init__(self, recorder: LogRecorder, buffer: LogBuffer) -> None:
        """Keep the recorder and the buffer."""
        self._recorder = recorder
        self._buffer = buffer

    def get(self, since: int, limit: int, flt: LogFilter, newest_first: bool) -> dict[str, Any]:
        """Return the entries after `since`; asking also keeps the recording going or starts it."""
        self._recorder.touch()
        entries, dropped = self._buffer.read(since, limit, flt.matches, newest_first)
        return {
            "entries": [entry.as_dict() for entry in entries],
            **self._status(),
            "dropped": dropped,
        }

    def configure(
        self, capture: bool | None, capture_filter: LogFilter | None, size: int | None
    ) -> dict[str, Any]:
        """Stop the recording, set the filter in front of the buffer or its size; return the status."""
        if capture is False:
            self._recorder.stop()
        if capture_filter is not None:
            self._recorder.set_filter(capture_filter)
        if size is not None:
            self._buffer.resize(size)
        return self._status()

    def clear(self) -> dict[str, Any]:
        """Empty the buffer and return the status."""
        self._buffer.clear()
        return self._status()

    def _status(self) -> dict[str, Any]:
        """Return the state of the log: whether it records, how full it is and what was dropped."""
        return {
            "capture": self._recorder.active,
            "last_seq": self._buffer.last_seq,
            "size": self._buffer.size,
            "capacity": self._buffer.capacity,
            "discarded": self._recorder.discarded,
        }
