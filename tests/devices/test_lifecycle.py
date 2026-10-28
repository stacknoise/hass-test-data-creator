"""Creating devices, acting on them, and removing everything again (concept 4.4, 10)."""

from __future__ import annotations

from unittest.mock import patch

from homeassistant.core import HomeAssistant
from homeassistant.helpers import (
    area_registry as ar,
    device_registry as dr,
    entity_registry as er,
    label_registry as lr,
)
from homeassistant.helpers.dispatcher import async_dispatcher_send
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.hass_test_data_creator.const import DOMAIN, MANUFACTURER, SIGNAL_TICK
from custom_components.hass_test_data_creator.core.errors import ScheduleError
from custom_components.hass_test_data_creator.core.runtime import get_data
from custom_components.hass_test_data_creator.engine.tick import signal_time

from ..conftest import create_devices, our_devices, state_of

PLUG_ENTITIES = 6


async def test_create_registers_devices_entities_areas_and_labels(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    response = await create_devices(hass, count=8, areas=["Living room", "Kitchen"])
    assert response["devices"] == 8

    devices = our_devices(hass, entry)
    assert len(devices) == 8
    assert {d.manufacturer for d in devices} == {MANUFACTURER}
    label = lr.async_get(hass).async_get_label_by_name("test data")
    assert label is not None
    assert all(label.label_id in d.labels for d in devices)

    entities = er.async_entries_for_config_entry(er.async_get(hass), entry.entry_id)
    assert len(entities) == 8 * PLUG_ENTITIES

    areas = ar.async_get(hass)
    for name in ("Living room", "Kitchen"):
        area = areas.async_get_area_by_name(name)
        assert area is not None
        assert len(dr.async_entries_for_area(dr.async_get(hass), area.id)) == 4

    assert state_of(hass, "Plug 01", "state") is not None
    assert state_of(hass, "Plug 01", "power") is not None
    assert get_data(hass).store.device_count() == 8


async def test_actions_change_entity_states(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    await create_devices(hass, template="plug_metering", count=1)
    await create_devices(hass, template="motion_sensor", count=1, name_pattern="Motion {nn}")
    await create_devices(hass, template="wall_button", count=1, name_pattern="Button {nn}")

    async def fire(device: str, entity: str, action: str, **params: object) -> None:
        await hass.services.async_call(
            DOMAIN,
            "fire_event",
            {"device": device, "entity": entity, "action": action, "params": params},
            blocking=True,
        )

    await fire("Plug 01", "state", "turn_on")
    assert state_of(hass, "Plug 01", "state").state == "on"
    await fire("Plug 01", "state", "toggle")
    assert state_of(hass, "Plug 01", "state").state == "off"

    await fire("Motion 01", "motion", "set_on")
    assert state_of(hass, "Motion 01", "motion").state == "on"
    await fire("Motion 01", "motion", "set_off")
    assert state_of(hass, "Motion 01", "motion").state == "off"

    await fire("Button 01", "action", "press", event_type="double")
    assert state_of(hass, "Button 01", "action").attributes["event_type"] == "double"

    with pytest.raises(ScheduleError):
        await fire("Plug 01", "state", "explode")
    with pytest.raises(ScheduleError):
        await fire("Nobody", "state", "turn_on")


async def test_tick_updates_sensors_whose_interval_has_passed(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=1)
    before = float(state_of(hass, "Plug 01", "energy").state)
    with patch(
        "custom_components.hass_test_data_creator.engine.clock.Clock.now",
        lambda _: signal_time() + 36000,
    ):
        async_dispatcher_send(hass, SIGNAL_TICK)
        await hass.async_block_till_done()
    assert float(state_of(hass, "Plug 01", "energy").state) > before + 3


async def test_limits_are_enforced(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    from custom_components.hass_test_data_creator.core.errors import (  # noqa: PLC0415
        ErrorCode,
        GenerationError,
    )

    with pytest.raises(GenerationError) as batch:
        await create_devices(hass, count=501)
    assert batch.value.code is ErrorCode.GEN_BATCH
    assert not our_devices(hass, entry)


async def test_remove_all_removes_only_what_was_created(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    areas = ar.async_get(hass)
    garage = areas.async_create("Garage")
    foreign = MockConfigEntry(domain="test", title="Foreign")
    foreign.add_to_hass(hass)

    await create_devices(hass, count=4, areas=["Living room", "Kitchen"])
    living_room = areas.async_get_area_by_name("Living room")
    foreign_device = dr.async_get(hass).async_get_or_create(
        config_entry_id=foreign.entry_id, identifiers={("test", "real-lamp")}, name="Real lamp"
    )
    dr.async_get(hass).async_update_device(foreign_device.id, area_id=living_room.id)

    result = await hass.services.async_call(
        DOMAIN, "remove_all", {}, blocking=True, return_response=True
    )
    await hass.async_block_till_done()

    assert result["devices"] == 4
    assert not our_devices(hass, entry)
    assert not er.async_entries_for_config_entry(er.async_get(hass), entry.entry_id)
    assert get_data(hass).store.device_count() == 0
    assert areas.async_get_area_by_name("Kitchen") is None
    assert areas.async_get_area(garage.id) is not None
    assert areas.async_get_area(living_room.id) is not None
    assert dr.async_get(hass).async_get(foreign_device.id) is not None


async def test_remove_device_and_run(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    first = await create_devices(hass, count=3, name_pattern="A{nn}")
    await create_devices(hass, count=2, name_pattern="B{nn}")
    data = get_data(hass)

    device = next(d for d in data.store.devices() if d.name == "A01")
    await hass.services.async_call(
        DOMAIN, "remove", {"target": "device", "target_id": device.id}, blocking=True
    )
    assert len(our_devices(hass, entry)) == 4

    await hass.services.async_call(
        DOMAIN, "remove", {"target": "run", "target_id": first["run_id"]}, blocking=True
    )
    await hass.async_block_till_done()
    assert [d.name for d in data.store.devices()] == ["B04", "B05"]
    assert len(our_devices(hass, entry)) == 2


async def test_removal_finds_devices_missing_from_a_damaged_store(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=3)
    data = get_data(hass)
    for device in data.store.devices():
        data.store.remove_device(device.id)

    plan = data.removal_planner.plan("all", None)
    assert len(plan.orphans) == 3
    await data.removal_runner.async_run(plan)
    await hass.async_block_till_done()
    assert not our_devices(hass, entry)


async def test_removing_the_entry_cleans_up(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    await create_devices(hass, count=2, areas=["Temp area"])
    areas = ar.async_get(hass)
    assert areas.async_get_area_by_name("Temp area") is not None

    assert await hass.config_entries.async_remove(entry.entry_id) is not None
    await hass.async_block_till_done()

    assert not dr.async_entries_for_config_entry(dr.async_get(hass), entry.entry_id)
    assert areas.async_get_area_by_name("Temp area") is None
