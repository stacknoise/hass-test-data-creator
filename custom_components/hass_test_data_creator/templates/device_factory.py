"""Factory that creates the devices of one creation job (concept 13.2)."""

from __future__ import annotations

import copy
import zlib

from ..core.errors import ErrorCode, GenerationError
from ..core.ids import new_id
from ..model.models import DeviceDef
from .factory import Template


def format_name(pattern: str, index: int, template: Template) -> str:
    """Return the device name: `{n}`, `{nn}` (two digits) and `{template}` are replaced."""
    name = (
        pattern.replace("{nn}", f"{index:02d}")
        .replace("{n}", str(index))
        .replace("{template}", template.name)
    )
    if "{" in name or "}" in name or not name.strip():
        raise GenerationError(ErrorCode.GEN_NAME_PATTERN)
    return name.strip()


def device_seed(seed_text: str, template_id: str, index: int) -> int:
    """Return the seed of one device; the same text, template and index give the same seed."""
    return zlib.crc32(f"{seed_text}:{template_id}:{index}".encode())


class DeviceFactory:
    """Creates device descriptions from a template and the inputs of a job."""

    def create(
        self,
        template: Template,
        *,
        name_pattern: str,
        first_index: int,
        areas: list[str | None],
        seed_text: str,
        run_id: str,
        output: str,
        now: float,
    ) -> list[DeviceDef]:
        """Return one device per entry of `areas`, numbered from `first_index`."""
        devices: list[DeviceDef] = []
        for offset, area in enumerate(areas):
            index = first_index + offset
            devices.append(
                DeviceDef(
                    id=new_id(),
                    name=format_name(name_pattern, index, template),
                    template=template.id,
                    model=template.model,
                    output=output,
                    run_id=run_id,
                    seed=device_seed(seed_text, template.id, index),
                    created_at=now,
                    area=area,
                    entities=copy.deepcopy(template.entities),
                )
            )
        return devices
