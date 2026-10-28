"""Factory that creates the hourly statistics of a sensor from its signal (concept 13.2)."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from homeassistant.components.recorder.models import (
    StatisticData,
    StatisticMeanType,
    StatisticMetaData,
)
from homeassistant.components.recorder.statistics import STATISTIC_UNIT_TO_UNIT_CONVERTER
from homeassistant.components.sensor import UNIT_CONVERTERS
from homeassistant.util import dt as dt_util

from ..core.keys import KEY_MAX, KEY_MIN, KEY_NAME, KEY_SENSOR, KEY_SHAPE, KEY_START, KEY_STATE
from ..engine.behaviour_factory import entity_seed
from ..engine.signal_factory import Signal, SignalFactory
from ..engine.signals import COUNTER_SHAPE, DISCRETE_SHAPES
from ..engine.tick import signal_time
from ..model.models import DeviceDef, EntityDef

SECONDS_PER_HOUR = 3600
SAMPLES_PER_HOUR = 12
STATE_MEASUREMENT = "measurement"
STATE_CLASSES = (STATE_MEASUREMENT, "total", "total_increasing")
SOURCE = "recorder"


@dataclass
class Series:
    """The statistics of one entity: its metadata and one row per hour."""

    metadata: StatisticMetaData
    rows: list[StatisticData]


def unit_class_of(device_class: str | None, unit: str | None) -> str | None:
    """Return the unit conversion class the recorder expects for this device class and unit."""
    converter = UNIT_CONVERTERS.get(device_class) if device_class else None
    if converter and unit in converter.VALID_UNITS:
        return converter.UNIT_CLASS
    if converter := STATISTIC_UNIT_TO_UNIT_CONVERTER.get(unit):
        return converter.UNIT_CLASS
    return None


class SeriesFactory:
    """Creates the series of a sensor for a list of hours."""

    def __init__(self, signals: SignalFactory) -> None:
        """Keep the signal factory the series are computed with."""
        self._signals = signals

    def supports(self, definition: EntityDef) -> bool:
        """Whether the entity is a sensor with a state class and numbers as values."""
        return (
            definition.platform == KEY_SENSOR
            and definition.state_class in STATE_CLASSES
            and (definition.signal or {}).get(KEY_SHAPE) not in DISCRETE_SHAPES
        )

    def create(
        self, device: DeviceDef, definition: EntityDef, entity_id: str, hours: list[datetime]
    ) -> Series:
        """Return the series of `definition` for the hours that start at `hours` (UTC, on the hour).

        A counter starts at the beginning of the history instead of at the creation of the device,
        so that the past shows consumption.
        """
        signal = self._signal(device, definition, hours[0])
        measurement = definition.state_class == STATE_MEASUREMENT
        metadata: StatisticMetaData = {
            "mean_type": StatisticMeanType.ARITHMETIC if measurement else StatisticMeanType.NONE,
            "has_sum": not measurement,
            KEY_NAME: None,
            "source": SOURCE,
            "statistic_id": entity_id,
            "unit_class": unit_class_of(definition.device_class, definition.unit),
            "unit_of_measurement": definition.unit,
        }
        times = [signal_time(dt_util.as_local(start)) for start in hours]
        if measurement:
            return Series(
                metadata,
                [_measurement_row(signal, *item) for item in zip(hours, times, strict=True)],
            )
        return Series(metadata, _total_rows(signal, definition.state_class, hours, times))

    def _signal(self, device: DeviceDef, definition: EntityDef, first: datetime) -> Signal:
        """Return the signal of the entity; a counter gets an origin not later than `first`."""
        spec = definition.signal or {}
        origin = signal_time(dt_util.as_local(dt_util.utc_from_timestamp(device.created_at)))
        if spec.get(KEY_SHAPE) == COUNTER_SHAPE:
            origin = min(origin, signal_time(dt_util.as_local(first)))
        return self._signals.create(spec, entity_seed(device.seed, definition.key), origin)


def _samples(signal: Signal, begin: float) -> list[float]:
    """Return the values of the signal over the hour that starts at the signal time `begin`."""
    step = SECONDS_PER_HOUR / SAMPLES_PER_HOUR
    return [float(signal.value(begin + index * step)) for index in range(SAMPLES_PER_HOUR)]


def _measurement_row(signal: Signal, start: datetime, begin: float) -> StatisticData:
    """Return mean, minimum and maximum of the hour that starts at `start`."""
    values = _samples(signal, begin)
    return {
        KEY_START: start,
        "mean": sum(values) / len(values),
        KEY_MIN: min(values),
        KEY_MAX: max(values),
    }


def _total_rows(
    signal: Signal, state_class: str | None, hours: list[datetime], times: list[float]
) -> list[StatisticData]:
    """Return state and running sum at the end of every hour; the sum starts at 0."""
    rows: list[StatisticData] = []
    previous = float(signal.value(times[0]))
    total = 0.0
    for start, begin in zip(hours, times, strict=True):
        state = float(signal.value(begin + SECONDS_PER_HOUR))
        delta = state - previous
        if delta < 0 and state_class == "total_increasing":
            delta = state
        total += delta
        previous = state
        rows.append({KEY_START: start, KEY_STATE: state, "sum": total})
    return rows
