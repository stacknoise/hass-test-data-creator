"""Request fields of a schedule, shared by the services and the WebSocket commands."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from ..const import CONF_SEED, MAX_PARAMS_BYTES, MAX_TRIGGER_BYTES
from ..core.keys import (
    KEY_ACTION,
    KEY_DEVICE,
    KEY_ENABLED,
    KEY_ENTITY,
    KEY_NAME,
    KEY_PARAMS,
    KEY_RUN,
    KEY_SCENARIO,
    KEY_SCHEDULE_ID,
    KEY_TARGET,
    KEY_TEMPLATE,
    KEY_TRIGGER,
)
from ..core.limits import SHORT_TEXT, json_object

MAX_TARGET_DEVICES = 500

TARGET_SCHEMA = vol.Any(
    {
        vol.Required(KEY_DEVICE): vol.Any(
            SHORT_TEXT, vol.All([SHORT_TEXT], vol.Length(min=1, max=MAX_TARGET_DEVICES))
        )
    },
    {vol.Required(KEY_TEMPLATE): SHORT_TEXT},
    {vol.Required(KEY_RUN): SHORT_TEXT},
    {vol.Required("all"): True},
)


def device_references(value: str | list[str] | None) -> set[str]:
    """Return the ids or names that the `device` part of a target names: one text or a list."""
    if value is None:
        return set()
    return {value} if isinstance(value, str) else set(value)


SCHEDULE_FIELDS: dict[Any, Any] = {
    vol.Required(KEY_NAME): vol.All(str, vol.Length(min=1, max=64)),
    vol.Optional(KEY_TARGET): TARGET_SCHEMA,
    vol.Optional(KEY_ENTITY): SHORT_TEXT,
    vol.Optional(KEY_ACTION): SHORT_TEXT,
    vol.Optional(KEY_SCENARIO): SHORT_TEXT,
    vol.Optional(KEY_PARAMS, default=dict): json_object(MAX_PARAMS_BYTES),
    vol.Required(KEY_TRIGGER): json_object(MAX_TRIGGER_BYTES),
    vol.Optional(CONF_SEED): vol.All(str, vol.Length(min=1, max=64)),
    vol.Optional(KEY_ENABLED, default=True): bool,
}

# Changing a schedule keeps what the request leaves out; `enabled` has no default here.
SCHEDULE_UPDATE_FIELDS: dict[Any, Any] = {
    vol.Required(KEY_SCHEDULE_ID): str,
    **{key: value for key, value in SCHEDULE_FIELDS.items() if key.schema != KEY_ENABLED},
    vol.Optional(KEY_ENABLED): bool,
}
