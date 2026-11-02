"""The state of the source of a copy, read from the registries and the states (concept 17.4)."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr, entity_registry as er

from ..model.models import DeviceDef

STATE_OK = "ok"
STATE_OFFLINE = "offline"
STATE_REMOVED = "removed"
OFFLINE_STATES = ("unavailable", "unknown")


class SourceStatus:
    """Tells for a copy which source it follows and whether that source is ok, offline or removed."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Keep the instance."""
        self._hass = hass

    def of(self, device: DeviceDef) -> dict[str, Any] | None:
        """Return `{id, name, state, dismissed}` of the source of `device`, or None without one."""
        source = device.source
        if not source:
            return None
        entry = dr.async_get(self._hass).async_get(source["device_id"])
        name = (entry.name_by_user or entry.name) if entry else None
        return {
            "id": source["device_id"],
            "name": name or source.get("name") or source["device_id"],
            "state": self._state(source, entry is not None),
            "dismissed": bool(source.get("dismissed")),
        }

    def _state(self, source: dict[str, Any], device_exists: bool) -> str:
        """Return removed if the device or a mapped entity is gone, offline if one is unusable."""
        entities = list(source.get("mapping", {}).values())
        registry = er.async_get(self._hass)
        if not device_exists or any(registry.async_get(item) is None for item in entities):
            return STATE_REMOVED
        for entity_id in entities:
            state = self._hass.states.get(entity_id)
            if state is None or state.state in OFFLINE_STATES:
                return STATE_OFFLINE
        return STATE_OK

    def removed(self, devices: list[DeviceDef]) -> list[dict[str, Any]]:
        """Return the removed sources that still have copies nobody has decided about."""
        groups: dict[str, dict[str, Any]] = {}
        for device in devices:
            info = self.of(device)
            if info is None or info["state"] != STATE_REMOVED or info["dismissed"]:
                continue
            group = groups.setdefault(
                info["id"], {"id": info["id"], "name": info["name"], "devices": []}
            )
            group["devices"].append({"id": device.id, "name": device.name})
        return list(groups.values())
