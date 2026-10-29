"""Factory that builds validated templates and entity definitions (concept 13.2)."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from homeassistant.components.binary_sensor import BinarySensorDeviceClass
from homeassistant.components.cover import CoverDeviceClass
from homeassistant.components.event import EventDeviceClass
from homeassistant.components.sensor import SensorDeviceClass
from homeassistant.components.switch import SwitchDeviceClass
import voluptuous as vol

from ..const import CUSTOM_TEMPLATE_ID, DEFAULT_MODEL, MAX_ENTITIES_PER_DEVICE
from ..core.errors import ErrorCode, GenerationError, TemplateError
from ..core.keys import (
    KEY_BINARY_SENSOR,
    KEY_COVER,
    KEY_DEVICE_CLASS,
    KEY_ENTITIES,
    KEY_ENUM,
    KEY_EVENT,
    KEY_EVENT_TYPES,
    KEY_ID,
    KEY_MODEL,
    KEY_NAME,
    KEY_PLATFORM,
    KEY_SENSOR,
    KEY_SHAPE,
    KEY_SIGNAL,
    KEY_STATE_CLASS,
    KEY_SWITCH,
    KEY_UNIT,
)
from ..engine.signals import DISCRETE_SHAPES, SHAPE_NAMES, SignalSpec, has_invalid_states
from ..model.models import EntityDef
from .schema import ENTITY_SCHEMA, TEMPLATE_SCHEMA

_DEVICE_CLASSES: dict[str, set[str]] = {
    KEY_SENSOR: {item.value for item in SensorDeviceClass},
    KEY_BINARY_SENSOR: {item.value for item in BinarySensorDeviceClass},
    KEY_EVENT: {item.value for item in EventDeviceClass},
    KEY_SWITCH: {item.value for item in SwitchDeviceClass},
    KEY_COVER: {item.value for item in CoverDeviceClass},
}
_SIGNAL_PLATFORMS = {"sensor", "climate"}


@dataclass
class Template:
    """A device type: its model name and the entities every device of it gets."""

    id: str
    name: str
    model: str
    entities: list[EntityDef]
    bundled: bool = True
    z2m: dict[str, str] = field(default_factory=dict)

    def to_summary(self) -> dict[str, Any]:
        """Return the description sent to the panel."""
        return {
            KEY_ID: self.id,
            KEY_NAME: self.name,
            KEY_MODEL: self.model,
            "bundled": self.bundled,
            KEY_ENTITIES: [entity.to_dict() for entity in self.entities],
        }

    def to_file(self) -> dict[str, Any]:
        """Return the content of the template file: only the fields that differ from the defaults."""
        content: dict[str, Any] = {KEY_ID: self.id, KEY_NAME: self.name, KEY_MODEL: self.model}
        content[KEY_ENTITIES] = [
            {
                key: value
                for key, value in entity.to_dict().items()
                if value is not None and value is not False
            }
            for entity in self.entities
        ]
        if self.z2m:
            content["z2m"] = dict(self.z2m)
        return content


class TemplateFactory:
    """Creates templates and entity definitions from plain dictionaries."""

    def entity(self, data: dict[str, Any]) -> EntityDef:
        """Return the validated entity definition for `data`; fields that are `None` count as not set."""
        try:
            checked = ENTITY_SCHEMA(
                {key: value for key, value in data.items() if value is not None}
            )
        except vol.Invalid as err:
            raise TemplateError(ErrorCode.TPL_INVALID, file=str(err)) from err
        self._check_content(checked)
        return EntityDef.from_dict(checked)

    def with_signal(self, definition: EntityDef, signal: dict[str, Any]) -> EntityDef:
        """Return a copy of `definition` that has `signal` as its curve."""
        return EntityDef(**{**definition.to_dict(), KEY_SIGNAL: signal})

    def template(self, data: dict[str, Any], *, bundled: bool = True) -> Template:
        """Return the validated template for `data`."""
        try:
            checked = TEMPLATE_SCHEMA(data)
        except vol.Invalid as err:
            raise TemplateError(ErrorCode.TPL_INVALID, file=str(err)) from err
        entities = [self.entity(item) for item in checked[KEY_ENTITIES]]
        self._check_unique(entities)
        return Template(
            checked[KEY_ID],
            checked[KEY_NAME],
            checked[KEY_MODEL],
            entities,
            bundled,
            dict(checked.get("z2m", {})),
        )

    def custom(self, entities: list[dict[str, Any]]) -> Template:
        """Return a template for a device whose entities the user defined by hand."""
        if len(entities) > MAX_ENTITIES_PER_DEVICE:
            raise GenerationError(ErrorCode.GEN_ENTITY_LIMIT)
        return self.template(
            {
                KEY_ID: CUSTOM_TEMPLATE_ID,
                KEY_NAME: "Custom device",
                KEY_MODEL: DEFAULT_MODEL,
                KEY_ENTITIES: entities,
            },
            bundled=False,
        )

    def _check_unique(self, entities: list[EntityDef]) -> None:
        """Raise if two entities of one template share a key."""
        keys = [entity.key for entity in entities]
        if len(keys) != len(set(keys)):
            raise TemplateError(ErrorCode.TPL_INVALID, file="duplicate key")

    def _check_discrete(self, data: dict[str, Any], signal: dict[str, Any]) -> None:
        """Check a sensor with states: valid states, no unit or state class, device class enum."""
        invalid = has_invalid_states(SignalSpec.from_dict(signal, 0, 0.0))
        if invalid or data.get(KEY_UNIT) or data.get(KEY_STATE_CLASS):
            raise TemplateError(ErrorCode.TPL_INVALID, file=f"{data['key']}: states")
        if data.get(KEY_DEVICE_CLASS) not in (None, KEY_ENUM):
            raise TemplateError(ErrorCode.TPL_INVALID, file=f"{data['key']}: device_class")

    def _check_content(self, data: dict[str, Any]) -> None:
        """Check the rules that depend on the platform: signal, shape and device class."""
        platform = data[KEY_PLATFORM]
        signal = data.get(KEY_SIGNAL)
        if platform in _SIGNAL_PLATFORMS and signal is None:
            raise TemplateError(ErrorCode.TPL_INVALID, file=f"{data['key']}: signal missing")
        if signal is not None and signal[KEY_SHAPE] not in SHAPE_NAMES:
            raise TemplateError(ErrorCode.TPL_UNKNOWN_SHAPE)
        if signal is not None and signal[KEY_SHAPE] in DISCRETE_SHAPES:
            if platform != KEY_SENSOR:
                raise TemplateError(ErrorCode.TPL_INVALID, file=f"{data['key']}: signal")
            self._check_discrete(data, signal)
        if platform == KEY_EVENT and not data.get(KEY_EVENT_TYPES):
            raise TemplateError(ErrorCode.TPL_INVALID, file=f"{data['key']}: event_types missing")
        device_class = data.get(KEY_DEVICE_CLASS)
        if device_class and device_class not in _DEVICE_CLASSES.get(platform, set()):
            raise TemplateError(ErrorCode.TPL_INVALID, file=f"{data['key']}: device_class")
