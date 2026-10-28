"""The audit log: the only place where actions are logged (concept 13.4)."""

from __future__ import annotations

import json
import logging
from typing import Any

from .factory import AuditEntry

_LOGGER = logging.getLogger("custom_components.hass_test_data_creator.audit")
MAX_VALUE_LENGTH = 120


def format_value(value: Any) -> str:
    """Return `value` as a quoted, single-line, shortened string that is safe to log."""
    text = " ".join(str(value).split())[:MAX_VALUE_LENGTH]
    return json.dumps(text, ensure_ascii=False)


class AuditLog:
    """Writes audit entries to the Home Assistant log."""

    def record(self, entry: AuditEntry) -> None:
        """Log `entry` with its level; user-typed values are escaped."""
        fields = " ".join(f"{key}={format_value(value)}" for key, value in entry.fields.items())
        _LOGGER.log(entry.level, "%s %s", entry.message, fields)
