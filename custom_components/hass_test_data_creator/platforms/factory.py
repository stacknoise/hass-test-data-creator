"""Factory that creates the entity class per platform (concept 13.2)."""

from __future__ import annotations

import hashlib

from homeassistant.util import dt as dt_util

from ..engine.signal_factory import SignalFactory
from ..engine.tick import signal_time
from ..model.models import DeviceDef, EntityDef
from .entities import Live, TdcBinarySensor, TdcEntity, TdcEvent, TdcSensor, TdcSwitch

_SIMPLE_PLATFORMS: dict[str, type[TdcEntity]] = {
    "binary_sensor": TdcBinarySensor,
    "switch": TdcSwitch,
    "event": TdcEvent,
}


def entity_seed(device_seed: int, key: str) -> int:
    """Return the seed of one entity from the seed of its device and its key."""
    digest = hashlib.sha256(f"{device_seed}:{key}".encode()).digest()
    return int.from_bytes(digest[:4], "big")


class EntityFactory:
    """Creates the Home Assistant entity for an entity definition."""

    def __init__(self, signals: SignalFactory, live: Live) -> None:
        """Keep the signal factory and the live registry the entities register in."""
        self._signals = signals
        self._live = live

    def create(self, device: DeviceDef, definition: EntityDef) -> TdcEntity:
        """Return the entity for `definition` of `device`."""
        if definition.platform == "sensor":
            seed = entity_seed(device.seed, definition.key)
            origin = signal_time(dt_util.as_local(dt_util.utc_from_timestamp(device.created_at)))
            signal = self._signals.create(definition.signal or {}, seed, origin)
            return TdcSensor(device, definition, self._live, signal)
        return _SIMPLE_PLATFORMS[definition.platform](device, definition, self._live)
