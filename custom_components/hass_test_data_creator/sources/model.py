"""The stored form of a source of a device (concept 17.5)."""

from __future__ import annotations

from typing import Any

from .deviation import Deviation


def new_source(request: dict[str, Any]) -> dict[str, Any]:
    """Return the stored source for a request: references only, no values and no secrets."""
    return {
        "device_id": request["device_id"],
        "mapping": dict(request.get("mapping", {})),
        "deviation": Deviation.from_dict(request.get("deviation")).to_dict(),
        "seeds": {},
        "removed": False,
    }
