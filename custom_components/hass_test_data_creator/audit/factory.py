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

    def history_imported(self, series: int, rows: int) -> AuditEntry:
        """Return the entry for a finished statistics import."""
        return AuditEntry(logging.INFO, "history imported", {"series": series, "rows": rows})

    def device_moved(self, device: str, area: str | None) -> AuditEntry:
        """Return the entry for a device that was put into another area."""
        return AuditEntry(logging.INFO, "device moved", {"device": device, "area": area or ""})

    def signal_changed(self, device: str, key: str, shape: str) -> AuditEntry:
        """Return the entry for a sensor that got another curve."""
        return AuditEntry(
            logging.INFO, "signal changed", {"device": device, "entity": key, "shape": shape}
        )

    def action_fired(self, device: str, key: str, action: str) -> AuditEntry:
        """Return the entry for an action on one entity."""
        return AuditEntry(
            logging.INFO, "action fired", {"device": device, "entity": key, "action": action}
        )

    def schedule_ran(self, name: str, action: str) -> AuditEntry:
        """Return the entry for a schedule that ran."""
        return AuditEntry(logging.INFO, "schedule ran", {"schedule": name, "action": action})

    def schedule_changed(self, name: str) -> AuditEntry:
        """Return the entry for a schedule that was changed."""
        return AuditEntry(logging.INFO, "schedule changed", {"schedule": name})

    def scenario_started(self, name: str, steps: int) -> AuditEntry:
        """Return the entry for a scenario that was started."""
        return AuditEntry(logging.INFO, "scenario started", {"scenario": name, "steps": steps})

    def mqtt_failed(self, topic: str, reason: str) -> AuditEntry:
        """Return the warning for an MQTT message that could not be sent or applied."""
        return AuditEntry(logging.WARNING, "mqtt failed", {"topic": topic, "reason": reason})

    def schedule_failed(self, name: str, device: str, code: str) -> AuditEntry:
        """Return the warning for a run that failed on one device."""
        return AuditEntry(
            logging.WARNING,
            "schedule failed",
            {"schedule": name, "device": device, "code": code},
        )

    def tick_slow(self, duration: float, interval: float) -> AuditEntry:
        """Return the warning for a tick that took too long (TDC-GEN-005)."""
        return AuditEntry(
            logging.WARNING,
            "TDC-GEN-005 tick took too long",
            {"seconds": round(duration, 3), "interval": interval},
        )
