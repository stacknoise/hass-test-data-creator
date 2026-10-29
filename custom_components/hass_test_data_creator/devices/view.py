"""What the panel shows of devices: pages with live states, one device in full, and light name lists."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er

from ..core.errors import ErrorCode, ScheduleError
from ..core.identifiers import entity_id_of
from ..core.keys import (
    KEY_AREA,
    KEY_DEVICES,
    KEY_ENTITIES,
    KEY_ID,
    KEY_MODEL,
    KEY_NAME,
    KEY_OUTPUT,
    KEY_PLATFORM,
    KEY_RUN_ID,
    KEY_SHAPE,
    KEY_SIGNAL,
    KEY_STATE,
    KEY_STATE_CLASS,
    KEY_TEMPLATE,
    KEY_UNIT,
)
from ..engine.behaviours import Live
from ..model.models import DeviceDef, EntityDef
from ..store.store import TdcStore
from .usage import DeviceUsage, UsageIndex


class DeviceView:
    """Builds the replies of the device commands from the store, the registry and the states."""

    def __init__(
        self, hass: HomeAssistant, store: TdcStore, usage: DeviceUsage, live: Live
    ) -> None:
        """Keep the collaborators."""
        self._hass = hass
        self._store = store
        self._usage = usage
        self._live = live

    def page(self, offset: int, limit: int) -> dict[str, Any]:
        """Return `limit` devices from `offset` with the state of their entities and their users."""
        devices = self._store.devices()
        index = self._usage.index()
        return {
            "total": len(devices),
            KEY_DEVICES: [
                self._device(device, index, with_signal=False)
                for device in devices[offset : offset + limit]
            ],
        }

    def one(self, device_id: str) -> dict[str, Any]:
        """Return one device in full, including the signal of each entity."""
        device = self._store.device(device_id)
        if device is None:
            raise ScheduleError(ErrorCode.SCH_TARGET_NOT_FOUND)
        return self._device(device, self._usage.index(), with_signal=True)

    def names(self) -> list[dict[str, Any]]:
        """Return what pickers and run lists need of every device, without its entities."""
        return [
            {
                KEY_ID: device.id,
                KEY_NAME: device.name,
                KEY_TEMPLATE: device.template,
                KEY_MODEL: device.model,
                KEY_OUTPUT: device.output,
                KEY_RUN_ID: device.run_id,
                "created_at": device.created_at,
            }
            for device in self._store.devices()
        ]

    def _device(self, device: DeviceDef, index: UsageIndex, *, with_signal: bool) -> dict[str, Any]:
        """Return the reply for one device."""
        registry = er.async_get(self._hass)
        return {
            KEY_ID: device.id,
            KEY_NAME: device.name,
            KEY_TEMPLATE: device.template,
            KEY_MODEL: device.model,
            KEY_AREA: device.area,
            KEY_OUTPUT: device.output,
            KEY_RUN_ID: device.run_id,
            "created_at": device.created_at,
            KEY_ENTITIES: [
                self._entity(registry, device, definition, with_signal=with_signal)
                for definition in device.entities
            ],
            "used_by": index.of(device),
        }

    def _entity(
        self,
        registry: er.EntityRegistry,
        device: DeviceDef,
        definition: EntityDef,
        *,
        with_signal: bool,
    ) -> dict[str, Any]:
        """Return key, entity id and current state of one entity; the signal only when asked."""
        entity_id = entity_id_of(registry, device, definition)
        state = self._hass.states.get(entity_id) if entity_id else None
        reply = {
            "key": definition.key,
            KEY_NAME: definition.name,
            KEY_PLATFORM: definition.platform,
            "entity_id": entity_id,
            KEY_STATE: state.state if state else None,
            KEY_UNIT: definition.unit,
            KEY_STATE_CLASS: definition.state_class,
            KEY_SHAPE: (definition.signal or {}).get(KEY_SHAPE),
            "fault": getattr(self._live.get((device.id, definition.key)), "fault_kind", None),
        }
        if with_signal:
            reply[KEY_SIGNAL] = definition.signal
        return reply
