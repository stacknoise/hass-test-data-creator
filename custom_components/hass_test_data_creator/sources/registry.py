"""The only access to the device and entity registries for sources (concept 17.7); read only."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from homeassistant.const import ATTR_DEVICE_CLASS, ATTR_UNIT_OF_MEASUREMENT
from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr, entity_registry as er

from ..const import DOMAIN, OUTPUT_MQTT
from ..core.errors import ErrorCode, SourceError
from ..core.labels import marker_label_id
from ..model.identifiers import mqtt_device_identifier
from .mapper import SourceEntity

MQTT_PREFIX = mqtt_device_identifier("")
OFFLINE_STATES = ("unavailable", "unknown")


@dataclass(frozen=True)
class SourceState:
    """One entity of a source with its current state."""

    entity: SourceEntity
    name: str
    state: str | None

    @property
    def online(self) -> bool:
        """Whether the entity has a usable state."""
        return self.state is not None and self.state not in OFFLINE_STATES

    def to_dict(self) -> dict[str, Any]:
        """Return the form sent to the panel."""
        return {
            "entity_id": self.entity.entity_id,
            "name": self.name,
            "platform": self.entity.platform,
            "device_class": self.entity.device_class,
            "unit": self.entity.unit,
            "state": self.state,
        }


class SourceRegistry:
    """Finds real devices and reads their entities; never writes and never touches generated data."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Keep the instance."""
        self._hass = hass

    def is_generated(self, entry: dr.DeviceEntry) -> bool:
        """Return True if `entry` was made by this integration (marker, identifier or MQTT id)."""
        if marker_label_id(self._hass) in entry.labels:
            return True
        return any(
            domain == DOMAIN or (domain == OUTPUT_MQTT and str(ident).startswith(MQTT_PREFIX))
            for domain, ident in entry.identifiers
        )

    def search(self, query: str, limit: int) -> list[dict[str, Any]]:
        """Return real devices whose name, model or manufacturer contains `query`, by name."""
        needle = query.strip().casefold()
        found = [
            self._summary(entry)
            for entry in dr.async_get(self._hass).devices
            if not self.is_generated(entry) and needle in self._haystack(entry)
        ]
        found.sort(key=lambda item: str(item["name"]).casefold())
        return found[:limit]

    def device(self, device_id: str) -> dr.DeviceEntry:
        """Return the registry entry of a source or raise SRC_NOT_FOUND / SRC_GENERATED."""
        entry = dr.async_get(self._hass).async_get(device_id)
        if entry is None:
            raise SourceError(ErrorCode.SRC_NOT_FOUND)
        if self.is_generated(entry):
            raise SourceError(ErrorCode.SRC_GENERATED)
        return entry

    def entities(self, device_id: str) -> list[SourceState]:
        """Return the enabled entities of a source with their states, by entity id."""
        self.device(device_id)
        registry = er.async_get(self._hass)
        result = []
        for entity in er.async_entries_for_device(registry, device_id):
            state = self._hass.states.get(entity.entity_id)
            attributes = state.attributes if state else {}
            device_class = (
                attributes.get(ATTR_DEVICE_CLASS)
                or entity.device_class
                or entity.original_device_class
            )
            source = SourceEntity(
                entity.entity_id,
                entity.domain,
                device_class,
                attributes.get(ATTR_UNIT_OF_MEASUREMENT) or entity.unit_of_measurement,
            )
            name = entity.name or entity.original_name or entity.entity_id
            result.append(SourceState(source, name, state.state if state else None))
        return sorted(result, key=lambda item: item.entity.entity_id)

    def state_of(self, entity_id: str) -> SourceState:
        """Return one entity of a source, or raise SRC_NOT_FOUND."""
        entity = er.async_get(self._hass).async_get(entity_id)
        if entity is None or entity.device_id is None:
            raise SourceError(ErrorCode.SRC_NOT_FOUND)
        for item in self.entities(entity.device_id):
            if item.entity.entity_id == entity_id:
                return item
        raise SourceError(ErrorCode.SRC_NOT_FOUND)

    def _summary(self, entry: dr.DeviceEntry) -> dict[str, Any]:
        """Return the short description of a device for the search result."""
        registry = er.async_get(self._hass)
        return {
            "id": entry.id,
            "name": entry.name_by_user or entry.name or entry.id,
            "manufacturer": entry.manufacturer,
            "model": entry.model,
            "entities": len(er.async_entries_for_device(registry, entry.id)),
        }

    @staticmethod
    def _haystack(entry: dr.DeviceEntry) -> str:
        """Return the text that a search looks in."""
        parts = (entry.name_by_user, entry.name, entry.model, entry.manufacturer)
        return " ".join(part for part in parts if part).casefold()
