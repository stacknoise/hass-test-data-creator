"""Pauses and resumes generated devices (concept 16.7)."""

from __future__ import annotations

import asyncio
from dataclasses import replace

from ..audit.factory import AuditEntryFactory
from ..audit.log import AuditLog
from ..const import CHUNK_SIZE
from ..engine.behaviours import Live
from ..store.store import TdcStore


class DevicePauser:
    """Sets the paused flag of devices in the store and in their live entities."""

    def __init__(
        self, store: TdcStore, live: Live, audit: AuditLog, audit_factory: AuditEntryFactory
    ) -> None:
        """Keep the collaborators."""
        self._store = store
        self._live = live
        self._audit = audit
        self._audit_factory = audit_factory

    async def async_set(self, device_ids: list[str], paused: bool) -> int:
        """Pause or resume the devices; return how many changed (unknown and unchanged ones are skipped).

        The devices go in chunks and the store is saved once; one audit entry covers the batch.
        """
        stored = [
            item
            for item in map(self._store.device, device_ids)
            if item is not None and item.paused != paused
        ]
        for start in range(0, len(stored), CHUNK_SIZE):
            for device in stored[start : start + CHUNK_SIZE]:
                self._store.add_device(replace(device, paused=paused))
                for definition in device.entities:
                    behaviour = self._live.get((device.id, definition.key))
                    if behaviour is not None:
                        behaviour.set_paused(paused)
            await asyncio.sleep(0)
        await self._store.async_save()
        kind = "pause" if paused else "resume"
        self._audit.record(self._audit_factory.bulk_done(kind, len(stored), 0))
        return len(stored)
