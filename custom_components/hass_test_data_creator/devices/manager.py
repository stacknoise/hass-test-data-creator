"""Creates devices for a creation job (concept 4.1, 12)."""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
import time
from typing import Any

from ..areas.assigner import AreaAssigner
from ..areas.distribution import MODE_EVEN, distribute
from ..audit.factory import AuditEntryFactory
from ..audit.log import AuditLog
from ..const import (
    CHUNK_SIZE,
    CUSTOM_TEMPLATE_ID,
    MAX_BATCH,
    MAX_DEVICES,
    MAX_ENTITIES_PER_DEVICE,
    OUTPUT_NATIVE,
)
from ..core.errors import ErrorCode, GenerationError, ScheduleError
from ..core.ids import new_id
from ..core.keys import KEY_AREAS
from ..model.models import DeviceDef, RunRecord
from ..outputs.adapter import OutputAdapterFactory
from ..store.store import TdcStore
from ..templates.device_factory import DeviceFactory, device_seed
from ..templates.factory import Template, TemplateFactory
from ..templates.registry import TemplateRegistry


@dataclass
class CreationJob:
    """The inputs of one creation job."""

    template: str
    count: int
    name_pattern: str
    seed: str
    areas: list[str] = field(default_factory=list)
    area_mode: str = MODE_EVEN
    label: str = ""
    output: str = OUTPUT_NATIVE
    entities: list[dict[str, Any]] | None = None


class DevicesManager:
    """Creates devices with their registry entries, areas and entities."""

    def __init__(
        self,
        store: TdcStore,
        templates: TemplateRegistry,
        template_factory: TemplateFactory,
        device_factory: DeviceFactory,
        outputs: OutputAdapterFactory,
        areas: AreaAssigner,
        audit: AuditLog,
        audit_factory: AuditEntryFactory,
    ) -> None:
        """Keep the collaborators."""
        self._store = store
        self._templates = templates
        self._template_factory = template_factory
        self._device_factory = device_factory
        self._outputs = outputs
        self._areas = areas
        self._audit = audit
        self._audit_factory = audit_factory

    async def async_set_area(self, device_id: str, area: str | None) -> DeviceDef:
        """Put the device into the area `area` (created if new), or into none; return the device."""
        device = self._store.device(device_id)
        if device is None:
            raise ScheduleError(ErrorCode.SCH_TARGET_NOT_FOUND)
        device.area = area or None
        self._store.add_device(device)
        self._areas.move(device, device.area)
        self._areas.delete_empty_created()
        await self._store.async_save()
        self._audit.record(self._audit_factory.device_moved(device.name, device.area))
        return device

    def _template_for(self, job: CreationJob) -> Template:
        """Return the template of `job`: a stored one, or one built from its custom entities."""
        if job.template == CUSTOM_TEMPLATE_ID:
            return self._template_factory.custom(job.entities or [])
        return self._templates.get(job.template)

    def _check_limits(self, job: CreationJob, template: Template) -> None:
        """Raise if the job exceeds a limit of concept 12."""
        if job.count > MAX_BATCH:
            raise GenerationError(ErrorCode.GEN_BATCH)
        if self._store.device_count() + job.count > MAX_DEVICES:
            raise GenerationError(ErrorCode.GEN_LIMIT)
        if len(template.entities) > MAX_ENTITIES_PER_DEVICE:
            raise GenerationError(ErrorCode.GEN_ENTITY_LIMIT)

    async def async_create(self, job: CreationJob) -> RunRecord:
        """Create the devices of `job` in chunks and return the run that holds them."""
        template = self._template_for(job)
        self._check_limits(job, template)
        adapter = self._outputs.create(job.output)
        now = time.time()
        first = self._store.next_index(template.id, job.count)
        names = distribute(
            job.areas, job.count, job.area_mode, device_seed(job.seed, KEY_AREAS, first)
        )
        run = RunRecord(new_id(), job.label or template.name, now, job.seed)
        devices = self._device_factory.create(
            template,
            name_pattern=job.name_pattern,
            first_index=first,
            areas=names,
            seed_text=job.seed,
            run_id=run.id,
            output=job.output,
            now=now,
        )
        try:
            for start in range(0, len(devices), CHUNK_SIZE):
                chunk = devices[start : start + CHUNK_SIZE]
                for device in chunk:
                    area_id = self._areas.ensure(device.area) if device.area else None
                    await adapter.create(device, area_id)
                    self._store.add_device(device)
                    run.device_ids.append(device.id)
                await adapter.announce(chunk)
                await asyncio.sleep(0)
        finally:
            if run.device_ids:
                self._store.add_run(run)
            await self._store.async_save()
        self._audit.record(
            self._audit_factory.devices_created(run.id, template.id, len(run.device_ids))
        )
        return run
