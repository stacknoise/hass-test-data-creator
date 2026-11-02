"""The answer "keep them offline" to the question about a removed source (concept 17.3)."""

from __future__ import annotations

from dataclasses import replace

from ..audit.factory import AuditEntryFactory
from ..audit.log import AuditLog
from ..model.models import DeviceDef
from ..store.store import TdcStore

KIND_KEPT = "source_kept"


class SourceDecision:
    """Remembers that the user decided to keep the copies of a removed source, so nobody asks again."""

    def __init__(self, store: TdcStore, audit: AuditLog, audit_factory: AuditEntryFactory) -> None:
        """Keep the collaborators."""
        self._store = store
        self._audit = audit
        self._audit_factory = audit_factory

    async def keep(self, devices: list[DeviceDef]) -> int:
        """Mark the sources of `devices` as decided; the copies stay offline. Return how many changed."""
        changed = 0
        for device in devices:
            if device.source and not device.source.get("dismissed"):
                self._store.add_device(replace(device, source={**device.source, "dismissed": True}))
                changed += 1
        await self._store.async_save()
        self._audit.record(self._audit_factory.bulk_done(KIND_KEPT, changed, 0))
        return changed
