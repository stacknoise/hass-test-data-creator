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
from ..engine.behaviours import ClimateBehaviour, CoverBehaviour, LightBehaviour, Live
from ..engine.tick import signal_time
from ..model.models import DeviceDef, EntityDef
from .entities import TdcEntity, TdcStatefulEntity

TEMPERATURE_STEP = 0.5


class TdcLight(TdcStatefulEntity, LightEntity):
    """A dimmable light that keeps its on/off state."""

    _attr_color_mode = ColorMode.BRIGHTNESS
    _behaviour: LightBehaviour

    def __init__(
        self, device: DeviceDef, definition: EntityDef, behaviour: LightBehaviour, live: Live
    ) -> None:
        """Create the light; it can only be dimmed."""
        super().__init__(device, definition, behaviour, live)
        self._attr_supported_color_modes = {ColorMode.BRIGHTNESS}

    @property
    def brightness(self) -> int:
        """The brightness from 1 to 255."""
        return self._behaviour.brightness

    async def async_turn_on(self, **kwargs: Any) -> None:
        """Switch on, at the brightness of the call or the last one."""
        self._behaviour.turn_on(kwargs.get(ATTR_BRIGHTNESS))

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Switch off; the brightness is kept for the next time."""
        self._behaviour.turn_off()


class TdcCover(TdcEntity, RestoreEntity, CoverEntity):
    """A cover (blind, shutter) that moves to a position at once; 100 is open, 0 is closed."""

    _attr_supported_features = (
        CoverEntityFeature.OPEN
        | CoverEntityFeature.CLOSE
        | CoverEntityFeature.STOP
        | CoverEntityFeature.SET_POSITION
    )
    _behaviour: CoverBehaviour

    @property
    def current_cover_position(self) -> int:
        """The position from 0 (closed) to 100 (open)."""
        return self._behaviour.position

    @property
    def is_closed(self) -> bool:
        """Whether the cover is fully closed."""
        return self._behaviour.is_closed

    async def async_added_to_hass(self) -> None:
        """Restore the last position."""
        await super().async_added_to_hass()
        last = await self.async_get_last_state()
        if last is not None and last.attributes.get(ATTR_CURRENT_POSITION) is not None:
            self._behaviour.restore(int(last.attributes[ATTR_CURRENT_POSITION]))

    async def async_open_cover(self, **kwargs: Any) -> None:
        """Open fully."""
        self._behaviour.open_cover()

    async def async_close_cover(self, **kwargs: Any) -> None:
        """Close fully."""
        self._behaviour.close_cover()

    async def async_set_cover_position(self, **kwargs: Any) -> None:
        """Move to the position of the call."""
        self._behaviour.set_position(int(kwargs[ATTR_POSITION]))

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
    _attr_target_temperature_step = TEMPERATURE_STEP
    _behaviour: ClimateBehaviour

    def __init__(
        self, device: DeviceDef, definition: EntityDef, behaviour: ClimateBehaviour, live: Live
    ) -> None:
        """Create the thermostat with the range of its behaviour."""
        super().__init__(device, definition, behaviour, live)
        self._attr_hvac_modes = [HVACMode.OFF, HVACMode.HEAT]
        self._attr_min_temp = behaviour.min_temp
        self._attr_max_temp = behaviour.max_temp

    @property
    def hvac_mode(self) -> HVACMode:
        """Heat or off."""
        return HVACMode.HEAT if self._behaviour.heating else HVACMode.OFF

    @property
    def target_temperature(self) -> float:
        """The target temperature."""
        return self._behaviour.target

    @property
    def current_temperature(self) -> float:
        """The measured temperature, computed from the signal."""
        return float(self._behaviour.current_temperature(signal_time()))

    async def async_added_to_hass(self) -> None:
        """Restore mode and target, then follow the tick."""
        await super().async_added_to_hass()
        last = await self.async_get_last_state()
        if last is not None:
            target = last.attributes.get(ATTR_TEMPERATURE)
            self._behaviour.restore(
                last.state != HVACMode.OFF, None if target is None else float(target)
            )
        self.async_on_remove(async_dispatcher_connect(self.hass, SIGNAL_TICK, self._handle_tick))

    @callback
    def _handle_tick(self) -> None:
        """Publish the new measured temperature."""
        self.async_write_ha_state()

    async def async_set_hvac_mode(self, hvac_mode: HVACMode) -> None:
        """Switch between off and heat."""
        self._behaviour.set_heating(hvac_mode == HVACMode.HEAT)

    async def async_set_temperature(self, **kwargs: Any) -> None:
        """Set the target temperature and, if given, the mode."""
        mode = kwargs.get(ATTR_HVAC_MODE)
        target = kwargs.get(ATTR_TEMPERATURE)
        self._behaviour.update(
            heating=None if mode is None else HVACMode(mode) == HVACMode.HEAT,
            target=None if target is None else float(target),
        )
