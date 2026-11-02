"""The filter of the live log: one pure test per entry (concept 17.2)."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .entry import LogEntry, number_of

_GROUPS = (
    "devices",
    "entities",
    "templates",
    "areas",
    "platforms",
    "device_classes",
    "outputs",
    "causes",
    "runs",
    "sources",
)


@dataclass(frozen=True)
class LogFilter:
    """What a request asks for; a field that is empty or missing does not filter."""

    query: str = ""
    devices: frozenset[str] = frozenset()
    entities: frozenset[str] = frozenset()
    templates: frozenset[str] = frozenset()
    areas: frozenset[str] = frozenset()
    platforms: frozenset[str] = frozenset()
    device_classes: frozenset[str] = frozenset()
    outputs: frozenset[str] = frozenset()
    causes: frozenset[str] = frozenset()
    runs: frozenset[str] = frozenset()
    sources: frozenset[str] = frozenset()
    only_numeric: bool = False
    min_delta: float | None = None
    since_time: float | None = None
    until_time: float | None = None

    @classmethod
    def from_request(cls, data: dict[str, Any] | None) -> LogFilter:
        """Return the filter for a validated request; None means no filter."""
        data = data or {}
        groups = {name: frozenset(data.get(name, ())) for name in _GROUPS}
        return cls(
            query=data.get("query", "").strip().casefold(),
            only_numeric=data.get("only_numeric", False),
            min_delta=data.get("min_delta"),
            since_time=data.get("from"),
            until_time=data.get("to"),
            **groups,
        )

    @property
    def is_empty(self) -> bool:
        """Whether the filter lets every entry pass."""
        return self == LogFilter()

    def matches(self, entry: LogEntry) -> bool:
        """Whether `entry` passes: all groups must match, a value inside a group may be any."""
        return (
            self._in_time(entry)
            and self._in_groups(entry)
            and self._by_value(entry)
            and self._by_query(entry)
        )

    def _in_time(self, entry: LogEntry) -> bool:
        """Whether the entry lies in the time window."""
        if self.since_time is not None and entry.at < self.since_time:
            return False
        return self.until_time is None or entry.at <= self.until_time

    def _in_groups(self, entry: LogEntry) -> bool:
        """Whether the entry matches every group that has values."""
        pairs = (
            (self.devices, (entry.device_id, entry.device)),
            (self.entities, (entry.key, entry.name)),
            (self.templates, (entry.template,)),
            (self.areas, (entry.area,)),
            (self.platforms, (entry.platform,)),
            (self.device_classes, (entry.device_class,)),
            (self.outputs, (entry.output,)),
            (self.causes, (entry.cause,)),
            (self.runs, (entry.run_id,)),
            (self.sources, (entry.source_id, entry.source)),
        )
        return all(not wanted or wanted.intersection(have) for wanted, have in pairs)

    def _by_value(self, entry: LogEntry) -> bool:
        """Whether the value passes `only_numeric` and `min_delta`."""
        if self.only_numeric and number_of(entry.new) is None:
            return False
        if self.min_delta is None:
            return True
        delta = entry.delta
        return delta is not None and abs(delta) >= self.min_delta

    def _by_query(self, entry: LogEntry) -> bool:
        """Whether the text is part of the device, entity or value."""
        if not self.query:
            return True
        text = " ".join(
            (entry.device, entry.name, entry.key, entry.new, entry.old or "", entry.source)
        )
        return self.query in text.casefold()
