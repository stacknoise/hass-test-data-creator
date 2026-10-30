"""The panel commands: result format, error codes and the admin check."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.hass_test_data_creator.const import API_VERSION
from custom_components.hass_test_data_creator.data import get_data

from ..conftest import create_devices

PREFIX = "hass_test_data_creator"


async def call(client: Any, command: str, **fields: Any) -> dict[str, Any]:
    """Send a command and return the whole reply."""
    await client.send_json_auto_id({"type": f"{PREFIX}/{command}", **fields})
    return await client.receive_json()


async def test_info_and_templates(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    info = await call(client, "info")
    assert info["success"]
    assert info["result"]["api_version"] == API_VERSION
    assert info["result"]["version"] == "1.0.0"
    assert info["result"]["outputs"] == ["native"]
    assert info["result"]["mqtt"] is False
    assert "sine" in info["result"]["shapes"]

    templates = await call(client, "templates/list")
    assert {item["id"] for item in templates["result"]} >= {"plug_metering", "wall_button"}


async def test_save_and_delete_an_own_template(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    entry: MockConfigEntry,
    tmp_path: Path,
) -> None:
    hass.config.config_dir = str(tmp_path)
    client = await hass_ws_client(hass)
    entities = [
        {"key": "level", "platform": "sensor", "name": "Level", "signal": {"shape": "sine"}}
    ]
    saved = await call(client, "templates/save", template_id="mine", name="Mine", entities=entities)
    assert saved["success"]
    assert saved["result"]["model"] == "Custom"
    assert saved["result"]["bundled"] is False
    listed = await call(client, "templates/list")
    assert "mine" in {item["id"] for item in listed["result"]}

    refused = await call(client, "templates/delete", template_id="plug_metering")
    assert refused["error"]["code"] == "TDC-TPL-004"
    removed = await call(client, "templates/delete", template_id="mine")
    assert removed["success"]
    listed = await call(client, "templates/list")
    assert "mine" not in {item["id"] for item in listed["result"]}


async def test_create_list_and_remove(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    created = await call(
        client,
        "devices/create",
        template="climate_sensor",
        count=3,
        name_pattern="Climate {nn}",
        areas=["Bath"],
    )
    assert created["success"]
    assert created["result"]["devices"] == 3
    await hass.async_block_till_done()

    listed = await call(client, "devices/list", limit=2)
    assert listed["result"]["total"] == 3
    assert [d["name"] for d in listed["result"]["devices"]] == ["Climate 01", "Climate 02"]
    first = listed["result"]["devices"][0]
    assert first["area"] == "Bath"
    assert {e["key"] for e in first["entities"]} >= {"temperature", "humidity"}
    assert next(e for e in first["entities"] if e["key"] == "temperature")["state"] is not None

    plan = await call(client, "removal/plan", target="all")
    assert len(plan["result"]["devices"]) == 3
    assert plan["result"]["areas"] == ["Bath"]

    done = await call(client, "removal/run", target="all")
    assert done["result"]["devices"] == 3
    after = await call(client, "devices/list")
    assert after["result"]["total"] == 0


async def test_errors_carry_the_tdc_code(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    too_many = await call(client, "devices/create", template="plug_metering", count=501)
    assert not too_many["success"]
    assert too_many["error"]["code"] == "TDC-GEN-002"

    no_template = await call(client, "devices/create", template="nope", count=1)
    assert no_template["error"]["code"] == "TDC-TPL-001"

    no_mqtt = await call(client, "devices/create", template="plug_metering", count=1, output="z2m")
    assert no_mqtt["error"]["code"] == "TDC-OUT-002"

    unknown_device = await call(client, "devices/fire", device="x", entity="y", action="turn_on")
    assert unknown_device["error"]["code"] == "TDC-SCH-002"


async def test_only_administrators_may_use_the_commands(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    hass_read_only_access_token: str,
    entry: MockConfigEntry,
) -> None:
    client = await hass_ws_client(hass, hass_read_only_access_token)
    reply = await call(client, "info")
    assert not reply["success"]
    assert reply["error"]["code"] == "unauthorized"


async def test_schedule_commands(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    fields = {
        "name": "Evening",
        "target": {"template": "plug_metering"},
        "entity": "state",
        "action": "toggle",
        "trigger": {"type": "random_window", "count": 3, "start": "18:00", "end": "23:00"},
    }
    added = await call(client, "schedules/add", **fields)
    assert added["success"]
    schedule_id = added["result"]["id"]
    assert added["result"]["enabled"] is True

    listed = await call(client, "schedules/list")
    assert [item["name"] for item in listed["result"]] == ["Evening"]

    off = await call(client, "schedules/enable", schedule_id=schedule_id, enabled=False)
    assert off["result"]["enabled"] is False

    preview = await call(client, "schedules/preview", hours=48)
    assert preview["success"]
    assert preview["result"] == []

    bad = await call(client, "schedules/add", **{**fields, "trigger": {"type": "times"}})
    assert bad["error"]["code"] == "TDC-SCH-003"

    removed = await call(client, "schedules/remove", schedule_id=schedule_id)
    assert removed["success"]
    again = await call(client, "schedules/remove", schedule_id=schedule_id)
    assert again["error"]["code"] == "TDC-SCH-004"


async def test_names_are_light_and_get_reports_a_missing_device(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    await create_devices(hass, count=2)

    names = (await call(client, "devices/names"))["result"]["devices"]
    assert len(names) == 2
    assert set(names[0]) == {
        "id",
        "name",
        "template",
        "model",
        "output",
        "run_id",
        "created_at",
        "entities",
    }
    assert names[0]["entities"]
    assert set(names[0]["entities"][0]) == {"key", "name", "platform", "state_class", "shape"}

    missing = await call(client, "devices/get", device="nope")
    assert not missing["success"]
    assert missing["error"]["code"] == "TDC-SCH-002"


async def test_duplicate_copies_a_device_with_its_signals(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    await call(
        client,
        "devices/create",
        template="climate_sensor",
        count=1,
        name_pattern="Source",
        areas=["Bath"],
    )
    await hass.async_block_till_done()
    source = (await call(client, "devices/list"))["result"]["devices"][0]
    curve = {"shape": "constant", "value": 42}
    await call(client, "devices/signal", device=source["id"], entity="temperature", signal=curve)

    copies = await call(client, "devices/duplicate", device=source["id"], count=3)
    assert copies["success"]
    assert copies["result"]["devices"] == 3
    await hass.async_block_till_done()

    devices = (await call(client, "devices/list"))["result"]["devices"]
    assert sorted(d["name"] for d in devices) == ["Source", "Source 1", "Source 2", "Source 3"]
    assert {d["area"] for d in devices} == {"Bath"}
    assert len({d["id"] for d in devices}) == 4
    again = await call(
        client, "devices/duplicate", device=source["id"], count=1, name_pattern="Twin {n}"
    )
    assert again["success"]
    seeds = {d.seed for d in get_data(hass).store.devices()}
    assert len(seeds) == 5


async def test_duplicate_errors(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    await call(client, "devices/create", template="plug_metering", count=1)
    only = (await call(client, "devices/list"))["result"]["devices"][0]["id"]
    missing = await call(client, "devices/duplicate", device="nope", count=1)
    assert missing["error"]["code"] == "TDC-SCH-002"
    too_many = await call(client, "devices/duplicate", device=only, count=501)
    assert too_many["error"]["code"] == "TDC-GEN-002"
    bad = await call(client, "devices/duplicate", device=only, count=1, name_pattern="{x}")
    assert bad["error"]["code"] == "TDC-GEN-003"
