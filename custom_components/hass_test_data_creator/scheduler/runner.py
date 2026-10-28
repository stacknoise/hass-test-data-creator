"""Runs an action on one entity of a generated device (concept 6)."""

from __future__ import annotations

from typing import Any

from ..audit.factory import AuditEntryFactory
from ..audit.log import AuditLog
from ..core.errors import ErrorCode, ScheduleError, TdcError
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
        if "device" in target:
            return [d for d in devices if target["device"] in (d.id, d.name)]
        if "template" in target:
            return [d for d in devices if d.template == target["template"]]
        return [d for d in devices if d.run_id == target.get("run")]

    async def async_run_on(
        self,
        devices: list[DeviceDef],
        key: str,
        action: str,
        params: dict[str, Any],
        label: str,
    ) -> None:
        """Run `action` on entity `key` of every device; a failure is logged and the rest goes on."""
        for device in devices:
            try:
                await self.async_run(device.id, key, action, params)
            except TdcError as error:
                self._audit.record(
                    self._audit_factory.schedule_failed(label, device.name, error.code.value)
                )

    def find_device_id(self, reference: str) -> str:
        """Return the id of the device whose id or name is `reference`."""
        for device in self._store.devices():
            if reference in (device.id, device.name):
                return device.id
        raise ScheduleError(ErrorCode.SCH_TARGET_NOT_FOUND)

    async def async_run(
        self, reference: str, key: str, action: str, params: dict[str, Any] | None = None
    ) -> None:
        """Run `action` on entity `key` of the device `reference` (id or name)."""
        device_id = self.find_device_id(reference)
        behaviour = self._live.get((device_id, key))
        if behaviour is None:
            raise ScheduleError(ErrorCode.SCH_TARGET_NOT_FOUND)
        await self._actions.create(behaviour.platform, action)(behaviour, params or {})
        self._audit.record(self._audit_factory.action_fired(reference, key, action))
