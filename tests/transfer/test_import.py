"""Import: plan and run per category, in the modes add, sync and replace (concept 16.5)."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.hass_test_data_creator.data import get_data

from ..conftest import create_devices

PREFIX = "hass_test_data_creator"
CONSTANT = {"shape": "constant", "min": 5, "max": 5}


async def send(client: Any, command: str, **fields: Any) -> dict[str, Any]:
    """Send a transfer command and return the whole reply."""
    await client.send_json_auto_id({"type": f"{PREFIX}/transfer/{command}", **fields})
    return await client.receive_json()


def device(name: str, **fields: Any) -> dict[str, Any]:
    """Return the entry of a device of the plug template."""
    return {"name": name, "template": "plug_metering", "output": "native", **fields}


async def test_plan_counts_per_mode_and_changes_nothing(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=1)
    client = await hass_ws_client(hass)
    items = [device("Plug 01"), device("Lamp"), device("Lamp")]

    added = (await send(client, "plan", category="devices", mode="add", items=items))["result"]
    assert (added["create"], added["skip"]) == (1, 2)
    assert [problem["code"] for problem in added["problems"]] == ["TDC-GEN-011"]

    synced = (await send(client, "plan", category="devices", mode="sync", items=items[:2]))[
        "result"
    ]
    assert (synced["create"], synced["update"], synced["skip"]) == (1, 0, 1)

    replaced = (await send(client, "plan", category="devices", mode="replace", items=items[:2]))[
        "result"
    ]
    assert (replaced["create"], replaced["delete"]) == (2, 1)
    assert get_data(hass).store.device_count() == 1


async def test_add_creates_devices_in_one_run_and_skips_existing(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=1)
    client = await hass_ws_client(hass)
    items = [
        device("Plug 01"),
        device("Lamp", area="Hall", overrides={"power": {"signal": CONSTANT}}),
    ]

    result = (
        await send(client, "run", category="devices", mode="add", items=items, file_name="lab.json")
    )["result"]

    assert (result["create"], result["skip"], result["problems"]) == (1, 1, [])
    store = get_data(hass).store
    lamp = next(item for item in store.devices() if item.name == "Lamp")
    assert lamp.area == "Hall"
    assert next(e for e in lamp.entities if e.key == "power").signal == CONSTANT
    assert [run.label for run in store.runs() if run.label.startswith("import")] == [
        "import lab.json"
    ]
    assert store.device_count() == 2


async def test_sync_updates_area_and_curve_and_reports_conflicts(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=2)
    client = await hass_ws_client(hass)
    items = [
        device("Plug 01", area="Cellar", overrides={"power": {"signal": CONSTANT}}),
        device("Plug 02", template="climate_sensor"),
    ]

    result = (await send(client, "run", category="devices", mode="sync", items=items))["result"]

    assert (result["update"], result["conflict"]) == (1, 1)
    assert [problem["code"] for problem in result["problems"]] == ["TDC-GEN-013"]
    first = next(item for item in get_data(hass).store.devices() if item.name == "Plug 01")
    assert first.area == "Cellar"
    assert next(e for e in first.entities if e.key == "power").signal == CONSTANT


async def test_add_restores_the_seed_and_all_changed_fields(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    items = [
        device(
            "Lamp",
            seed=4711,
            overrides={"power": {"name": "Draw", "unit": "kW", "signal": CONSTANT}},
        ),
        device("Broken", overrides={"nothing": {"name": "x"}}),
    ]

    result = (await send(client, "run", category="devices", mode="add", items=items))["result"]

    assert (result["create"], [p["code"] for p in result["problems"]]) == (1, ["TDC-TPL-002"])
    lamp = next(item for item in get_data(hass).store.devices() if item.name == "Lamp")
    power = next(e for e in lamp.entities if e.key == "power")
    assert lamp.seed == 4711
    assert (power.name, power.unit, power.signal) == ("Draw", "kW", CONSTANT)


async def test_sync_reports_a_changed_seed_or_field_as_conflict(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=1)
    client = await hass_ws_client(hass)
    seed = get_data(hass).store.devices()[0].seed
    items = [device("Plug 01", seed=seed + 1)]

    result = (await send(client, "run", category="devices", mode="sync", items=items))["result"]
    assert (result["update"], result["conflict"]) == (0, 1)

    items = [device("Plug 01", seed=seed, overrides={"power": {"name": "Other"}})]
    result = (await send(client, "run", category="devices", mode="sync", items=items))["result"]
    assert (result["update"], result["conflict"]) == (0, 1)

    items = [device("Plug 01", seed=seed)]
    result = (await send(client, "run", category="devices", mode="sync", items=items))["result"]
    assert (result["update"], result["conflict"], result["skip"]) == (0, 0, 1)


async def test_an_unknown_reference_is_reported_and_the_entry_skipped(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    items = [
        {"name": "Nightly", "scenario": "Missing", "trigger": {"type": "times", "times": ["22:00"]}}
    ]

    result = (await send(client, "run", category="schedules", mode="add", items=items))["result"]

    assert (result["create"], result["skip"]) == (0, 1)
    assert result["problems"][0]["code"] == "TDC-GEN-012"
    assert get_data(hass).store.schedule_count() == 0


async def test_an_invalid_entry_does_not_stop_the_others(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    items = [{"template": "plug_metering"}, device("Good"), device("Bad {x}")]

    result = (await send(client, "run", category="devices", mode="add", items=items))["result"]

    assert result["create"] == 1
    assert sorted(problem["code"] for problem in result["problems"]) == [
        "TDC-GEN-010",
        "TDC-GEN-010",
    ]


async def test_scenarios_and_schedules_can_name_what_the_file_creates(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    scenario = {
        "name": "Burst",
        "steps": [{"target": {"device": "Lamp"}, "action": "turn_on", "entity": ""}],
    }
    schedule = {
        "name": "Nightly",
        "scenario": "Burst",
        "trigger": {"type": "times", "times": ["22:00"]},
    }
    known = {"devices": ["Lamp"], "scenarios": ["Burst"]}

    planned = (
        await send(client, "plan", category="scenarios", mode="add", items=[scenario], known=known)
    )["result"]
    assert planned["create"] == 1 and planned["problems"] == []

    await send(client, "run", category="devices", mode="add", items=[device("Lamp")])
    created = (await send(client, "run", category="scenarios", mode="add", items=[scenario]))[
        "result"
    ]
    assert created["create"] == 1, created
    created = (await send(client, "run", category="schedules", mode="add", items=[schedule]))[
        "result"
    ]
    assert created["create"] == 1, created
    store = get_data(hass).store
    assert store.schedules()[0].scenario == store.scenarios()[0].id


async def test_replace_removes_first_and_then_imports(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=3)
    client = await hass_ws_client(hass)

    purged = (await send(client, "run", category="devices", mode="replace", phase="purge"))[
        "result"
    ]
    assert purged["delete"] == 3
    assert get_data(hass).store.device_count() == 0

    result = (
        await send(client, "run", category="devices", mode="replace", items=[device("Only")])
    )["result"]
    assert result["create"] == 1
    assert [item.name for item in get_data(hass).store.devices()] == ["Only"]


async def test_replace_of_devices_that_a_schedule_names_is_refused_unless_it_is_replaced(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=1)
    data = get_data(hass)
    await data.schedules.async_add(
        {
            "name": "Toggle",
            "target": {"device": "Plug 01"},
            "action": "turn_on",
            "trigger": {"type": "times", "times": ["22:00"]},
        },
        "seed",
    )
    client = await hass_ws_client(hass)

    planned = (await send(client, "plan", category="devices", mode="replace"))["result"]
    assert [problem["code"] for problem in planned["problems"]] == ["TDC-REM-002"]
    refused = await send(client, "run", category="devices", mode="replace", phase="purge")
    assert refused["error"]["code"] == "TDC-REM-002"

    ok = await send(
        client, "plan", category="devices", mode="replace", replacing=["schedules", "devices"]
    )
    assert ok["result"]["problems"] == []


async def test_own_templates_are_imported_and_a_bundled_one_is_refused(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    entry: MockConfigEntry,
    tmp_path: Any,
) -> None:
    hass.config.config_dir = str(tmp_path)
    client = await hass_ws_client(hass)
    mine = {
        "id": "mine",
        "name": "Mine",
        "model": "Custom",
        "entities": [
            {"key": "level", "platform": "sensor", "name": "Level", "signal": {"shape": "sine"}}
        ],
    }
    bundled = {**mine, "id": "plug_metering"}

    result = (await send(client, "run", category="templates", mode="add", items=[mine, bundled]))[
        "result"
    ]

    assert result["create"] == 1
    assert [problem["code"] for problem in result["problems"]] == ["TDC-TPL-004"]
    assert "mine" in {item.id for item in get_data(hass).template_registry.all()}


async def test_groups_need_mqtt(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    result = (
        await send(
            client,
            "plan",
            category="groups",
            mode="add",
            items=[{"name": "All", "members": ["Plug 01"]}],
        )
    )["result"]
    assert result["problems"][0]["code"] == "TDC-OUT-002"


async def test_a_wrong_request_is_refused(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    for fields in (
        {"category": "areas", "mode": "add"},
        {"category": "devices", "mode": "merge"},
        {"category": "devices", "mode": "add", "items": [1]},
        {"category": "devices", "mode": "add", "items": [{}] * 501},
    ):
        assert (await send(client, "plan", **fields))["error"]["code"] == "TDC-WS-001"
