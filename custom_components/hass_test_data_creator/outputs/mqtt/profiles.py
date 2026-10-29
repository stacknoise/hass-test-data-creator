"""How each platform looks over MQTT discovery: config, states and commands (concept 7.3)."""

from __future__ import annotations

from abc import ABC, abstractmethod
from collections.abc import Callable
from dataclasses import dataclass
import json
from typing import Any

from ...const import COVER_CLOSED_POSITION, COVER_OPEN_POSITION, MANUFACTURER, TEMPERATURE_STEP
from ...core.errors import ErrorCode, OutputError
from ...core.keys import (
    KEY_AVAILABILITY,
    KEY_BINARY_SENSOR,
    KEY_BRIGHTNESS,
    KEY_CLIMATE,
    KEY_COMMAND_TOPIC,
    KEY_COVER,
    KEY_DEVICE,
    KEY_DEVICE_CLASS,
    KEY_ENUM,
    KEY_EVENT,
    KEY_EVENT_TYPES,
    KEY_HEAT,
    KEY_LIGHT,
    KEY_MODE,
    KEY_MODEL,
    KEY_NAME,
    KEY_OFF,
    KEY_POSITION,
    KEY_SENSOR,
    KEY_SHAPE,
    KEY_STATE,
    KEY_STATE_CLASS,
    KEY_STATE_MACHINE,
    KEY_STATE_TOPIC,
    KEY_STATES,
    KEY_SWITCH,
    KEY_TEMPERATURE,
    KEY_VALUE,
    KEY_VALUES,
    VALUE_CLOSE,
    VALUE_OPEN,
)
from ...engine.behaviours import (
    Behaviour,
    BinarySensorBehaviour,
    ClimateBehaviour,
    CoverBehaviour,
    EventBehaviour,
    LightBehaviour,
    OnOffBehaviour,
    SensorBehaviour,
)
from ...model.identifiers import mqtt_device_identifier, mqtt_unique_id
from ...model.models import DeviceDef, EntityDef

ON = "ON"
OFF = "OFF"
ONLINE = "online"
OFFLINE = "offline"
SET = "set"
Send = Callable[[str, str], None]


@dataclass(frozen=True)
class Topics:
    """The topics of one entity below the base topic: `<base>/<device>/<key>/<facet>[/set]`."""

    base: str
    device_id: str
    key: str

    def facet(self, name: str, *, command: bool = False) -> str:
        """Return the state topic of `name`, or its command topic."""
        topic = f"{self.base}/{self.device_id}/{self.key}/{name}"
        return f"{topic}/{SET}" if command else topic


class MqttProfile(ABC):
    """What one platform publishes and accepts; created only by the MqttProfileFactory."""

    component: str

    def config(self, topics: Topics, device: DeviceDef, definition: EntityDef) -> dict[str, Any]:
        """Return the discovery payload: the common part plus what the platform adds."""
        payload: dict[str, Any] = {
            KEY_NAME: definition.name,
            "unique_id": mqtt_unique_id(device.id, definition.key),
            "availability_topic": topics.facet(KEY_AVAILABILITY),
            "payload_available": ONLINE,
            "payload_not_available": OFFLINE,
            KEY_DEVICE: {
                "identifiers": [mqtt_device_identifier(device.id)],
                KEY_NAME: device.name,
                "manufacturer": MANUFACTURER,
                KEY_MODEL: device.model,
                **({"suggested_area": device.area} if device.area else {}),
            },
        }
        if definition.device_class:
            payload[KEY_DEVICE_CLASS] = definition.device_class
        if definition.entity_category:
            payload["entity_category"] = definition.entity_category
        return {**payload, **self.platform_fields(topics, definition)}

    @abstractmethod
    def platform_fields(self, topics: Topics, definition: EntityDef) -> dict[str, Any]:
        """Return the platform specific part of the discovery payload."""

    @abstractmethod
    def states(self, behaviour: Any) -> dict[str, str]:
        """Return the payload of every state facet of the behaviour."""

    def command(self, behaviour: Any, facet: str, payload: str) -> None:
        """Apply a command received on `<facet>/set`; platforms without commands ignore it."""
        return None

    def attach(self, behaviour: Behaviour, send: Send) -> None:
        """Let the behaviour publish things that are not states (events); `send(facet, payload)`."""
        return None


