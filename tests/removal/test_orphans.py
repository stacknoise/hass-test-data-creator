"""Retained topics of generated devices that the store does not know: scan and clear."""

from __future__ import annotations

import asyncio
from collections.abc import Iterator
from unittest.mock import AsyncMock, MagicMock, patch

from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_mqtt_message,
)
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.hass_test_data_creator.core.errors import ErrorCode, OutputError
from custom_components.hass_test_data_creator.data import get_data

from ..api.test_commands import call

DEVICE = "0123456789abcdef012345678"
OURS = [
    f"homeassistant/sensor/tdc_{DEVICE}/power/config",
    f"tdc/{DEVICE}/power/state",
    "tdc_z2m/bridge/state",
    "tdc_z2m/Plug 01",
]
NOT_OURS = [
    "homeassistant/sensor/other_device/power/config",
    "tdc/not_a_device_id/power/state",
    "tdc_other/anything",
    "zigbee2mqtt/bridge/state",
    "tdc/state",
]


@pytest.fixture
def expected_lingering_timers() -> bool:
    """Let the periodic timer of the MQTT client of Home Assistant run past the test."""
    return True


@pytest.fixture
def broker(entry: MockConfigEntry, hass: HomeAssistant) -> Iterator[AsyncMock]:
    """Make the scan see `OURS + NOT_OURS` as retained topics."""
    client = get_data(hass).mqtt
    with patch.object(
        client, "async_collect", AsyncMock(return_value=set(OURS + NOT_OURS))
    ) as collect:
        yield collect


async def test_the_scan_reports_only_topics_of_generated_devices(
    hass: HomeAssistant, broker: AsyncMock, mqtt_mock: MagicMock
) -> None:
    scanner = get_data(hass).orphans
    assert await scanner.async_scan() == sorted(OURS)
    patterns = broker.call_args.args[0]
    assert "tdc/#" in patterns
    assert "tdc_z2m/#" in patterns
    assert "homeassistant/+/tdc_+/+/config" in patterns


async def test_topics_the_store_recorded_are_not_orphans(
    hass: HomeAssistant, broker: AsyncMock, mqtt_mock: MagicMock
) -> None:
    get_data(hass).store.add_topic(OURS[0], DEVICE)
    assert OURS[0] not in await get_data(hass).orphans.async_scan()


async def test_clearing_deletes_only_what_the_scan_reports(
    hass: HomeAssistant, broker: AsyncMock, mqtt_mock: MagicMock
) -> None:
    asked = [OURS[0], NOT_OURS[0], NOT_OURS[3], "anything/else"]
    cleared = await get_data(hass).orphans.async_clear(asked)

    assert cleared == [OURS[0]]
    published = {call.args[0]: call.args[1] for call in mqtt_mock.async_publish.call_args_list}
    assert published[OURS[0]] == ""
    assert not set(NOT_OURS) & set(published)


async def test_the_default_zigbee2mqtt_base_topic_is_not_scanned(
    hass: HomeAssistant, broker: AsyncMock, mqtt_mock: MagicMock
) -> None:
    scanner = get_data(hass).orphans
    scanner._z2m_base = "zigbee2mqtt"
    broker.return_value = {"zigbee2mqtt/Lamp", "zigbee2mqtt/bridge/state"}

    assert await scanner.async_scan() == []
    assert "zigbee2mqtt/#" not in broker.call_args.args[0]


async def test_collect_sees_retained_messages_only(
    hass: HomeAssistant, entry: MockConfigEntry, mqtt_mock: MagicMock
) -> None:
    client = get_data(hass).mqtt
    scan = asyncio.create_task(client.async_collect(["tdc/#"]))
    await asyncio.sleep(0.05)
    async_fire_mqtt_message(hass, "tdc/a", "x", retain=True)
    async_fire_mqtt_message(hass, "tdc/b", "x", retain=False)
    async_fire_mqtt_message(hass, "tdc/c", "", retain=True)
    assert await scan == {"tdc/a"}


async def test_the_commands_scan_and_clear(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, broker: AsyncMock, mqtt_mock: MagicMock
) -> None:
    client = await hass_ws_client(hass)
    scanned = await call(client, "removal/orphan_topics")
    assert scanned["result"]["topics"] == sorted(OURS)

    cleared = await call(client, "removal/orphan_topics_clear", topics=[OURS[1], NOT_OURS[0]])
    assert cleared["result"] == {"cleared": [OURS[1]]}


async def test_without_mqtt_the_scan_fails_with_its_code(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    reply = await call(client, "removal/orphan_topics")
    assert reply["error"]["code"] == ErrorCode.OUT_MQTT_UNAVAILABLE.value
    assert OutputError
