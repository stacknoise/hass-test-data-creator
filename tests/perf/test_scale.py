"""Scale test (concept 11): 1000 devices must keep the tick, actions, lists and Z2M groups fast.

Marked `slow`; the pull request run skips it and the nightly run executes it.
"""

from __future__ import annotations

import time
from unittest.mock import MagicMock

from homeassistant.core import HomeAssistant
from homeassistant.helpers.dispatcher import async_dispatcher_send
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_fire_mqtt_message
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.hass_test_data_creator.const import DOMAIN, MAX_BATCH, SIGNAL_TICK
from custom_components.hass_test_data_creator.core.runtime import get_data

from ..conftest import create_devices

pytestmark = pytest.mark.slow

TICK_INTERVAL_SECONDS = 10
DEVICES = 1000
TICKS = 20


@pytest.fixture
def expected_lingering_timers() -> bool:
    """Let the periodic timer of the MQTT client of Home Assistant run past the test."""
    return True


async def test_a_thousand_devices_keep_the_tick_actions_and_lists_fast(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    for _ in range(DEVICES // MAX_BATCH):
        await create_devices(hass, count=MAX_BATCH, name_pattern="Plug {nn}")
    data = get_data(hass)
    assert data.store.device_count() == DEVICES

    started = time.perf_counter()
    for _ in range(TICKS):
        async_dispatcher_send(hass, SIGNAL_TICK)
        await hass.async_block_till_done()
    per_tick = (time.perf_counter() - started) / TICKS
    assert per_tick < TICK_INTERVAL_SECONDS / 2

    started = time.perf_counter()
    await data.action_runner.async_run_on(
        data.action_runner.devices_for({"all": True}), "state", "turn_on", {}, "scale"
    )
    await hass.async_block_till_done()
    assert time.perf_counter() - started < 1.0

    client = await hass_ws_client(hass)
    for command, fields, limit in (
        ("devices/list", {"limit": 500}, 1.0),
        ("devices/names", {}, 0.3),
    ):
        started = time.perf_counter()
        await client.send_json_auto_id({"type": f"{DOMAIN}/{command}", **fields})
        assert (await client.receive_json())["success"]
        assert time.perf_counter() - started < limit, command


async def test_a_z2m_group_of_200_devices_publishes_fast(
    hass: HomeAssistant, mqtt_mock: MagicMock, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=200, name_pattern="Lamp {nn}", template="light", output="z2m")
    devices = get_data(hass).store.devices()
    members = [device.name for device in devices]
    await hass.services.async_call(
        DOMAIN, "add_group", {"name": "Big", "members": members}, blocking=True
    )

    started = time.perf_counter()
    async_fire_mqtt_message(hass, f"tdc_z2m/{devices[0].name}/set", '{"state": "ON"}')
    await hass.async_block_till_done()
    assert time.perf_counter() - started < 0.1
