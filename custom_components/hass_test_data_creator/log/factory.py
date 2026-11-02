"""Factory for log entries (concept 13.2, 17.1)."""

from __future__ import annotations

from ..model.models import DeviceDef, EntityDef
from .entry import LogEntry


class LogEntryFactory:
    """Creates the log entry of a state change; the only place where entries are built."""

    def create(
        self,
        seq: int,
        at: float,
        device: DeviceDef,
        definition: EntityDef,
        old: str | None,
        new: str,
        cause: str,
    ) -> LogEntry:
        """Return the entry for the change of `definition` of `device` from `old` to `new`."""
        return LogEntry(
            seq=seq,
            at=at,
            device_id=device.id,
            device=device.name,
            key=definition.key,
            name=definition.name,
            template=device.template,
            area=device.area or "",
            run_id=device.run_id,
            output=device.output,
            platform=definition.platform,
            device_class=definition.device_class or "",
            unit=definition.unit or "",
            old=old,
            new=new,
            cause=cause,
            source_id=(device.source or {}).get("device_id", ""),
            source=(device.source or {}).get("name", ""),
        )
