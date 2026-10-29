"""Services of the integration (concept 8.1); all of them need an administrator."""

from __future__ import annotations

from homeassistant.core import HomeAssistant, ServiceCall, SupportsResponse
from homeassistant.helpers.service import async_register_admin_service
import voluptuous as vol

from .const import CONF_SEED, DEFAULT_SEED, DOMAIN, MAX_PARAMS_BYTES
from .core.keys import (
    KEY_ACTION,
    KEY_DAYS,
    KEY_DEVICE,
    KEY_DEVICES,
    KEY_ENABLED,
    KEY_ENTITY,
    KEY_GROUP_ID,
    KEY_ID,
    KEY_MEMBERS,
    KEY_NAME,
    KEY_PARAMS,
    KEY_RUN,
    KEY_RUN_ID,
    KEY_SCENARIO_ID,
    KEY_SCHEDULE_ID,
    KEY_STEPS,
    KEY_TARGET,
    KEY_TARGET_ID,
)
from .core.limits import SHORT_TEXT, json_object
from .core.runtime import get_data
from .devices.schema import CREATE_FIELDS, job_from_request
from .groups.schema import GROUP_FIELDS
from .history.schema import HISTORY_FIELDS
from .removal.planner import TARGET_ALL
from .scenarios.schema import SCENARIO_FIELDS
from .scheduler.schema import SCHEDULE_FIELDS

SERVICE_CREATE = "create_devices"
SERVICE_FIRE = "fire_event"
SERVICE_REMOVE = "remove"
SERVICE_REMOVE_ALL = "remove_all"
SERVICE_ADD_SCHEDULE = "add_schedule"
SERVICE_REMOVE_SCHEDULE = "remove_schedule"
SERVICE_ENABLE_SCHEDULE = "set_schedule_enabled"
SERVICE_ADD_SCENARIO = "add_scenario"
SERVICE_REMOVE_SCENARIO = "remove_scenario"
SERVICE_RUN_SCENARIO = "run_scenario"
SERVICE_ADD_GROUP = "add_group"
SERVICE_REMOVE_GROUP = "remove_group"
SERVICE_IMPORT_HISTORY = "import_history"
SERVICES = (
    SERVICE_CREATE,
    SERVICE_FIRE,
    SERVICE_REMOVE,
    SERVICE_REMOVE_ALL,
    SERVICE_ADD_SCHEDULE,
    SERVICE_REMOVE_SCHEDULE,
    SERVICE_ENABLE_SCHEDULE,
    SERVICE_ADD_SCENARIO,
    SERVICE_REMOVE_SCENARIO,
    SERVICE_RUN_SCENARIO,
    SERVICE_ADD_GROUP,
    SERVICE_REMOVE_GROUP,
    SERVICE_IMPORT_HISTORY,
)


async def _create(call: ServiceCall) -> dict[str, object]:
    """Create the devices of a job."""
    data = get_data(call.hass)
    seed = data.entry.data.get(CONF_SEED, DEFAULT_SEED)
    await data.csv.async_refresh()
    run = await data.manager.async_create(job_from_request(dict(call.data), seed))
    return {KEY_RUN_ID: run.id, KEY_DEVICES: len(run.device_ids)}


async def _fire(call: ServiceCall) -> None:
    """Run an action on one entity of a device."""
    await get_data(call.hass).action_runner.async_run(
        call.data[KEY_DEVICE], call.data[KEY_ENTITY], call.data[KEY_ACTION], call.data[KEY_PARAMS]
    )


async def _remove(call: ServiceCall) -> dict[str, object]:
    """Remove one device or one run."""
    data = get_data(call.hass)
    plan = data.removal_planner.plan(call.data[KEY_TARGET], call.data[KEY_TARGET_ID])
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
    return {KEY_ID: schedule.id}


async def _remove_schedule(call: ServiceCall) -> None:
    """Delete a schedule."""
    await get_data(call.hass).schedules.async_remove(call.data[KEY_SCHEDULE_ID])


