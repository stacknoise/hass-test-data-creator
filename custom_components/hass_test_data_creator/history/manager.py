"""Imports hourly statistics for generated sensors and removes them again (concept 5.1, 10.3)."""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.util import dt as dt_util

from ..audit.factory import AuditEntryFactory
from ..audit.log import AuditLog
from ..const import HISTORY_CHUNK_ROWS, MAX_HISTORY_ROWS
from ..core.errors import ErrorCode, GenerationError, ScheduleError
from ..core.identifiers import entity_id_of
from ..core.keys import KEY_SENSOR
from ..core.targets import device_references
from ..model.models import DeviceDef, EntityDef
from ..store.store import TdcStore
from .factory import Series, SeriesFactory
from .recorder import StatisticsClient

Target = tuple[DeviceDef, EntityDef, str]


HOURS_PER_DAY = 24


def last_hours(days: int, now: datetime | None = None) -> list[datetime]:
    """Return the starts (UTC) of the `days` * 24 full hours before the current hour."""
    end = (now or dt_util.utcnow()).replace(minute=0, second=0, microsecond=0)
    return [end - timedelta(hours=count) for count in range(days * HOURS_PER_DAY, 0, -1)]


class HistoryManager:
    """Writes the statistics of generated sensors and clears them when they are removed."""

    def __init__(
        self,
        hass: HomeAssistant,
        store: TdcStore,
        client: StatisticsClient,
        series: SeriesFactory,
        audit: AuditLog,
        audit_factory: AuditEntryFactory,
    ) -> None:
        """Keep the collaborators."""
        self._hass = hass
        self._store = store
        self._client = client
        self._series = series
        self._audit = audit
        self._audit_factory = audit_factory

    async def async_import(
        self, days: int, device: str | list[str] | None = None, entity: str | None = None
    ) -> dict[str, Any]:
        """Write `days` of hourly statistics for the sensors with a state class and return counts.

        `device` (an id or name, or a list of them) and `entity` (key) narrow the sensors; the statistics of those
        hours that already exist are replaced.
        """
        self._client.check()
        hours = last_hours(days)
        targets, skipped = self._targets(device, entity)
        if len(targets) * len(hours) > MAX_HISTORY_ROWS:
            raise GenerationError(ErrorCode.GEN_HISTORY_LIMIT)
        size = max(1, HISTORY_CHUNK_ROWS // len(hours))
        for start in range(0, len(targets), size):
            chunk = targets[start : start + size]
            built = await self._hass.async_add_executor_job(self._build, chunk, hours)
            for (owner, _, entity_id), series in zip(chunk, built, strict=True):
                self._client.write(series.metadata, series.rows)
                self._store.add_statistic(entity_id, owner.id)
            await self._store.async_save()
        rows = len(targets) * len(hours)
        self._audit.record(self._audit_factory.history_imported(len(targets), rows))
        return {"series": len(targets), "rows": rows, "skipped": skipped}

    def check_clearable(self, statistic_ids: list[str]) -> None:
        """Raise TDC-CFG-003 if there are statistics to clear but no recorder."""
        if statistic_ids:
            self._client.check()

    def forget(self, statistic_ids: list[str]) -> None:
        """Clear the statistics `statistic_ids` in the recorder and forget them."""
        self._client.clear(statistic_ids)
        self._store.forget_statistics(statistic_ids)

    def _build(self, targets: list[Target], hours: list[datetime]) -> list[Series]:
        """Compute the series of all targets; runs in the executor."""
        return [
            self._series.create(owner, definition, entity_id, hours)
            for owner, definition, entity_id in targets
        ]

    def _targets(
        self, device: str | list[str] | None, entity: str | None
    ) -> tuple[list[Target], int]:
        """Return the sensors to import and the number of sensors that cannot be imported."""
        wanted = device_references(device)
        devices = [
            item
            for item in self._store.devices()
            if device is None or wanted & {item.id, item.name}
        ]
        if device is not None and not devices:
            raise ScheduleError(ErrorCode.SCH_TARGET_NOT_FOUND)
        registry = er.async_get(self._hass)
        targets: list[Target] = []
        skipped = 0
        for owner in devices:
            for definition in owner.entities:
                if definition.platform != KEY_SENSOR or entity not in (None, definition.key):
                    continue
                entity_id = entity_id_of(registry, owner, definition)
                if entity_id and self._series.supports(definition):
                    targets.append((owner, definition, entity_id))
                else:
                    skipped += 1
        if entity is not None and not targets and not skipped:
            raise ScheduleError(ErrorCode.SCH_TARGET_NOT_FOUND)
        return targets, skipped
