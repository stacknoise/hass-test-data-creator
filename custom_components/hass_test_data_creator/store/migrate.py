"""Migrates the stored data of older versions to the current layout (concept 4.3)."""

from __future__ import annotations

from typing import Any

from ..core.keys import KEY_TIME_LAPSE


def _to_version_2(data: dict[str, Any]) -> dict[str, Any]:
    """Version 2 remembers when the time lapse began; older data has no such base."""
    return {**data, KEY_TIME_LAPSE: None}


_STEPS = {1: _to_version_2}


def migrate(version: int, data: dict[str, Any]) -> dict[str, Any]:
    """Return `data` of `version` in the layout of the current version, one step at a time."""
    while version in _STEPS:
        data = _STEPS[version](data)
        version += 1
    return data