async def _set_schedule_enabled(call: ServiceCall) -> None:
    """Switch a schedule on or off."""
    await get_data(call.hass).schedules.async_set_enabled(
        call.data[KEY_SCHEDULE_ID], call.data[KEY_ENABLED]
    )


async def _add_scenario(call: ServiceCall) -> dict[str, object]:
    """Add a scenario."""
    scenario = await get_data(call.hass).scenarios.async_add(dict(call.data))
    return {KEY_ID: scenario.id}


async def _remove_scenario(call: ServiceCall) -> None:
    """Delete a scenario."""
    await get_data(call.hass).scenarios.async_remove(call.data[KEY_SCENARIO_ID])


async def _run_scenario(call: ServiceCall) -> dict[str, object]:
    """Start a scenario."""
    return {KEY_STEPS: await get_data(call.hass).scenarios.async_run(call.data[KEY_SCENARIO_ID])}


async def _add_group(call: ServiceCall) -> dict[str, object]:
    """Add a group of Zigbee2MQTT devices."""
    group = await get_data(call.hass).groups.async_add(call.data[KEY_NAME], call.data[KEY_MEMBERS])
    return {KEY_ID: group.id, "number": group.number}


async def _remove_group(call: ServiceCall) -> None:
    """Delete a group."""
    await get_data(call.hass).groups.async_remove(call.data[KEY_GROUP_ID])


async def _import_history(call: ServiceCall) -> dict[str, object]:
    """Write hourly statistics for the past days of the test sensors."""
    return await get_data(call.hass).history.async_import(
        call.data[KEY_DAYS], call.data.get(KEY_DEVICE), call.data.get(KEY_ENTITY)
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
                    vol.Required(KEY_DEVICE): SHORT_TEXT,
                    vol.Required(KEY_ENTITY): SHORT_TEXT,
                    vol.Required(KEY_ACTION): SHORT_TEXT,
                    vol.Optional(KEY_PARAMS, default=dict): json_object(MAX_PARAMS_BYTES),
                }
            ),
            SupportsResponse.NONE,
        ),
        (
            SERVICE_REMOVE,
            _remove,
            vol.Schema(
                {
                    vol.Required(KEY_TARGET): vol.In((KEY_DEVICE, KEY_RUN)),
                    vol.Required(KEY_TARGET_ID): str,
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
            vol.Schema({vol.Required(KEY_SCHEDULE_ID): str}),
            SupportsResponse.NONE,
        ),
        (
            SERVICE_ENABLE_SCHEDULE,
            _set_schedule_enabled,
            vol.Schema({vol.Required(KEY_SCHEDULE_ID): str, vol.Required(KEY_ENABLED): bool}),
            SupportsResponse.NONE,
        ),
        (
            SERVICE_ADD_SCENARIO,
            _add_scenario,
            vol.Schema(SCENARIO_FIELDS),
            SupportsResponse.OPTIONAL,
        ),
        (
            SERVICE_REMOVE_SCENARIO,
            _remove_scenario,
            vol.Schema({vol.Required(KEY_SCENARIO_ID): str}),
            SupportsResponse.NONE,
        ),
        (
            SERVICE_RUN_SCENARIO,
            _run_scenario,
            vol.Schema({vol.Required(KEY_SCENARIO_ID): str}),
            SupportsResponse.OPTIONAL,
        ),
        (SERVICE_ADD_GROUP, _add_group, vol.Schema(GROUP_FIELDS), SupportsResponse.OPTIONAL),
        (
            SERVICE_REMOVE_GROUP,
            _remove_group,
            vol.Schema({vol.Required(KEY_GROUP_ID): str}),
            SupportsResponse.NONE,
        ),
        (
            SERVICE_IMPORT_HISTORY,
            _import_history,
            vol.Schema(HISTORY_FIELDS),
            SupportsResponse.OPTIONAL,
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
