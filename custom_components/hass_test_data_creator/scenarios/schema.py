"""Request fields of a scenario, shared by the services and the WebSocket commands."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from ..core.keys import KEY_ACTION, KEY_ENTITY, KEY_NAME, KEY_PARAMS, KEY_STEPS, KEY_TARGET
from ..scheduler.schema import TARGET_SCHEMA

MAX_STEPS = 50
MAX_STEP_DELAY_SECONDS = 86400

STEP_SCHEMA = vol.Schema(
    {
        vol.Optional("after_s", default=0): vol.All(
            vol.Coerce(float), vol.Range(min=0, max=MAX_STEP_DELAY_SECONDS)
        ),
        vol.Required(KEY_TARGET): TARGET_SCHEMA,
        vol.Optional(KEY_ENTITY, default=""): str,
        vol.Required(KEY_ACTION): str,
        vol.Optional(KEY_PARAMS, default=dict): dict,
    }
)

SCENARIO_FIELDS: dict[Any, Any] = {
    vol.Required(KEY_NAME): vol.All(str, vol.Length(min=1, max=64)),
    vol.Required(KEY_STEPS): vol.All([STEP_SCHEMA], vol.Length(min=1, max=MAX_STEPS)),
}
