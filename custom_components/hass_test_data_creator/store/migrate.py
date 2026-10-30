"""Migrates the stored data of older versions to the current layout (concept 4.3)."""

from __future__ import annotations

from typing import Any

from ..core.keys import KEY_DEVICES, KEY_TIME_LAPSE


def _to_version_2(data: dict[str, Any]) -> dict[str, Any]:
    """Version 2 remembers when the time lapse began; older data has no such base."""
    return {**data, KEY_TIME_LAPSE: None}


def _to_version_3(data: dict[str, Any]) -> dict[str, Any]:
    """Version 3 lets a device be paused; every stored device runs."""
    devices = {
        key: {**device, "paused": False} if isinstance(device, dict) else device
        for key, device in data.get(KEY_DEVICES, {}).items()
    }
    return {**data, KEY_DEVICES: devices}


_STEPS = {1: _to_version_2, 2: _to_version_3}


def migrate(version: int, data: dict[str, Any]) -> dict[str, Any]:
    """Return `data` of `version` in the layout of the current version, one step at a time."""
    while version in _STEPS:
        data = _STEPS[version](data)
        version += 1
    return data
