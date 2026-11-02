"""The ring buffer of the live log: newest entries in memory, never stored (concept 17.1)."""

from __future__ import annotations

from collections import deque
from collections.abc import Callable

from .entry import LogEntry


class LogBuffer:
    """Keeps the newest entries; each one has a rising `seq` so that readers can ask for more."""

    def __init__(self, capacity: int) -> None:
        """Start empty with room for `capacity` entries."""
        self._entries: deque[LogEntry] = deque(maxlen=capacity)
        self._seq = 0
        self._floor = 0

    @property
    def capacity(self) -> int:
        """The most entries that are kept."""
        return self._entries.maxlen or 0

    @property
    def size(self) -> int:
        """The number of entries now."""
        return len(self._entries)

    @property
    def last_seq(self) -> int:
        """The `seq` of the newest entry made so far, 0 before the first."""
        return self._seq

    def next_seq(self) -> int:
        """Return the `seq` of the next entry."""
        self._seq += 1
        return self._seq

    def append(self, entry: LogEntry) -> None:
        """Add `entry`; the oldest one drops out when the buffer is full."""
        self._entries.append(entry)

    def clear(self) -> None:
        """Remove all entries; `seq` goes on, and the removed ones do not count as dropped."""
        self._entries.clear()
        self._floor = self._seq

    def resize(self, capacity: int) -> None:
        """Change the room; the newest entries stay if it gets smaller."""
        self._entries = deque(self._entries, maxlen=capacity)

    def read(
        self,
        since: int,
        limit: int,
        matches: Callable[[LogEntry], bool],
        newest_first: bool = False,
    ) -> tuple[list[LogEntry], int]:
        """Return up to `limit` matching entries after `since` and how many dropped out unseen.

        Oldest first, the oldest ones after `since` when there are more than `limit`, so that a
        reader that goes on from the last `seq` misses nothing. `newest_first` returns the newest
        `limit` entries, newest first.
        """
        base = max(since, self._floor)
        found: list[LogEntry] = []
        for entry in reversed(self._entries):
            if entry.seq <= base:
                break
            if matches(entry):
                found.append(entry)
        found.reverse()
        if newest_first:
            return found[-limit:][::-1], self._dropped(since, base)
        return found[:limit], self._dropped(since, base)

    def _dropped(self, since: int, base: int) -> int:
        """Return how many entries after `base` are gone because the buffer was full.

        A reader that asks from the start (`since` 0) has seen nothing, so nothing is missing.
        """
        if since == 0 or not self._entries:
            return 0
        return max(0, self._entries[0].seq - base - 1)
