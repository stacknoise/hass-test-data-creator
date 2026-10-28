"""Finds the entity id of an entity of a generated device, whatever its output."""

from __future__ import annotations

from homeassistant.helpers import entity_registry as er

from ..const import DOMAIN, OUTPUT_MQTT
from ..model.models import DeviceDef, EntityDef
from ..outputs.mqtt.profiles import mqtt_unique_id


def entity_id_of(
    registry: er.EntityRegistry, device: DeviceDef, definition: EntityDef
) -> str | None:
    """Return the entity id of `definition` (native or MQTT unique id), or None if not registered."""
    return registry.async_get_entity_id(
        definition.platform, DOMAIN, f"{device.id}_{definition.key}"
    ) or registry.async_get_entity_id(
        definition.platform, OUTPUT_MQTT, mqtt_unique_id(device.id, definition.key)
    )
