"""Request fields of a scenario, shared by the services and the WebSocket commands."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from ..scheduler.schema import TARGET_SCHEMA

MAX_STEPS = 50
MAX_STEP_DELAY_SECONDS = 86400

STEP_SCHEMA = vol.Schema(
    {
        vol.Optional("after_s", default=0): vol.All(
            vol.Coerce(float), vol.Range(min=0, max=MAX_STEP_DELAY_SECONDS)
        ),
        vol.Required("target"): TARGET_SCHEMA,
        vol.Required("entity"): str,
        vol.Required("action"): str,
        vol.Optional("params", default=dict): dict,
    }
)

SCENARIO_FIELDS: dict[Any, Any] = {
    vol.Required("name"): vol.All(str, vol.Length(min=1, max=64)),
    vol.Required("steps"): vol.All([STEP_SCHEMA], vol.Length(min=1, max=MAX_STEPS)),
}
