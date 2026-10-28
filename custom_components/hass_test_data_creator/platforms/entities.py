"""Entity classes of the native output: thin shells around the behaviours (concept 5.4, 7.2)."""

from __future__ import annotations

from typing import Any

from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.components.event import EventEntity
from homeassistant.components.sensor import SensorDeviceClass, SensorEntity
from homeassistant.components.switch import SwitchEntity
from homeassistant.const import STATE_ON, EntityCategory
from homeassistant.core import callback
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.restore_state import RestoreEntity

from ..const import DOMAIN, MANUFACTURER, SIGNAL_TICK
from ..engine.behaviours import (
    Behaviour,
    BinarySensorBehaviour,
    EventBehaviour,
    Live,
    OnOffBehaviour,
    SensorBehaviour,
)
from ..engine.tick import signal_time
from ..model.models import DeviceDef, EntityDef


class TdcEntity:
    """Mixin with what every generated entity has: ids, device info and its behaviour."""

    _attr_should_poll = False
    _attr_has_entity_name = True

    def __init__(
        self, device: DeviceDef, definition: EntityDef, behaviour: Behaviour, live: Live
    ) -> None:
        """Set unique id, name, device info and category from the definitions."""
        self._behaviour = behaviour
        self._live = live
        self._attr_unique_id = f"{device.id}_{definition.key}"
        self._attr_name = definition.name
        self._attr_device_class = definition.device_class
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, device.id)},
            name=device.name,
            manufacturer=MANUFACTURER,
            model=device.model,
        )
        if definition.entity_category:
            self._attr_entity_category = EntityCategory(definition.entity_category)

    async def async_added_to_hass(self) -> None:
        """Make the behaviour findable for actions and let it report changes."""
        await super().async_added_to_hass()  # type: ignore[misc]
        self._live[(self._behaviour.device_id, self._behaviour.key)] = self._behaviour
        self._behaviour.on_change = self._write

    async def async_will_remove_from_hass(self) -> None:
        """Stop the behaviour and remove it from the live registry."""
        self._behaviour.close()
        self._live.pop((self._behaviour.device_id, self._behaviour.key), None)
        await super().async_will_remove_from_hass()  # type: ignore[misc]

    @property
    def available(self) -> bool:
        """False while a fault makes the entity unavailable."""
        return self._behaviour.available

    @callback
    def _write(self) -> None:
        """Publish the state after the behaviour changed."""
        self.async_write_ha_state()  # type: ignore[attr-defined]


class TdcStatefulEntity(TdcEntity, RestoreEntity):
    """A generated entity with an on/off state that survives a restart."""

    _behaviour: OnOffBehaviour

    @property
    def is_on(self) -> bool:
        """Whether the entity is on."""
        return self._behaviour.is_on

    async def async_added_to_hass(self) -> None:
        """Restore the last state."""
        await super().async_added_to_hass()
        last = await self.async_get_last_state()
        if last is not None:
            self._behaviour.restore(last.state == STATE_ON)


class TdcSensor(TdcEntity, SensorEntity):
    """A sensor whose value comes from a signal."""

    _behaviour: SensorBehaviour

    def __init__(
        self, device: DeviceDef, definition: EntityDef, behaviour: SensorBehaviour, live: Live
    ) -> None:
        """Create the sensor; sensors with states get the enum device class and their options."""
        super().__init__(device, definition, behaviour, live)
        self._attr_native_unit_of_measurement = definition.unit
        self._attr_state_class = definition.state_class
        if behaviour.discrete:
            self._attr_device_class = SensorDeviceClass.ENUM
            self._attr_options = behaviour.options

    @property
    def native_value(self) -> float | str:
        """The current value."""
        return self._behaviour.native_value

    async def async_added_to_hass(self) -> None:
        """Follow the tick."""
        await super().async_added_to_hass()
        self.async_on_remove(async_dispatcher_connect(self.hass, SIGNAL_TICK, self._handle_tick))

    @callback
    def _handle_tick(self) -> None:
        """Compute a new value if the interval of the signal has passed."""
        if self._behaviour.tick(signal_time()):
            self.async_write_ha_state()


class TdcBinarySensor(TdcStatefulEntity, BinarySensorEntity):
    """A binary sensor that is set by actions; motion sensors switch off after a pulse."""

    _behaviour: BinarySensorBehaviour


class TdcSwitch(TdcStatefulEntity, SwitchEntity):
    """A switch that keeps its state."""

    async def async_turn_on(self, **kwargs: Any) -> None:
        """Switch on."""
        self._behaviour.turn_on()

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Switch off."""
        self._behaviour.turn_off()


class TdcEvent(TdcEntity, EventEntity):
    """An event entity, for example the buttons of a wall button."""

    _behaviour: EventBehaviour

    def __init__(
        self, device: DeviceDef, definition: EntityDef, behaviour: EventBehaviour, live: Live
    ) -> None:
        """Create the event entity with the event types of its behaviour."""
        super().__init__(device, definition, behaviour, live)
        self._attr_event_types = behaviour.event_types

    async def async_added_to_hass(self) -> None:
        """Fire the events of the behaviour."""
        await super().async_added_to_hass()
        self._behaviour.on_event = self._fire

    @callback
    def _fire(self, event_type: str) -> None:
        """Fire the event `event_type` and publish the state."""
        self._trigger_event(event_type)
        self.async_write_ha_state()
