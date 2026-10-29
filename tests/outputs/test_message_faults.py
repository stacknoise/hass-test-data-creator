"""The faults late and duplicate: messages of the MQTT outputs are held back or sent again."""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_fire_time_changed

from custom_components.hass_test_data_creator.const import DOMAIN
from custom_components.hass_test_data_creator.core.errors import ErrorCode, ScheduleError
from custom_components.hass_test_data_creator.data import get_data
from custom_components.hass_test_data_creator.faults.factory import FaultFactory
from custom_components.hass_test_data_creator.outputs.mqtt.client import MqttClient

from ..conftest import create_devices, state_of


@pytest.fixture
def expected_lingering_timers() -> bool:
    """Let the periodic timer of the MQTT client of Home Assistant run past the test."""
    return True


def count(mqtt_mock: MagicMock, topic: str, payload: str | None = None) -> int:
    """Return how often a topic (and a payload) was published."""
    return sum(
        1
        for call in mqtt_mock.async_publish.call_args_list
        if call.args[0] == topic and (payload is None or call.args[1] == payload)
    )


async def make(hass: HomeAssistant, template: str, output: str, name: str = "Dev 01") -> str:
    """Create one device with the given output and return its id."""
    await create_devices(hass, template=template, count=1, name_pattern=name, output=output)
    return get_data(hass).store.devices()[-1].id


async def act(hass: HomeAssistant, entity: str, action: str) -> None:
    """Run a plain action on an entity of "Dev 01"."""
    await hass.services.async_call(
        DOMAIN,
        "fire_event",
        {"device": "Dev 01", "entity": entity, "action": action, "params": {}},
        blocking=True,
    )
    await hass.async_block_till_done()


async def fault(
    hass: HomeAssistant, entity: str, kind: str, name: str = "Dev 01", **p: float
) -> None:
    """Start a fault on an entity of a device."""
    await hass.services.async_call(
        DOMAIN,
        "fire_event",
        {"device": name, "entity": entity, "action": f"fault_{kind}", "params": p},
        blocking=True,
    )
    await hass.async_block_till_done()


async def test_duplicate_sends_every_state_message_again(
    hass: HomeAssistant, mqtt_mock: MagicMock, entry: MockConfigEntry
) -> None:
    device_id = await make(hass, "plug_metering", "mqtt")
    topic = f"tdc/{device_id}/state/state"
    await fault(hass, "state", "duplicate", copies=2)
    before = count(mqtt_mock, topic, "ON")

    await act(hass, "state", "turn_on")
    assert count(mqtt_mock, topic, "ON") - before == 3
    assert count(mqtt_mock, f"tdc/{device_id}/state/availability", "online") <= 3


async def test_duplicate_repeats_events(
    hass: HomeAssistant, mqtt_mock: MagicMock, entry: MockConfigEntry
) -> None:
    device_id = await make(hass, "wall_button", "mqtt")
    await fault(hass, "action", "duplicate", duration_s=60)
    await hass.services.async_call(
        DOMAIN,
        "fire_event",
        {"device": "Dev 01", "entity": "action", "action": "press", "params": {}},
        blocking=True,
    )
    await hass.async_block_till_done()
    assert count(mqtt_mock, f"tdc/{device_id}/action/event", '{"event_type": "single"}') == 2


async def test_late_holds_the_message_back_until_the_delay_has_passed(
    hass: HomeAssistant,
    mqtt_mock: MagicMock,
    freezer: FrozenDateTimeFactory,
    entry: MockConfigEntry,
) -> None:
    device_id = await make(hass, "plug_metering", "mqtt")
    topic = f"tdc/{device_id}/state/state"
    await fault(hass, "state", "late", delay_s=30, duration_s=600)

    await act(hass, "state", "turn_on")
    assert count(mqtt_mock, topic, "ON") == 0

    freezer.tick(31)
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert count(mqtt_mock, topic, "ON") == 1