class SensorProfile(MqttProfile):
    """A sensor: one state, a number or a state name."""

    component = KEY_SENSOR

    def platform_fields(self, topics: Topics, definition: EntityDef) -> dict[str, Any]:
        """Return the state topic, unit and state class."""
        extra: dict[str, Any] = {KEY_STATE_TOPIC: topics.facet(KEY_STATE)}
        if definition.unit:
            extra["unit_of_measurement"] = definition.unit
        if definition.state_class:
            extra[KEY_STATE_CLASS] = definition.state_class
        return extra

    def config(self, topics: Topics, device: DeviceDef, definition: EntityDef) -> dict[str, Any]:
        """Add the options of a sensor with states."""
        payload = super().config(topics, device, definition)
        options = _options(definition)
        if options:
            payload.update({KEY_DEVICE_CLASS: KEY_ENUM, "options": options})
        return payload

    def states(self, behaviour: SensorBehaviour) -> dict[str, str]:
        """Return the current value."""
        return {KEY_STATE: str(behaviour.native_value)}


def _options(definition: EntityDef) -> list[str]:
    """Return the states of a sensor with a discrete signal, or an empty list."""
    signal = definition.signal or {}
    if signal.get(KEY_SHAPE) == KEY_ENUM:
        return list(dict.fromkeys(str(item) for item in signal.get(KEY_VALUES, ())))
    if signal.get(KEY_SHAPE) == KEY_STATE_MACHINE:
        return list(dict.fromkeys(str(item[KEY_VALUE]) for item in signal.get(KEY_STATES, ())))
    return []


class BinarySensorProfile(MqttProfile):
    """A binary sensor: ON or OFF."""

    component = KEY_BINARY_SENSOR

    def platform_fields(self, topics: Topics, definition: EntityDef) -> dict[str, Any]:
        """Return the state topic and the payloads."""
        return {KEY_STATE_TOPIC: topics.facet(KEY_STATE), "payload_on": ON, "payload_off": OFF}

    def states(self, behaviour: BinarySensorBehaviour) -> dict[str, str]:
        """Return ON or OFF."""
        return {KEY_STATE: ON if behaviour.is_on else OFF}


class SwitchProfile(MqttProfile):
    """A switch: ON or OFF, set by the same payloads."""

    component = KEY_SWITCH

    def platform_fields(self, topics: Topics, definition: EntityDef) -> dict[str, Any]:
        """Return the state and command topics."""
        return {
            KEY_STATE_TOPIC: topics.facet(KEY_STATE),
            KEY_COMMAND_TOPIC: topics.facet(KEY_STATE, command=True),
            "payload_on": ON,
            "payload_off": OFF,
        }

    def states(self, behaviour: OnOffBehaviour) -> dict[str, str]:
        """Return ON or OFF."""
        return {KEY_STATE: ON if behaviour.is_on else OFF}

    def command(self, behaviour: OnOffBehaviour, facet: str, payload: str) -> None:
        """Switch on or off."""
        if payload == ON:
            behaviour.turn_on()
        elif payload == OFF:
            behaviour.turn_off()


class LightProfile(MqttProfile):
    """A dimmable light with the JSON schema."""

    component = KEY_LIGHT

    def platform_fields(self, topics: Topics, definition: EntityDef) -> dict[str, Any]:
        """Return the JSON schema with brightness."""
        return {
            "schema": "json",
            KEY_STATE_TOPIC: topics.facet(KEY_STATE),
            KEY_COMMAND_TOPIC: topics.facet(KEY_STATE, command=True),
            KEY_BRIGHTNESS: True,
            "supported_color_modes": [KEY_BRIGHTNESS],
        }

    def states(self, behaviour: LightBehaviour) -> dict[str, str]:
        """Return state, brightness and color mode as JSON."""
        return {
            KEY_STATE: json.dumps(
                {
                    KEY_STATE: ON if behaviour.is_on else OFF,
                    KEY_BRIGHTNESS: behaviour.brightness,
                    "color_mode": KEY_BRIGHTNESS,
                }
            )
        }

    def command(self, behaviour: LightBehaviour, facet: str, payload: str) -> None:
        """Apply a JSON command with `state` and optionally `brightness`."""
        data = json.loads(payload)
        if data.get(KEY_STATE) == OFF:
            behaviour.turn_off()
        else:
            brightness = data.get(KEY_BRIGHTNESS)
            behaviour.turn_on(None if brightness is None else int(brightness))


