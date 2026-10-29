"""What a schedule, a scenario step or a history import aims at: the target and its schema."""

from __future__ import annotations

import voluptuous as vol

from .keys import KEY_DEVICE, KEY_RUN, KEY_TEMPLATE
from .limits import SHORT_TEXT

MAX_TARGET_DEVICES = 500

TARGET_SCHEMA = vol.Any(
    {
        vol.Required(KEY_DEVICE): vol.Any(
            SHORT_TEXT, vol.All([SHORT_TEXT], vol.Length(min=1, max=MAX_TARGET_DEVICES))
        )
    },
    {vol.Required(KEY_TEMPLATE): SHORT_TEXT},
    {vol.Required(KEY_RUN): SHORT_TEXT},
    {vol.Required("all"): True},
)


def device_references(value: str | list[str] | None) -> set[str]:
    """Return the ids or names that the `device` part of a target names: one text or a list."""
    if value is None:
        return set()
    return {value} if isinstance(value, str) else set(value)
