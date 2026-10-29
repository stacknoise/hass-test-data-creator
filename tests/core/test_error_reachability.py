"""Every error code is raised somewhere, and every conversion path ends in a TdcError."""

from __future__ import annotations

import asyncio
from pathlib import Path
import re

import pytest
import voluptuous as vol

from custom_components.hass_test_data_creator.core.error_factory import ErrorFactory
from custom_components.hass_test_data_creator.core.errors import (
    ErrorCode,
    InternalError,
    RequestError,
    TdcError,
)

PACKAGE = Path(__file__).parent.parent.parent / "custom_components" / "hass_test_data_creator"


def test_every_error_code_is_used_in_the_code() -> None:
    source = "\n".join(path.read_text(encoding="utf-8") for path in PACKAGE.rglob("*.py"))
    unused = [
        code.name for code in ErrorCode if not re.search(rf"ErrorCode\.{code.name}\b", source)
    ]
    assert unused == []


def test_a_schema_error_becomes_a_request_error() -> None:
    error = ErrorFactory().from_exception(vol.Invalid("bad"))
    assert isinstance(error, RequestError)
    assert error.code is ErrorCode.WS_INVALID_REQUEST


def test_an_unexpected_exception_becomes_an_internal_error() -> None:
    error = ErrorFactory().from_exception(KeyError("x"))
    assert isinstance(error, InternalError)
    assert error.code is ErrorCode.INT_UNEXPECTED


def test_a_tdc_error_passes_through() -> None:
    original = TdcError(ErrorCode.GEN_BATCH)
    assert ErrorFactory().from_exception(original) is original


def test_cancellation_is_never_converted() -> None:
    with pytest.raises(asyncio.CancelledError):
        ErrorFactory().from_exception(asyncio.CancelledError())
