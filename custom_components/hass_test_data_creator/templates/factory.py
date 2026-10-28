"""Factory that builds validated templates and entity definitions (concept 13.2)."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from homeassistant.components.binary_sensor import BinarySensorDeviceClass
from homeassistant.components.cover import CoverDeviceClass
from homeassistant.components.event import EventDeviceClass
from homeassistant.components.sensor import SensorDeviceClass
from homeassistant.components.switch import SwitchDeviceClass
import voluptuous as vol

from ..const import CUSTOM_TEMPLATE_ID, MAX_ENTITIES_PER_DEVICE
from ..core.errors import ErrorCode, GenerationError, TemplateError
from ..engine.signals import SHAPE_NAMES
from ..model.models import EntityDef
from .schema import ENTITY_SCHEMA, TEMPLATE_SCHEMA

_DEVICE_CLASSES: dict[str, set[str]] = {
    "sensor": {item.value for item in SensorDeviceClass},
    "binary_sensor": {item.value for item in BinarySensorDeviceClass},
    "event": {item.value for item in EventDeviceClass},
    "switch": {item.value for item in SwitchDeviceClass},
    "cover": {item.value for item in CoverDeviceClass},
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

    def to_summary(self) -> dict[str, Any]:
        """Return the description sent to the panel."""
        return {
            "id": self.id,
            "name": self.name,
            "model": self.model,
            "bundled": self.bundled,
            "entities": [entity.to_dict() for entity in self.entities],
        }


class TemplateFactory:
    """Creates templates and entity definitions from plain dictionaries."""

    def entity(self, data: dict[str, Any]) -> EntityDef:
        """Return the validated entity definition for `data`."""
        try:
            checked = ENTITY_SCHEMA(data)
        except vol.Invalid as err:
            raise TemplateError(ErrorCode.TPL_INVALID, file=str(err)) from err
        self._check_content(checked)
        return EntityDef.from_dict(checked)

    def template(self, data: dict[str, Any], *, bundled: bool = True) -> Template:
        """Return the validated template for `data`."""
        try:
            checked = TEMPLATE_SCHEMA(data)
        except vol.Invalid as err:
            raise TemplateError(ErrorCode.TPL_INVALID, file=str(err)) from err
        entities = [self.entity(item) for item in checked["entities"]]
        self._check_unique(entities)
        return Template(checked["id"], checked["name"], checked["model"], entities, bundled)

    def custom(self, entities: list[dict[str, Any]]) -> Template:
        """Return a template for a device whose entities the user defined by hand."""
        if len(entities) > MAX_ENTITIES_PER_DEVICE:
            raise GenerationError(ErrorCode.GEN_ENTITY_LIMIT)
        return self.template(
            {
                "id": CUSTOM_TEMPLATE_ID,
                "name": "Custom device",
                "model": "Custom",
                "entities": entities,
            },
            bundled=False,
        )

    def _check_unique(self, entities: list[EntityDef]) -> None:
        """Raise if two entities of one template share a key."""
        keys = [entity.key for entity in entities]
        if len(keys) != len(set(keys)):
            raise TemplateError(ErrorCode.TPL_INVALID, file="duplicate key")

    def _check_content(self, data: dict[str, Any]) -> None:
        """Check the rules that depend on the platform: signal, shape and device class."""
        platform = data["platform"]
        signal = data.get("signal")
        if platform in _SIGNAL_PLATFORMS and signal is None:
            raise TemplateError(ErrorCode.TPL_INVALID, file=f"{data['key']}: signal missing")
        if signal is not None and signal["shape"] not in SHAPE_NAMES:
            raise TemplateError(ErrorCode.TPL_UNKNOWN_SHAPE)
        if platform == "event" and not data.get("event_types"):
            raise TemplateError(ErrorCode.TPL_INVALID, file=f"{data['key']}: event_types missing")
        device_class = data.get("device_class")
        if device_class and device_class not in _DEVICE_CLASSES.get(platform, set()):
            raise TemplateError(ErrorCode.TPL_INVALID, file=f"{data['key']}: device_class")
