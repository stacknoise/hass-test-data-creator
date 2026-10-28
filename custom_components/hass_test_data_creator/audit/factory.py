"""Factory for audit entries (concept 13.2, 13.4)."""

from __future__ import annotations

from dataclasses import dataclass, field
import logging
from typing import Any

from ..core.keys import (
    KEY_ACTION,
    KEY_AREA,
    KEY_AREAS,
    KEY_COUNT,
    KEY_DEVICE,
    KEY_DEVICES,
    KEY_ENTITY,
    KEY_INTERVAL,
    KEY_RUN,
    KEY_SCENARIO,
    KEY_SCHEDULE,
    KEY_SHAPE,
    KEY_STEPS,
    KEY_TARGET,
    KEY_TEMPLATE,
)


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
            logging.INFO,
            "devices created",
            {KEY_RUN: run_id, KEY_TEMPLATE: template, KEY_COUNT: count},
        )

    def removal_done(self, target: str, devices: int, areas: int) -> AuditEntry:
        """Return the entry for a finished removal."""
        return AuditEntry(
            logging.INFO,
            "removal done",
            {KEY_TARGET: target, KEY_DEVICES: devices, KEY_AREAS: areas},
        )

    def history_imported(self, series: int, rows: int) -> AuditEntry:
        """Return the entry for a finished statistics import."""
        return AuditEntry(logging.INFO, "history imported", {"series": series, "rows": rows})

    def device_moved(self, device: str, area: str | None) -> AuditEntry:
        """Return the entry for a device that was put into another area."""
        return AuditEntry(logging.INFO, "device moved", {KEY_DEVICE: device, KEY_AREA: area or ""})

    def signal_changed(self, device: str, key: str, shape: str) -> AuditEntry:
        """Return the entry for a sensor that got another curve."""
        return AuditEntry(
            logging.INFO, "signal changed", {KEY_DEVICE: device, KEY_ENTITY: key, KEY_SHAPE: shape}
        )

    def action_fired(self, device: str, key: str, action: str) -> AuditEntry:
        """Return the entry for an action on one entity."""
        return AuditEntry(
            logging.INFO, "action fired", {KEY_DEVICE: device, KEY_ENTITY: key, KEY_ACTION: action}
        )

    def schedule_ran(self, name: str, action: str) -> AuditEntry:
        """Return the entry for a schedule that ran."""
        return AuditEntry(logging.INFO, "schedule ran", {KEY_SCHEDULE: name, KEY_ACTION: action})

    def schedule_changed(self, name: str) -> AuditEntry:
        """Return the entry for a schedule that was changed."""
        return AuditEntry(logging.INFO, "schedule changed", {KEY_SCHEDULE: name})

    def scenario_started(self, name: str, steps: int) -> AuditEntry:
        """Return the entry for a scenario that was started."""
        return AuditEntry(logging.INFO, "scenario started", {KEY_SCENARIO: name, KEY_STEPS: steps})

    def scenario_changed(self, name: str) -> AuditEntry:
        """Return the entry for a scenario that was changed."""
        return AuditEntry(logging.INFO, "scenario changed", {KEY_SCENARIO: name})

    def mqtt_failed(self, topic: str, reason: str) -> AuditEntry:
        """Return the warning for an MQTT message that could not be sent or applied."""
        return AuditEntry(logging.WARNING, "mqtt failed", {"topic": topic, "reason": reason})

    def schedule_failed(self, name: str, device: str, code: str) -> AuditEntry:
        """Return the warning for a run that failed on one device."""
        return AuditEntry(
            logging.WARNING,
            "schedule failed",
            {KEY_SCHEDULE: name, KEY_DEVICE: device, "code": code},
        )

    def tick_slow(self, duration: float, interval: float) -> AuditEntry:
        """Return the warning for a tick that took too long (TDC-GEN-005)."""
        return AuditEntry(
            logging.WARNING,
            "TDC-GEN-005 tick took too long",
            {"seconds": round(duration, 3), KEY_INTERVAL: interval},
        )
