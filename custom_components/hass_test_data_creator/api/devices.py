"""Commands about devices (concept 8.2)."""

from __future__ import annotations

from typing import Any

from homeassistant.components.websocket_api import ActiveConnection
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
import voluptuous as vol

from ..const import (
    CONF_SEED,
    DEFAULT_PAGE_SIZE,
    DEFAULT_SEED,
    DOMAIN,
    MAX_AREA_NAME,
    MAX_PAGE_SIZE,
)
from ..core.command import tdc_command
from ..core.runtime import get_data
from ..devices.entity_ids import entity_id_of
from ..devices.schema import CREATE_FIELDS, job_from_request
from ..model.models import DeviceDef
from ..templates.schema import SIGNAL_SCHEMA


def _entity_states(hass: HomeAssistant, device: DeviceDef) -> list[dict[str, Any]]:
    """Return key, entity id and current state of every entity of `device`."""
    registry = er.async_get(hass)
    live = get_data(hass).live
    result: list[dict[str, Any]] = []
    for definition in device.entities:
        entity_id = entity_id_of(registry, device, definition)
        state = hass.states.get(entity_id) if entity_id else None
        result.append(
            {
                "key": definition.key,
                "name": definition.name,
                "platform": definition.platform,
                "entity_id": entity_id,
                "state": state.state if state else None,
                "unit": definition.unit,
                "state_class": definition.state_class,
                "signal": definition.signal,
                "fault": getattr(live.get((device.id, definition.key)), "fault_kind", None),
            }
        )
    return result


@tdc_command(
    f"{DOMAIN}/devices/list",
    {
        vol.Optional("offset", default=0): vol.All(int, vol.Range(min=0)),
        vol.Optional("limit", default=DEFAULT_PAGE_SIZE): vol.All(
            int, vol.Range(min=1, max=MAX_PAGE_SIZE)
        ),
    },
)
async def ws_devices_list(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Return one page of devices with the current state of their entities."""
    devices = get_data(hass).store.devices()
    page = devices[msg["offset"] : msg["offset"] + msg["limit"]]
    return {
        "total": len(devices),
        "devices": [
            {
                "id": device.id,
                "name": device.name,
                "template": device.template,
                "model": device.model,
                "area": device.area,
                "output": device.output,
                "run_id": device.run_id,
                "created_at": device.created_at,
                "entities": _entity_states(hass, device),
                "used_by": get_data(hass).usage.of(device),
            }
            for device in page
        ],
    }


@tdc_command(f"{DOMAIN}/devices/create", CREATE_FIELDS)
async def ws_devices_create(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Create the devices of a job and return the run."""
    data = get_data(hass)
    seed = data.entry.data.get(CONF_SEED, DEFAULT_SEED)
    run = await data.manager.async_create(job_from_request(msg, seed))
    return {"run_id": run.id, "label": run.label, "devices": len(run.device_ids)}


@tdc_command(
    f"{DOMAIN}/devices/update",
    {
        vol.Required("device"): str,
        vol.Required("area"): vol.Any(None, vol.All(str, vol.Length(max=MAX_AREA_NAME))),
    },
)
async def ws_devices_update(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Put a device into another area, or into none, and return its new area."""
    area = (msg["area"] or "").strip() or None
    device = await get_data(hass).manager.async_set_area(msg["device"], area)
    return {"id": device.id, "area": device.area}


@tdc_command(
    f"{DOMAIN}/devices/signal",
    {
        vol.Required("device"): str,
        vol.Required("entity"): str,
        vol.Required("signal"): SIGNAL_SCHEMA,
    },
)
async def ws_devices_signal(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Give a sensor of a device another curve and return the new signal."""
    definition = await get_data(hass).signal_editor.async_set(
        msg["device"], msg["entity"], dict(msg["signal"])
    )
    return {"entity": definition.key, "signal": definition.signal}


@tdc_command(
    f"{DOMAIN}/devices/fire",
    {
        vol.Required("device"): str,
        vol.Required("entity"): str,
        vol.Required("action"): str,
        vol.Optional("params", default=dict): dict,
    },
)
async def ws_devices_fire(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Run an action on one entity of a device."""
    await get_data(hass).action_runner.async_run(
        msg["device"], msg["entity"], msg["action"], msg["params"]
    )
    return {}
