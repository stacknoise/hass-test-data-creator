"""Commands about devices (concept 8.2)."""

from __future__ import annotations

from typing import Any

from homeassistant.components.websocket_api import ActiveConnection
from homeassistant.core import HomeAssistant
import voluptuous as vol

from ..const import (
    CONF_SEED,
    DEFAULT_PAGE_SIZE,
    DEFAULT_SEED,
    DOMAIN,
    MAX_AREA_NAME,
    MAX_PAGE_SIZE,
    MAX_PARAMS_BYTES,
)
from ..core.command import tdc_command
from ..core.keys import (
    KEY_ACTION,
    KEY_AREA,
    KEY_DEVICE,
    KEY_DEVICES,
    KEY_ENTITY,
    KEY_ID,
    KEY_LABEL,
    KEY_OFFSET,
    KEY_PARAMS,
    KEY_RUN_ID,
    KEY_SIGNAL,
)
from ..core.limits import SHORT_TEXT, json_object
from ..data import get_data
from ..devices.filters import DeviceFilter
from ..devices.schema import CREATE_FIELDS, FILTER_FIELDS, job_from_request
from ..templates.schema import SIGNAL_SCHEMA


@tdc_command(
    f"{DOMAIN}/devices/list",
    {
        vol.Optional(KEY_OFFSET, default=0): vol.All(int, vol.Range(min=0)),
        vol.Optional("limit", default=DEFAULT_PAGE_SIZE): vol.All(
            int, vol.Range(min=1, max=MAX_PAGE_SIZE)
        ),
        vol.Optional("facets", default=False): bool,
        **FILTER_FIELDS,
    },
)
async def ws_devices_list(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Return one page of the filtered, sorted devices with the current state of their entities."""
    return get_data(hass).device_view.page(
        msg[KEY_OFFSET],
        msg["limit"],
        DeviceFilter.from_request(msg),
        with_facets=msg["facets"],
    )


@tdc_command(f"{DOMAIN}/devices/get", {vol.Required(KEY_DEVICE): str})
async def ws_devices_get(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Return one device in full, with the signal of each entity."""
    return get_data(hass).device_view.one(msg[KEY_DEVICE])


@tdc_command(f"{DOMAIN}/devices/names", {})
async def ws_devices_names(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Return what pickers need of every device: no entities, states or users."""
    return {KEY_DEVICES: get_data(hass).device_view.names()}


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
        vol.Required(KEY_DEVICE): SHORT_TEXT,
        vol.Required(KEY_ENTITY): SHORT_TEXT,
        vol.Required(KEY_ACTION): SHORT_TEXT,
        vol.Optional(KEY_PARAMS, default=dict): json_object(MAX_PARAMS_BYTES),
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
