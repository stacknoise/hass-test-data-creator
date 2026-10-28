"""Factory for WebSocket replies (concept 13.2)."""

from __future__ import annotations

from typing import Any

from homeassistant.components import websocket_api

from .errors import TdcError


class ResponseFactory:
    """Creates the result and error replies of the panel commands."""

    def result(self, msg_id: int, payload: Any) -> dict[str, Any]:
        """Return the success reply with `payload`."""
        return websocket_api.result_message(msg_id, payload)

    def error(self, msg_id: int, error: TdcError) -> dict[str, Any]:
        """Return the error reply: the TDC code as error code, the translated text as message."""
        return websocket_api.error_message(msg_id, error.code.value, str(error))