class CoverProfile(MqttProfile):
    """A cover with a position; open and close are commands."""

    component = KEY_COVER

    def platform_fields(self, topics: Topics, definition: EntityDef) -> dict[str, Any]:
        """Return the position, command and set position topics."""
        return {
            "position_topic": topics.facet(KEY_POSITION),
            "set_position_topic": topics.facet(KEY_POSITION, command=True),
            KEY_COMMAND_TOPIC: topics.facet("command", command=True),
            "payload_open": VALUE_OPEN,
            "payload_close": VALUE_CLOSE,
            "payload_stop": "STOP",
            "position_open": COVER_OPEN_POSITION,
            "position_closed": COVER_CLOSED_POSITION,
        }

    def states(self, behaviour: CoverBehaviour) -> dict[str, str]:
        """Return the position."""
        return {KEY_POSITION: str(behaviour.position)}

    def command(self, behaviour: CoverBehaviour, facet: str, payload: str) -> None:
        """Open, close or move to a position."""
        if facet == KEY_POSITION:
            behaviour.set_position(int(float(payload)))
        elif payload == VALUE_OPEN:
            behaviour.open_cover()
        elif payload == VALUE_CLOSE:
            behaviour.close_cover()


class ClimateProfile(MqttProfile):
    """A thermostat with off and heat."""

    component = KEY_CLIMATE

    def platform_fields(self, topics: Topics, definition: EntityDef) -> dict[str, Any]:
        """Return the topics of mode, target and measured temperature."""
        return {
            "modes": [KEY_OFF, KEY_HEAT],
            "mode_state_topic": topics.facet(KEY_MODE),
            "mode_command_topic": topics.facet(KEY_MODE, command=True),
            "temperature_state_topic": topics.facet(KEY_TEMPERATURE),
            "temperature_command_topic": topics.facet(KEY_TEMPERATURE, command=True),
            "current_temperature_topic": topics.facet("current_temperature"),
            "min_temp": ClimateBehaviour.min_temp,
            "max_temp": ClimateBehaviour.max_temp,
            "temp_step": TEMPERATURE_STEP,
            "temperature_unit": "C",
        }

    def states(self, behaviour: ClimateBehaviour) -> dict[str, str]:
        """Return mode, target and measured temperature."""
        return {
            KEY_MODE: KEY_HEAT if behaviour.heating else KEY_OFF,
            KEY_TEMPERATURE: str(behaviour.target),
            "current_temperature": str(behaviour.measured()),
        }

    def command(self, behaviour: ClimateBehaviour, facet: str, payload: str) -> None:
        """Set the mode or the target temperature."""
        if facet == KEY_MODE:
            behaviour.set_heating(payload == KEY_HEAT)
        else:
            value = float(payload)
            behaviour.set_target(max(behaviour.min_temp, min(behaviour.max_temp, value)))


class EventProfile(MqttProfile):
    """An event entity: events are published as JSON and are not retained."""

    component = KEY_EVENT

    def platform_fields(self, topics: Topics, definition: EntityDef) -> dict[str, Any]:
        """Return the event topic and the event types."""
        return {
            KEY_STATE_TOPIC: topics.facet(KEY_EVENT),
            KEY_EVENT_TYPES: list(definition.event_types or []),
        }

    def states(self, behaviour: EventBehaviour) -> dict[str, str]:
        """Events have no state to publish."""
        return {}

    def attach(self, behaviour: Behaviour, send: Send) -> None:
        """Publish every event of the behaviour as `{"event_type": ...}`."""
        if isinstance(behaviour, EventBehaviour):
            behaviour.on_event = lambda event_type: send(
                KEY_EVENT, json.dumps({"event_type": event_type})
            )


_PROFILES: dict[str, type[MqttProfile]] = {
    KEY_SENSOR: SensorProfile,
    KEY_BINARY_SENSOR: BinarySensorProfile,
    KEY_SWITCH: SwitchProfile,
    KEY_LIGHT: LightProfile,
    KEY_COVER: CoverProfile,
    KEY_CLIMATE: ClimateProfile,
    KEY_EVENT: EventProfile,
}


class MqttProfileFactory:
    """Creates the MQTT profile for a platform."""

    def create(self, platform: str) -> MqttProfile:
        """Return the profile of `platform` or raise TDC-OUT-001."""
        profile = _PROFILES.get(platform)
        if profile is None:
            raise OutputError(ErrorCode.OUT_UNSUPPORTED)
        return profile()
