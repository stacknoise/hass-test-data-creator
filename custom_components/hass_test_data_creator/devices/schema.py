"""Request fields of a creation job, shared by the service and the WebSocket command."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from ..areas.distribution import MODE_EVEN, MODES
from ..const import OUTPUT_NATIVE, OUTPUTS
from .manager import CreationJob

CREATE_FIELDS: dict[Any, Any] = {
    vol.Required("template"): str,
    vol.Required("count"): vol.All(int, vol.Range(min=1)),
    vol.Optional("name_pattern", default="{template} {nn}"): vol.All(str, vol.Length(max=64)),
    vol.Optional("areas", default=list): [vol.All(str, vol.Length(min=1, max=64))],
    vol.Optional("area_mode", default=MODE_EVEN): vol.In(MODES),
    vol.Optional("seed"): vol.All(str, vol.Length(min=1, max=64)),
    vol.Optional("label", default=""): vol.All(str, vol.Length(max=64)),
    vol.Optional("output", default=OUTPUT_NATIVE): vol.In(OUTPUTS),
    vol.Optional("entities"): [dict],
}


def job_from_request(data: dict[str, Any], default_seed: str) -> CreationJob:
    """Return the creation job for a validated request; `default_seed` is used without a seed."""
    return CreationJob(
        template=data["template"],
        count=data["count"],
        name_pattern=data["name_pattern"],
        seed=data.get("seed", default_seed),
        areas=data["areas"],
        area_mode=data["area_mode"],
        label=data["label"],
        output=data["output"],
        entities=data.get("entities"),
    )
