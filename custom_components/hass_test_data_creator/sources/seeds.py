"""The seed of a copy per sensor: the only thing of a copy that the user can change (concept 17.5)."""

from __future__ import annotations

from dataclasses import replace
import secrets
from typing import Any

from ..audit.factory import AuditEntryFactory
from ..audit.log import AuditLog
from ..core.errors import ErrorCode, SourceError
from ..engine.behaviours import Live
from ..model.models import DeviceDef
from ..store.store import TdcStore
from .binding import SourceBinding

MAX_SEED = 2**31 - 1
RANDOM_SEED = "random"


class SourceSeeds:
    """Stores the seed of single sensors of copies and gives it to the running bindings."""

    def __init__(
        self, store: TdcStore, live: Live, audit: AuditLog, audit_factory: AuditEntryFactory
    ) -> None:
        """Keep the collaborators."""
        self._store = store
        self._live = live
        self._audit = audit
        self._audit_factory = audit_factory

    async def async_set(self, device_ids: list[str], key: str | None, seed: int | str) -> int:
        """Set the seed of sensor `key` (all mapped sensors without it) of the devices.

        `seed` is a number or "random", which draws an own number for every sensor. Return the
        number of devices that changed. A device without a source raises TDC-SRC-006 and a
        sensor that follows nothing raises TDC-SRC-003; then nothing is changed.
        """
        devices = [self._copy(device_id) for device_id in device_ids]
        for device in devices:
            keys = self._keys(device, key)
            seeds = {
                **device.source.get("seeds", {}),
                **{item: self._draw(seed) for item in keys},
            }
            self._store.add_device(replace(device, source={**device.source, "seeds": seeds}))
            self._apply(device, keys, seeds)
            first = seeds[keys[0]]
            self._audit.record(self._audit_factory.seed_changed(device.name, key or "", first))
        await self._store.async_save()
        return len(devices)

    def _copy(self, device_id: str) -> DeviceDef:
        """Return the stored device, which must follow a source."""
        device = self._store.device(device_id)
        if device is None or not device.source:
            raise SourceError(ErrorCode.SRC_NOT_COPY)
        return device

    @staticmethod
    def _keys(device: DeviceDef, key: str | None) -> list[str]:
        """Return the sensors whose seed changes: `key` if it follows the source, else all that do."""
        mapped = list((device.source or {}).get("mapping", {}))
        if key is None and mapped:
            return mapped
        if key not in mapped:
            raise SourceError(ErrorCode.SRC_MAPPING)
        return [key]

    @staticmethod
    def _draw(seed: int | str) -> int:
        """Return `seed`, or a new number for "random"."""
        return secrets.randbelow(MAX_SEED + 1) if seed == RANDOM_SEED else int(seed)

    def _apply(self, device: DeviceDef, keys: list[str], seeds: dict[str, Any]) -> None:
        """Give the running bindings of the sensors their new seed."""
        for item in keys:
            binding = getattr(self._live.get((device.id, item)), "source", None)
            if isinstance(binding, SourceBinding):
                binding.reseed(seeds[item])
