"""Runs an action on one entity of a generated device (concept 6)."""

from __future__ import annotations

from typing import Any

from ..audit.factory import AuditEntryFactory
from ..audit.log import AuditLog
from ..core.errors import ErrorCode, ScheduleError, TdcError
from ..core.keys import KEY_DEVICE, KEY_RUN, KEY_TEMPLATE
from ..core.targets import device_references
from ..engine.behaviours import Live
from ..model.models import DeviceDef
from ..store.store import TdcStore
from .actions import ActionFactory


class ActionRunner:
    """Finds the live entity for an action and runs it."""

    def __init__(
        self,
        store: TdcStore,
        live: Live,
        actions: ActionFactory,
        audit: AuditLog,
        audit_factory: AuditEntryFactory,
    ) -> None:
        """Keep the collaborators."""
        self._store = store
        self._live = live
        self._actions = actions
        self._audit = audit
        self._audit_factory = audit_factory

    def actions(self) -> dict[str, list[str]]:
        """Return the available action names per platform."""
        return self._actions.names()

    def devices_for(self, target: dict[str, Any]) -> list[DeviceDef]:
        """Return the devices a target selects: a device, a template, a run or all."""
        devices = self._store.devices()
        if "all" in target:
            return devices
        if KEY_DEVICE in target:
            wanted = device_references(target[KEY_DEVICE])
            return [d for d in devices if d.id in wanted or d.name in wanted]
        if KEY_TEMPLATE in target:
            return [d for d in devices if d.template == target[KEY_TEMPLATE]]
        return [d for d in devices if d.run_id == target.get(KEY_RUN)]

    async def async_run_on(
        self,
        devices: list[DeviceDef],
        key: str,
        action: str,
        params: dict[str, Any],
        label: str,
    ) -> None:
        """Run `action` on entity `key` (all that fit if empty) of every device; a failure is logged."""
        for device in devices:
            try:
                await self._run_device(device.id, device.id, key, action, params)
            except TdcError as error:
                self._audit.record(
                    self._audit_factory.schedule_failed(label, device.name, error.code.value)
                )

    def find_device_id(self, reference: str) -> str:
        """Return the id of the device whose id or name is `reference`."""
        device_id = self._store.device_id_of(reference)
        if device_id is None:
            raise ScheduleError(ErrorCode.SCH_TARGET_NOT_FOUND)
        return device_id

    async def async_run(
        self, reference: str, key: str, action: str, params: dict[str, Any] | None = None
    ) -> None:
        """Run `action` on entity `key` of the device `reference` (id or name).

        An empty `key` means every entity of the device that can do the action; TDC-SCH-001 is
        raised if there is none.
        """
        await self._run_device(self.find_device_id(reference), reference, key, action, params)

    async def _run_device(
        self,
        device_id: str,
        reference: str,
        key: str,
        action: str,
        params: dict[str, Any] | None,
    ) -> None:
        """Run `action` on the entities of the device `device_id`; `reference` is audited."""
        for entity in self._keys(device_id, key, action):
            behaviour = self._live.get((device_id, entity))
            if behaviour is None:
                raise ScheduleError(ErrorCode.SCH_TARGET_NOT_FOUND)
            await self._actions.create(behaviour.platform, action)(behaviour, params or {})
            self._audit.record(self._audit_factory.action_fired(reference, entity, action))

    def _keys(self, device_id: str, key: str, action: str) -> list[str]:
        """Return the keys of the entities that an action runs on: the one named, or all that fit."""
        if key:
            return [key]
        device = self._store.device(device_id)
        keys = [
            item.key
            for item in (device.entities if device else [])
            if self._actions.supports(item.platform, action)
        ]
        if not keys:
            raise ScheduleError(ErrorCode.SCH_UNKNOWN_ACTION)
        return keys
