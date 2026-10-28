"""Request fields of a statistics import, shared by the service and the WebSocket command."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from ..const import DEFAULT_HISTORY_DAYS, MAX_HISTORY_DAYS
from ..core.keys import KEY_DAYS, KEY_DEVICE, KEY_ENTITY
from ..scheduler.schema import MAX_TARGET_DEVICES

HISTORY_FIELDS: dict[Any, Any] = {
    vol.Optional(KEY_DAYS, default=DEFAULT_HISTORY_DAYS): vol.All(
        int, vol.Range(min=1, max=MAX_HISTORY_DAYS)
    ),
    vol.Optional(KEY_DEVICE): vol.Any(
        str, vol.All([str], vol.Length(min=1, max=MAX_TARGET_DEVICES))
    ),
    vol.Optional(KEY_ENTITY): str,
}
