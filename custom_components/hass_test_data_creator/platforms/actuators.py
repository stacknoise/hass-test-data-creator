"""Entity classes of the actuators: light, cover and climate (concept 7.2)."""

from __future__ import annotations

from typing import Any

from homeassistant.components.climate import (
    ATTR_HVAC_MODE,
    ClimateEntity,
    ClimateEntityFeature,
    HVACMode,
)
from homeassistant.components.cover import (
    ATTR_CURRENT_POSITION,
    ATTR_POSITION,
    CoverEntity,
    CoverEntityFeature,
)
from homeassistant.components.light import ATTR_BRIGHTNESS, ColorMode, LightEntity
from homeassistant.const import ATTR_TEMPERATURE, UnitOfTemperature
from homeassistant.core import callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.restore_state import RestoreEntity

from ..const import SIGNAL_TICK
from ..engine.signal_factory import Signal
from ..engine.tick import signal_time
from ..model.models import DeviceDef, EntityDef
from .entities import Live, TdcEntity, TdcStatefulEntity

FULL_BRIGHTNESS = 255
OPEN = 100
CLOSED = 0
DEFAULT_TARGET_TEMPERATURE = 21.0
MIN_TEMPERATURE = 5.0
MAX_TEMPERATURE = 30.0
TEMPERATURE_STEP = 0.5


class TdcLight(TdcStatefulEntity, LightEntity):
    """A dimmable light that keeps its on/off state."""

    _attr_color_mode = ColorMode.BRIGHTNESS
    _attr_brightness = FULL_BRIGHTNESS

    def __init__(self, device: DeviceDef, definition: EntityDef, live: Live) -> None:
        """Create the light; it can only be dimmed."""
        super().__init__(device, definition, live)
        self._attr_supported_color_modes = {ColorMode.BRIGHTNESS}

    async def async_turn_on(self, **kwargs: Any) -> None:
        """Switch on, at the brightness of the call or the last one."""
        self._attr_brightness = kwargs.get(ATTR_BRIGHTNESS, self._attr_brightness)
        self._attr_is_on = True
        self.async_write_ha_state()

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Switch off; the brightness is kept for the next time."""
        self._attr_is_on = False
        self.async_write_ha_state()


class TdcCover(TdcEntity, RestoreEntity, CoverEntity):
    """A cover (blind, shutter) that moves to a position at once; 100 is open, 0 is closed."""

    _attr_supported_features = (
        CoverEntityFeature.OPEN
        | CoverEntityFeature.CLOSE
        | CoverEntityFeature.STOP
        | CoverEntityFeature.SET_POSITION
    )

    def __init__(self, device: DeviceDef, definition: EntityDef, live: Live) -> None:
        """Start open if the definition says `initial_on`, otherwise closed."""
        super().__init__(device, definition, live)
        self._attr_current_cover_position = OPEN if definition.initial_on else CLOSED

    async def async_added_to_hass(self) -> None:
        """Restore the last position."""
        await super().async_added_to_hass()
        last = await self.async_get_last_state()
        if last is not None and last.attributes.get(ATTR_CURRENT_POSITION) is not None:
            self._attr_current_cover_position = int(last.attributes[ATTR_CURRENT_POSITION])

    @property
    def is_closed(self) -> bool:
        """Whether the cover is fully closed."""
        return self._attr_current_cover_position == CLOSED

    def set_position(self, position: int) -> None:
        """Move to `position` (0 to 100) at once."""
        self._attr_current_cover_position = max(CLOSED, min(OPEN, position))
        self.async_write_ha_state()

    async def async_open_cover(self, **kwargs: Any) -> None:
        """Open fully."""
        self.set_position(OPEN)

    async def async_close_cover(self, **kwargs: Any) -> None:
        """Close fully."""
        self.set_position(CLOSED)

    async def async_set_cover_position(self, **kwargs: Any) -> None:
        """Move to the position of the call."""
        self.set_position(int(kwargs[ATTR_POSITION]))

    async def async_stop_cover(self, **kwargs: Any) -> None:
        """Do nothing: the cover never moves slowly."""


class TdcClimate(TdcEntity, RestoreEntity, ClimateEntity):
    """A thermostat: the measured temperature follows a signal, the target is set by actions."""

    _attr_temperature_unit = UnitOfTemperature.CELSIUS
    _attr_supported_features = (
        ClimateEntityFeature.TARGET_TEMPERATURE
        | ClimateEntityFeature.TURN_ON
        | ClimateEntityFeature.TURN_OFF
    )
    _attr_min_temp = MIN_TEMPERATURE
    _attr_max_temp = MAX_TEMPERATURE
    _attr_target_temperature_step = TEMPERATURE_STEP

    def __init__(
        self, device: DeviceDef, definition: EntityDef, live: Live, signal: Signal
    ) -> None:
        """Start in heat mode at the default target temperature."""
        super().__init__(device, definition, live)
        self._signal = signal
        self._attr_hvac_modes = [HVACMode.OFF, HVACMode.HEAT]
        self._attr_hvac_mode = HVACMode.HEAT
        self._attr_target_temperature = DEFAULT_TARGET_TEMPERATURE

    @property
    def current_temperature(self) -> float:
        """The measured temperature, computed from the signal."""
        return self._signal.value(signal_time())

    async def async_added_to_hass(self) -> None:
        """Restore mode and target, then follow the tick."""
        await super().async_added_to_hass()
        last = await self.async_get_last_state()
        if last is not None:
            if last.state in (HVACMode.OFF, HVACMode.HEAT):
                self._attr_hvac_mode = HVACMode(last.state)
            if last.attributes.get(ATTR_TEMPERATURE) is not None:
                self._attr_target_temperature = float(last.attributes[ATTR_TEMPERATURE])
        self.async_on_remove(async_dispatcher_connect(self.hass, SIGNAL_TICK, self._handle_tick))

    @callback
    def _handle_tick(self) -> None:
        """Publish the new measured temperature."""
        self.async_write_ha_state()

    async def async_set_hvac_mode(self, hvac_mode: HVACMode) -> None:
        """Switch between off and heat."""
        self._attr_hvac_mode = hvac_mode
        self.async_write_ha_state()

    async def async_set_temperature(self, **kwargs: Any) -> None:
        """Set the target temperature and, if given, the mode."""
        if ATTR_HVAC_MODE in kwargs:
            self._attr_hvac_mode = HVACMode(kwargs[ATTR_HVAC_MODE])
        if ATTR_TEMPERATURE in kwargs:
            self._attr_target_temperature = float(kwargs[ATTR_TEMPERATURE])
        self.async_write_ha_state()
