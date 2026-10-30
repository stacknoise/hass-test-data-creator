"""Categories of a transfer file and the request fields of the transfer commands."""

from __future__ import annotations

from typing import Any, Final

import voluptuous as vol

from ..const import MAX_BATCH
from ..core.keys import KEY_DEVICES, KEY_GROUPS, KEY_SCENARIOS, KEY_SCHEDULES

FORMAT_VERSION: Final = 1
KEY_TEMPLATES: Final = "templates"
KEY_CATEGORY: Final = "category"
KEY_ITEMS: Final = "items"
KEY_OVERRIDES: Final = "overrides"

CATEGORIES: Final = (KEY_DEVICES, KEY_TEMPLATES, KEY_SCHEDULES, KEY_SCENARIOS, KEY_GROUPS)

EXPORT_FIELDS: dict[Any, Any] = {
    vol.Required(KEY_CATEGORY): vol.In(CATEGORIES),
    vol.Optional("offset", default=0): vol.All(int, vol.Range(min=0)),
    vol.Optional("limit", default=MAX_BATCH): vol.All(int, vol.Range(min=0, max=MAX_BATCH)),
}
