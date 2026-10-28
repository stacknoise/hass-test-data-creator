"""Finds or creates areas and records the ones the integration created (concept 4.4)."""

from __future__ import annotations

from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry as ar, device_registry as dr, entity_registry as er

from ..const import DOMAIN, OUTPUT_MQTT
from ..model.models import DeviceDef
from ..outputs.mqtt.profiles import mqtt_device_identifier
from ..store.store import TdcStore


class AreaAssigner:
    """Resolves area names to area ids and cleans up the areas it created."""

    def __init__(self, hass: HomeAssistant, store: TdcStore) -> None:
        """Keep the Home Assistant instance and the store with the list of created areas."""
        self._hass = hass
        self._store = store

    def ensure(self, name: str) -> str:
        """Return the id of the area `name`; create it and remember it if it does not exist."""
        registry = ar.async_get(self._hass)
        area = registry.async_get_area_by_name(name)
        if area is None:
            area = registry.async_create(name)
            self._store.add_created_area(area.id)
        return area.id

    def move(self, device: DeviceDef, name: str | None) -> None:
        """Put the registry device of `device` into the area `name`, or into no area if None."""
        registry = dr.async_get(self._hass)
        entry = registry.async_get_device(
            identifiers={(DOMAIN, device.id)}
        ) or registry.async_get_device(
            identifiers={(OUTPUT_MQTT, mqtt_device_identifier(device.id))}
        )
        if entry is not None:
            registry.async_update_device(entry.id, area_id=self.ensure(name) if name else None)

    def delete_empty_created(self) -> list[str]:
        """Delete the created areas that hold no device and no entity; return their names."""
        registry = ar.async_get(self._hass)
        device_registry = dr.async_get(self._hass)
        entity_registry = er.async_get(self._hass)
        removed: list[str] = []
        for area_id in self._store.created_areas:
            area = registry.async_get_area(area_id)
            if area is None:
                self._store.forget_area(area_id)
                continue
            if dr.async_entries_for_area(device_registry, area_id) or er.async_entries_for_area(
                entity_registry, area_id
            ):
                continue
            registry.async_delete(area_id)
            self._store.forget_area(area_id)
            removed.append(area.name)
        return removed
