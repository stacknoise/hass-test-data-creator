"""Data classes of devices, entities and creation runs (concept 4.1)."""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any


@dataclass
class EntityDef:
    """Definition of one entity of a device."""

    key: str
    platform: str
    name: str
    device_class: str | None = None
    unit: str | None = None
    state_class: str | None = None
    entity_category: str | None = None
    signal: dict[str, Any] | None = None
    event_types: list[str] | None = None
    initial_on: bool = False
    pulse_s: int | None = None

    def to_dict(self) -> dict[str, Any]:
        """Return the JSON-serialisable form."""
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> EntityDef:
        """Return the entity definition stored in `data`."""
        return cls(**data)


@dataclass
class DeviceDef:
    """One generated device with its entities."""

    id: str
    name: str
    template: str
    model: str
    output: str
    run_id: str
    seed: int
    created_at: float
    area: str | None = None
    entities: list[EntityDef] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        """Return the JSON-serialisable form."""
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> DeviceDef:
        """Return the device stored in `data`."""
        entities = [EntityDef.from_dict(item) for item in data.get("entities", [])]
        return cls(**{**data, "entities": entities})


@dataclass
class RunRecord:
    """One creation job; the unit of removal besides device and template."""

    id: str
    label: str
    created_at: float
    seed: str
    device_ids: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        """Return the JSON-serialisable form."""
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> RunRecord:
        """Return the run stored in `data`."""
        return cls(**data)


@dataclass
class ScheduleDef:
    """An action that runs on devices at times given by a trigger (concept 6)."""

    id: str
    name: str
    target: dict[str, Any]
    entity: str
    action: str
    trigger: dict[str, Any]
    seed: str
    created_at: float
    params: dict[str, Any] = field(default_factory=dict)
    enabled: bool = True
    scenario: str | None = None

    def to_dict(self) -> dict[str, Any]:
        """Return the JSON-serialisable form."""
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> ScheduleDef:
        """Return the schedule stored in `data`."""
        return cls(**data)


@dataclass
class ScenarioDef:
    """A named list of steps; each step runs an action `after_s` seconds after the step before."""

    id: str
    name: str
    steps: list[dict[str, Any]]
    created_at: float

    def to_dict(self) -> dict[str, Any]:
        """Return the JSON-serialisable form."""
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> ScenarioDef:
        """Return the scenario stored in `data`."""
        return cls(**data)
