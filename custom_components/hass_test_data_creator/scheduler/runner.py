"""Runs an action on one entity of a generated device (concept 6)."""

from __future__ import annotations

from typing import Any

from ..audit.factory import AuditEntryFactory
from ..audit.log import AuditLog
from ..core.errors import ErrorCode, ScheduleError
from ..platforms.entities import Live
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
        entity = self._live.get((device_id, key))
        if entity is None:
            raise ScheduleError(ErrorCode.SCH_TARGET_NOT_FOUND)
        platform = entity.platform.domain
        await self._actions.create(platform, action)(entity, params or {})
        self._audit.record(self._audit_factory.action_fired(reference, key, action))
