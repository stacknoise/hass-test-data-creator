"""Services of the integration (concept 8.1); all of them need an administrator."""

from __future__ import annotations

from homeassistant.core import HomeAssistant, ServiceCall, SupportsResponse
from homeassistant.helpers.service import async_register_admin_service
import voluptuous as vol

from .const import CONF_SEED, DEFAULT_SEED, DOMAIN
from .core.runtime import get_data
from .devices.schema import CREATE_FIELDS, job_from_request
from .removal.planner import TARGET_ALL
from .scheduler.schema import SCHEDULE_FIELDS

SERVICE_CREATE = "create_devices"
SERVICE_FIRE = "fire_event"
SERVICE_REMOVE = "remove"
SERVICE_REMOVE_ALL = "remove_all"
SERVICE_ADD_SCHEDULE = "add_schedule"
SERVICE_REMOVE_SCHEDULE = "remove_schedule"
SERVICE_ENABLE_SCHEDULE = "set_schedule_enabled"
SERVICES = (
    SERVICE_CREATE,
    SERVICE_FIRE,
    SERVICE_REMOVE,
    SERVICE_REMOVE_ALL,
    SERVICE_ADD_SCHEDULE,
    SERVICE_REMOVE_SCHEDULE,
    SERVICE_ENABLE_SCHEDULE,
)


async def _create(call: ServiceCall) -> dict[str, object]:
    """Create the devices of a job."""
    data = get_data(call.hass)
    seed = data.entry.data.get(CONF_SEED, DEFAULT_SEED)
    run = await data.manager.async_create(job_from_request(dict(call.data), seed))
    return {"run_id": run.id, "devices": len(run.device_ids)}


async def _fire(call: ServiceCall) -> None:
    """Run an action on one entity of a device."""
    await get_data(call.hass).action_runner.async_run(
        call.data["device"], call.data["entity"], call.data["action"], call.data["params"]
    )


async def _remove(call: ServiceCall) -> dict[str, object]:
    """Remove one device or one run."""
    data = get_data(call.hass)
    plan = data.removal_planner.plan(call.data["target"], call.data["target_id"])
    return await data.removal_runner.async_run(plan)


async def _remove_all(call: ServiceCall) -> dict[str, object]:
    """Remove everything the integration created."""
    data = get_data(call.hass)
    return await data.removal_runner.async_run(data.removal_planner.plan(TARGET_ALL, None))


async def _add_schedule(call: ServiceCall) -> dict[str, object]:
    """Add a schedule."""
    data = get_data(call.hass)
    seed = data.entry.data.get(CONF_SEED, DEFAULT_SEED)
    schedule = await data.schedules.async_add(dict(call.data), seed)
    return {"id": schedule.id}


async def _remove_schedule(call: ServiceCall) -> None:
    """Delete a schedule."""
    await get_data(call.hass).schedules.async_remove(call.data["schedule_id"])


async def _set_schedule_enabled(call: ServiceCall) -> None:
    """Switch a schedule on or off."""
    await get_data(call.hass).schedules.async_set_enabled(
        call.data["schedule_id"], call.data["enabled"]
    )


def async_register_services(hass: HomeAssistant) -> None:
    """Register the services as administrator services."""
    definitions = (
        (SERVICE_CREATE, _create, vol.Schema(CREATE_FIELDS), SupportsResponse.OPTIONAL),
        (
            SERVICE_FIRE,
            _fire,
            vol.Schema(
                {
                    vol.Required("device"): str,
                    vol.Required("entity"): str,
                    vol.Required("action"): str,
                    vol.Optional("params", default=dict): dict,
                }
            ),
            SupportsResponse.NONE,
        ),
        (
            SERVICE_REMOVE,
            _remove,
            vol.Schema(
                {
                    vol.Required("target"): vol.In(("device", "run")),
                    vol.Required("target_id"): str,
                }
            ),
            SupportsResponse.OPTIONAL,
        ),
        (SERVICE_REMOVE_ALL, _remove_all, vol.Schema({}), SupportsResponse.OPTIONAL),
        (
            SERVICE_ADD_SCHEDULE,
            _add_schedule,
            vol.Schema(SCHEDULE_FIELDS),
            SupportsResponse.OPTIONAL,
        ),
        (
            SERVICE_REMOVE_SCHEDULE,
            _remove_schedule,
            vol.Schema({vol.Required("schedule_id"): str}),
            SupportsResponse.NONE,
        ),
        (
            SERVICE_ENABLE_SCHEDULE,
            _set_schedule_enabled,
            vol.Schema({vol.Required("schedule_id"): str, vol.Required("enabled"): bool}),
            SupportsResponse.NONE,
        ),
    )
    for name, handler, schema, response in definitions:
        async_register_admin_service(
            hass, DOMAIN, name, handler, schema=schema, supports_response=response
        )


def async_remove_services(hass: HomeAssistant) -> None:
    """Remove the services when the entry is unloaded."""
    for name in SERVICES:
        hass.services.async_remove(DOMAIN, name)
