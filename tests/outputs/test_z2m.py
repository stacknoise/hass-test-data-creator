"""The Zigbee2MQTT output: bridge topics, device states, commands, actions and the base topic."""

from __future__ import annotations

import asyncio
import json
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_mqtt_message,
    async_fire_time_changed,
)

from custom_components.hass_test_data_creator.const import (
    CONF_Z2M_BASE_TOPIC,
    CONF_Z2M_CONFIRM_DEFAULT,
    DOMAIN,
)
from custom_components.hass_test_data_creator.core.errors import ErrorCode, OutputError
from custom_components.hass_test_data_creator.core.runtime import get_data
from custom_components.hass_test_data_creator.outputs.mqtt.client import MqttClient

from ..conftest import create_devices

BASE = "tdc_z2m"


@pytest.fixture
def expected_lingering_timers() -> bool:
    """Let the periodic timer of the MQTT client of Home Assistant run past the test."""
    return True


def sent(mqtt_mock: MagicMock) -> dict[str, str]:
    """Return the last payload published on every topic."""
    return {call.args[0]: call.args[1] for call in mqtt_mock.async_publish.call_args_list}


def json_of(mqtt_mock: MagicMock, topic: str) -> Any:
    """Return the last payload of a topic as JSON."""
    return json.loads(sent(mqtt_mock)[topic])


async def make(hass: HomeAssistant, template: str, name: str = "Dev 01", **fields: object) -> str:
    """Create one device with the output z2m and return its id."""
    await create_devices(
        hass, template=template, count=1, name_pattern=name, output="z2m", **fields
    )
    return get_data(hass).store.devices()[-1].id


def exposes_of(mqtt_mock: MagicMock, name: str) -> list[dict[str, Any]]:
    """Return the exposes of a device from the last `bridge/devices`."""
    devices = json_of(mqtt_mock, f"{BASE}/bridge/devices")
    return next(item for item in devices if item["friendly_name"] == name)["definition"]["exposes"]


async def test_the_bridge_announces_itself_and_its_devices(
    hass: HomeAssistant, mqtt_mock: MagicMock, entry: MockConfigEntry
) -> None:
    await make(hass, "plug_metering")
    assert json_of(mqtt_mock, f"{BASE}/bridge/state") == {"state": "online"}
    info = json_of(mqtt_mock, f"{BASE}/bridge/info")
    assert info["config"]["mqtt"]["base_topic"] == BASE
    assert info["permit_join"] is False

    devices = json_of(mqtt_mock, f"{BASE}/bridge/devices")
    assert [item["type"] for item in devices] == ["Coordinator", "Router"]
    plug = devices[1]
    assert plug["friendly_name"] == "Dev 01"
    assert plug["ieee_address"].startswith("0x") and len(plug["ieee_address"]) == 18
    assert plug["definition"]["model"] == "TDC-PLUG-01"
    assert plug["definition"]["vendor"] == "TDC"
    assert plug["power_source"] == "Mains (single phase)"

    by_name = {item.get("name") or item["type"]: item for item in plug["definition"]["exposes"]}
    assert by_name["switch"]["features"][0]["value_toggle"] == "TOGGLE"
    assert by_name["power"]["unit"] == "W"
    assert by_name["linkquality"]["access"] == 1


async def test_the_state_and_availability_of_a_device(
    hass: HomeAssistant, mqtt_mock: MagicMock, entry: MockConfigEntry
) -> None:
    await make(hass, "plug_metering")
    state = json_of(mqtt_mock, f"{BASE}/Dev 01")
    assert state["state"] == "OFF"
    assert {"power", "energy", "voltage", "current", "linkquality"} <= set(state)
    assert json_of(mqtt_mock, f"{BASE}/Dev 01/availability") == {"state": "online"}
    assert f"{BASE}/Dev 01" in get_data(hass).store.topics()


async def test_set_applies_the_properties_and_publishes_the_new_state(
    hass: HomeAssistant, mqtt_mock: MagicMock, entry: MockConfigEntry
) -> None:
    await make(hass, "plug_metering")
    async_fire_mqtt_message(hass, f"{BASE}/Dev 01/set", '{"state": "ON"}')
    await hass.async_block_till_done()
    assert json_of(mqtt_mock, f"{BASE}/Dev 01")["state"] == "ON"

    async_fire_mqtt_message(hass, f"{BASE}/Dev 01/set", '{"state": "TOGGLE"}')
    await hass.async_block_till_done()
    assert json_of(mqtt_mock, f"{BASE}/Dev 01")["state"] == "OFF"

    async_fire_mqtt_message(hass, f"{BASE}/Dev 01/set", "not json")
    async_fire_mqtt_message(hass, f"{BASE}/Nobody/set", '{"state": "ON"}')
    await hass.async_block_till_done()
    assert json_of(mqtt_mock, f"{BASE}/Dev 01")["state"] == "OFF"


