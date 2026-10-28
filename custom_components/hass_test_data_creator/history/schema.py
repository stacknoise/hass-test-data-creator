"""Request fields of a statistics import, shared by the service and the WebSocket command."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from ..const import DEFAULT_HISTORY_DAYS, MAX_HISTORY_DAYS

HISTORY_FIELDS: dict[Any, Any] = {
    vol.Optional("days", default=DEFAULT_HISTORY_DAYS): vol.All(
        int, vol.Range(min=1, max=MAX_HISTORY_DAYS)
    ),
    vol.Optional("device"): str,
    vol.Optional("entity"): str,
}
