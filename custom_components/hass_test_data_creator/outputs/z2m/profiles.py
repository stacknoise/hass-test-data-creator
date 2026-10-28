"""How each platform looks in the Zigbee2MQTT format: exposes, state values and commands (concept 7.4)."""

from __future__ import annotations

from abc import ABC, abstractmethod
from collections.abc import Callable
from typing import Any

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
from ...model.models import EntityDef

ON = "ON"
OFF = "OFF"
TOGGLE = "TOGGLE"
MAX_BRIGHTNESS = 254
ACCESS_STATE = 1
ACCESS_SET = 2
ACCESS_GET = 4
READ_ONLY = ACCESS_STATE
READ_WRITE = ACCESS_STATE | ACCESS_SET | ACCESS_GET
DOOR_CLASSES = ("door", "window", "opening", "garage_door")
SendAction = Callable[[str], None]


def numeric(name: str, label: str, access: int, **extra: Any) -> dict[str, Any]:
    """Return a numeric expose (or feature) of Zigbee2MQTT."""
    return {
        "type": "numeric",
        "name": name,
        "label": label,
        "property": name,
        "access": access,
        **extra,
    }


def binary_state(access: int = READ_WRITE) -> dict[str, Any]:
    """Return the ON/OFF/TOGGLE state feature of switches and lights."""
    return {
        "type": "binary",
        "name": "state",
        "label": "State",
        "property": "state",
        "access": access,
        "value_on": ON,
        "value_off": OFF,
        "value_toggle": TOGGLE,
    }


def _on_off(behaviour: OnOffBehaviour, data: dict[str, Any]) -> bool:
    """Apply `state` of a command (ON, OFF, TOGGLE); True if the command had a state."""
    state = str(data.get("state", "")).upper()
    if state == ON:
        behaviour.turn_on()
    elif state == OFF:
        behaviour.turn_off()
    elif state == TOGGLE:
        behaviour.toggle()
    else:
        return False
    return True


class Z2mProfile(ABC):
    """What one platform exposes and accepts; created only by the Z2mProfileFactory."""

    @abstractmethod
    def expose(self, definition: EntityDef) -> dict[str, Any]:
        """Return the expose of the entity for `bridge/devices`."""

    @abstractmethod
    def values(self, definition: EntityDef, behaviour: Any) -> dict[str, Any]:
        """Return the properties of the entity for the device state."""

    def apply(self, definition: EntityDef, behaviour: Any, data: dict[str, Any]) -> None:
        """Apply the properties of a `/set` message that belong to this entity."""
        return None

    def attach(self, definition: EntityDef, behaviour: Behaviour, send: SendAction) -> None:
        """Let the behaviour publish actions on `<device>/action`."""
        return None


class SensorProfile(Z2mProfile):
    """A sensor: a number, or a state name."""

    def expose(self, definition: EntityDef) -> dict[str, Any]:
        """Return a numeric expose with unit and range, or an enum for state sensors."""
        signal = definition.signal or {}
        if signal.get("shape") in ("enum", "state_machine"):
            names = signal.get("values") or [item["value"] for item in signal.get("states", ())]
            return {
                "type": "enum",
                "name": definition.key,
                "label": definition.name,
                "property": definition.key,
                "access": READ_ONLY,
                "values": list(dict.fromkeys(names)),
            }
        extra: dict[str, Any] = {}
        if definition.unit:
            extra["unit"] = definition.unit
        if "min" in signal and "max" in signal:
            extra.update(value_min=signal["min"], value_max=signal["max"])
        return numeric(definition.key, definition.name, READ_ONLY, **extra)

    def values(self, definition: EntityDef, behaviour: SensorBehaviour) -> dict[str, Any]:
        """Return the value under the key of the entity."""
        return {definition.key: behaviour.native_value}


class BinarySensorProfile(Z2mProfile):
    """A binary sensor: occupancy for motion, contact for doors and windows, else a boolean."""

    def name_of(self, definition: EntityDef) -> str:
        """Return the Zigbee2MQTT property name."""
        if definition.device_class == "motion":
            return "occupancy"
        if definition.device_class in DOOR_CLASSES:
            return "contact"
        return definition.key

    def expose(self, definition: EntityDef) -> dict[str, Any]:
        """Return a binary expose with true and false."""
        name = self.name_of(definition)
        return {
            "type": "binary",
            "name": name,
            "label": definition.name,
            "property": name,
            "access": READ_ONLY,
            "value_on": True,
            "value_off": False,
        }

    def values(self, definition: EntityDef, behaviour: BinarySensorBehaviour) -> dict[str, Any]:
        """Return true or false; `contact` is true while the door is closed."""
        name = self.name_of(definition)
        return {name: (not behaviour.is_on) if name == "contact" else behaviour.is_on}


class SwitchProfile(Z2mProfile):
    """A switch with the state ON or OFF."""

    def expose(self, definition: EntityDef) -> dict[str, Any]:
        """Return the switch expose."""
        return {"type": "switch", "features": [binary_state()]}

    def values(self, definition: EntityDef, behaviour: OnOffBehaviour) -> dict[str, Any]:
        """Return the state."""
        return {"state": ON if behaviour.is_on else OFF}

    def apply(self, definition: EntityDef, behaviour: OnOffBehaviour, data: dict[str, Any]) -> None:
        """Apply `state`."""
        _on_off(behaviour, data)


