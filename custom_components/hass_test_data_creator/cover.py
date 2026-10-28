"""The cover platform of the generated devices."""

from __future__ import annotations

from .core.keys import KEY_COVER
from .platforms.setup import platform_setup

async_setup_entry = platform_setup(KEY_COVER)
