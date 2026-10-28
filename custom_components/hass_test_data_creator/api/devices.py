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
from ..core.keys import (
    KEY_ACTION,
    KEY_AREA,
    KEY_DEVICE,
    KEY_DEVICES,
    KEY_ENTITIES,
    KEY_ENTITY,
    KEY_ID,
    KEY_LABEL,
    KEY_MODEL,
    KEY_NAME,
    KEY_OFFSET,
    KEY_OUTPUT,
    KEY_PARAMS,
    KEY_PLATFORM,
    KEY_RUN_ID,
    KEY_SIGNAL,
    KEY_STATE,
    KEY_STATE_CLASS,
    KEY_TEMPLATE,
    KEY_UNIT,
)
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
                KEY_NAME: definition.name,
                KEY_PLATFORM: definition.platform,
                "entity_id": entity_id,
                KEY_STATE: state.state if state else None,
                KEY_UNIT: definition.unit,
                KEY_STATE_CLASS: definition.state_class,
                KEY_SIGNAL: definition.signal,
                "fault": getattr(live.get((device.id, definition.key)), "fault_kind", None),
            }
        )
    return result


@tdc_command(
    f"{DOMAIN}/devices/list",
    {
        vol.Optional(KEY_OFFSET, default=0): vol.All(int, vol.Range(min=0)),
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
    page = devices[msg[KEY_OFFSET] : msg[KEY_OFFSET] + msg["limit"]]
    return {
        "total": len(devices),
        KEY_DEVICES: [
            {
                KEY_ID: device.id,
                KEY_NAME: device.name,
                KEY_TEMPLATE: device.template,
                KEY_MODEL: device.model,
                KEY_AREA: device.area,
                KEY_OUTPUT: device.output,
                KEY_RUN_ID: device.run_id,
                "created_at": device.created_at,
                KEY_ENTITIES: _entity_states(hass, device),
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
    await data.csv.async_refresh()
    run = await data.manager.async_create(job_from_request(msg, seed))
    return {KEY_RUN_ID: run.id, KEY_LABEL: run.label, KEY_DEVICES: len(run.device_ids)}


@tdc_command(
    f"{DOMAIN}/devices/update",
    {
        vol.Required(KEY_DEVICE): str,
        vol.Required(KEY_AREA): vol.Any(None, vol.All(str, vol.Length(max=MAX_AREA_NAME))),
    },
)
async def ws_devices_update(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Put a device into another area, or into none, and return its new area."""
    area = (msg[KEY_AREA] or "").strip() or None
    device = await get_data(hass).manager.async_set_area(msg[KEY_DEVICE], area)
    return {KEY_ID: device.id, KEY_AREA: device.area}


@tdc_command(
    f"{DOMAIN}/devices/signal",
    {
        vol.Required(KEY_DEVICE): str,
        vol.Required(KEY_ENTITY): str,
        vol.Required(KEY_SIGNAL): SIGNAL_SCHEMA,
    },
)
async def ws_devices_signal(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Give a sensor of a device another curve and return the new signal."""
    data = get_data(hass)
    await data.csv.async_refresh()
    definition = await data.signal_editor.async_set(
        msg[KEY_DEVICE], msg[KEY_ENTITY], dict(msg[KEY_SIGNAL])
    )
    return {KEY_ENTITY: definition.key, KEY_SIGNAL: definition.signal}


@tdc_command(
    f"{DOMAIN}/devices/fire",
    {
        vol.Required(KEY_DEVICE): str,
        vol.Required(KEY_ENTITY): str,
        vol.Required(KEY_ACTION): str,
        vol.Optional(KEY_PARAMS, default=dict): dict,
    },
)
async def ws_devices_fire(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Run an action on one entity of a device."""
    await get_data(hass).action_runner.async_run(
        msg[KEY_DEVICE], msg[KEY_ENTITY], msg[KEY_ACTION], msg[KEY_PARAMS]
    )
    return {}
