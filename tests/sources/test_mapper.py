"""The mapping proposal and the unit conversion between source and copy."""

from __future__ import annotations

import pytest

from custom_components.hass_test_data_creator.model.models import EntityDef
from custom_components.hass_test_data_creator.sources.mapper import Proposal, SourceEntity, propose
from custom_components.hass_test_data_creator.sources.units import converter


def sensor(key: str, device_class: str, unit: str) -> EntityDef:
    """Return a sensor definition."""
    return EntityDef(key=key, platform="sensor", name=key, device_class=device_class, unit=unit)


def test_a_unique_match_is_taken() -> None:
    result = propose(
        [sensor("temperature", "temperature", "°C")],
        [SourceEntity("sensor.boiler_temp", "sensor", "temperature", "°C")],
    )
    assert result == [Proposal("temperature", entity_id="sensor.boiler_temp")]


def test_units_are_converted() -> None:
    result = propose(
        [sensor("temperature", "temperature", "°C")],
        [SourceEntity("sensor.boiler_temp", "sensor", "temperature", "°F")],
    )
    assert result[0].entity_id == "sensor.boiler_temp"
    convert = converter("temperature", "°F", "°C")
    assert convert is not None
    assert convert(212.0) == pytest.approx(100.0)


def test_two_candidates_are_ambiguous_and_listed() -> None:
    result = propose(
        [sensor("temperature", "temperature", "°C")],
        [
            SourceEntity("sensor.a", "sensor", "temperature", "°C"),
            SourceEntity("sensor.b", "sensor", "temperature", "°C"),
        ],
    )
    assert result[0].entity_id is None
    assert result[0].reason == "ambiguous"
    assert result[0].candidates == ["sensor.a", "sensor.b"]


def test_a_source_entity_feeds_only_one_entity() -> None:
    result = propose(
        [sensor("t1", "temperature", "°C"), sensor("t2", "temperature", "°C")],
        [SourceEntity("sensor.a", "sensor", "temperature", "°C")],
    )
    assert [p.entity_id for p in result] == ["sensor.a", None]
    assert result[1].reason == "none"


def test_a_unit_that_cannot_be_converted_is_named() -> None:
    result = propose(
        [sensor("power", "power", "W")],
        [SourceEntity("sensor.p", "sensor", "power", "bananas")],
    )
    assert result[0].entity_id is None
    assert result[0].reason == "unit"


def test_nothing_fits_and_state_platforms_map_one_to_one() -> None:
    assert propose([sensor("power", "power", "W")], [])[0].reason == "none"
    switch = EntityDef(key="relay", platform="switch", name="Relay")
    result = propose([switch], [SourceEntity("switch.relay", "switch")])
    assert result[0].entity_id == "switch.relay"


def test_converter_without_units_is_the_identity_and_unknown_classes_fail() -> None:
    identity = converter(None, None, None)
    assert identity is not None
    assert identity(3.0) == 3.0
    assert converter("not_a_class", "a", "b") is None
