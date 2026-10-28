"""How each platform looks over MQTT discovery: config, states and commands (concept 7.3)."""

from __future__ import annotations

from abc import ABC, abstractmethod
from collections.abc import Callable
from dataclasses import dataclass
import json
from typing import Any

from ...const import MANUFACTURER
from ...core.errors import ErrorCode, OutputError
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
from ...model.models import DeviceDef, EntityDef

ON = "ON"
OFF = "OFF"
ONLINE = "online"
OFFLINE = "offline"
SET = "set"
Send = Callable[[str, str], None]


def mqtt_unique_id(device_id: str, key: str) -> str:
    """Return the unique id of the MQTT entity of `key` of a device."""
    return f"tdc_{device_id}_{key}"


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
            "name": definition.name,
            "unique_id": mqtt_unique_id(device.id, definition.key),
            "availability_topic": topics.facet("availability"),
            "payload_available": ONLINE,
            "payload_not_available": OFFLINE,
            "device": {
                "identifiers": [f"tdc_{device.id}"],
                "name": device.name,
                "manufacturer": MANUFACTURER,
                "model": device.model,
                **({"suggested_area": device.area} if device.area else {}),
            },
        }
        if definition.device_class:
            payload["device_class"] = definition.device_class
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

    component = "sensor"

    def platform_fields(self, topics: Topics, definition: EntityDef) -> dict[str, Any]:
        """Return the state topic, unit and state class."""
        extra: dict[str, Any] = {"state_topic": topics.facet("state")}
        if definition.unit:
            extra["unit_of_measurement"] = definition.unit
        if definition.state_class:
            extra["state_class"] = definition.state_class
        return extra

    def config(self, topics: Topics, device: DeviceDef, definition: EntityDef) -> dict[str, Any]:
        """Add the options of a sensor with states."""
        payload = super().config(topics, device, definition)
        options = _options(definition)
        if options:
            payload.update({"device_class": "enum", "options": options})
        return payload

    def states(self, behaviour: SensorBehaviour) -> dict[str, str]:
        """Return the current value."""
        return {"state": str(behaviour.native_value)}


def _options(definition: EntityDef) -> list[str]:
    """Return the states of a sensor with a discrete signal, or an empty list."""
    signal = definition.signal or {}
    if signal.get("shape") == "enum":
        return list(dict.fromkeys(str(item) for item in signal.get("values", ())))
    if signal.get("shape") == "state_machine":
        return list(dict.fromkeys(str(item["value"]) for item in signal.get("states", ())))
    return []


class BinarySensorProfile(MqttProfile):
    """A binary sensor: ON or OFF."""

    component = "binary_sensor"

    def platform_fields(self, topics: Topics, definition: EntityDef) -> dict[str, Any]:
        """Return the state topic and the payloads."""
        return {"state_topic": topics.facet("state"), "payload_on": ON, "payload_off": OFF}

    def states(self, behaviour: BinarySensorBehaviour) -> dict[str, str]:
        """Return ON or OFF."""
        return {"state": ON if behaviour.is_on else OFF}


class SwitchProfile(MqttProfile):
    """A switch: ON or OFF, set by the same payloads."""

    component = "switch"

    def platform_fields(self, topics: Topics, definition: EntityDef) -> dict[str, Any]:
        """Return the state and command topics."""
        return {
            "state_topic": topics.facet("state"),
            "command_topic": topics.facet("state", command=True),
            "payload_on": ON,
            "payload_off": OFF,
        }

    def states(self, behaviour: OnOffBehaviour) -> dict[str, str]:
        """Return ON or OFF."""
        return {"state": ON if behaviour.is_on else OFF}

    def command(self, behaviour: OnOffBehaviour, facet: str, payload: str) -> None:
        """Switch on or off."""
        if payload == ON:
            behaviour.turn_on()
        elif payload == OFF:
            behaviour.turn_off()


class LightProfile(MqttProfile):
    """A dimmable light with the JSON schema."""

    component = "light"

    def platform_fields(self, topics: Topics, definition: EntityDef) -> dict[str, Any]:
        """Return the JSON schema with brightness."""
        return {
            "schema": "json",
            "state_topic": topics.facet("state"),
            "command_topic": topics.facet("state", command=True),
            "brightness": True,
            "supported_color_modes": ["brightness"],
        }

    def states(self, behaviour: LightBehaviour) -> dict[str, str]:
        """Return state, brightness and color mode as JSON."""
        return {
            "state": json.dumps(
                {
                    "state": ON if behaviour.is_on else OFF,
                    "brightness": behaviour.brightness,
                    "color_mode": "brightness",
                }
            )
        }

    def command(self, behaviour: LightBehaviour, facet: str, payload: str) -> None:
        """Apply a JSON command with `state` and optionally `brightness`."""
        data = json.loads(payload)
        if data.get("state") == OFF:
            behaviour.turn_off()
        else:
            brightness = data.get("brightness")
            behaviour.turn_on(None if brightness is None else int(brightness))


