"""The pure deviation functions: deterministic, bounded and switched off by zero parameters."""

from __future__ import annotations

from custom_components.hass_test_data_creator.sources.deviation import (
    Deviation,
    bucket_of,
    deviate,
    is_dropout,
    lag_of,
    signed,
)


def test_without_parameters_the_value_is_unchanged() -> None:
    assert deviate(21.5, 7, 3, Deviation()) == 21.5


def test_the_same_input_gives_the_same_result_and_other_seeds_differ() -> None:
    deviation = Deviation(offset=0.5, scale=0.02, noise=0.01)
    first = deviate(20.0, 1, 4, deviation, span=40.0)
    assert deviate(20.0, 1, 4, deviation, span=40.0) == first
    assert deviate(20.0, 2, 4, deviation, span=40.0) != first


def test_offset_and_scale_stay_within_their_bounds() -> None:
    deviation = Deviation(offset=0.5, scale=0.02)
    for seed in range(200):
        value = deviate(100.0, seed, 0, deviation)
        assert 100.0 * 0.98 - 0.5 <= value <= 100.0 * 1.02 + 0.5


def test_the_offset_is_fixed_per_seed_but_the_noise_moves_with_the_bucket() -> None:
    fixed = Deviation(offset=1.0)
    assert deviate(10.0, 5, 0, fixed) == deviate(10.0, 5, 99, fixed)
    noisy = Deviation(noise=0.1)
    assert deviate(10.0, 5, 0, noisy, span=10.0) != deviate(10.0, 5, 1, noisy, span=10.0)


def test_clamp_and_decimals_apply_last() -> None:
    deviation = Deviation(offset=50.0, clamp_max=100.0, decimals=1)
    assert all(deviate(99.123, seed, 0, deviation) <= 100.0 for seed in range(50))
    assert deviate(1.23456, 1, 0, Deviation(decimals=2)) == 1.23


def test_the_lag_is_fixed_per_seed_and_within_the_limit() -> None:
    deviation = Deviation(lag_s=30)
    lags = {lag_of(seed, deviation) for seed in range(50)}
    assert all(0 <= lag < 30 for lag in lags)
    assert lag_of(3, deviation) == lag_of(3, deviation)
    assert lag_of(3, Deviation()) == 0


def test_dropout_follows_its_rate() -> None:
    assert not any(is_dropout(1, bucket, Deviation()) for bucket in range(100))
    assert all(is_dropout(1, bucket, Deviation(dropout=1.0)) for bucket in range(100))
    hits = sum(is_dropout(1, bucket, Deviation(dropout=0.2)) for bucket in range(2000))
    assert 300 < hits < 500


def test_signed_stays_in_range_and_buckets_follow_the_interval() -> None:
    assert all(-1 <= signed(9, 1, n) < 1 for n in range(100))
    assert bucket_of(25.0, 10) == 2
    assert bucket_of(25.0, 0) == 25


def test_stored_parameters_round_trip_and_ignore_unknown_fields() -> None:
    deviation = Deviation(offset=0.5, decimals=1, clamp_max=100.0)
    assert Deviation.from_dict(deviation.to_dict()) == deviation
    assert Deviation.from_dict({"offset": 2.0, "bogus": 1}) == Deviation(offset=2.0)
    assert Deviation.from_dict(None) == Deviation()