async def test_late_messages_are_capped_and_the_oldest_is_dropped(
    hass: HomeAssistant,
    mqtt_mock: MagicMock,
    freezer: FrozenDateTimeFactory,
    entry: MockConfigEntry,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(
        "custom_components.hass_test_data_creator.outputs.mqtt.runtime.MAX_LATE_MESSAGES", 3
    )
    device_id = await make(hass, "plug_metering", "mqtt")
    topic = f"tdc/{device_id}/state/state"
    await fault(hass, "state", "late", delay_s=30, duration_s=600)
    before = count(mqtt_mock, topic)

    for _ in range(5):
        await act(hass, "state", "toggle")
        freezer.tick(1)
    assert sum(len(timers) for timers in get_data(hass).mqtt_devices._late.values()) == 3

    freezer.tick(60)
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert count(mqtt_mock, topic) - before == 3


async def test_the_fault_ends_and_messages_flow_again(
    hass: HomeAssistant,
    mqtt_mock: MagicMock,
    freezer: FrozenDateTimeFactory,
    entry: MockConfigEntry,
) -> None:
    device_id = await make(hass, "plug_metering", "mqtt")
    topic = f"tdc/{device_id}/state/state"
    await fault(hass, "state", "late", delay_s=30, duration_s=10)
    freezer.tick(11)
    async_fire_time_changed(hass)
    await hass.async_block_till_done()

    await act(hass, "state", "turn_on")
    assert count(mqtt_mock, topic, "ON") == 1


async def test_removing_the_device_drops_the_messages_that_are_still_held_back(
    hass: HomeAssistant,
    mqtt_mock: MagicMock,
    freezer: FrozenDateTimeFactory,
    entry: MockConfigEntry,
) -> None:
    device_id = await make(hass, "plug_metering", "mqtt")
    topic = f"tdc/{device_id}/state/state"
    await fault(hass, "state", "late", delay_s=30, duration_s=600)
    await act(hass, "state", "turn_on")

    await hass.services.async_call(
        DOMAIN, "remove", {"target": "device", "target_id": device_id}, blocking=True
    )
    freezer.tick(60)
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert count(mqtt_mock, topic, "ON") == 0
    assert get_data(hass).store.topics() == []


async def test_zigbee2mqtt_devices_publish_their_state_twice_or_late(
    hass: HomeAssistant,
    mqtt_mock: MagicMock,
    freezer: FrozenDateTimeFactory,
    entry: MockConfigEntry,
) -> None:
    with patch.object(MqttClient, "async_foreign_topic", AsyncMock(return_value=None)):
        await make(hass, "plug_metering", "z2m")
    topic = "tdc_z2m/Dev 01"
    await fault(hass, "state", "duplicate", copies=1, duration_s=600)
    before = count(mqtt_mock, topic)
    await act(hass, "state", "turn_on")
    assert count(mqtt_mock, topic) - before == 2

    await fault(hass, "state", "late", delay_s=20, duration_s=600)
    before = count(mqtt_mock, topic)
    await act(hass, "state", "turn_off")
    assert count(mqtt_mock, topic) == before
    freezer.tick(21)
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert count(mqtt_mock, topic) > before


async def test_native_devices_accept_the_faults_without_a_message_to_change(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    await make(hass, "plug_metering", "native")
    await fault(hass, "state", "duplicate", copies=3)
    await act(hass, "state", "turn_on")
    assert state_of(hass, "Dev 01", "state").state == "on"


def test_the_parameters_are_checked() -> None:
    factory = FaultFactory()
    late = factory.create("late", {"delay_s": 45, "duration_s": 90})
    assert (late.message_delay_s, late.duration_s) == (45, 90)
    assert factory.create("late", {}).message_delay_s == 30
    assert factory.create("duplicate", {}).message_repeats == 1
    for kind, params in (
        ("late", {"delay_s": 0}),
        ("duplicate", {"copies": 11}),
        ("duplicate", {"copies": 0}),
    ):
        with pytest.raises(ScheduleError) as error:
            factory.create(kind, params)
        assert error.value.code is ErrorCode.SCH_INVALID_FAULT
