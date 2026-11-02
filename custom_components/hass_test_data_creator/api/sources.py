"""Commands that read real devices for the source feature (concept 17.6)."""

from __future__ import annotations

from typing import Any

from homeassistant.components.websocket_api import ActiveConnection
from homeassistant.core import HomeAssistant

from ..const import CONF_SEED, DEFAULT_SEED, DOMAIN
from ..core.command import tdc_command
from ..core.errors import ErrorCode, SourceError
from ..data import get_data
from ..sources.deviation import Deviation
from ..sources.mapper import propose
from ..sources.preview import preview
from ..sources.schema import SOURCES_INSPECT_FIELDS, SOURCES_LIST_FIELDS, SOURCES_PREVIEW_FIELDS


@tdc_command(f"{DOMAIN}/sources/list", SOURCES_LIST_FIELDS)
async def ws_sources_list(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Search the real devices that can be a source; generated devices are never listed."""
    return {"devices": get_data(hass).sources.search(msg["query"], msg["limit"])}


@tdc_command(f"{DOMAIN}/sources/inspect", SOURCES_INSPECT_FIELDS)
async def ws_sources_inspect(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Return the entities of a device with their states and, for a template, a mapping proposal."""
    data = get_data(hass)
    states = data.sources.entities(msg["device_id"])
    reply: dict[str, Any] = {"entities": [item.to_dict() for item in states]}
    if "template" in msg:
        template = data.template_registry.get(msg["template"])
        proposals = propose(template.entities, [item.entity for item in states])
        reply["proposal"] = [
            {"key": p.key, "entity_id": p.entity_id, "reason": p.reason, "candidates": p.candidates}
            for p in proposals
        ]
    return reply


@tdc_command(f"{DOMAIN}/sources/preview", SOURCES_PREVIEW_FIELDS)
async def ws_sources_preview(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Return the values that copies with the given deviation would show now; nothing is created."""
    item = get_data(hass).sources.state_of(msg["entity_id"])
    try:
        value = float(item.state or "")
    except ValueError as err:
        raise SourceError(ErrorCode.SRC_NOT_FOUND) from err
    seed = msg.get("seed") or get_data(hass).entry.data.get(CONF_SEED, DEFAULT_SEED)
    rows = preview(
        value,
        seed,
        msg["key"],
        msg["count"],
        Deviation.from_dict(msg["deviation"]),
        msg["span"],
        template=msg["template"],
    )
    return {
        "entity_id": item.entity.entity_id,
        "source": value,
        "unit": item.entity.unit,
        "copies": rows,
    }
