"""Request fields of the live log commands (concept 17.2)."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from ..const import LOG_MIN_ENTRIES, MAX_FILTER_VALUES, MAX_LOG_ENTRIES, MAX_PAGE_SIZE
from ..core.limits import SHORT_TEXT

_values = vol.All([SHORT_TEXT], vol.Length(max=MAX_FILTER_VALUES))

LOG_FILTER_FIELDS: dict[Any, Any] = {
    vol.Optional("query"): SHORT_TEXT,
    vol.Optional("devices"): _values,
    vol.Optional("entities"): _values,
    vol.Optional("templates"): _values,
    vol.Optional("areas"): _values,
    vol.Optional("platforms"): _values,
    vol.Optional("device_classes"): _values,
    vol.Optional("outputs"): _values,
    vol.Optional("causes"): _values,
    vol.Optional("runs"): _values,
    vol.Optional("only_numeric"): bool,
    vol.Optional("min_delta"): vol.All(vol.Coerce(float), vol.Range(min=0)),
    vol.Optional("from"): vol.Coerce(float),
    vol.Optional("to"): vol.Coerce(float),
}

LOG_GET_FIELDS: dict[Any, Any] = {
    vol.Optional("since", default=0): vol.All(int, vol.Range(min=0)),
    vol.Optional("limit", default=200): vol.All(int, vol.Range(min=1, max=MAX_PAGE_SIZE)),
    vol.Optional("newest_first", default=False): bool,
    vol.Optional("filter"): vol.Schema(LOG_FILTER_FIELDS),
}

LOG_SET_FIELDS: dict[Any, Any] = {
    vol.Optional("capture"): bool,
    vol.Optional("capture_filter"): vol.Schema(LOG_FILTER_FIELDS),
    vol.Optional("size"): vol.All(int, vol.Range(min=LOG_MIN_ENTRIES, max=MAX_LOG_ENTRIES)),
}
