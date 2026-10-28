"""Factory that creates the behaviour per platform (concept 13.2)."""

from __future__ import annotations

import hashlib

from homeassistant.util import dt as dt_util

from ..model.models import DeviceDef, EntityDef
from .behaviours import (
    Behaviour,
    BinarySensorBehaviour,
    ClimateBehaviour,
    CoverBehaviour,
    EventBehaviour,
    LightBehaviour,
    OnOffBehaviour,
    Scheduler,
    SensorBehaviour,
)
from .signal_factory import SignalFactory

_SIMPLE: dict[str, type[Behaviour]] = {
    "binary_sensor": BinarySensorBehaviour,
    "switch": OnOffBehaviour,
    "event": EventBehaviour,
    "light": LightBehaviour,
    "cover": CoverBehaviour,
}
_WITH_SIGNAL: dict[str, type[SensorBehaviour] | type[ClimateBehaviour]] = {
    "sensor": SensorBehaviour,
    "climate": ClimateBehaviour,
}


def entity_seed(device_seed: int, key: str) -> int:
    """Return the seed of one entity from the seed of its device and its key."""
    digest = hashlib.sha256(f"{device_seed}:{key}".encode()).digest()
    return int.from_bytes(digest[:4], "big")


class BehaviourFactory:
    """Creates the behaviour for an entity definition."""

    def __init__(self, signals: SignalFactory, scheduler: Scheduler) -> None:
        """Keep the signal factory and the scheduler the behaviours use."""
        self._signals = signals
        self._scheduler = scheduler

    def create(self, device: DeviceDef, definition: EntityDef) -> Behaviour:
        """Return the behaviour for `definition` of `device`."""
        if definition.platform in _WITH_SIGNAL:
            seed = entity_seed(device.seed, definition.key)
            origin = self._scheduler.at(dt_util.utc_from_timestamp(device.created_at))
            signal = self._signals.create(definition.signal or {}, seed, origin)
            return _WITH_SIGNAL[definition.platform](device.id, definition, self._scheduler, signal)
        return _SIMPLE[definition.platform](device.id, definition, self._scheduler)
