"""The payloads of the Zigbee2MQTT bridge, created only here (concept 7.4, 13.2)."""

from __future__ import annotations

import hashlib
import json
from typing import Any

from ...const import DEFAULT_MQTT_BASE_TOPIC, OUTPUT_MQTT
from ...core.keys import (
    KEY_BRIGHTNESS,
    KEY_DESCRIPTION,
    KEY_ENABLED,
    KEY_FRIENDLY_NAME,
    KEY_ID,
    KEY_IEEE_ADDRESS,
    KEY_MEMBERS,
    KEY_MODEL,
    KEY_OUTPUT,
    KEY_POSITION,
    KEY_POWER_SOURCE,
    KEY_STATE,
    KEY_TYPE,
    KEY_VENDOR,
)
from ...model.models import DeviceDef, GroupDef

BRIDGE_VERSION = "2.1.0"
COORDINATOR_IEEE = "0x00124b0000000001"
DEFAULT_VENDOR = "TDC"
GROUP_PROPERTIES = (
    "state",
    "brightness",
    "position",
    "system_mode",
    "occupied_heating_setpoint",
)

HEX_BASE = 16
IEEE_HEX_DIGITS = 16
NETWORK_HEX_DIGITS = 4
# The fake Zigbee network of the bridge info.
ZIGBEE_CHANNEL = 11
PAN_ID = 6754
EXTENDED_PAN_ID_BYTES = 8


def ieee_address(device_id: str) -> str:
    """Return a stable fake IEEE address for a device id."""
    return "0x" + hashlib.sha256(device_id.encode()).hexdigest()[:IEEE_HEX_DIGITS]


def network_address(device_id: str) -> int:
    """Return a stable fake network address (16 bit) for a device id."""
    return int(
        hashlib.sha256(device_id.encode()).hexdigest()[
            IEEE_HEX_DIGITS : IEEE_HEX_DIGITS + NETWORK_HEX_DIGITS
        ],
        HEX_BASE,
    )


class Z2mPayloadFactory:
    """Builds the retained JSON payloads of the bridge and the devices."""

    def bridge_state(self, online: bool) -> str:
        """Return the payload of `bridge/state`."""
        return json.dumps({KEY_STATE: "online" if online else "offline"})

    def availability(self, online: bool) -> str:
        """Return the payload of `<device>/availability`."""
        return json.dumps({KEY_STATE: "online" if online else "offline"})

    def bridge_info(self, base_topic: str) -> str:
        """Return the payload of `bridge/info`: version, coordinator and a subset of the config."""
        return json.dumps(
            {
                "version": BRIDGE_VERSION,
                "commit": DEFAULT_MQTT_BASE_TOPIC,
                "coordinator": {
                    KEY_TYPE: "HASS Test Data Creator",
                    KEY_IEEE_ADDRESS: COORDINATOR_IEEE,
                    "meta": {"revision": DEFAULT_MQTT_BASE_TOPIC},
                },
                "network": {
                    "channel": ZIGBEE_CHANNEL,
                    "pan_id": PAN_ID,
                    "extended_pan_id": [0] * EXTENDED_PAN_ID_BYTES,
                },
                "log_level": "info",
                "permit_join": False,
                "permit_join_end": None,
                "restart_required": False,
                "config": {
                    "homeassistant": {KEY_ENABLED: False},
                    "advanced": {KEY_OUTPUT: "json"},
                    OUTPUT_MQTT: {"base_topic": base_topic},
                },
            }
        )

    def bridge_devices(self, entries: list[dict[str, Any]]) -> str:
        """Return the payload of `bridge/devices`: the coordinator and the given devices."""
        coordinator = {
            KEY_IEEE_ADDRESS: COORDINATOR_IEEE,
            KEY_TYPE: "Coordinator",
            "network_address": 0,
            "supported": False,
            "disabled": False,
            KEY_FRIENDLY_NAME: "Coordinator",
            "interviewing": False,
            "interview_completed": True,
        }
        return json.dumps([coordinator, *entries])

    def device_entry(
        self, device: DeviceDef, meta: dict[str, str], exposes: list[dict[str, Any]]
    ) -> dict[str, Any]:
        """Return one device of `bridge/devices`; `meta` is the z2m block of its template."""
        return {
            KEY_IEEE_ADDRESS: ieee_address(device.id),
            KEY_TYPE: meta.get(KEY_TYPE, "EndDevice"),
            "network_address": network_address(device.id),
            "supported": True,
            "disabled": False,
            KEY_FRIENDLY_NAME: device.name,
            KEY_DESCRIPTION: "",
            "definition": {
                KEY_MODEL: meta.get(KEY_MODEL, device.model),
                KEY_VENDOR: meta.get(KEY_VENDOR, DEFAULT_VENDOR),
                KEY_DESCRIPTION: meta.get(KEY_DESCRIPTION, device.model),
                "supports_ota": False,
                "exposes": exposes,
                "options": [],
            },
            KEY_POWER_SOURCE: meta.get(KEY_POWER_SOURCE, "Battery"),
            "model_id": meta.get(KEY_MODEL, device.model),
            "date_code": "",
            "software_build_id": DEFAULT_MQTT_BASE_TOPIC,
            "interviewing": False,
            "interview_completed": True,
            "endpoints": {},
        }

    def bridge_groups(self, groups: list[dict[str, Any]]) -> str:
        """Return the payload of `bridge/groups`."""
        return json.dumps(groups)

    def group_entry(self, group: GroupDef, devices: list[DeviceDef]) -> dict[str, Any]:
        """Return one group of `bridge/groups` with its member devices."""
        return {
            KEY_ID: group.number,
            KEY_FRIENDLY_NAME: group.name,
            KEY_MEMBERS: [
                {KEY_IEEE_ADDRESS: ieee_address(device.id), "endpoint": 1} for device in devices
            ],
            "scenes": [],
        }

    def group_state(self, member_states: list[dict[str, Any]]) -> dict[str, Any]:
        """Return the state of a group from the states of its members."""
        state: dict[str, Any] = {}
        for name in GROUP_PROPERTIES:
            values = [item[name] for item in member_states if name in item]
            if not values:
                continue
            if name == KEY_STATE:
                state[name] = "ON" if "ON" in values else "OFF"
            elif name in (KEY_BRIGHTNESS, KEY_POSITION):
                state[name] = round(sum(values) / len(values))
            else:
                state[name] = values[0]
        return state

    def device_state(self, properties: dict[str, Any]) -> str:
        """Return the payload of `<device>`: all properties as JSON."""
        return json.dumps(properties)
