"""Request fields of a group, shared by the services and the WebSocket commands."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

MAX_MEMBERS = 500

GROUP_FIELDS: dict[Any, Any] = {
    vol.Required("name"): vol.All(str, vol.Length(min=1, max=64)),
    vol.Required("members"): vol.All([str], vol.Length(min=1, max=MAX_MEMBERS)),
}
