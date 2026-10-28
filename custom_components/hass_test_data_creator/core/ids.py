"""Identifier helpers."""

from __future__ import annotations

import secrets
import time

MS_PER_SECOND = 1000
TIME_HEX_DIGITS = 11
RANDOM_BYTES = 7


def new_id() -> str:
    """Return a new time-ordered hexadecimal identifier (26 characters)."""
    millis = int(time.time() * MS_PER_SECOND)
    return f"{millis:0{TIME_HEX_DIGITS}x}{secrets.token_hex(RANDOM_BYTES)}"
