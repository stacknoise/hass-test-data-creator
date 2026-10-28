"""Changes the curve of a sensor of a generated device (concept 5)."""

from __future__ import annotations

from typing import Any

from ..audit.factory import AuditEntryFactory
from ..audit.log import AuditLog
from ..core.errors import ErrorCode, ScheduleError, TemplateError
from ..engine.behaviour_factory import BehaviourFactory
from ..engine.behaviours import ClimateBehaviour, Live, SensorBehaviour
from ..engine.signals import DISCRETE_SHAPES
from ..model.models import EntityDef
from ..store.store import TdcStore

SIGNAL_PLATFORMS = ("sensor", "climate")


class SignalEditor:
    """Replaces the signal of a stored entity and of its live behaviour."""

    def __init__(
        self,
        store: TdcStore,
        live: Live,
        behaviours: BehaviourFactory,
        audit: AuditLog,
        audit_factory: AuditEntryFactory,
    ) -> None:
        """Keep the collaborators."""
        self._store = store
        self._live = live
        self._behaviours = behaviours
        self._audit = audit
        self._audit_factory = audit_factory

    async def async_set(self, device_id: str, key: str, signal: dict[str, Any]) -> EntityDef:
        """Give entity `key` of the device the numeric signal `signal`; return the entity.

        A sensor with states keeps them, and a number signal cannot become states, because the
        outputs describe the entity by its kind of value. A wrong signal raises its TDC-SIG error
        and leaves everything as it was.
        """
        device = self._store.device(device_id)
        definition = next(
            (item for item in (device.entities if device else []) if item.key == key), None
        )
        if device is None or definition is None or definition.platform not in SIGNAL_PLATFORMS:
            raise ScheduleError(ErrorCode.SCH_TARGET_NOT_FOUND)
        if (definition.signal or {}).get("shape") in DISCRETE_SHAPES or (
            signal.get("shape") in DISCRETE_SHAPES
        ):
            raise TemplateError(ErrorCode.TPL_INVALID, file=f"{key}: signal")
        changed = EntityDef(**{**definition.to_dict(), "signal": signal})
        new_signal = self._behaviours.signal_for(device, changed)
        definition.signal = signal
        self._store.add_device(device)
        behaviour = self._live.get((device.id, key))
        if isinstance(behaviour, SensorBehaviour | ClimateBehaviour):
            behaviour.replace_signal(new_signal)
        await self._store.async_save()
        self._audit.record(self._audit_factory.signal_changed(device.name, key, signal["shape"]))
        return definition
