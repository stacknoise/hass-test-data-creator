"""What the panel shows of devices: pages with live states, one device in full, and light name lists."""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er

from ..core.errors import ErrorCode, ScheduleError
from ..core.keys import (
    KEY_AREA,
    KEY_DEVICES,
    KEY_ENTITIES,
    KEY_ID,
    KEY_LABEL,
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
from ..model.identifiers import entity_id_of
from ..model.models import DeviceDef, EntityDef
from ..store.store import TdcStore
from .filters import DeviceFilter, FilterContext, facets, filter_and_sort
from .usage import DeviceUsage, UsageIndex


class DeviceView:
    """Builds the replies of the device commands from the store, the registry and the states."""

    def __init__(
        self,
        hass: HomeAssistant,
        store: TdcStore,
        usage: DeviceUsage,
        live: Live,
        bundled_ids: Callable[[], frozenset[str]],
    ) -> None:
        """Keep the collaborators."""
        self._hass = hass
        self._store = store
        self._usage = usage
        self._live = live
        self._bundled_ids = bundled_ids

    def page(
        self, offset: int, limit: int, flt: DeviceFilter | None = None, *, with_facets: bool = False
    ) -> dict[str, Any]:
        """Return `limit` of the devices that pass `flt` from `offset`, with states and users.

        `total` counts all devices, `matched` those that pass the filter; `facets` is added on request.
        """
        flt = flt or DeviceFilter()
        devices = self._store.devices()
        index = self._usage.index()
        context = FilterContext(index, self._has_fault, self._bundled_ids())
        found = filter_and_sort(devices, flt, context)
        reply: dict[str, Any] = {
            "total": len(devices),
            "matched": len(found),
            KEY_DEVICES: [
                self._device(device, index, with_signal=False)
                for device in found[offset : offset + limit]
            ],
        }
        if with_facets:
            reply["facets"] = self._facets(devices, flt, context)
        return reply

    def _has_fault(self, device: DeviceDef) -> bool:
        """Whether an entity of `device` has an active fault."""
        return any(
            getattr(self._live.get((device.id, item.key)), "fault_kind", None)
            for item in device.entities
        )

    def _facets(
        self, devices: list[DeviceDef], flt: DeviceFilter, context: FilterContext
    ) -> dict[str, list[dict[str, Any]]]:
        """Return the facets, with the label of each run next to its id."""
        reply = facets(devices, flt, context)
        labels = {run.id: run.label for run in self._store.runs()}
        for item in reply["runs"]:
            item[KEY_LABEL] = labels.get(item["value"], "")
        return reply

    def one(self, device_id: str) -> dict[str, Any]:
        """Return one device in full, including the signal of each entity."""
        device = self._store.device(device_id)
        if device is None:
            raise ScheduleError(ErrorCode.SCH_TARGET_NOT_FOUND)
        return self._device(device, self._usage.index(), with_signal=True)

    def names(self) -> list[dict[str, Any]]:
        """Return what pickers and run lists need of every device: entities with key, name, platform."""
        return [
            {
                KEY_ID: device.id,
                KEY_NAME: device.name,
                KEY_TEMPLATE: device.template,
                KEY_MODEL: device.model,
                KEY_OUTPUT: device.output,
                KEY_RUN_ID: device.run_id,
                "created_at": device.created_at,
                KEY_ENTITIES: [
                    {
                        "key": item.key,
                        KEY_NAME: item.name,
                        KEY_PLATFORM: item.platform,
                        KEY_STATE_CLASS: item.state_class,
                        KEY_SHAPE: (item.signal or {}).get(KEY_SHAPE),
                    }
                    for item in device.entities
                ],
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
