"""Request fields of a group, shared by the services and the WebSocket commands."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from ..core.keys import KEY_MEMBERS, KEY_NAME

MAX_MEMBERS = 500

GROUP_FIELDS: dict[Any, Any] = {
    vol.Required(KEY_NAME): vol.All(str, vol.Length(min=1, max=64)),
    vol.Required(KEY_MEMBERS): vol.All([str], vol.Length(min=1, max=MAX_MEMBERS)),
}
