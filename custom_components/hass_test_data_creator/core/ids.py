"""Identifier helpers."""

from __future__ import annotations

import secrets
import time


def new_id() -> str:
    """Return a new time-ordered hexadecimal identifier (26 characters)."""
    return f"{int(time.time() * 1000):011x}{secrets.token_hex(7)}"