async def test_light_cover_and_thermostat_follow_the_z2m_properties(
    hass: HomeAssistant, mqtt_mock: MagicMock, entry: MockConfigEntry
) -> None:
    await make(hass, "light", "Lamp")
    async_fire_mqtt_message(hass, f"{BASE}/Lamp/set", '{"brightness": 120}')
    await hass.async_block_till_done()
    assert json_of(mqtt_mock, f"{BASE}/Lamp")["state"] == "ON"
    assert json_of(mqtt_mock, f"{BASE}/Lamp")["brightness"] == 120
    light = exposes_of(mqtt_mock, "Lamp")[0]
    assert light["type"] == "light"
    assert light["features"][1]["value_max"] == 254

    await make(hass, "cover", "Blind")
    async_fire_mqtt_message(hass, f"{BASE}/Blind/set", '{"position": 30}')
    await hass.async_block_till_done()
    assert json_of(mqtt_mock, f"{BASE}/Blind")["position"] == 30
    async_fire_mqtt_message(hass, f"{BASE}/Blind/set", '{"state": "CLOSE"}')
    await hass.async_block_till_done()
    assert json_of(mqtt_mock, f"{BASE}/Blind")["state"] == "CLOSE"

    await make(hass, "thermostat", "Heater")
    async_fire_mqtt_message(
        hass, f"{BASE}/Heater/set", '{"occupied_heating_setpoint": 99, "system_mode": "off"}'
    )
    await hass.async_block_till_done()
    heater = json_of(mqtt_mock, f"{BASE}/Heater")
    assert heater["occupied_heating_setpoint"] == 30
    assert heater["system_mode"] == "off"
    assert 17 <= heater["local_temperature"] <= 24


async def test_binary_sensors_use_the_z2m_names_and_buttons_publish_actions(
    hass: HomeAssistant, mqtt_mock: MagicMock, entry: MockConfigEntry
) -> None:
    await make(hass, "motion_sensor", "Motion")
    await make(hass, "contact_sensor", "Door")
    assert json_of(mqtt_mock, f"{BASE}/Motion")["occupancy"] is False
    assert json_of(mqtt_mock, f"{BASE}/Door")["contact"] is True
    names = {item.get("name") for item in exposes_of(mqtt_mock, "Door")}
    assert "contact" in names

    await make(hass, "wall_button", "Button")
    await hass.services.async_call(
        DOMAIN,
        "fire_event",
        {
            "device": "Button",
            "entity": "action",
            "action": "press",
            "params": {"event_type": "hold"},
        },
        blocking=True,
    )
    await hass.async_block_till_done()
    assert sent(mqtt_mock)[f"{BASE}/Button/action"] == "hold"
    assert f"{BASE}/Button/action" not in get_data(hass).store.topics()
    action = next(item for item in exposes_of(mqtt_mock, "Button") if item["name"] == "action")
    assert action["values"] == ["single", "double", "hold"]


async def test_a_fault_takes_the_device_offline_and_back(
    hass: HomeAssistant,
    mqtt_mock: MagicMock,
    freezer: FrozenDateTimeFactory,
    entry: MockConfigEntry,
) -> None:
    with patch.object(MqttClient, "async_retained", AsyncMock(return_value=None)):
        await make(hass, "plug_metering")
    await hass.services.async_call(
        DOMAIN,
        "fire_event",
        {
            "device": "Dev 01",
            "entity": "power",
            "action": "fault_unavailable",
            "params": {"duration_s": 30},
        },
        blocking=True,
    )
    await hass.async_block_till_done()
    assert json_of(mqtt_mock, f"{BASE}/Dev 01/availability") == {"state": "offline"}

    freezer.tick(31)
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert json_of(mqtt_mock, f"{BASE}/Dev 01/availability") == {"state": "online"}


async def test_removing_a_device_updates_the_device_list_and_deletes_its_topics(
    hass: HomeAssistant, mqtt_mock: MagicMock, entry: MockConfigEntry
) -> None:
    first = await make(hass, "plug_metering", "One")
    await make(hass, "light", "Two")
    await hass.services.async_call(
        DOMAIN, "remove", {"target": "device", "target_id": first}, blocking=True
    )
    await hass.async_block_till_done()

    devices = json_of(mqtt_mock, f"{BASE}/bridge/devices")
    assert [item["friendly_name"] for item in devices] == ["Coordinator", "Two"]
    assert sent(mqtt_mock)[f"{BASE}/One"] == ""
    assert f"{BASE}/bridge/state" in get_data(hass).store.topics()

    await hass.services.async_call(DOMAIN, "remove_all", {}, blocking=True)
    assert sent(mqtt_mock)[f"{BASE}/bridge/state"] == ""
    assert get_data(hass).store.topics() == []


