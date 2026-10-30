"""The device filter: matching, facets and the natural sort order, as pure functions."""

from __future__ import annotations

from typing import Any

import pytest

from custom_components.hass_test_data_creator.devices.filters import (
    DeviceFilter,
    FilterContext,
    facets,
    filter_and_sort,
    matches,
    natural_key,
)
from custom_components.hass_test_data_creator.model.models import DeviceDef, EntityDef


class _Usage:
    """Usage lookup that calls the devices with the given ids used."""

    def __init__(self, used: set[str]) -> None:
        self._used = used

    def is_used(self, device: DeviceDef) -> bool:
        return device.id in self._used


def _device(
    name: str,
    template: str = "plug",
    area: str | None = None,
    platform: str = "sensor",
    **extra: Any,
) -> DeviceDef:
    fields: dict[str, Any] = {
        "id": f"id-{name}",
        "name": name,
        "template": template,
        "model": "Model X",
        "output": "native",
        "run_id": "run-1",
        "seed": 1,
        "created_at": 1.0,
        "area": area,
        "entities": [EntityDef(key="e", name="Power", platform=platform)],
    }
    fields.update(extra)
    return DeviceDef(**fields)


def _context(used: set[str] | None = None, faulty: set[str] | None = None) -> FilterContext:
    return FilterContext(
        _Usage(used or set()),
        lambda device: device.id in (faulty or set()),
        frozenset({"plug", "light"}),
    )


DEVICES = [
    _device("Sensor 10", "plug", "Kitchen", created_at=3.0),
    _device("sensor 2", "light", None, "light", created_at=1.0, output="mqtt", run_id="run-2"),
    _device("Sensor 1", "mine", "Hall", created_at=2.0),
]


@pytest.mark.parametrize(
    ("flt", "names"),
    [
        (DeviceFilter(), ["Sensor 10", "sensor 2", "Sensor 1"]),
        (DeviceFilter(query="KITCHEN"), ["Sensor 10"]),
        (DeviceFilter(query="power"), ["Sensor 10", "sensor 2", "Sensor 1"]),
        (DeviceFilter(query="id-sensor 2"), ["sensor 2"]),
        (DeviceFilter(query="model x"), ["Sensor 10", "sensor 2", "Sensor 1"]),
        (DeviceFilter(templates=("plug", "light")), ["Sensor 10", "sensor 2"]),
        (DeviceFilter(areas=("",)), ["sensor 2"]),
        (DeviceFilter(areas=("", "Hall")), ["sensor 2", "Sensor 1"]),
        (DeviceFilter(outputs=("mqtt",)), ["sensor 2"]),
        (DeviceFilter(platforms=("light",)), ["sensor 2"]),
        (DeviceFilter(runs=("run-2",)), ["sensor 2"]),
        (DeviceFilter(custom=True), ["Sensor 1"]),
        (DeviceFilter(templates=("plug",), areas=("Hall",)), []),
        (DeviceFilter(state="used"), ["Sensor 10"]),
        (DeviceFilter(state="unused"), ["sensor 2", "Sensor 1"]),
        (DeviceFilter(state="fault"), ["Sensor 1"]),
    ],
)
def test_the_filter_keeps_what_matches(flt: DeviceFilter, names: list[str]) -> None:
    context = _context(used={"id-Sensor 10"}, faulty={"id-Sensor 1"})
    assert [d.name for d in filter_and_sort(DEVICES, flt, context)] == names
    assert [d.name for d in DEVICES if matches(d, flt, context)] == names


def test_an_entity_id_is_not_searched() -> None:
    device = _device("Lamp")
    device.entities[0].key = "unique_key"
    assert not matches(device, DeviceFilter(query="sensor.lamp"), _context())


@pytest.mark.parametrize(
    ("flt", "names"),
    [
        (DeviceFilter(sort="name"), ["Sensor 1", "sensor 2", "Sensor 10"]),
        (DeviceFilter(sort="name", descending=True), ["Sensor 10", "sensor 2", "Sensor 1"]),
        (DeviceFilter(sort="created"), ["sensor 2", "Sensor 1", "Sensor 10"]),
        (DeviceFilter(sort="template"), ["sensor 2", "Sensor 1", "Sensor 10"]),
        (DeviceFilter(descending=True), ["Sensor 1", "sensor 2", "Sensor 10"]),
    ],
)
def test_the_sort_is_natural_and_case_blind(flt: DeviceFilter, names: list[str]) -> None:
    assert [d.name for d in filter_and_sort(DEVICES, flt, _context())] == names


def test_equal_names_are_ordered_by_id() -> None:
    first, second = _device("Same", id="b"), _device("Same", id="a")
    found = filter_and_sort([first, second], DeviceFilter(sort="name"), _context())
    assert [d.id for d in found] == ["a", "b"]


def test_natural_key_orders_numbers_by_value() -> None:
    assert sorted(["a10", "A2", "a1b"], key=natural_key) == ["a1b", "A2", "a10"]


def test_facets_count_with_the_other_groups_applied() -> None:
    context = _context(used={"id-Sensor 10"})
    result = facets(DEVICES, DeviceFilter(areas=("Hall",)), context)
    # Own group is not filtered, so every area is offered; other groups see only the Hall device.
    assert result["areas"] == [
        {"value": "", "count": 1},
        {"value": "Hall", "count": 1},
        {"value": "Kitchen", "count": 1},
    ]
    assert result["templates"] == [{"value": "mine", "count": 1}]
    assert result["state"] == [{"value": "unused", "count": 1}]


def test_empty_facets_over_no_devices() -> None:
    assert all(not values for values in facets([], DeviceFilter(), _context()).values())
