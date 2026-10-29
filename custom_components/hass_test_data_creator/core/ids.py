"""Identifier helpers."""

from __future__ import annotations

import secrets
import time

MS_PER_SECOND = 1000
TIME_HEX_DIGITS = 11
RANDOM_BYTES = 7
ID_LENGTH = TIME_HEX_DIGITS + 2 * RANDOM_BYTES


def new_id() -> str:
    """Return a new time-ordered hexadecimal identifier (`ID_LENGTH` characters)."""
    millis = int(time.time() * MS_PER_SECOND)
    return f"{millis:0{TIME_HEX_DIGITS}x}{secrets.token_hex(RANDOM_BYTES)}"
