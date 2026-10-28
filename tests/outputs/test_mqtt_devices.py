"""Devices with the output mqtt: discovery, states, commands, faults, removal and restart."""

from __future__ import annotations

import json
from unittest.mock import MagicMock, patch

from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.dispatcher import async_dispatcher_send
import pytest
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_mqtt_message,
    async_fire_time_changed,
)

from custom_components.hass_test_data_creator.const import DOMAIN, SIGNAL_TICK
from custom_components.hass_test_data_creator.core.errors import ErrorCode, OutputError
from custom_components.hass_test_data_creator.core.runtime import get_data
from custom_components.hass_test_data_creator.engine.tick import signal_time

from ..conftest import create_devices


@pytest.fixture
def expected_lingering_timers() -> bool:
    """Let the periodic timer of the MQTT client of Home Assistant run past the test."""
    return True


def sent(mqtt_mock: MagicMock) -> dict[str, str]:
    """Return the last payload published on every topic."""
    return {call.args[0]: call.args[1] for call in mqtt_mock.async_publish.call_args_list}


def flags(mqtt_mock: MagicMock) -> dict[str, bool]:
    """Return whether the last message on every topic was retained."""
    return {call.args[0]: call.args[3] for call in mqtt_mock.async_publish.call_args_list}


async def make(hass: HomeAssistant, template: str, **fields: object) -> str:
    """Create one device with the output mqtt and return its id."""
    await create_devices(
        hass, template=template, count=1, name_pattern="Dev {nn}", output="mqtt", **fields
    )
    return get_data(hass).store.devices()[0].id


async def fire(hass: HomeAssistant, key: str, action: str, **params: object) -> None:
    """Run an action on an entity of "Dev 01"."""
    await hass.services.async_call(
        DOMAIN,
        "fire_event",
        {"device": "Dev 01", "entity": key, "action": action, "params": params},
        blocking=True,
    )
    await hass.async_block_till_done()


async def test_discovery_states_and_availability_are_published(
    hass: HomeAssistant, mqtt_mock: MagicMock, entry: MockConfigEntry
) -> None:
    device_id = await make(hass, "plug_metering", areas=["Kitchen"])
    topics = sent(mqtt_mock)

    switch = json.loads(topics[f"homeassistant/switch/tdc_{device_id}/state/config"])
    assert switch["state_topic"] == f"tdc/{device_id}/state/state"
    assert switch["command_topic"] == f"tdc/{device_id}/state/state/set"
    assert switch["unique_id"] == f"tdc_{device_id}_state"
    assert switch["device"]["identifiers"] == [f"tdc_{device_id}"]
    assert switch["device"]["suggested_area"] == "Kitchen"
    power = json.loads(topics[f"homeassistant/sensor/tdc_{device_id}/power/config"])
    assert power["unit_of_measurement"] == "W"
    assert power["device_class"] == "power"
    assert power["state_class"] == "measurement"

    assert topics[f"tdc/{device_id}/state/state"] == "OFF"
    assert float(topics[f"tdc/{device_id}/power/state"]) >= 0
    assert topics[f"tdc/{device_id}/power/availability"] == "online"
    assert all(flags(mqtt_mock)[topic] for topic in topics if topic.startswith("homeassistant/"))


async def test_home_assistant_creates_the_entities_through_discovery(
    hass: HomeAssistant, mqtt_mock: MagicMock, entry: MockConfigEntry
) -> None:
    device_id = await make(hass, "plug_metering")
    await hass.async_block_till_done()
    entities = er.async_get(hass).entities.values()
    assert {item.platform for item in entities} == {"mqtt"}
    assert f"tdc_{device_id}_state" in {item.unique_id for item in entities}
    assert hass.states.get("switch.dev_01_switch").state == "off"
    assert float(hass.states.get("sensor.dev_01_power").state) >= 0

    async_fire_mqtt_message(hass, f"tdc/{device_id}/state/state/set", "ON")
    await hass.async_block_till_done()
    assert sent(mqtt_mock)[f"tdc/{device_id}/state/state"] == "ON"


async def test_commands_and_actions_change_the_state_topic(
    hass: HomeAssistant, mqtt_mock: MagicMock, entry: MockConfigEntry
) -> None:
    device_id = await make(hass, "plug_metering")
    async_fire_mqtt_message(hass, f"tdc/{device_id}/state/state/set", "ON")
    await hass.async_block_till_done()
    assert sent(mqtt_mock)[f"tdc/{device_id}/state/state"] == "ON"

    await fire(hass, "state", "turn_off")
    assert sent(mqtt_mock)[f"tdc/{device_id}/state/state"] == "OFF"
    async_fire_mqtt_message(hass, f"tdc/{device_id}/state/state/set", "nonsense")
    async_fire_mqtt_message(hass, f"tdc/{device_id}/nope/state/set", "ON")
    await hass.async_block_till_done()
    assert sent(mqtt_mock)[f"tdc/{device_id}/state/state"] == "OFF"


