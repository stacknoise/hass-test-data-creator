"""Derives the entities of a copy from the entities of its source (concept 17.5)."""

from __future__ import annotations

from dataclasses import dataclass
import re
from typing import Any

from ..const import MAX_ENTITIES_PER_DEVICE
from ..model.models import EntityDef
from .mapper import FOLLOWABLE
from .registry import SourceState

SENSOR = "sensor"
MEASUREMENT = "measurement"
MIN_SPAN = 1.0
SPAN_SHARE = 0.2
_SLUG = re.compile(r"[^a-z0-9]+")


@dataclass(frozen=True)
class Derived:
    """One entity of the copy and the entity of the source that it follows."""

    entity: EntityDef
    source_entity_id: str


def _number(state: str | None) -> float | None:
    """Return the state as a number, or None if it is none."""
    try:
        return None if state is None else float(state)
    except ValueError:
        return None


def _signal(value: float | None) -> dict[str, Any]:
    """Return a curve around `value`; only its range counts, as the copy shows the source."""
    centre = value or 0.0
    span = max(abs(centre) * SPAN_SHARE, MIN_SPAN)
    return {"shape": "sine", "min": centre - span, "max": centre + span}


def _key(object_id: str, device_slug: str, taken: set[str]) -> str:
    """Return a free key from the object id of a source entity, without the device name in front."""
    key = _SLUG.sub("_", object_id.removeprefix(device_slug)).strip("_") or "value"
    unique, number = key, 2
    while unique in taken:
        unique, number = f"{key}_{number}", number + 1
    taken.add(unique)
    return unique


def _entity(item: SourceState, key: str) -> EntityDef | None:
    """Return the entity of the copy for one source entity, or None if it cannot be followed."""
    source = item.entity
    if source.platform not in FOLLOWABLE:
        return None
    base = {"key": key, "platform": source.platform, "name": item.name}
    if source.platform != SENSOR:
        return EntityDef(**base, device_class=source.device_class)
    value = _number(item.state)
    if value is None and item.online:
        return None
    return EntityDef(
        **base,
        device_class=source.device_class,
        unit=source.unit,
        state_class=MEASUREMENT if source.unit else None,
        signal=_signal(value),
    )


def derive(device_name: str, states: list[SourceState]) -> list[Derived]:
    """Return the entities a copy of the source gets: one per entity that can be followed.

    Sensors with a text state are left out, because a copy shows numbers. At most
    `MAX_ENTITIES_PER_DEVICE` entities are returned, in the order of the entity ids.
    """
    device_slug = _SLUG.sub("_", device_name.casefold()).strip("_") + "_"
    taken: set[str] = set()
    result: list[Derived] = []
    for item in sorted(states, key=lambda s: s.entity.entity_id):
        object_id = item.entity.entity_id.split(".", 1)[1]
        entity = _entity(item, _key(object_id, device_slug, taken))
        if entity is not None:
            result.append(Derived(entity, item.entity.entity_id))
    return result[:MAX_ENTITIES_PER_DEVICE]
