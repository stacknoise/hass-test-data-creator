"""The binding of one entity of a copy to its source entity, and the factory that builds it."""

from __future__ import annotations

from collections import deque
from collections.abc import Callable
from typing import Any

from homeassistant.core import State

from ..core.errors import ErrorCode, SourceError
from ..core.protocols import SourceFollowing
from ..engine.behaviour_factory import entity_seed
from ..model.models import DeviceDef, EntityDef
from .deviation import Deviation, bucket_of, deviate, is_dropout, lag_of
from .follower import SourceFollower
from .mapper import FOLLOWABLE, SourceEntity, compatible, same_kind
from .registry import SourceRegistry
from .units import converter

OFFLINE_STATES = ("unavailable", "unknown")
TEXT_STATES = ("on", "off")
HISTORY_LENGTH = 32
DEFAULT_INTERVAL_S = 60.0


class SourceBinding:
    """Gives one entity of a copy the value of its source entity, with the deviation of its seed."""

    def __init__(
        self,
        entity_id: str,
        target: EntityDef,
        seed: int,
        deviation: Deviation,
        states: Callable[[str], State | None],
        follower: SourceFollower,
        clock: Callable[[], float],
    ) -> None:
        """Keep the parts and read the first value of the source."""
        self.entity_id = entity_id
        self._target = target
        self._seed = seed
        self._deviation = deviation
        self._states = states
        self._follower = follower
        self._clock = clock
        self._interval = self._interval_of(target)
        self._span = self._span_of(target)
        self._lag = lag_of(seed, deviation)
        self._history: deque[tuple[float, float | str]] = deque(maxlen=HISTORY_LENGTH)
        self._held: float | str | None = None
        self._listener: Callable[[], None] | None = None
        self.observe()
        follower.attach(self)

    def raw(self) -> float | str | None:
        """Return the newest value of the source in the unit of the entity, without deviation."""
        return self._history[-1][1] if self._history else None

    def reseed(self, seed: int) -> None:
        """Deviate with another seed from now on; the value is drawn again."""
        self._seed = seed
        self._lag = lag_of(seed, self._deviation)
        self._held = None
        self.notify()

    def online(self) -> bool:
        """Whether the source entity exists and has a usable state."""
        state = self._states(self.entity_id)
        return state is not None and state.state not in OFFLINE_STATES

    def listen(self, listener: Callable[[], None]) -> None:
        """Call `listener` when the source changes."""
        self._listener = listener

    def release(self) -> None:
        """Stop following the source."""
        self._follower.detach(self)
        self._listener = None

    def notify(self) -> None:
        """Tell the listener that the source changed."""
        if self._listener is not None:
            self._listener()

    def observe(self) -> None:
        """Remember the current state of the source, converted to the unit of the entity."""
        state = self._states(self.entity_id)
        if state is None or state.state in OFFLINE_STATES:
            return
        value = self._convert(state)
        if value is not None:
            self._history.append((self._clock(), value))

    def value(self, now: float) -> float | str | None:
        """Return the value of the copy at `now`: the lagged source value with the deviation."""
        raw = self._lagged(now)
        if raw is None or isinstance(raw, str):
            return raw
        bucket = bucket_of(now, self._interval)
        if self._held is not None and is_dropout(self._seed, bucket, self._deviation):
            return self._held
        self._held = deviate(raw, self._seed, bucket, self._deviation, self._span)
        return self._held

    def _lagged(self, now: float) -> float | str | None:
        """Return the newest remembered source value that is at least `lag` seconds old."""
        if not self._history:
            return None
        wanted = now - self._lag
        older = [value for at, value in self._history if at <= wanted]
        return older[-1] if older else self._history[0][1]

    def _convert(self, state: State) -> float | str | None:
        """Return the state as a number in the unit of the entity, `on`/`off` as text, or None."""
        if self._target.platform != "sensor":
            return state.state if state.state in TEXT_STATES else None
        try:
            number = float(state.state)
        except ValueError:
            return None
        convert = converter(
            self._target.device_class,
            state.attributes.get("unit_of_measurement"),
            self._target.unit,
        )
        return None if convert is None else convert(number)

    @staticmethod
    def _interval_of(target: EntityDef) -> float:
        """Return the update interval of the entity in seconds."""
        interval = (target.signal or {}).get("interval_s")
        return (
            float(interval)
            if isinstance(interval, int | float) and interval > 0
            else DEFAULT_INTERVAL_S
        )

    @staticmethod
    def _span_of(target: EntityDef) -> float:
        """Return the range of the entity (max - min of its curve), 0 if it has none."""
        signal = target.signal or {}
        low, high = signal.get("min"), signal.get("max")
        both = isinstance(low, int | float) and isinstance(high, int | float)
        return float(high - low) if both else 0.0


class SourceBindingFactory:
    """Builds the bindings of the copies and checks the source of a job before it runs."""

    def __init__(
        self,
        follower: SourceFollower,
        states: Callable[[str], State | None],
        registry: SourceRegistry,
    ) -> None:
        """Keep the follower, the state reader and the access to the registries."""
        self._follower = follower
        self._states = states
        self._registry = registry

    def bind(self, device: DeviceDef, definition: EntityDef, behaviour: SourceFollowing) -> None:
        """Connect `behaviour` to its source entity if the device has a source that maps its key."""
        source = device.source
        entity_id = (source or {}).get("mapping", {}).get(definition.key)
        if not source or not entity_id or definition.platform not in FOLLOWABLE:
            return
        seed = source.get("seeds", {}).get(definition.key)
        if seed is None:
            seed = entity_seed(device.seed, definition.key)
        binding = SourceBinding(
            entity_id,
            definition,
            seed,
            Deviation.from_dict(source.get("deviation")),
            self._states,
            self._follower,
            behaviour.now,
        )
        behaviour.bind_source(binding)

    def find(self, name: str) -> str | None:
        """Return the id of the one real device called `name`, or None if there is none."""
        return self._registry.find_by_name(name)

    def name_of(self, device_id: str) -> str:
        """Return the name of the source device."""
        entry = self._registry.device(device_id)
        return entry.name_by_user or entry.name or ""

    def check(self, source: dict[str, Any] | None, entities: list[EntityDef]) -> None:
        """Raise a source error unless the source exists, is not generated and the mapping fits."""
        if not source:
            return
        self._registry.device(source["device_id"])
        owned = {
            item.entity.entity_id: item.entity
            for item in self._registry.entities(source["device_id"])
        }
        wanted = {entity.key: entity for entity in entities}
        for key, entity_id in source.get("mapping", {}).items():
            origin: SourceEntity | None = owned.get(entity_id)
            target = wanted.get(key)
            if origin is None or target is None or not same_kind(target, origin):
                raise SourceError(ErrorCode.SRC_MAPPING)
            if not compatible(target, origin):
                raise SourceError(ErrorCode.SRC_UNIT)
