"""Rules for the names that become Zigbee2MQTT topics (concept 7.3, 7.4)."""

from __future__ import annotations

import re

RESERVED_NAMES = ("bridge",)
MAX_FRIENDLY_NAME_LENGTH = 64
_FORBIDDEN = re.compile(r"[/+#\x00-\x1f\x7f]")


def is_friendly_name(name: str) -> bool:
    """Whether `name` can be a Zigbee2MQTT friendly name: a single, printable topic level."""
    return (
        0 < len(name) <= MAX_FRIENDLY_NAME_LENGTH
        and not _FORBIDDEN.search(name)
        and name not in RESERVED_NAMES
    )
