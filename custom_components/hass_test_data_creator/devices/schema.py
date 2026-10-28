"""Request fields of a creation job, shared by the service and the WebSocket command."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from ..areas.distribution import MODE_EVEN, MODES
from ..const import CONF_SEED, OUTPUT_NATIVE, OUTPUTS
from ..core.keys import KEY_AREAS, KEY_COUNT, KEY_ENTITIES, KEY_LABEL, KEY_OUTPUT, KEY_TEMPLATE
from .manager import CreationJob

CREATE_FIELDS: dict[Any, Any] = {
    vol.Required(KEY_TEMPLATE): str,
    vol.Required(KEY_COUNT): vol.All(int, vol.Range(min=1)),
    vol.Optional("name_pattern", default="{template} {nn}"): vol.All(str, vol.Length(max=64)),
    vol.Optional(KEY_AREAS, default=list): [vol.All(str, vol.Length(min=1, max=64))],
    vol.Optional("area_mode", default=MODE_EVEN): vol.In(MODES),
    vol.Optional(CONF_SEED): vol.All(str, vol.Length(min=1, max=64)),
    vol.Optional(KEY_LABEL, default=""): vol.All(str, vol.Length(max=64)),
    vol.Optional(KEY_OUTPUT, default=OUTPUT_NATIVE): vol.In(OUTPUTS),
    vol.Optional(KEY_ENTITIES): [dict],
}


def job_from_request(data: dict[str, Any], default_seed: str) -> CreationJob:
    """Return the creation job for a validated request; `default_seed` is used without a seed."""
    return CreationJob(
        template=data[KEY_TEMPLATE],
        count=data[KEY_COUNT],
        name_pattern=data["name_pattern"],
        seed=data.get(CONF_SEED, default_seed),
        areas=data[KEY_AREAS],
        area_mode=data["area_mode"],
        label=data[KEY_LABEL],
        output=data[KEY_OUTPUT],
        entities=data.get(KEY_ENTITIES),
    )