async def test_light_cover_and_thermostat(
    hass: HomeAssistant, mqtt_mock: MagicMock, entry: MockConfigEntry
) -> None:
    light = await make(hass, "light")
    config = json.loads(sent(mqtt_mock)[f"homeassistant/light/tdc_{light}/light/config"])
    assert config["schema"] == "json"
    async_fire_mqtt_message(
        hass, f"tdc/{light}/light/state/set", json.dumps({"state": "ON", "brightness": 90})
    )
    await hass.async_block_till_done()
    state = json.loads(sent(mqtt_mock)[f"tdc/{light}/light/state"])
    assert (state["state"], state["brightness"]) == ("ON", 90)

    await hass.services.async_call(DOMAIN, "remove_all", {}, blocking=True)
    cover = await make(hass, "cover")
    assert sent(mqtt_mock)[f"tdc/{cover}/cover/position"] == "100"
    async_fire_mqtt_message(hass, f"tdc/{cover}/cover/command/set", "CLOSE")
    await hass.async_block_till_done()
    assert sent(mqtt_mock)[f"tdc/{cover}/cover/position"] == "0"
    async_fire_mqtt_message(hass, f"tdc/{cover}/cover/position/set", "35")
    await hass.async_block_till_done()
    assert sent(mqtt_mock)[f"tdc/{cover}/cover/position"] == "35"

    await hass.services.async_call(DOMAIN, "remove_all", {}, blocking=True)
    heater = await make(hass, "thermostat")
    topics = sent(mqtt_mock)
    assert topics[f"tdc/{heater}/thermostat/mode"] == "heat"
    assert topics[f"tdc/{heater}/thermostat/temperature"] == "21.0"
    assert 17 <= float(topics[f"tdc/{heater}/thermostat/current_temperature"]) <= 24
    async_fire_mqtt_message(hass, f"tdc/{heater}/thermostat/temperature/set", "99")
    async_fire_mqtt_message(hass, f"tdc/{heater}/thermostat/mode/set", "off")
    await hass.async_block_till_done()
    topics = sent(mqtt_mock)
    assert topics[f"tdc/{heater}/thermostat/temperature"] == "30.0"
    assert topics[f"tdc/{heater}/thermostat/mode"] == "off"


async def test_events_are_published_without_retain(
    hass: HomeAssistant, mqtt_mock: MagicMock, entry: MockConfigEntry
) -> None:
    device_id = await make(hass, "wall_button")
    config = json.loads(sent(mqtt_mock)[f"homeassistant/event/tdc_{device_id}/action/config"])
    assert config["event_types"] == ["single", "double", "hold"]

    await fire(hass, "action", "press", event_type="double")
    topic = f"tdc/{device_id}/action/event"
    assert json.loads(sent(mqtt_mock)[topic]) == {"event_type": "double"}
    assert flags(mqtt_mock)[topic] is False
    assert topic not in get_data(hass).store.topics()


async def test_state_sensors_publish_their_options(
    hass: HomeAssistant, mqtt_mock: MagicMock, entry: MockConfigEntry
) -> None:
    device_id = await make(hass, "washer")
    config = json.loads(sent(mqtt_mock)[f"homeassistant/sensor/tdc_{device_id}/program/config"])
    assert config["device_class"] == "enum"
    assert set(config["options"]) == {"idle", "wash", "rinse", "spin"}
    assert sent(mqtt_mock)[f"tdc/{device_id}/program/state"] in config["options"]


async def test_a_fault_marks_the_entity_unavailable_and_back(
    hass: HomeAssistant,
    mqtt_mock: MagicMock,
    freezer: FrozenDateTimeFactory,
    entry: MockConfigEntry,
) -> None:
    device_id = await make(hass, "plug_metering")
    topic = f"tdc/{device_id}/power/availability"
    await fire(hass, "power", "fault_unavailable", duration_s=30)
    assert sent(mqtt_mock)[topic] == "offline"

    freezer.tick(31)
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert sent(mqtt_mock)[topic] == "online"


async def test_the_tick_publishes_new_sensor_values(
    hass: HomeAssistant, mqtt_mock: MagicMock, entry: MockConfigEntry
) -> None:
    device_id = await make(hass, "plug_metering")
    topic = f"tdc/{device_id}/energy/state"
    before = float(sent(mqtt_mock)[topic])
    with patch(
        "custom_components.hass_test_data_creator.outputs.mqtt.runtime.signal_time",
        lambda: signal_time() + 36000,
    ):
        async_dispatcher_send(hass, SIGNAL_TICK)
        await hass.async_block_till_done()
    assert float(sent(mqtt_mock)[topic]) > before + 3


async def test_removing_the_device_deletes_all_its_retained_topics(
    hass: HomeAssistant, mqtt_mock: MagicMock, entry: MockConfigEntry
) -> None:
    device_id = await make(hass, "plug_metering")
    store = get_data(hass).store
    recorded = store.topics({device_id})
    assert f"homeassistant/switch/tdc_{device_id}/state/config" in recorded
    assert f"tdc/{device_id}/power/state" in recorded

    await hass.services.async_call(
        DOMAIN, "remove", {"target": "device", "target_id": device_id}, blocking=True
    )
    await hass.async_block_till_done()
    topics = sent(mqtt_mock)
    assert all(topics[topic] == "" for topic in recorded)
    assert store.topics() == []
    assert get_data(hass).live == {}


async def test_unloading_marks_everything_offline_and_a_reload_publishes_again(
    hass: HomeAssistant, mqtt_mock: MagicMock, entry: MockConfigEntry
) -> None:
    device_id = await make(hass, "plug_metering")
    topic = f"tdc/{device_id}/power/availability"
    config = f"homeassistant/sensor/tdc_{device_id}/power/config"

    assert await hass.config_entries.async_unload(entry.entry_id)
    assert sent(mqtt_mock)[topic] == "offline"

    mqtt_mock.async_publish.reset_mock()
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done(wait_background_tasks=True)
    assert sent(mqtt_mock)[topic] == "online"
    assert config in sent(mqtt_mock)

    async_fire_mqtt_message(hass, f"tdc/{device_id}/state/state/set", "ON")
    await hass.async_block_till_done()
    assert sent(mqtt_mock)[f"tdc/{device_id}/state/state"] == "ON"


async def test_creating_without_mqtt_fails_and_creates_nothing(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    with pytest.raises(OutputError) as error:
        await make(hass, "plug_metering")
    assert error.value.code is ErrorCode.OUT_MQTT_UNAVAILABLE
    assert get_data(hass).store.devices() == []
