"""The climate platform of the generated devices."""

from __future__ import annotations

from .platforms.setup import platform_setup

async_setup_entry = platform_setup("climate")
