"""Statistics backfill: series computed from the signals, import, removal and limits."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Any
from unittest.mock import patch

from homeassistant.components.recorder import get_instance
from homeassistant.components.recorder.statistics import (
    list_statistic_ids,
    statistics_during_period,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.util import dt as dt_util
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.components.recorder.common import (
    async_wait_recording_done,
)
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.hass_test_data_creator.const import DOMAIN
from custom_components.hass_test_data_creator.core.errors import (
    ConfigError,
    ErrorCode,
    GenerationError,
    ScheduleError,
)
from custom_components.hass_test_data_creator.core.runtime import get_data
from custom_components.hass_test_data_creator.engine.signal_factory import SignalFactory
from custom_components.hass_test_data_creator.history.factory import SeriesFactory
from custom_components.hass_test_data_creator.history.manager import last_hours
from custom_components.hass_test_data_creator.model.models import DeviceDef, EntityDef

from ..conftest import create_devices


def _device() -> DeviceDef:
    """Return a device that was created just now."""
    return DeviceDef(
        id="d1",
        name="D1",
        template="custom",
        model="m",
        output="native",
        run_id="r1",
        seed=7,
        created_at=dt_util.utcnow().timestamp(),
    )


def _sensor(signal: dict[str, Any], state_class: str | None, unit: str = "kWh") -> EntityDef:
    """Return a sensor definition with `signal`."""
    return EntityDef(
        key="s",
        platform="sensor",
        name="S",
        device_class="energy",
        unit=unit,
        state_class=state_class,
        signal=signal,
    )


def test_last_hours_are_the_full_hours_before_the_current_one() -> None:
    hours = last_hours(2, datetime(2026, 10, 28, 13, 42, tzinfo=UTC))
    assert len(hours) == 48
    assert hours[0] == datetime(2026, 10, 26, 13, tzinfo=UTC)
    assert hours[-1] == datetime(2026, 10, 28, 12, tzinfo=UTC)


def test_a_counter_grows_through_the_history() -> None:
    factory = SeriesFactory(SignalFactory())
    definition = _sensor({"shape": "counter", "rate_per_hour": 2.0, "decimals": 3}, "total")
    series = factory.create(_device(), definition, "sensor.d1_s", last_hours(2))
    assert series.metadata["has_sum"] is True
    assert series.metadata["unit_class"] == "energy"
    assert [row["sum"] for row in series.rows][:3] == pytest.approx([2.0, 4.0, 6.0])
    assert series.rows[-1]["state"] == pytest.approx(96.0)


def test_a_total_increasing_reset_does_not_lower_the_sum() -> None:
    factory = SeriesFactory(SignalFactory())
    definition = _sensor(
        {"shape": "saw", "min": 0, "max": 10, "period_s": 7200}, "total_increasing"
    )
    series = factory.create(_device(), definition, "sensor.x", last_hours(2))
    sums = [row["sum"] for row in series.rows]
    assert sums == sorted(sums)
    assert sums[-1] > 0


def test_a_measurement_has_mean_minimum_and_maximum() -> None:
    factory = SeriesFactory(SignalFactory())
    definition = _sensor({"shape": "sine", "min": 0, "max": 100, "period_s": 3600}, "measurement")
    series = factory.create(_device(), definition, "sensor.x", last_hours(1))
    assert series.metadata["has_sum"] is False
    assert len(series.rows) == 24
    for row in series.rows:
        assert 0 <= row["min"] <= row["mean"] <= row["max"] <= 100


def test_only_sensors_with_a_state_class_and_numbers_are_supported() -> None:
    factory = SeriesFactory(SignalFactory())
    assert factory.supports(_sensor({"shape": "sine"}, "measurement"))
    assert not factory.supports(_sensor({"shape": "sine"}, None))
    assert not factory.supports(_sensor({"shape": "enum", "values": ["a"]}, "measurement"))
    assert not factory.supports(EntityDef(key="state", platform="switch", name="State"))


def _without_recorder() -> Any:
    """Make the integration see no recorder."""
    return patch("custom_components.hass_test_data_creator.history.recorder.RECORDER_DOMAIN", "x")


def _entity_id(hass: HomeAssistant, name: str, key: str) -> str:
    """Return the entity id of a native sensor of the device called `name`."""
    device = next(item for item in get_data(hass).store.devices() if item.name == name)
    entity_id = er.async_get(hass).async_get_entity_id("sensor", DOMAIN, f"{device.id}_{key}")
    assert entity_id
    return entity_id


async def _rows(hass: HomeAssistant, entity_id: str) -> list[dict[str, Any]]:
    """Return the hourly statistics of the last days of `entity_id`."""
    await async_wait_recording_done(hass)
    found = await get_instance(hass).async_add_executor_job(
        statistics_during_period,
        hass,
        dt_util.utcnow() - timedelta(days=3),
        None,
        {entity_id},
        "hour",
        None,
        {"mean", "min", "max", "state", "sum"},
    )
    return list(found.get(entity_id, []))


async def _import(hass: HomeAssistant, **fields: Any) -> dict[str, Any]:
    """Call the import_history service and return its response."""
    response = await hass.services.async_call(
        DOMAIN, "import_history", fields, blocking=True, return_response=True
    )
    await hass.async_block_till_done()
    return response


async def test_import_writes_hourly_statistics(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    await create_devices(hass, count=2)
    result = await _import(hass, days=1)
    assert result == {"series": 10, "rows": 240, "skipped": 0}

    power = await _rows(hass, _entity_id(hass, "Plug 01", "power"))
    assert len(power) == 24
    assert all(0 <= row["min"] <= row["mean"] <= row["max"] for row in power)

    energy = await _rows(hass, _entity_id(hass, "Plug 01", "energy"))
    sums = [row["sum"] for row in energy]
    assert sums == sorted(sums)
    assert sums[-1] > 0
    assert len(get_data(hass).store.statistics()) == 10


async def test_import_can_be_narrowed_and_repeated(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=2)
    result = await _import(hass, days=2, device="Plug 02", entity="power")
    assert result == {"series": 1, "rows": 48, "skipped": 0}
    await _import(hass, days=2, device="Plug 02", entity="power")
    assert len(await _rows(hass, _entity_id(hass, "Plug 02", "power"))) == 48
    assert len(get_data(hass).store.statistics()) == 1


async def test_import_rejects_unknown_targets(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    await create_devices(hass, count=1)
    for fields in ({"device": "nope"}, {"device": "Plug 01", "entity": "nope"}):
        with pytest.raises(ScheduleError) as error:
            await _import(hass, **fields)
        assert error.value.code is ErrorCode.SCH_TARGET_NOT_FOUND


async def test_import_refuses_too_many_rows(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    await create_devices(hass, count=2)
    with (
        patch("custom_components.hass_test_data_creator.history.manager.MAX_HISTORY_ROWS", 10),
        pytest.raises(GenerationError) as error,
    ):
        await _import(hass, days=1)
    assert error.value.code is ErrorCode.GEN_HISTORY_LIMIT
    assert not get_data(hass).store.statistics()


async def test_import_needs_the_recorder(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    await create_devices(hass, count=1)
    with _without_recorder(), pytest.raises(ConfigError) as error:
        await _import(hass)
    assert error.value.code is ErrorCode.CFG_NO_RECORDER


async def test_removing_a_device_clears_its_statistics(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=2)
    await _import(hass, days=1)
    data = get_data(hass)
    kept = _entity_id(hass, "Plug 02", "power")
    gone = _entity_id(hass, "Plug 01", "power")

    device = next(item for item in data.store.devices() if item.name == "Plug 01")
    plan = data.removal_planner.plan("device", device.id)
    assert len(plan.statistics) == 5
    assert (await data.removal_runner.async_run(plan))["statistics"] == 5
    await hass.async_block_till_done()

    assert await _rows(hass, gone) == []
    assert len(await _rows(hass, kept)) == 24
    assert len(data.store.statistics()) == 5


async def test_removal_stops_before_anything_is_gone_without_a_recorder(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=1)
    data = get_data(hass)
    data.store.add_statistic("sensor.plug_01_power", data.store.devices()[0].id)
    with _without_recorder(), pytest.raises(ConfigError):
        await data.removal_runner.async_run(data.removal_planner.plan("all", None))
    assert data.store.device_count() == 1


async def test_removing_the_entry_clears_all_statistics(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=1)
    await _import(hass, days=1)
    assert await hass.config_entries.async_remove(entry.entry_id) is not None
    await hass.async_block_till_done()
    await async_wait_recording_done(hass)
    found = await get_instance(hass).async_add_executor_job(list_statistic_ids, hass)
    assert not [item for item in found if item["statistic_id"].startswith("sensor.plug")]


async def test_the_panel_command_imports_and_reports_errors(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=1)
    client = await hass_ws_client(hass)

    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/history/import", "days": 1, "entity": "power"}
    )
    reply = await client.receive_json()
    assert reply["success"]
    assert reply["result"] == {"series": 1, "rows": 24, "skipped": 0}

    await client.send_json_auto_id({"type": f"{DOMAIN}/history/import", "device": "nope"})
    reply = await client.receive_json()
    assert not reply["success"]
    assert reply["error"]["code"] == ErrorCode.SCH_TARGET_NOT_FOUND
