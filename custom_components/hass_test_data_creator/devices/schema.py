"""Request fields of a creation job, shared by the service and the WebSocket command."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from ..areas.distribution import MODE_EVEN, MODES
from ..const import (
    CONF_SEED,
    MAX_AREAS_PER_JOB,
    MAX_BATCH,
    MAX_ENTITIES_BYTES,
    MAX_ENTITIES_PER_DEVICE,
    MAX_FILTER_VALUES,
    OUTPUT_NATIVE,
    OUTPUTS,
)
from ..core.keys import (
    KEY_AREAS,
    KEY_COUNT,
    KEY_ENTITIES,
    KEY_IDS,
    KEY_LABEL,
    KEY_OUTPUT,
    KEY_TEMPLATE,
)
from ..core.limits import SHORT_TEXT, json_size
from .filters import SORTS, STATES, DeviceFilter
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


_filter_values = vol.All([SHORT_TEXT], vol.Length(max=MAX_FILTER_VALUES))

FILTER_FIELDS: dict[Any, Any] = {
    vol.Optional("query"): SHORT_TEXT,
    vol.Optional("templates"): _filter_values,
    vol.Optional(KEY_AREAS): _filter_values,
    vol.Optional("outputs"): _filter_values,
    vol.Optional("platforms"): _filter_values,
    vol.Optional("runs"): _filter_values,
    vol.Optional("custom"): bool,
    vol.Optional("state"): vol.In(STATES),
    vol.Optional("sort"): vol.In(SORTS),
    vol.Optional("descending"): bool,
}


KEY_FILTER = "filter"

BULK_TARGET_FIELDS: dict[Any, Any] = {
    vol.Exclusive(KEY_IDS, "target"): vol.All([SHORT_TEXT], vol.Length(min=1, max=MAX_BATCH)),
    vol.Exclusive(KEY_FILTER, "target"): vol.Schema(FILTER_FIELDS),
    vol.Optional("expected"): vol.All(int, vol.Range(min=0)),
}


def bulk_target(data: dict[str, Any]) -> tuple[list[str] | None, DeviceFilter | None]:
    """Return the ids or the filter a validated bulk request names; None for the one it leaves out."""
    flt = data.get(KEY_FILTER)
    return data.get(KEY_IDS), None if flt is None else DeviceFilter.from_request(flt)


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
