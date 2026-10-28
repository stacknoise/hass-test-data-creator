"""Factory that creates the entity class per platform (concept 13.2)."""

from __future__ import annotations

from typing import Any

from ..engine.behaviour_factory import BehaviourFactory
from ..engine.behaviours import Live
from ..model.models import DeviceDef, EntityDef
from .actuators import TdcClimate, TdcCover, TdcLight
from .entities import TdcBinarySensor, TdcEntity, TdcEvent, TdcSensor, TdcSwitch

_ENTITY_CLASSES: dict[str, Any] = {
    "binary_sensor": TdcBinarySensor,
    "switch": TdcSwitch,
    "event": TdcEvent,
    "light": TdcLight,
    "cover": TdcCover,
    "sensor": TdcSensor,
    "climate": TdcClimate,
}


class EntityFactory:
    """Creates the Home Assistant entity, and its behaviour, for an entity definition."""

    def __init__(self, behaviours: BehaviourFactory, live: Live) -> None:
        """Keep the behaviour factory and the live registry the entities register in."""
        self._behaviours = behaviours
        self._live = live

    def create(self, device: DeviceDef, definition: EntityDef) -> TdcEntity:
        """Return the entity for `definition` of `device`."""
        behaviour = self._behaviours.create(device, definition)
        return _ENTITY_CLASSES[definition.platform](device, definition, behaviour, self._live)
