"""The names a generated device and its entities carry in Home Assistant and in MQTT discovery."""

from __future__ import annotations

from homeassistant.helpers import entity_registry as er

from ..const import DOMAIN, OUTPUT_MQTT
from ..model.models import DeviceDef, EntityDef


def mqtt_device_identifier(device_id: str) -> str:
    """Return the identifier of the registry device that MQTT discovery creates for `device_id`."""
    return f"tdc_{device_id}"


def mqtt_unique_id(device_id: str, key: str) -> str:
    """Return the unique id of the MQTT entity of `key` of a device."""
    return f"tdc_{device_id}_{key}"


def entity_id_of(
    registry: er.EntityRegistry, device: DeviceDef, definition: EntityDef
) -> str | None:
    """Return the entity id of `definition` (native or MQTT unique id), or None if not registered."""
    return registry.async_get_entity_id(
        definition.platform, DOMAIN, f"{device.id}_{definition.key}"
    ) or registry.async_get_entity_id(
        definition.platform, OUTPUT_MQTT, mqtt_unique_id(device.id, definition.key)
    )
