"""The MQTT client: publishing, recording, subscribing and the cleanup of retained topics."""

from __future__ import annotations

from unittest.mock import MagicMock

from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_fire_mqtt_message

from custom_components.hass_test_data_creator.const import DOMAIN
from custom_components.hass_test_data_creator.core.errors import ErrorCode, OutputError
from custom_components.hass_test_data_creator.core.runtime import get_data

from ..conftest import create_devices


@pytest.fixture
def expected_lingering_timers() -> bool:
    """Let the periodic timer of the MQTT client of Home Assistant run past the test."""
    return True


def published(mqtt_mock: MagicMock, topic: str, payload: str) -> None:
    """Assert that a retained message was published; the client adds an expiry argument."""
    mqtt_mock.async_publish.assert_any_call(topic, payload, 0, True, message_expiry_interval=None)


async def test_retained_topics_are_recorded_per_device(
    hass: HomeAssistant, mqtt_mock: MagicMock, entry: MockConfigEntry
) -> None:
    mqtt = get_data(hass).mqtt
    assert mqtt.available()
    await mqtt.async_publish("tdc/a/state", "on", device_id="d1")
    await mqtt.async_publish("tdc/bridge/state", "online")
    await mqtt.async_publish("tdc/a/live", "x", retain=False, device_id="d1")

    published(mqtt_mock, "tdc/a/state", "on")
    store = get_data(hass).store
    assert store.topics() == ["tdc/a/state", "tdc/bridge/state"]
    assert store.topics({"d1"}) == ["tdc/a/state"]


async def test_clearing_deletes_the_retained_messages_and_forgets_the_topics(
    hass: HomeAssistant, mqtt_mock: MagicMock, entry: MockConfigEntry
) -> None:
    mqtt = get_data(hass).mqtt
    await mqtt.async_publish("tdc/a/state", "on")
    await mqtt.async_clear(["tdc/a/state"])

    published(mqtt_mock, "tdc/a/state", "")
    assert get_data(hass).store.topics() == []


async def test_messages_reach_the_subscriber(
    hass: HomeAssistant, mqtt_mock: MagicMock, entry: MockConfigEntry
) -> None:
    received: list[tuple[str, str]] = []
    unsubscribe = await get_data(hass).mqtt.async_subscribe(
        "tdc/+/set", lambda topic, payload: received.append((topic, payload))
    )
    async_fire_mqtt_message(hass, "tdc/lamp/set", '{"state": "ON"}')
    await hass.async_block_till_done()
    assert received == [("tdc/lamp/set", '{"state": "ON"}')]

    unsubscribe()
    async_fire_mqtt_message(hass, "tdc/lamp/set", "again")
    await hass.async_block_till_done()
    assert len(received) == 1


async def test_remove_all_clears_the_topics_of_everything(
    hass: HomeAssistant, mqtt_mock: MagicMock, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=1)
    await get_data(hass).mqtt.async_publish("tdc/bridge/state", "online")

    plan = get_data(hass).removal_planner.plan("all", None)
    assert plan.topics == ["tdc/bridge/state"]
    assert plan.to_dict()["topics"] == ["tdc/bridge/state"]
    result = await hass.services.async_call(
        DOMAIN, "remove_all", {}, blocking=True, return_response=True
    )

    assert result["topics"] == 1
    published(mqtt_mock, "tdc/bridge/state", "")
    assert get_data(hass).store.topics() == []


async def test_removing_a_device_clears_only_its_topics(
    hass: HomeAssistant, mqtt_mock: MagicMock, entry: MockConfigEntry
) -> None:
    await create_devices(hass, count=2)
    first, second = get_data(hass).store.devices()
    mqtt = get_data(hass).mqtt
    await mqtt.async_publish("tdc/one", "1", device_id=first.id)
    await mqtt.async_publish("tdc/two", "2", device_id=second.id)

    await hass.services.async_call(
        DOMAIN, "remove", {"target": "device", "target_id": first.id}, blocking=True
    )
    assert get_data(hass).store.topics() == ["tdc/two"]


async def test_without_mqtt_publishing_fails_and_removal_with_topics_stops(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    data = get_data(hass)
    assert not data.mqtt.available()
    with pytest.raises(OutputError) as error:
        await data.mqtt.async_publish("tdc/a", "x")
    assert error.value.code is ErrorCode.OUT_MQTT_UNAVAILABLE

    await create_devices(hass, count=1)
    data.store.add_topic("tdc/a", None)
    with pytest.raises(OutputError):
        await hass.services.async_call(DOMAIN, "remove_all", {}, blocking=True)
    assert len(data.store.devices()) == 1
    assert data.store.topics() == ["tdc/a"]

    data.store.forget_topics(["tdc/a"])
    await hass.services.async_call(DOMAIN, "remove_all", {}, blocking=True)
    assert data.store.devices() == []
