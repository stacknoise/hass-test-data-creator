"""Mapping of the entities of a copy to the entities of its source (concept 17.5)."""

from __future__ import annotations

from dataclasses import dataclass, field

from ..model.models import EntityDef
from .units import converter

REASON_NONE = "none"
REASON_AMBIGUOUS = "ambiguous"
REASON_UNIT = "unit"


@dataclass(frozen=True)
class SourceEntity:
    """One entity of the source device, as far as the mapping needs it."""

    entity_id: str
    platform: str
    device_class: str | None = None
    unit: str | None = None


@dataclass(frozen=True)
class Proposal:
    """The result for one entity of the copy: the chosen source entity, or why there is none."""

    key: str
    entity_id: str | None = None
    reason: str | None = None
    candidates: list[str] = field(default_factory=list)


def compatible(target: EntityDef, source: SourceEntity) -> bool:
    """Return True if `source` can feed `target`: same platform, same device class, units convert."""
    if target.platform != source.platform or target.device_class != source.device_class:
        return False
    return converter(target.device_class, source.unit, target.unit) is not None


def propose(entities: list[EntityDef], sources: list[SourceEntity]) -> list[Proposal]:
    """Return one proposal per entity: a unique match is taken, the rest says why not.

    A source entity feeds at most one entity of the copy, so two sensors never share one.
    """
    taken: set[str] = set()
    result: list[Proposal] = []
    for target in entities:
        same = [s for s in sources if s.platform == target.platform and s.entity_id not in taken]
        fitting = [s.entity_id for s in same if compatible(target, s)]
        if len(fitting) == 1:
            taken.add(fitting[0])
            result.append(Proposal(target.key, entity_id=fitting[0]))
        elif fitting:
            result.append(Proposal(target.key, reason=REASON_AMBIGUOUS, candidates=fitting))
        else:
            reason = REASON_UNIT if _only_unit_differs(target, same) else REASON_NONE
            result.append(Proposal(target.key, reason=reason))
    return result


def _only_unit_differs(target: EntityDef, same_platform: list[SourceEntity]) -> bool:
    """Return True if a source entity has the right class but a unit that cannot be converted."""
    return any(s.device_class == target.device_class for s in same_platform)
