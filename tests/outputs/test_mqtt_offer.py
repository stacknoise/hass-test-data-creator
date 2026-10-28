"""The panel is told about the MQTT outputs only while MQTT is connected."""

from __future__ import annotations

from unittest.mock import MagicMock

from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.hass_test_data_creator.const import DOMAIN


@pytest.fixture
def expected_lingering_timers() -> bool:
    """Let the periodic timer of the MQTT client of Home Assistant run past the test."""
    return True


async def _info(hass: HomeAssistant, hass_ws_client: WebSocketGenerator) -> dict:
    """Return the result of the info command."""
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": f"{DOMAIN}/info"})
    return (await client.receive_json())["result"]


async def test_the_mqtt_outputs_are_offered_with_a_broker(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    mqtt_mock: MagicMock,
    entry: MockConfigEntry,
) -> None:
    info = await _info(hass, hass_ws_client)
    assert info["mqtt"] is True
    assert info["outputs"] == ["native", "mqtt", "z2m"]


async def test_only_the_native_output_is_offered_without_a_broker(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    info = await _info(hass, hass_ws_client)
    assert info["mqtt"] is False
    assert info["outputs"] == ["native"]
