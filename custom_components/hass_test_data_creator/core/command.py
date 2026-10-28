"""The command wrapper: every panel command runs in it (concept 8.2, 13.3)."""

from __future__ import annotations

import asyncio
from collections.abc import Awaitable, Callable
import logging
from typing import Any

from homeassistant.components import websocket_api
from homeassistant.components.websocket_api import ActiveConnection
from homeassistant.core import HomeAssistant
import voluptuous as vol

from ..const import DOMAIN
from .error_factory import ErrorFactory
from .errors import TdcError
from .response_factory import ResponseFactory
from .runtime import TdcData

_LOGGER = logging.getLogger(__name__)
_FALLBACK_ERRORS = ErrorFactory()
_FALLBACK_RESPONSES = ResponseFactory()

Handler = Callable[[HomeAssistant, ActiveConnection, dict[str, Any]], Awaitable[Any]]


def tdc_command(
    command_type: str, fields: dict[Any, Any] | None = None
) -> Callable[[Handler], Any]:
    """Return a decorator that turns `handler` into an admin-only WebSocket command.

    The handler returns the payload or raises a TdcError. Errors are logged once with their code
    and sent as an error reply.
    """
    schema = {vol.Required("type"): command_type, **(fields or {})}

    def decorator(handler: Handler) -> Any:
        """Wrap `handler` with schema, admin check and error conversion."""

        @websocket_api.websocket_command(schema)
        @websocket_api.require_admin
        @websocket_api.async_response
        async def command(
            hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
        ) -> None:
            """Run the handler and send its result or the converted error."""
            data = hass.data.get(DOMAIN)
            errors = data.error_factory if isinstance(data, TdcData) else _FALLBACK_ERRORS
            responses = data.response_factory if isinstance(data, TdcData) else _FALLBACK_RESPONSES
            try:
                payload = await handler(hass, connection, msg)
            except asyncio.CancelledError:
                raise
            except Exception as exc:
                error: TdcError = errors.from_exception(exc)
                _LOGGER.log(
                    logging.WARNING if error.code.name != "INT_UNEXPECTED" else logging.ERROR,
                    "%s %s",
                    error.code.value,
                    command_type,
                    exc_info=error.code.name == "INT_UNEXPECTED",
                )
                connection.send_message(responses.error(msg["id"], error))
                return
            connection.send_message(responses.result(msg["id"], payload))

        return command

    return decorator
