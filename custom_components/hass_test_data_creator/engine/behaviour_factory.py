"""Factory that creates the behaviour per platform (concept 13.2)."""

from __future__ import annotations

import hashlib

from homeassistant.util import dt as dt_util

from ..core.keys import (
    KEY_BINARY_SENSOR,
    KEY_CLIMATE,
    KEY_COVER,
    KEY_EVENT,
    KEY_LIGHT,
    KEY_SENSOR,
    KEY_SWITCH,
)
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
from .signal_factory import Signal, SignalFactory

SEED_BYTES = 4
_SIMPLE: dict[str, type[Behaviour]] = {
    KEY_BINARY_SENSOR: BinarySensorBehaviour,
    KEY_SWITCH: OnOffBehaviour,
    KEY_EVENT: EventBehaviour,
    KEY_LIGHT: LightBehaviour,
    KEY_COVER: CoverBehaviour,
}
_WITH_SIGNAL: dict[str, type[SensorBehaviour] | type[ClimateBehaviour]] = {
    KEY_SENSOR: SensorBehaviour,
    KEY_CLIMATE: ClimateBehaviour,
}


def entity_seed(device_seed: int, key: str) -> int:
    """Return the seed of one entity from the seed of its device and its key."""
    digest = hashlib.sha256(f"{device_seed}:{key}".encode()).digest()
    return int.from_bytes(digest[:SEED_BYTES], "big")


class BehaviourFactory:
    """Creates the behaviour for an entity definition."""

    def __init__(self, signals: SignalFactory, scheduler: Scheduler) -> None:
        """Keep the signal factory and the scheduler the behaviours use."""
        self._signals = signals
        self._scheduler = scheduler

    def signal_for(self, device: DeviceDef, definition: EntityDef) -> Signal:
        """Return the signal of `definition` of `device`, with the seed and origin of the entity."""
        seed = entity_seed(device.seed, definition.key)
        origin = self._scheduler.at(dt_util.utc_from_timestamp(device.created_at))
        return self._signals.create(definition.signal or {}, seed, origin)

    def create(self, device: DeviceDef, definition: EntityDef) -> Behaviour:
        """Return the behaviour for `definition` of `device`."""
        if definition.platform in _WITH_SIGNAL:
            signal = self.signal_for(device, definition)
            behaviour: Behaviour = _WITH_SIGNAL[definition.platform](
                device.id, definition, self._scheduler, signal
            )
        else:
            behaviour = _SIMPLE[definition.platform](device.id, definition, self._scheduler)
        behaviour.paused = device.paused
        return behaviour
