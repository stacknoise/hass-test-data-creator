"""The panel commands: result format, error codes and the admin check."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.hass_test_data_creator.const import API_VERSION

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
    assert info["result"]["version"] == "0.2.0"
    assert info["result"]["outputs"] == ["native", "mqtt", "z2m"]
    assert "sine" in info["result"]["shapes"]

    templates = await call(client, "templates/list")
    assert {item["id"] for item in templates["result"]} >= {"plug_metering", "wall_button"}


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
