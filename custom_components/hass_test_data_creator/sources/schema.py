"""Request schemas of the source commands (concept 17.6)."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from ..const import MAX_PAGE_SIZE, MAX_SOURCE_PREVIEW
from ..core.limits import SHORT_TEXT

_fraction = vol.All(vol.Coerce(float), vol.Range(min=0, max=1))
_amount = vol.All(vol.Coerce(float), vol.Range(min=0, max=1_000_000))

DEVIATION_FIELDS: dict[Any, Any] = {
    vol.Optional("offset"): _amount,
    vol.Optional("scale"): _fraction,
    vol.Optional("noise"): _fraction,
    vol.Optional("lag_s"): vol.All(vol.Coerce(float), vol.Range(min=0, max=86400)),
    vol.Optional("dropout"): _fraction,
    vol.Optional("decimals"): vol.All(int, vol.Range(min=0, max=6)),
    vol.Optional("clamp_min"): vol.Coerce(float),
    vol.Optional("clamp_max"): vol.Coerce(float),
}

SOURCES_LIST_FIELDS: dict[Any, Any] = {
    vol.Optional("query", default=""): SHORT_TEXT,
    vol.Optional("limit", default=50): vol.All(int, vol.Range(min=1, max=MAX_PAGE_SIZE)),
}

SOURCES_INSPECT_FIELDS: dict[Any, Any] = {
    vol.Required("device_id"): SHORT_TEXT,
    vol.Optional("template"): SHORT_TEXT,
}

SOURCES_PREVIEW_FIELDS: dict[Any, Any] = {
    vol.Required("entity_id"): SHORT_TEXT,
    vol.Optional("seed", default="tdc-0042"): SHORT_TEXT,
    vol.Optional("key", default="value"): SHORT_TEXT,
    vol.Optional("count", default=5): vol.All(int, vol.Range(min=1, max=MAX_SOURCE_PREVIEW)),
    vol.Optional("span", default=0.0): _amount,
    vol.Optional("deviation", default={}): vol.Schema(DEVIATION_FIELDS),
}
