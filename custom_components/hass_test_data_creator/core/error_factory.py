"""Factory that turns any caught exception into a TdcError (concept 13.2)."""

from __future__ import annotations

import asyncio

import voluptuous as vol

from .errors import InternalError, RequestError, TdcError


class ErrorFactory:
    """Creates a TdcError from any exception."""

    def from_exception(self, exc: BaseException) -> TdcError:
        """Return `exc` as TdcError; schema errors become request errors, the rest internal."""
        if isinstance(exc, asyncio.CancelledError):
            raise exc
        if isinstance(exc, TdcError):
            return exc
        if isinstance(exc, vol.Invalid):
            return RequestError()
        return InternalError()
