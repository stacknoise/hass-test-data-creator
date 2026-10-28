"""Behaviours: state and logic without Home Assistant, driven by a fake clock and fake timers."""

from __future__ import annotations

from collections.abc import Callable

from custom_components.hass_test_data_creator.engine.behaviours import (
    BinarySensorBehaviour,
    ClimateBehaviour,
    CoverBehaviour,
    EventBehaviour,
    LightBehaviour,
    OnOffBehaviour,
    SensorBehaviour,
)
from custom_components.hass_test_data_creator.engine.signal_factory import SignalFactory
from custom_components.hass_test_data_creator.faults.factory import FaultFactory
from custom_components.hass_test_data_creator.model.models import EntityDef


class FakeScheduler:
    """A clock that moves by hand and timers that fire when it reaches them."""

    def __init__(self) -> None:
        """Start at time 0 without timers."""
        self.time = 0.0
        self.timers: list[tuple[float, Callable[[], None]]] = []

    def now(self) -> float:
        """Return the fake signal time."""
        return self.time

    def call_later(self, delay_s: float, callback: Callable[[], None]) -> Callable[[], None]:
        """Remember the timer and return its cancel function."""
        timer = (self.time + delay_s, callback)
        self.timers.append(timer)
        return lambda: self.timers.remove(timer) if timer in self.timers else None

    def advance(self, seconds: float) -> None:
        """Move the clock and fire the timers that are due."""
        self.time += seconds
        for due, callback in sorted(self.timers, key=lambda item: item[0]):
            if due <= self.time and (due, callback) in self.timers:
                self.timers.remove((due, callback))
                callback()


def definition(platform: str, **fields: object) -> EntityDef:
    """Return an entity definition for tests."""
    return EntityDef(key="x", platform=platform, name="X", **fields)  # type: ignore[arg-type]


def sensor(scheduler: FakeScheduler, **signal: object) -> SensorBehaviour:
    """Return a sensor with a counter signal that rises 3600 per hour (1 per second)."""
    fields = {"shape": "counter", "rate_per_hour": 3600, "decimals": 0, "interval_s": 10, **signal}
    spec = SignalFactory().create(fields, 1, 0.0)
    return SensorBehaviour("d", definition("sensor", signal=fields), scheduler, spec)


def test_sensor_updates_only_after_its_interval_and_reports_changes() -> None:
    clock = FakeScheduler()
    behaviour = sensor(clock)
    assert behaviour.native_value == 0
    assert behaviour.tick(5) is False
    assert behaviour.native_value == 0
    assert behaviour.tick(10) is True
    assert behaviour.native_value == 10


def test_a_frozen_sensor_keeps_its_value_until_the_fault_ends() -> None:
    clock = FakeScheduler()
    behaviour = sensor(clock)
    changes: list[int] = []
    behaviour.on_change = lambda: changes.append(1)
    behaviour.start_fault(FaultFactory().create("frozen", {"duration_s": 30}))
    assert behaviour.fault_kind == "frozen"

    clock.time = 20
    assert behaviour.tick(20) is False
    assert behaviour.native_value == 0
    clock.advance(30)
    assert behaviour.fault_kind is None
    assert behaviour.native_value == 50
    assert len(changes) == 2


def test_spike_scales_the_value_at_once_and_ends_by_itself() -> None:
    clock = FakeScheduler()
    clock.time = 100
    behaviour = sensor(clock)
    behaviour.start_fault(FaultFactory().create("spike", {"factor": 2, "duration_s": 5}))
    assert behaviour.native_value == 200
    clock.advance(6)
    assert behaviour.native_value == 106


def test_unavailable_and_a_replacing_fault() -> None:
    clock = FakeScheduler()
    behaviour = sensor(clock)
    faults = FaultFactory()
    behaviour.start_fault(faults.create("unavailable", {"duration_s": 1000}))
    assert behaviour.available is False
    behaviour.start_fault(faults.create("dropout", {"duration_s": 5}))
    assert len(clock.timers) == 1
    clock.advance(6)
    assert behaviour.available is True
    assert clock.timers == []


def test_closing_cancels_the_timers_and_stops_reporting() -> None:
    clock = FakeScheduler()
    behaviour = BinarySensorBehaviour("d", definition("binary_sensor", pulse_s=30), clock)
    changes: list[int] = []
    behaviour.on_change = lambda: changes.append(1)
    behaviour.pulse(None)
    behaviour.close()
    assert clock.timers == []
    clock.advance(60)
    assert behaviour.is_on is True
    assert len(changes) == 1


def test_a_pulse_switches_off_again_and_a_set_cancels_it() -> None:
    clock = FakeScheduler()
    behaviour = BinarySensorBehaviour("d", definition("binary_sensor", pulse_s=30), clock)
    behaviour.pulse(None)
    assert behaviour.is_on is True
    clock.advance(31)
    assert behaviour.is_on is False

    behaviour.pulse(10)
    behaviour.set_state(True)
    clock.advance(60)
    assert behaviour.is_on is True


def test_switch_light_and_restore() -> None:
    clock = FakeScheduler()
    switch = OnOffBehaviour("d", definition("switch"), clock)
    switch.toggle()
    assert switch.is_on is True
    switch.restore(False)
    assert switch.is_on is False

    light = LightBehaviour("d", definition("light"), clock)
    light.turn_on(brightness=100)
    light.turn_off()
    light.turn_on()
    assert (light.is_on, light.brightness) == (True, 100)


def test_cover_clamps_and_thermostat_changes_together() -> None:
    clock = FakeScheduler()
    cover = CoverBehaviour("d", definition("cover", initial_on=True), clock)
    assert cover.position == 100
    cover.set_position(150)
    assert cover.position == 100
    cover.close_cover()
    assert cover.is_closed is True

    signal = SignalFactory().create({"shape": "constant", "min": 20, "max": 20}, 1, 0.0)
    climate = ClimateBehaviour("d", definition("climate"), clock, signal)
    changes: list[int] = []
    climate.on_change = lambda: changes.append(1)
    climate.update(heating=False, target=18.5)
    assert (climate.heating, climate.target, len(changes)) == (False, 18.5, 1)
    assert climate.current_temperature(0) == 20


def test_events_go_to_the_listener() -> None:
    behaviour = EventBehaviour(
        "d", definition("event", event_types=["single", "hold"]), FakeScheduler()
    )
    fired: list[str] = []
    behaviour.on_event = fired.append
    behaviour.press("hold")
    assert fired == ["hold"]
    assert behaviour.event_types == ["single", "hold"]
