"""Behaviours: the state and logic of one generated entity, independent of any output (concept 2)."""

from __future__ import annotations

from collections.abc import Callable
from datetime import datetime
from typing import Protocol

from ..const import MAX_LIGHT_BRIGHTNESS
from ..faults.factory import Fault
from ..model.models import EntityDef
from .signal_factory import Signal
from .signals import DISCRETE_SHAPES, options_of

DEFAULT_PULSE_SECONDS = 30
INTERVAL_TOLERANCE = 0.999
FULL_BRIGHTNESS = 255
OPEN = 100
CLOSED = 0
DEFAULT_TARGET_TEMPERATURE = 21.0
MIN_TEMPERATURE = 5.0
MAX_TEMPERATURE = 30.0

Cancel = Callable[[], None]


class Scheduler(Protocol):
    """The clock and the timers of the output; the behaviours know nothing else about time."""

    def now(self) -> float:
        """Return the signal time in seconds."""

    def at(self, moment: datetime) -> float:
        """Return the signal time in seconds that belongs to the real `moment`."""

    def call_later(self, delay_s: float, callback: Callable[[], None]) -> Cancel:
        """Run `callback` after `delay_s` seconds and return the function that cancels it."""


def _ignore() -> None:
    """Do nothing; the default of the change callbacks."""


def _ignore_event(event_type: str) -> None:
    """Do nothing with an event; the default of the event callback."""


class Behaviour:
    """What every entity has: its place in a device, a fault and a callback for changes."""

    def __init__(self, device_id: str, definition: EntityDef, scheduler: Scheduler) -> None:
        """Keep the ids, the definition and the scheduler."""
        self.device_id = device_id
        self.key = definition.key
        self.definition = definition
        self.platform = definition.platform
        self.on_change: Callable[[], None] = _ignore
        self._scheduler = scheduler
        self._fault: Fault | None = None
        self._cancel_fault: Cancel | None = None

    def now(self) -> float:
        """Return the current signal time in seconds."""
        return self._scheduler.now()

    @property
    def available(self) -> bool:
        """False while a fault makes the entity unavailable."""
        return not (self._fault and self._fault.unavailable)

    @property
    def fault_kind(self) -> str | None:
        """The kind of the active fault, if there is one."""
        return self._fault.kind if self._fault else None

    @property
    def message_delay_s(self) -> float:
        """Seconds that the messages of this entity are held back (fault late)."""
        return self._fault.message_delay_s if self._fault else 0.0

    @property
    def message_repeats(self) -> int:
        """How many extra copies of every message are sent (fault duplicate)."""
        return self._fault.message_repeats if self._fault else 0

    def start_fault(self, fault: Fault) -> None:
        """Make `fault` active; it ends by itself after its duration and replaces a running one."""
        self._clear_fault_timer()
        self._fault = fault
        self._cancel_fault = self._scheduler.call_later(fault.duration_s, self._end_fault)
        self._fault_changed()
        self.on_change()

    def tick(self, now: float) -> bool:
        """Follow the clock; True if the state changed. Most entities do not move by themselves."""
        return False

    def close(self) -> None:
        """Cancel the timers and stop reporting; the behaviour is no longer used."""
        self._clear_fault_timer()
        self.on_change = _ignore

    def _end_fault(self) -> None:
        """End the active fault."""
        self._cancel_fault = None
        self._fault = None
        self._fault_changed()
        self.on_change()

    def _clear_fault_timer(self) -> None:
        """Cancel the timer that ends the active fault."""
        if self._cancel_fault:
            self._cancel_fault()
            self._cancel_fault = None

    def _fault_changed(self) -> None:
        """Apply the new fault (or its end) to the state; sensors recompute their value."""


class SensorBehaviour(Behaviour):
    """A sensor whose value comes from a signal."""

    def __init__(
        self, device_id: str, definition: EntityDef, scheduler: Scheduler, signal: Signal
    ) -> None:
        """Compute the first value at the current signal time."""
        super().__init__(device_id, definition, scheduler)
        self.signal = signal
        self.discrete = signal.spec.shape in DISCRETE_SHAPES
        self.options = options_of(signal.spec) if self.discrete else None
        self._last = scheduler.now()
        self.native_value: float | str = signal.value(self._last)

    def tick(self, now: float) -> bool:
        """Compute a new value if the interval has passed and the sensor is not frozen."""
        if now - self._last < self.signal.spec.interval_s * INTERVAL_TOLERANCE:
            return False
        if self._fault and self._fault.frozen:
            return False
        self._last = now
        self.native_value = self._value(now)
        return True

    def _value(self, now: float) -> float | str:
        """Return the value of the signal at `now` with the transformation of an active fault."""
        value = self.signal.value(now)
        transform = self._fault.transform if self._fault else None
        return transform(value) if transform and not isinstance(value, str) else value

    def replace_signal(self, signal: Signal) -> None:
        """Follow another curve from now on and show its value at once, unless the sensor is frozen."""
        self.signal = signal
        self._last = self._scheduler.now()
        self._fault_changed()
        self.on_change()

    def _fault_changed(self) -> None:
        """Show the changed value at once, unless the sensor is frozen."""
        if not (self._fault and self._fault.frozen):
            self.native_value = self._value(self._scheduler.now())


