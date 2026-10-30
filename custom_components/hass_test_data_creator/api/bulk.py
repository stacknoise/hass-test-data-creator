"""Commands that act on many devices at once (concept 16.3)."""

from __future__ import annotations

from typing import Any

from homeassistant.components.websocket_api import ActiveConnection
from homeassistant.core import HomeAssistant
import voluptuous as vol

from ..const import DOMAIN, MAX_AREA_NAME, MAX_PARAMS_BYTES
from ..core.command import tdc_command
from ..core.errors import ErrorCode, RequestError
from ..core.keys import (
    KEY_ACTION,
    KEY_AREA,
    KEY_COUNT,
    KEY_DEVICES,
    KEY_ENTITY,
    KEY_GROUP_ID,
    KEY_NAME,
    KEY_PARAMS,
)
from ..core.limits import SHORT_TEXT, json_object
from ..data import get_data
from ..devices.schema import BULK_TARGET_FIELDS, bulk_target
from ..model.models import DeviceDef

KEY_PLAN_ONLY = "plan_only"


def _selected(hass: HomeAssistant, msg: dict[str, Any]) -> list[DeviceDef]:
    """Return the devices a bulk request selects; raise if it names none or the count differs."""
    ids, flt = bulk_target(msg)
    if ids is None and flt is None:
        raise RequestError(ErrorCode.WS_INVALID_REQUEST)
    found = get_data(hass).device_view.select(ids, flt)
    if "expected" in msg and msg["expected"] != len(found):
        raise RequestError(ErrorCode.WS_SELECTION_CHANGED)
    return found


@tdc_command(
    f"{DOMAIN}/devices/bulk_remove",
    {**BULK_TARGET_FIELDS, vol.Optional(KEY_PLAN_ONLY, default=False): bool},
)
async def ws_devices_bulk_remove(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Return the plan to remove the selected devices, or remove them and return what went."""
    data = get_data(hass)
    plan = data.removal_planner.plan_devices(_selected(hass, msg))
    if msg[KEY_PLAN_ONLY]:
        return {**plan.to_dict(), KEY_COUNT: len(plan.devices)}
    return await data.removal_runner.async_run(plan)


@tdc_command(
    f"{DOMAIN}/devices/bulk_area",
    {
        **BULK_TARGET_FIELDS,
        vol.Required(KEY_AREA): vol.Any(None, vol.All(str, vol.Length(max=MAX_AREA_NAME))),
    },
)
async def ws_devices_bulk_area(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Put the selected devices into an area, or into none, and return how many moved."""
    area = (msg[KEY_AREA] or "").strip() or None
    moved = await get_data(hass).manager.async_set_area_many(
        [device.id for device in _selected(hass, msg)], area
    )
    return {KEY_DEVICES: moved, KEY_AREA: area}


@tdc_command(
    f"{DOMAIN}/devices/bulk_group",
    {
        **BULK_TARGET_FIELDS,
        vol.Optional(KEY_GROUP_ID): SHORT_TEXT,
        vol.Optional(KEY_NAME): vol.All(str, vol.Length(min=1, max=64)),
    },
)
async def ws_devices_bulk_group(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Put the selected Zigbee2MQTT devices into a group that exists, or into a new one."""
    if (KEY_GROUP_ID in msg) == (KEY_NAME in msg):
        raise RequestError(ErrorCode.WS_INVALID_REQUEST)
    group = await get_data(hass).groups.async_bulk(
        [device.id for device in _selected(hass, msg)], msg.get(KEY_GROUP_ID), msg.get(KEY_NAME)
    )
    return group.to_dict()


@tdc_command(
    f"{DOMAIN}/devices/bulk_action",
    {
        **BULK_TARGET_FIELDS,
        vol.Optional(KEY_ENTITY, default=""): SHORT_TEXT,
        vol.Required(KEY_ACTION): SHORT_TEXT,
        vol.Optional(KEY_PARAMS, default=dict): json_object(MAX_PARAMS_BYTES),
    },
)
async def ws_devices_bulk_action(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any]:
    """Run an action on the selected devices and return how many ran and how many failed."""
    devices = _selected(hass, msg)
    failed = await get_data(hass).action_runner.async_run_bulk(
        devices, msg[KEY_ENTITY], msg[KEY_ACTION], msg[KEY_PARAMS]
    )
    return {KEY_DEVICES: len(devices), "failed": failed}
