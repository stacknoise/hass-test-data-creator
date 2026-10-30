"""Categories of a transfer file and the request fields of the transfer commands."""

from __future__ import annotations

from typing import Any, Final

import voluptuous as vol

from ..const import MAX_BATCH
from ..core.keys import KEY_DEVICES, KEY_GROUPS, KEY_SCENARIOS, KEY_SCHEDULES
from ..core.limits import SHORT_TEXT

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

MODE_ADD: Final = "add"
MODE_SYNC: Final = "sync"
MODE_REPLACE: Final = "replace"
MODES: Final = (MODE_ADD, MODE_SYNC, MODE_REPLACE)
PHASE_IMPORT: Final = "import"
PHASE_PURGE: Final = "purge"
PHASES: Final = (PHASE_IMPORT, PHASE_PURGE)
MAX_KNOWN_NAMES: Final = 10_000

# Names that exist in the file, so that a reference to an entry that is not created yet still counts.
_KNOWN_LIST = vol.All([SHORT_TEXT], vol.Length(max=MAX_KNOWN_NAMES))
IMPORT_FIELDS: dict[Any, Any] = {
    vol.Required(KEY_CATEGORY): vol.In(CATEGORIES),
    vol.Required("mode"): vol.In(MODES),
    vol.Optional("phase", default=PHASE_IMPORT): vol.In(PHASES),
    vol.Optional(KEY_ITEMS, default=list): vol.All([dict], vol.Length(max=MAX_BATCH)),
    vol.Optional("known", default=dict): {
        vol.Optional(KEY_DEVICES): _KNOWN_LIST,
        vol.Optional(KEY_TEMPLATES): _KNOWN_LIST,
        vol.Optional(KEY_SCENARIOS): _KNOWN_LIST,
    },
    vol.Optional("replacing", default=list): vol.All([vol.In(CATEGORIES)], vol.Length(max=5)),
    vol.Optional("first", default=True): bool,
    vol.Optional("file_name", default=""): vol.All(str, vol.Length(max=64)),
}
