"""Error codes: unique, well formed, translated in both languages (concept 13.3)."""

from __future__ import annotations

import json
from pathlib import Path
import re

import pytest

from custom_components.hass_test_data_creator.core.errors import (
    ErrorCode,
    GenerationError,
    TdcError,
)

TRANSLATIONS = (
    Path(__file__).parents[2] / "custom_components" / "hass_test_data_creator" / "translations"
)
AREAS = {"CFG", "TPL", "GEN", "SIG", "SCH", "OUT", "REM", "WS", "INT"}


def test_codes_are_unique_and_well_formed() -> None:
    values = [code.value for code in ErrorCode]
    assert len(values) == len(set(values))
    for code in ErrorCode:
        assert re.fullmatch(r"TDC-[A-Z]+-\d{3}", code.value)
        area = code.value.split("-")[1]
        assert area in AREAS
        assert code.name.startswith(f"{area}_")


def test_numbers_have_no_gaps_per_area() -> None:
    by_area: dict[str, list[int]] = {}
    for code in ErrorCode:
        _, area, number = code.value.split("-")
        by_area.setdefault(area, []).append(int(number))
    for numbers in by_area.values():
        assert sorted(numbers) == list(range(1, len(numbers) + 1))


@pytest.mark.parametrize("language", ["en", "de"])
def test_every_code_has_a_text_without_trailing_period(language: str) -> None:
    exceptions = json.loads((TRANSLATIONS / f"{language}.json").read_text(encoding="utf-8"))[
        "exceptions"
    ]
    for code in ErrorCode:
        message = exceptions[code.name.lower()]["message"]
        assert message
        assert not message.endswith(".")


def test_error_carries_its_code_and_translation_key() -> None:
    error = GenerationError(ErrorCode.GEN_BATCH)
    assert isinstance(error, TdcError)
    assert error.code is ErrorCode.GEN_BATCH
    assert error.translation_key == "gen_batch"
