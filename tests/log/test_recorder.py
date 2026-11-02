"""The recorder of the live log and the hook in the behaviours, without Home Assistant."""

from __future__ import annotations

from custom_components.hass_test_data_creator.const import LOG_IDLE_S, MAX_LOG_RATE
from custom_components.hass_test_data_creator.engine.behaviours import (
    BinarySensorBehaviour,
    EventBehaviour,
    SensorBehaviour,
)
from custom_components.hass_test_data_creator.engine.signal_factory import SignalFactory
from custom_components.hass_test_data_creator.faults.factory import Fault
from custom_components.hass_test_data_creator.log.buffer import LogBuffer
from custom_components.hass_test_data_creator.log.factory import LogEntryFactory
from custom_components.hass_test_data_creator.log.filters import LogFilter
from custom_components.hass_test_data_creator.log.recorder import LogRecorder
from custom_components.hass_test_data_creator.model.models import DeviceDef, EntityDef

from ..engine.test_behaviours import FakeScheduler


class Clocks:
    """A wall clock and a monotonic clock that move by hand."""

    def __init__(self) -> None:
        self.wall = 1_000_000.0
        self.mono = 100.0


class FakeStore:
    """Knows one device."""

    def __init__(self, device: DeviceDef) -> None:
        self._device = device

    def device(self, device_id: str) -> DeviceDef | None:
        return self._device if device_id == self._device.id else None


def make() -> tuple[LogRecorder, LogBuffer, Clocks, DeviceDef]:
    """Return a recorder over a fake store and fake clocks."""
    device = DeviceDef(
        id="d1",
        name="Plug 01",
        template="plug_metering",
        model="m",
        output="native",
        run_id="r1",
        seed=1,
        created_at=0.0,
        area="Kitchen",
    )
    clocks = Clocks()
    buffer = LogBuffer(1000)
    recorder = LogRecorder(
        FakeStore(device),  # type: ignore[arg-type]
        LogEntryFactory(),
        buffer,
        wall=lambda: clocks.wall,
        monotonic=lambda: clocks.mono,
    )
    return recorder, buffer, clocks, device


def sensor(recorder: LogRecorder, scheduler: FakeScheduler) -> SensorBehaviour:
    """Return a sensor that counts 1 per second and reports to `recorder`."""
    fields = {"shape": "counter", "rate_per_hour": 3600, "decimals": 0, "interval_s": 10}
    definition = EntityDef(
        key="power", platform="sensor", name="Power", unit="W", device_class="power", signal=fields
    )
    behaviour = SensorBehaviour("d1", definition, scheduler, SignalFactory().create(fields, 1, 0.0))
    behaviour.recorder = recorder
    return behaviour


def read(buffer: LogBuffer) -> list:
    return buffer.read(0, 100, lambda _: True)[0]


def test_nothing_is_recorded_until_a_reader_asks() -> None:
    recorder, buffer, _, _ = make()
    behaviour = sensor(recorder, FakeScheduler())
    assert behaviour.tick(10) is True
    assert buffer.size == 0
    recorder.touch()
    assert behaviour.tick(20) is True
    assert buffer.size == 1


def test_a_sensor_change_is_recorded_with_old_value_unit_and_cause() -> None:
    recorder, buffer, _, _ = make()
    recorder.touch()
    behaviour = sensor(recorder, FakeScheduler())
    behaviour.tick(10)
    behaviour.tick(20)
    first, second = read(buffer)
    assert (first.old, first.new, first.cause) == (None, "10.0", "signal")
    assert (second.old, second.new) == ("10.0", "20.0")
    assert (second.device, second.name, second.unit, second.area) == (
        "Plug 01",
        "Power",
        "W",
        "Kitchen",
    )
    assert second.seq == first.seq + 1


def test_a_fault_is_recorded_as_unavailable_and_its_end_as_the_value() -> None:
    recorder, buffer, _, _ = make()
    recorder.touch()
    scheduler = FakeScheduler()
    behaviour = sensor(recorder, scheduler)
    behaviour.start_fault(Fault(kind="unavailable", duration_s=30, unavailable=True))
    scheduler.advance(31)
    started, ended = read(buffer)
    assert (started.new, started.cause) == ("unavailable", "fault")
    assert ended.cause == "fault"
    assert ended.new != "unavailable"


def test_actions_on_switches_and_events_are_recorded() -> None:
    recorder, buffer, _, _ = make()
    recorder.touch()
    scheduler = FakeScheduler()
    binary = BinarySensorBehaviour(
        "d1", EntityDef(key="motion", platform="binary_sensor", name="Motion"), scheduler
    )
    binary.recorder = recorder
    binary.set_state(True)
    button = EventBehaviour(
        "d1",
        EntityDef(key="button", platform="event", name="Button", event_types=["press"]),
        scheduler,
    )
    button.recorder = recorder
    button.press("press")
    on, pressed = read(buffer)
    assert (on.new, on.cause) == ("on", "action")
    assert (pressed.new, pressed.cause) == ("press", "action")


def test_the_recording_stops_by_itself_and_forgets_everything() -> None:
    recorder, buffer, clocks, _ = make()
    recorder.touch()
    behaviour = sensor(recorder, FakeScheduler())
    behaviour.tick(10)
    assert buffer.size == 1
    clocks.mono += LOG_IDLE_S + 1
    assert recorder.active is False
    assert buffer.size == 0
    behaviour.tick(20)
    assert buffer.size == 0


def test_asking_again_keeps_the_recording_going() -> None:
    recorder, _, clocks, _ = make()
    recorder.touch()
    clocks.mono += LOG_IDLE_S - 1
    recorder.touch()
    clocks.mono += LOG_IDLE_S - 1
    assert recorder.active is True


def test_the_capture_filter_keeps_other_entries_out() -> None:
    recorder, buffer, _, _ = make()
    recorder.touch()
    recorder.set_filter(LogFilter.from_request({"entities": ["energy"]}))
    behaviour = sensor(recorder, FakeScheduler())
    behaviour.tick(10)
    assert buffer.size == 0


def test_too_many_changes_in_one_second_are_counted_and_dropped() -> None:
    recorder, buffer, clocks, _ = make()
    recorder.touch()
    behaviour = sensor(recorder, FakeScheduler())
    for step in range(1, MAX_LOG_RATE + 6):
        behaviour.tick(step * 10)
    assert buffer.size == MAX_LOG_RATE
    assert recorder.discarded == 5
    clocks.mono += 1
    behaviour.tick(10_000)
    assert buffer.size == MAX_LOG_RATE + 1


def test_a_device_that_is_gone_is_skipped() -> None:
    recorder, buffer, _, _ = make()
    recorder.touch()
    behaviour = sensor(recorder, FakeScheduler())
    behaviour.device_id = "unknown"
    behaviour.tick(10)
    assert buffer.size == 0