async def test_unloading_marks_the_bridge_and_devices_offline(
    hass: HomeAssistant, mqtt_mock: MagicMock, entry: MockConfigEntry
) -> None:
    await make(hass, "plug_metering")
    assert await hass.config_entries.async_unload(entry.entry_id)
    assert json_of(mqtt_mock, f"{BASE}/bridge/state") == {"state": "offline"}
    assert json_of(mqtt_mock, f"{BASE}/Dev 01/availability") == {"state": "offline"}

    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done(wait_background_tasks=True)
    assert json_of(mqtt_mock, f"{BASE}/bridge/state") == {"state": "online"}
    assert json_of(mqtt_mock, f"{BASE}/Dev 01/availability") == {"state": "online"}


async def test_a_foreign_bridge_on_the_base_topic_stops_the_output(
    hass: HomeAssistant, mqtt_mock: MagicMock, entry: MockConfigEntry
) -> None:
    foreign = AsyncMock(return_value='{"state":"online"}')
    with patch.object(MqttClient, "async_retained", foreign), pytest.raises(OutputError) as error:
        await make(hass, "plug_metering")
    assert error.value.code is ErrorCode.OUT_FOREIGN_BRIDGE
    foreign.assert_awaited_with(f"{BASE}/bridge/state")
    assert get_data(hass).store.devices() == []


async def test_a_bridge_state_of_our_own_is_not_foreign(
    hass: HomeAssistant, mqtt_mock: MagicMock, entry: MockConfigEntry
) -> None:
    get_data(hass).store.add_topic(f"{BASE}/bridge/state", None)
    with patch.object(MqttClient, "async_retained", AsyncMock(return_value='{"state":"offline"}')):
        await make(hass, "plug_metering")
    assert json_of(mqtt_mock, f"{BASE}/bridge/state") == {"state": "online"}


async def test_reading_a_retained_message_waits_for_it(
    hass: HomeAssistant, mqtt_mock: MagicMock, entry: MockConfigEntry
) -> None:
    client = get_data(hass).mqtt
    reading = hass.async_create_task(client.async_retained("some/topic"))
    await asyncio.sleep(0.05)
    async_fire_mqtt_message(hass, "some/topic", "hello", retain=True)
    assert await reading == "hello"

    assert await client.async_retained("empty/topic") is None


async def test_the_default_zigbee2mqtt_topic_needs_a_confirmation(
    hass: HomeAssistant, mqtt_mock: MagicMock, entry: MockConfigEntry
) -> None:
    hass.config_entries.async_update_entry(entry, options={CONF_Z2M_BASE_TOPIC: "zigbee2mqtt"})
    await hass.async_block_till_done()
    with pytest.raises(OutputError) as error:
        await make(hass, "plug_metering")
    assert error.value.code is ErrorCode.OUT_Z2M_DEFAULT_TOPIC

    hass.config_entries.async_update_entry(
        entry, options={CONF_Z2M_BASE_TOPIC: "zigbee2mqtt", CONF_Z2M_CONFIRM_DEFAULT: True}
    )
    await hass.async_block_till_done()
    await make(hass, "plug_metering")
    assert "zigbee2mqtt/Dev 01" in sent(mqtt_mock)


async def test_the_options_flow_checks_the_topics(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    flow = await hass.config_entries.options.async_init(entry.entry_id)
    assert flow["type"] == "form"

    async def submit(**values: object) -> dict[str, Any]:
        data = {
            "mqtt_base_topic": "tdc",
            "z2m_base_topic": "tdc_z2m",
            "z2m_confirm_default_topic": False,
            **values,
        }
        return await hass.config_entries.options.async_configure(flow["flow_id"], data)

    assert (await submit(mqtt_base_topic="a/#"))["errors"] == {"mqtt_base_topic": "invalid_topic"}
    assert (await submit(z2m_base_topic="/x"))["errors"] == {"z2m_base_topic": "invalid_topic"}
    assert (await submit(z2m_base_topic="tdc"))["errors"] == {"z2m_base_topic": "same_topic"}
    unconfirmed = await submit(z2m_base_topic="zigbee2mqtt")
    assert unconfirmed["errors"] == {"z2m_base_topic": "unconfirmed_default_topic"}
    saved = await submit(mqtt_base_topic="my/tdc")
    assert saved["type"] == "create_entry"
    assert saved["data"]["mqtt_base_topic"] == "my/tdc"
