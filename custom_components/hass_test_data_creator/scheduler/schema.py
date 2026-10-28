"""Request fields of a schedule, shared by the services and the WebSocket commands."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

TARGET_SCHEMA = vol.Any(
    {vol.Required("device"): str},
    {vol.Required("template"): str},
    {vol.Required("run"): str},
    {vol.Required("all"): True},
)

SCHEDULE_FIELDS: dict[Any, Any] = {
    vol.Required("name"): vol.All(str, vol.Length(min=1, max=64)),
    vol.Optional("target"): TARGET_SCHEMA,
    vol.Optional("entity"): str,
    vol.Optional("action"): str,
    vol.Optional("scenario"): str,
    vol.Optional("params", default=dict): dict,
    vol.Required("trigger"): dict,
    vol.Optional("seed"): vol.All(str, vol.Length(min=1, max=64)),
    vol.Optional("enabled", default=True): bool,
}
