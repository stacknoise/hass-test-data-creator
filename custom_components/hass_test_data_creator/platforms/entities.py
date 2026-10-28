"""Entity classes of the native output (concept 5.4, 7.2)."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.components.event import EventEntity
from homeassistant.components.sensor import SensorEntity
from homeassistant.components.switch import SwitchEntity
from homeassistant.const import STATE_ON, EntityCategory
from homeassistant.core import CALLBACK_TYPE, callback
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.event import async_call_later
from homeassistant.helpers.restore_state import RestoreEntity

from ..const import DOMAIN, MANUFACTURER, SIGNAL_TICK
from ..engine.signal_factory import Signal
from ..engine.tick import signal_time
from ..model.models import DeviceDef, EntityDef

DEFAULT_PULSE_SECONDS = 30
INTERVAL_TOLERANCE = 0.999
Live = dict[tuple[str, str], Any]


class TdcEntity:
    """Mixin with what every generated entity has: ids, device info and the live registry."""

    _attr_should_poll = False
    _attr_has_entity_name = True

    def __init__(self, device: DeviceDef, definition: EntityDef, live: Live) -> None:
        """Set unique id, name, device info and category from the definitions."""
        self._device_id = device.id
        self._key = definition.key
        self._definition = definition
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
        """Make the entity findable for actions."""
        await super().async_added_to_hass()  # type: ignore[misc]
        self._live[(self._device_id, self._key)] = self

    async def async_will_remove_from_hass(self) -> None:
        """Remove the entity from the live registry."""
        self._live.pop((self._device_id, self._key), None)
        await super().async_will_remove_from_hass()  # type: ignore[misc]


class TdcStatefulEntity(TdcEntity, RestoreEntity):
    """A generated entity with an on/off state that survives a restart."""

    _attr_is_on: bool | None

    def __init__(self, device: DeviceDef, definition: EntityDef, live: Live) -> None:
        """Start in the initial state of the definition."""
        super().__init__(device, definition, live)
        self._attr_is_on = definition.initial_on

    async def async_added_to_hass(self) -> None:
        """Restore the last state."""
        await super().async_added_to_hass()
        last = await self.async_get_last_state()
        if last is not None:
            self._attr_is_on = last.state == STATE_ON


class TdcSensor(TdcEntity, SensorEntity):
    """A sensor whose value comes from a signal."""

    def __init__(
        self, device: DeviceDef, definition: EntityDef, live: Live, signal: Signal
    ) -> None:
        """Create the sensor with its signal and compute the first value."""
        super().__init__(device, definition, live)
        self._signal = signal
        self._last = signal_time()
        self._attr_native_unit_of_measurement = definition.unit
        self._attr_state_class = definition.state_class
        self._attr_native_value = signal.value(self._last)

    async def async_added_to_hass(self) -> None:
        """Follow the tick."""
        await super().async_added_to_hass()
        self.async_on_remove(async_dispatcher_connect(self.hass, SIGNAL_TICK, self._handle_tick))

    @callback
    def _handle_tick(self) -> None:
        """Compute a new value if the interval of the signal has passed."""
        now = signal_time()
        if now - self._last < self._signal.spec.interval_s * INTERVAL_TOLERANCE:
            return
        self._last = now
        self._attr_native_value = self._signal.value(now)
        self.async_write_ha_state()


class TdcBinarySensor(TdcStatefulEntity, BinarySensorEntity):
    """A binary sensor that is set by actions; motion sensors switch off after a pulse."""

    _cancel_pulse: CALLBACK_TYPE | None = None

    async def async_will_remove_from_hass(self) -> None:
        """Cancel a running pulse."""
        self._clear_pulse()
        await super().async_will_remove_from_hass()

    def set_state(self, is_on: bool) -> None:
        """Set the state; a running pulse is cancelled."""
        self._clear_pulse()
        self._attr_is_on = is_on
        self.async_write_ha_state()

    def pulse(self, seconds: float | None) -> None:
        """Switch on and off again after `seconds` (default: the pulse of the template)."""
        duration = seconds or self._definition.pulse_s or DEFAULT_PULSE_SECONDS
        self.set_state(True)
        self._cancel_pulse = async_call_later(self.hass, duration, self._end_pulse)

    @callback
    def _end_pulse(self, _now: datetime) -> None:
        """Switch off at the end of a pulse."""
        self._cancel_pulse = None
        self.set_state(False)

    def _clear_pulse(self) -> None:
        """Cancel a running pulse timer."""
        if self._cancel_pulse:
            self._cancel_pulse()
            self._cancel_pulse = None


class TdcSwitch(TdcStatefulEntity, SwitchEntity):
    """A switch that keeps its state."""

    async def async_turn_on(self, **kwargs: Any) -> None:
        """Switch on."""
        self._attr_is_on = True
        self.async_write_ha_state()

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Switch off."""
        self._attr_is_on = False
        self.async_write_ha_state()


class TdcEvent(TdcEntity, EventEntity):
    """An event entity, for example the buttons of a wall button."""

    def __init__(self, device: DeviceDef, definition: EntityDef, live: Live) -> None:
        """Create the event entity with the event types of its definition."""
        super().__init__(device, definition, live)
        self._attr_event_types = list(definition.event_types or [])

    def press(self, event_type: str) -> None:
        """Fire the event `event_type`."""
        self._trigger_event(event_type)
        self.async_write_ha_state()
