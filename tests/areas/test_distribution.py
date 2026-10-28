"""Distribution of devices over areas."""

from __future__ import annotations

from custom_components.hass_test_data_creator.areas.distribution import distribute


def test_even_hands_out_areas_in_turn() -> None:
    assert distribute(["a", "b"], 5, "even", 1) == ["a", "b", "a", "b", "a"]


def test_without_areas_every_device_has_none() -> None:
    assert distribute([], 3, "even", 1) == [None, None, None]


def test_random_is_deterministic_and_uses_only_given_areas() -> None:
    first = distribute(["a", "b", "c"], 50, "random", 9)
    assert first == distribute(["a", "b", "c"], 50, "random", 9)
    assert set(first) <= {"a", "b", "c"}
    assert len(set(first)) > 1