class LightProfile(Z2mProfile):
    """A dimmable light with state and brightness (0 to 254)."""

    def expose(self, definition: EntityDef) -> dict[str, Any]:
        """Return the light expose."""
        brightness = numeric(
            "brightness", "Brightness", READ_WRITE, value_min=0, value_max=MAX_BRIGHTNESS
        )
        return {"type": "light", "features": [binary_state(), brightness]}

    def values(self, definition: EntityDef, behaviour: LightBehaviour) -> dict[str, Any]:
        """Return state and brightness."""
        return {
            "state": ON if behaviour.is_on else OFF,
            "brightness": min(behaviour.brightness, MAX_BRIGHTNESS),
        }

    def apply(self, definition: EntityDef, behaviour: LightBehaviour, data: dict[str, Any]) -> None:
        """Apply `brightness` (which switches the light on) and `state`."""
        if "brightness" in data:
            level = max(0, min(MAX_BRIGHTNESS, int(data["brightness"])))
            if level == 0:
                behaviour.turn_off()
            else:
                behaviour.turn_on(level)
        else:
            _on_off(behaviour, data)


class CoverProfile(Z2mProfile):
    """A cover with the states OPEN, CLOSE, STOP and a position."""

    def expose(self, definition: EntityDef) -> dict[str, Any]:
        """Return the cover expose."""
        state = {
            "type": "enum",
            "name": "state",
            "label": "State",
            "property": "state",
            "access": READ_WRITE,
            "values": ["OPEN", "CLOSE", "STOP"],
        }
        position = numeric("position", "Position", READ_WRITE, unit="%", value_min=0, value_max=100)
        return {"type": "cover", "features": [state, position]}

    def values(self, definition: EntityDef, behaviour: CoverBehaviour) -> dict[str, Any]:
        """Return state and position."""
        return {
            "state": "CLOSE" if behaviour.is_closed else "OPEN",
            "position": behaviour.position,
        }

    def apply(self, definition: EntityDef, behaviour: CoverBehaviour, data: dict[str, Any]) -> None:
        """Apply `position` or `state`."""
        state = str(data.get("state", "")).upper()
        if "position" in data:
            behaviour.set_position(int(data["position"]))
        elif state == "OPEN":
            behaviour.open_cover()
        elif state == "CLOSE":
            behaviour.close_cover()


class ClimateProfile(Z2mProfile):
    """A thermostat with system mode, heating setpoint and local temperature."""

    def expose(self, definition: EntityDef) -> dict[str, Any]:
        """Return the climate expose."""
        setpoint = numeric(
            "occupied_heating_setpoint",
            "Occupied heating setpoint",
            READ_WRITE,
            unit="°C",
            value_min=ClimateBehaviour.min_temp,
            value_max=ClimateBehaviour.max_temp,
            value_step=0.5,
        )
        temperature = numeric(
            "local_temperature", "Local temperature", READ_ONLY | ACCESS_GET, unit="°C"
        )
        mode = {
            "type": "enum",
            "name": "system_mode",
            "label": "System mode",
            "property": "system_mode",
            "access": READ_WRITE,
            "values": ["off", "heat"],
        }
        return {"type": "climate", "features": [setpoint, temperature, mode]}

    def values(self, definition: EntityDef, behaviour: ClimateBehaviour) -> dict[str, Any]:
        """Return mode, setpoint and the measured temperature."""
        return {
            "system_mode": "heat" if behaviour.heating else "off",
            "occupied_heating_setpoint": behaviour.target,
            "local_temperature": behaviour.measured(),
        }

    def apply(
        self, definition: EntityDef, behaviour: ClimateBehaviour, data: dict[str, Any]
    ) -> None:
        """Apply the mode and the setpoint together."""
        setpoint = data.get("occupied_heating_setpoint")
        mode = data.get("system_mode")
        behaviour.update(
            heating=None if mode is None else mode == "heat",
            target=None
            if setpoint is None
            else max(behaviour.min_temp, min(behaviour.max_temp, float(setpoint))),
        )


class EventProfile(Z2mProfile):
    """Buttons: every event is published as text on `<device>/action`."""

    def expose(self, definition: EntityDef) -> dict[str, Any]:
        """Return the action enum."""
        return {
            "type": "enum",
            "name": "action",
            "label": "Action",
            "property": "action",
            "access": READ_ONLY,
            "values": list(definition.event_types or []),
        }

    def values(self, definition: EntityDef, behaviour: EventBehaviour) -> dict[str, Any]:
        """Events are not part of the state."""
        return {}

    def attach(self, definition: EntityDef, behaviour: Behaviour, send: SendAction) -> None:
        """Publish every event of the behaviour as an action."""
        if isinstance(behaviour, EventBehaviour):
            behaviour.on_event = send


_PROFILES: dict[str, type[Z2mProfile]] = {
    "sensor": SensorProfile,
    "binary_sensor": BinarySensorProfile,
    "switch": SwitchProfile,
    "light": LightProfile,
    "cover": CoverProfile,
    "climate": ClimateProfile,
    "event": EventProfile,
}


class Z2mProfileFactory:
    """Creates the Zigbee2MQTT profile for a platform."""

    def create(self, platform: str) -> Z2mProfile:
        """Return the profile of `platform` or raise TDC-OUT-001."""
        profile = _PROFILES.get(platform)
        if profile is None:
            raise OutputError(ErrorCode.OUT_UNSUPPORTED)
        return profile()
