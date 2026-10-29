"""Validators that bound free-form request fields (concept 12)."""

from __future__ import annotations

from collections.abc import Callable
import json
from typing import Any

import voluptuous as vol

from ..const import MAX_SHORT_TEXT


def json_size(max_bytes: int) -> Callable[[Any], Any]:
    """Return a validator for a value whose JSON text is at most `max_bytes` long."""

    def _bounded(value: Any) -> Any:
        """Return `value` or raise vol.Invalid if it is too large to store."""
        try:
            size = len(json.dumps(value))
        except (TypeError, ValueError) as error:
            raise vol.Invalid("must be JSON") from error
        if size > max_bytes:
            raise vol.Invalid(f"must not be larger than {max_bytes} bytes")
        return value

    return _bounded


def json_object(max_bytes: int) -> vol.All:
    """Return a validator for a dict whose JSON text is at most `max_bytes` long."""
    return vol.All(dict, json_size(max_bytes))


SHORT_TEXT = vol.All(str, vol.Length(max=MAX_SHORT_TEXT))
