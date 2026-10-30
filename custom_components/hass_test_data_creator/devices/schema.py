"""Request fields of a creation job, shared by the service and the WebSocket command."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from ..areas.distribution import MODE_EVEN, MODES
from ..const import (
    CONF_SEED,
    MAX_AREAS_PER_JOB,
    MAX_ENTITIES_BYTES,
    MAX_ENTITIES_PER_DEVICE,
    OUTPUT_NATIVE,
    OUTPUTS,
)
from ..core.keys import (
    KEY_AREAS,
    KEY_COUNT,
    KEY_DEVICE,
    KEY_ENTITIES,
    KEY_LABEL,
    KEY_OUTPUT,
    KEY_TEMPLATE,
)
from ..core.limits import SHORT_TEXT, json_size
from .manager import CreationJob

_entities_size = json_size(MAX_ENTITIES_BYTES)

CREATE_FIELDS: dict[Any, Any] = {
    vol.Required(KEY_TEMPLATE): SHORT_TEXT,
    vol.Required(KEY_COUNT): vol.All(int, vol.Range(min=1)),
    vol.Optional("name_pattern", default="{template} {nn}"): vol.All(str, vol.Length(max=64)),
    vol.Optional(KEY_AREAS, default=list): vol.All(
        [vol.All(str, vol.Length(min=1, max=64))], vol.Length(max=MAX_AREAS_PER_JOB)
    ),
    vol.Optional("area_mode", default=MODE_EVEN): vol.In(MODES),
    vol.Optional(CONF_SEED): vol.All(str, vol.Length(min=1, max=64)),
    vol.Optional(KEY_LABEL, default=""): vol.All(str, vol.Length(max=64)),
    vol.Optional(KEY_OUTPUT, default=OUTPUT_NATIVE): vol.In(OUTPUTS),
    vol.Optional(KEY_ENTITIES): vol.All(
        [dict], vol.Length(max=MAX_ENTITIES_PER_DEVICE), _entities_size
    ),
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


DUPLICATE_FIELDS: dict[Any, Any] = {
    vol.Required(KEY_DEVICE): SHORT_TEXT,
    vol.Optional(KEY_COUNT, default=1): vol.All(int, vol.Range(min=1)),
    vol.Optional("name_pattern", default="{template} {n}"): vol.All(str, vol.Length(max=64)),
    vol.Optional(KEY_AREAS, default=list): vol.All(
        [vol.All(str, vol.Length(min=1, max=64))], vol.Length(max=MAX_AREAS_PER_JOB)
    ),
    vol.Optional("area_mode", default=MODE_EVEN): vol.In(MODES),
    vol.Optional(CONF_SEED): vol.All(str, vol.Length(min=1, max=64)),
    vol.Optional(KEY_LABEL, default=""): vol.All(str, vol.Length(max=64)),
}


def duplicate_job_from_request(data: dict[str, Any], default_seed: str) -> CreationJob:
    """Return the job for copies of a device; template, output and entities come from the device."""
    return CreationJob(
        template="",
        count=data[KEY_COUNT],
        name_pattern=data["name_pattern"],
        seed=data.get(CONF_SEED, default_seed),
        areas=data[KEY_AREAS],
        area_mode=data["area_mode"],
        label=data[KEY_LABEL],
    )
