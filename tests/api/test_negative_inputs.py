"""Requests with oversized, wrong or hostile values are refused with a TDC error."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.hass_test_data_creator.const import (
    MAX_AREAS_PER_JOB,
    MAX_ENTITIES_PER_DEVICE,
    MAX_PARAMS_BYTES,
    MAX_SHORT_TEXT,
)

from .test_commands import call

SENSOR = {"key": "level", "platform": "sensor", "name": "Level", "signal": {"shape": "sine"}}

CASES: list[tuple[str, dict[str, Any]]] = [
    (
        "devices/fire",
        {"device": "x", "entity": "y", "action": "z", "params": {"k": "v" * MAX_PARAMS_BYTES}},
    ),
    ("devices/fire", {"device": "x" * (MAX_SHORT_TEXT + 1), "entity": "y", "action": "z"}),
    (
        "devices/create",
        {"template": "plug_metering", "count": 1, "areas": ["A"] * (MAX_AREAS_PER_JOB + 1)},
    ),
    (
        "devices/create",
        {"template": "custom", "count": 1, "entities": [SENSOR] * (MAX_ENTITIES_PER_DEVICE + 1)},
    ),
    ("devices/create", {"template": "plug_metering", "count": 0}),
    ("devices/update", {"device": "x", "area": "a" * 500}),
    (
        "schedules/add",
        {
            "name": "n",
            "target": {"all": True},
            "action": "toggle",
            "trigger": {"type": "times", "times": ["12:00"], "pad": "x" * 5000},
        },
    ),
    (
        "schedules/add",
        {
            "name": "n",
            "target": {"template": "t" * 500},
            "action": "toggle",
            "trigger": {"type": "times", "times": ["12:00"]},
        },
    ),
    ("groups/add", {"name": "g", "members": []}),
    ("history/import", {"days": 0}),
    ("history/import", {"days": 100000}),
]


@pytest.mark.parametrize(("command", "fields"), CASES)
async def test_hostile_requests_are_refused(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    entry: MockConfigEntry,
    command: str,
    fields: dict[str, Any],
) -> None:
    client = await hass_ws_client(hass)
    reply = await call(client, command, **fields)
    assert not reply["success"]
    assert reply["error"]["code"].startswith("TDC-")
    assert reply["error"]["code"] != "TDC-INT-001"


async def test_a_schema_error_is_answered_with_the_request_code(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    reply = await call(client, "devices/create", template="plug_metering", count="many")
    assert not reply["success"]
    assert reply["error"]["code"] == "TDC-WS-001"