class OnOffBehaviour(Behaviour):
    """An entity with an on/off state that survives a restart."""

    def __init__(self, device_id: str, definition: EntityDef, scheduler: Scheduler) -> None:
        """Start in the initial state of the definition."""
        super().__init__(device_id, definition, scheduler)
        self.is_on = definition.initial_on

    def restore(self, is_on: bool) -> None:
        """Set the last state without telling anyone."""
        self.is_on = is_on

    def turn_on(self) -> None:
        """Switch on."""
        self.is_on = True
        self.on_change()

    def turn_off(self) -> None:
        """Switch off."""
        self.is_on = False
        self.on_change()

    def toggle(self) -> None:
        """Switch to the other state."""
        if self.is_on:
            self.turn_off()
        else:
            self.turn_on()


class LightBehaviour(OnOffBehaviour):
    """A dimmable light; the brightness is kept for the next time it is switched on."""

    def __init__(self, device_id: str, definition: EntityDef, scheduler: Scheduler) -> None:
        """Start at full brightness."""
        super().__init__(device_id, definition, scheduler)
        self.brightness = FULL_BRIGHTNESS

    def turn_on(self, brightness: int | None = None) -> None:
        """Switch on, at `brightness` or the last one."""
        if brightness is not None:
            self.brightness = max(1, min(MAX_LIGHT_BRIGHTNESS, brightness))
        super().turn_on()


class BinarySensorBehaviour(OnOffBehaviour):
    """A binary sensor that is set by actions; motion sensors switch off after a pulse."""

    def __init__(self, device_id: str, definition: EntityDef, scheduler: Scheduler) -> None:
        """Start without a running pulse."""
        super().__init__(device_id, definition, scheduler)
        self._cancel_pulse: Cancel | None = None

    def close(self) -> None:
        """Cancel a running pulse and the fault timer."""
        self._clear_pulse()
        super().close()

    def set_state(self, is_on: bool) -> None:
        """Set the state; a running pulse is cancelled."""
        self._clear_pulse()
        self.is_on = is_on
        self.on_change()

    def pulse(self, seconds: float | None) -> None:
        """Switch on and off again after `seconds` (default: the pulse of the template)."""
        duration = seconds or self.definition.pulse_s or DEFAULT_PULSE_SECONDS
        self.set_state(True)
        self._cancel_pulse = self._scheduler.call_later(duration, self._end_pulse)

    def _end_pulse(self) -> None:
        """Switch off at the end of a pulse."""
        self._cancel_pulse = None
        self.set_state(False)

    def _clear_pulse(self) -> None:
        """Cancel a running pulse timer."""
        if self._cancel_pulse:
            self._cancel_pulse()
            self._cancel_pulse = None


class EventBehaviour(Behaviour):
    """An entity that fires events, for example the buttons of a wall button."""

    def __init__(self, device_id: str, definition: EntityDef, scheduler: Scheduler) -> None:
        """Keep the event types and start without a listener."""
        super().__init__(device_id, definition, scheduler)
        self.event_types = list(definition.event_types or [])
        self.on_event: Callable[[str], None] = _ignore_event

    def press(self, event_type: str) -> None:
        """Fire the event `event_type`."""
        self.on_event(event_type)


class CoverBehaviour(Behaviour):
    """A cover that moves to a position at once; 100 is open, 0 is closed."""

    def __init__(self, device_id: str, definition: EntityDef, scheduler: Scheduler) -> None:
        """Start open if the definition says `initial_on`, otherwise closed."""
        super().__init__(device_id, definition, scheduler)
        self.position = OPEN if definition.initial_on else CLOSED

    @property
    def is_closed(self) -> bool:
        """Whether the cover is fully closed."""
        return self.position == CLOSED

    def restore(self, position: int) -> None:
        """Set the last position without telling anyone."""
        self.position = position

    def set_position(self, position: int) -> None:
        """Move to `position` (0 to 100) at once."""
        self.position = max(CLOSED, min(OPEN, position))
        self.on_change()

    def open_cover(self) -> None:
        """Open fully."""
        self.set_position(OPEN)

    def close_cover(self) -> None:
        """Close fully."""
        self.set_position(CLOSED)


class ClimateBehaviour(Behaviour):
    """A thermostat: the measured temperature follows a signal, the target is set by actions."""

    min_temp = MIN_TEMPERATURE
    max_temp = MAX_TEMPERATURE

    def __init__(
        self, device_id: str, definition: EntityDef, scheduler: Scheduler, signal: Signal
    ) -> None:
        """Start in heat mode at the default target temperature."""
        super().__init__(device_id, definition, scheduler)
        self.signal = signal
        self.heating = True
        self.target = DEFAULT_TARGET_TEMPERATURE

    def current_temperature(self, now: float) -> float | str:
        """The measured temperature at signal time `now`."""
        return self.signal.value(now)

    def replace_signal(self, signal: Signal) -> None:
        """Measure another curve from now on."""
        self.signal = signal
        self.on_change()

    def measured(self) -> float | str:
        """The measured temperature now."""
        return self.signal.value(self._scheduler.now())

    def tick(self, now: float) -> bool:
        """The measured temperature moves all the time, so every tick is a change."""
        return True

    def restore(self, heating: bool, target: float | None) -> None:
        """Set the last mode and target without telling anyone."""
        self.heating = heating
        if target is not None:
            self.target = target

    def update(self, *, heating: bool | None = None, target: float | None = None) -> None:
        """Change the mode and the target together and report once."""
        if heating is not None:
            self.heating = heating
        if target is not None:
            self.target = target
        self.on_change()

    def set_heating(self, heating: bool) -> None:
        """Switch between heat and off."""
        self.update(heating=heating)

    def set_target(self, target: float) -> None:
        """Set the target temperature."""
        self.update(target=target)

    def turn_on(self) -> None:
        """Switch to heat."""
        self.set_heating(True)

    def turn_off(self) -> None:
        """Switch to off."""
        self.set_heating(False)


Live = dict[tuple[str, str], Behaviour]
