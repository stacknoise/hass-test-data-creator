"""CSV replay: the file format, the looped curve and the files in the config folder."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.hass_test_data_creator.const import DOMAIN
from custom_components.hass_test_data_creator.core.errors import ErrorCode, SignalError
from custom_components.hass_test_data_creator.data import get_data
from custom_components.hass_test_data_creator.engine.signals import SignalSpec, value_at
from custom_components.hass_test_data_creator.replay.library import FOLDER
from custom_components.hass_test_data_creator.replay.parser import build_table, parse_rows

from ..conftest import create_devices, state_of


def test_one_column_is_spread_over_the_step() -> None:
    rows = parse_rows("1\n2\n3\n", "a.csv")
    table, loop_s = build_table(rows, 10.0)

    assert table == ((0.0, 1.0), (10.0, 2.0), (20.0, 3.0))
    assert loop_s == 30.0


def test_two_columns_keep_their_seconds_and_start_at_zero() -> None:
    rows = parse_rows("seconds,value\n100,1\n160,5\n220,3\n", "a.csv")
    table, loop_s = build_table(rows, 10.0)

    assert table == ((0.0, 1.0), (60.0, 5.0), (120.0, 3.0))
    assert loop_s == 120.0


def test_comments_blank_lines_and_a_semicolon_with_decimal_commas_are_read() -> None:
    rows = parse_rows("# power\n\n0;1,5\n60;2,5\n", "a.csv")

    assert rows == ((0.0, 1.5), (60.0, 2.5))


@pytest.mark.parametrize(
    ("text", "reason"),
    [
        ("", "no data"),
        ("# only a comment\n", "no data"),
        ("1\n", "rows needed"),
        ("1,2,3\n4,5,6\n", "one or two columns"),
        ("1\n2,3\n", "one or two columns"),
        ("1\nabc\n", "not a number"),
        ("1\nnan\n", "not a number"),
        ("0,1\n0,2\n", "must rise"),
        ("5,1\n3,2\n", "must rise"),
    ],
)
def test_a_file_that_does_not_fit_is_refused_with_its_reason(text: str, reason: str) -> None:
    with pytest.raises(SignalError) as error:
        parse_rows(text, "a.csv")

    assert error.value.code is ErrorCode.SIG_CSV_INVALID
    assert reason in (error.value.translation_placeholders or {})["reason"]


def _spec(table: tuple[tuple[float, float], ...], loop_s: float, **fields: Any) -> SignalSpec:
    """Return a csv signal over `table`."""
    return SignalSpec(shape="csv", table=table, loop_s=loop_s, decimals=3, **fields)


def test_the_curve_joins_the_points_linearly_and_loops() -> None:
    spec = _spec(((0.0, 0.0), (10.0, 10.0), (20.0, 0.0)), 30.0)

    assert value_at(spec, 5.0) == 5.0
    assert value_at(spec, 10.0) == 10.0
    assert value_at(spec, 15.0) == 5.0
    assert value_at(spec, 25.0) == 0.0
    assert value_at(spec, 35.0) == 5.0


def test_the_phase_shifts_the_start_and_the_origin_sets_zero() -> None:
    table = ((0.0, 0.0), (10.0, 10.0), (20.0, 0.0))

    assert value_at(_spec(table, 30.0, phase=1 / 3), 0.0) == 10.0
    assert value_at(_spec(table, 30.0, origin=100.0), 105.0) == 5.0


async def _put(hass: HomeAssistant, name: str, text: str) -> None:
    """Write a replay file into the csv folder of the config."""
    folder = Path(hass.config.path(*FOLDER))
    await hass.async_add_executor_job(lambda: folder.mkdir(parents=True, exist_ok=True))
    await hass.async_add_executor_job((folder / name).write_text, text, "utf-8")


async def test_the_library_lists_the_usable_files_and_explains_the_others(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    await _put(hass, "good.csv", "1\n2\n3\n")
    await _put(hass, "bad.csv", "1\nabc\n")
    library = get_data(hass).csv

    await library.async_refresh()

    assert library.names() == ["good.csv"]
    assert library.table("good.csv", 60.0)[1] == 180.0
    with pytest.raises(SignalError) as invalid:
        library.table("bad.csv", 60.0)
    assert invalid.value.code is ErrorCode.SIG_CSV_INVALID
    with pytest.raises(SignalError) as missing:
        library.table("none.csv", 60.0)
    assert missing.value.code is ErrorCode.SIG_CSV_NOT_FOUND


async def test_a_sensor_replays_a_file(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    await _put(hass, "load.csv", "0,40\n600,80\n")
    await create_devices(hass, count=1)
    client = await hass_ws_client(hass)
    device_id = get_data(hass).store.devices()[0].id
    signal = {"shape": "csv", "file": "load.csv", "min": 0, "max": 100, "decimals": 1}

    await client.send_json_auto_id(
        {
            "type": f"{DOMAIN}/devices/signal",
            "device": device_id,
            "entity": "power",
            "signal": signal,
        }
    )
    reply = await client.receive_json()
    await hass.async_block_till_done()

    assert reply["success"], reply
    assert 40.0 <= float(state_of(hass, "Plug 01", "power").state) <= 80.0


async def test_a_curve_with_a_missing_file_is_refused(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=1)
    client = await hass_ws_client(hass)
    device_id = get_data(hass).store.devices()[0].id
    signal = {"shape": "csv", "file": "gone.csv", "min": 0, "max": 100}

    await client.send_json_auto_id(
        {
            "type": f"{DOMAIN}/devices/signal",
            "device": device_id,
            "entity": "power",
            "signal": signal,
        }
    )
    reply = await client.receive_json()

    assert not reply["success"]
    assert reply["error"]["code"] == ErrorCode.SIG_CSV_NOT_FOUND.value
