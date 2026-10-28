"""Factory for audit entries (concept 13.2, 13.4)."""

from __future__ import annotations

from dataclasses import dataclass, field
import logging
from typing import Any


@dataclass(frozen=True)
class AuditEntry:
    """One action with its log level and fields."""

    level: int
    message: str
    fields: dict[str, Any] = field(default_factory=dict)


class AuditEntryFactory:
    """Creates one audit entry per kind of action."""

    def devices_created(self, run_id: str, template: str, count: int) -> AuditEntry:
        """Return the entry for a finished creation job."""
        return AuditEntry(
            logging.INFO, "devices created", {"run": run_id, "template": template, "count": count}
        )

    def removal_done(self, target: str, devices: int, areas: int) -> AuditEntry:
        """Return the entry for a finished removal."""
        return AuditEntry(
            logging.INFO, "removal done", {"target": target, "devices": devices, "areas": areas}
        )

    def action_fired(self, device: str, key: str, action: str) -> AuditEntry:
        """Return the entry for an action on one entity."""
        return AuditEntry(
            logging.INFO, "action fired", {"device": device, "entity": key, "action": action}
        )

    def tick_slow(self, duration: float, interval: float) -> AuditEntry:
        """Return the warning for a tick that took too long (TDC-GEN-005)."""
        return AuditEntry(
            logging.WARNING,
            "TDC-GEN-005 tick took too long",
            {"seconds": round(duration, 3), "interval": interval},
        )