class CoverProfile(MqttProfile):
    """A cover with a position; open and close are commands."""

    component = "cover"

    def platform_fields(self, topics: Topics, definition: EntityDef) -> dict[str, Any]:
        """Return the position, command and set position topics."""
        return {
            "position_topic": topics.facet("position"),
            "set_position_topic": topics.facet("position", command=True),
            "command_topic": topics.facet("command", command=True),
            "payload_open": "OPEN",
            "payload_close": "CLOSE",
            "payload_stop": "STOP",
            "position_open": 100,
            "position_closed": 0,
        }

    def states(self, behaviour: CoverBehaviour) -> dict[str, str]:
        """Return the position."""
        return {"position": str(behaviour.position)}

    def command(self, behaviour: CoverBehaviour, facet: str, payload: str) -> None:
        """Open, close or move to a position."""
        if facet == "position":
            behaviour.set_position(int(float(payload)))
        elif payload == "OPEN":
            behaviour.open_cover()
        elif payload == "CLOSE":
            behaviour.close_cover()


class ClimateProfile(MqttProfile):
    """A thermostat with off and heat."""

    component = "climate"

    def platform_fields(self, topics: Topics, definition: EntityDef) -> dict[str, Any]:
        """Return the topics of mode, target and measured temperature."""
        return {
            "modes": ["off", "heat"],
            "mode_state_topic": topics.facet("mode"),
            "mode_command_topic": topics.facet("mode", command=True),
            "temperature_state_topic": topics.facet("temperature"),
            "temperature_command_topic": topics.facet("temperature", command=True),
            "current_temperature_topic": topics.facet("current_temperature"),
            "min_temp": ClimateBehaviour.min_temp,
            "max_temp": ClimateBehaviour.max_temp,
            "temp_step": 0.5,
            "temperature_unit": "C",
        }

    def states(self, behaviour: ClimateBehaviour) -> dict[str, str]:
        """Return mode, target and measured temperature."""
        return {
            "mode": "heat" if behaviour.heating else "off",
            "temperature": str(behaviour.target),
            "current_temperature": str(behaviour.measured()),
        }

    def command(self, behaviour: ClimateBehaviour, facet: str, payload: str) -> None:
        """Set the mode or the target temperature."""
        if facet == "mode":
            behaviour.set_heating(payload == "heat")
        else:
            value = float(payload)
            behaviour.set_target(max(behaviour.min_temp, min(behaviour.max_temp, value)))


class EventProfile(MqttProfile):
    """An event entity: events are published as JSON and are not retained."""

    component = "event"

    def platform_fields(self, topics: Topics, definition: EntityDef) -> dict[str, Any]:
        """Return the event topic and the event types."""
        return {
            "state_topic": topics.facet("event"),
            "event_types": list(definition.event_types or []),
        }

    def states(self, behaviour: EventBehaviour) -> dict[str, str]:
        """Events have no state to publish."""
        return {}

    def attach(self, behaviour: Behaviour, send: Send) -> None:
        """Publish every event of the behaviour as `{"event_type": ...}`."""
        if isinstance(behaviour, EventBehaviour):
            behaviour.on_event = lambda event_type: send(
                "event", json.dumps({"event_type": event_type})
            )


_PROFILES: dict[str, type[MqttProfile]] = {
    "sensor": SensorProfile,
    "binary_sensor": BinarySensorProfile,
    "switch": SwitchProfile,
    "light": LightProfile,
    "cover": CoverProfile,
    "climate": ClimateProfile,
    "event": EventProfile,
}


class MqttProfileFactory:
    """Creates the MQTT profile for a platform."""

    def create(self, platform: str) -> MqttProfile:
        """Return the profile of `platform` or raise TDC-OUT-001."""
        profile = _PROFILES.get(platform)
        if profile is None:
            raise OutputError(ErrorCode.OUT_UNSUPPORTED)
        return profile()
