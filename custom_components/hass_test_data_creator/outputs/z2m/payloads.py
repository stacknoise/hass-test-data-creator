"""The payloads of the Zigbee2MQTT bridge, created only here (concept 7.4, 13.2)."""

from __future__ import annotations

import hashlib
import json
from typing import Any

from ...model.models import DeviceDef

BRIDGE_VERSION = "2.1.0"
COORDINATOR_IEEE = "0x00124b0000000001"
DEFAULT_VENDOR = "TDC"


def ieee_address(device_id: str) -> str:
    """Return a stable fake IEEE address for a device id."""
    return "0x" + hashlib.sha256(device_id.encode()).hexdigest()[:16]


def network_address(device_id: str) -> int:
    """Return a stable fake network address (16 bit) for a device id."""
    return int(hashlib.sha256(device_id.encode()).hexdigest()[16:20], 16)


class Z2mPayloadFactory:
    """Builds the retained JSON payloads of the bridge and the devices."""

    def bridge_state(self, online: bool) -> str:
        """Return the payload of `bridge/state`."""
        return json.dumps({"state": "online" if online else "offline"})

    def availability(self, online: bool) -> str:
        """Return the payload of `<device>/availability`."""
        return json.dumps({"state": "online" if online else "offline"})

    def bridge_info(self, base_topic: str) -> str:
        """Return the payload of `bridge/info`: version, coordinator and a subset of the config."""
        return json.dumps(
            {
                "version": BRIDGE_VERSION,
                "commit": "tdc",
                "coordinator": {
                    "type": "HASS Test Data Creator",
                    "ieee_address": COORDINATOR_IEEE,
                    "meta": {"revision": "tdc"},
                },
                "network": {"channel": 11, "pan_id": 6754, "extended_pan_id": [0] * 8},
                "log_level": "info",
                "permit_join": False,
                "permit_join_end": None,
                "restart_required": False,
                "config": {
                    "homeassistant": {"enabled": False},
                    "advanced": {"output": "json"},
                    "mqtt": {"base_topic": base_topic},
                },
            }
        )

    def bridge_devices(self, entries: list[dict[str, Any]]) -> str:
        """Return the payload of `bridge/devices`: the coordinator and the given devices."""
        coordinator = {
            "ieee_address": COORDINATOR_IEEE,
            "type": "Coordinator",
            "network_address": 0,
            "supported": False,
            "disabled": False,
            "friendly_name": "Coordinator",
            "interviewing": False,
            "interview_completed": True,
        }
        return json.dumps([coordinator, *entries])

    def device_entry(
        self, device: DeviceDef, meta: dict[str, str], exposes: list[dict[str, Any]]
    ) -> dict[str, Any]:
        """Return one device of `bridge/devices`; `meta` is the z2m block of its template."""
        return {
            "ieee_address": ieee_address(device.id),
            "type": meta.get("type", "EndDevice"),
            "network_address": network_address(device.id),
            "supported": True,
            "disabled": False,
            "friendly_name": device.name,
            "description": "",
            "definition": {
                "model": meta.get("model", device.model),
                "vendor": meta.get("vendor", DEFAULT_VENDOR),
                "description": meta.get("description", device.model),
                "supports_ota": False,
                "exposes": exposes,
                "options": [],
            },
            "power_source": meta.get("power_source", "Battery"),
            "model_id": meta.get("model", device.model),
            "date_code": "",
            "software_build_id": "tdc",
            "interviewing": False,
            "interview_completed": True,
            "endpoints": {},
        }

    def device_state(self, properties: dict[str, Any]) -> str:
        """Return the payload of `<device>`: all properties as JSON."""
        return json.dumps(properties)
