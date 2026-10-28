"""Actions on entities and their factory (concept 6.2, 13.2); v0.1 has manual actions only."""

from __future__ import annotations

from collections.abc import Awaitable, Callable
from typing import Any

from ..core.errors import ErrorCode, ScheduleError

Action = Callable[[Any, dict[str, Any]], Awaitable[None]]


async def _turn_on(entity: Any, params: dict[str, Any]) -> None:
    """Switch a switch on."""
    await entity.async_turn_on()


async def _turn_off(entity: Any, params: dict[str, Any]) -> None:
    """Switch a switch off."""
    await entity.async_turn_off()


async def _toggle(entity: Any, params: dict[str, Any]) -> None:
    """Toggle a switch."""
    await entity.async_toggle()


async def _set_on(entity: Any, params: dict[str, Any]) -> None:
    """Set a binary sensor to on."""
    entity.set_state(True)


async def _set_off(entity: Any, params: dict[str, Any]) -> None:
    """Set a binary sensor to off."""
    entity.set_state(False)


async def _pulse(entity: Any, params: dict[str, Any]) -> None:
    """Switch a binary sensor on for `duration_s` seconds."""
    entity.pulse(params.get("duration_s"))


async def _press(entity: Any, params: dict[str, Any]) -> None:
    """Fire an event of an event entity; `event_type` defaults to the first one."""
    event_type = params.get("event_type") or entity.event_types[0]
    if event_type not in entity.event_types:
        raise ScheduleError(ErrorCode.SCH_UNKNOWN_ACTION)
    entity.press(event_type)


_ACTIONS: dict[tuple[str, str], Action] = {
    ("switch", "turn_on"): _turn_on,
    ("switch", "turn_off"): _turn_off,
    ("switch", "toggle"): _toggle,
    ("binary_sensor", "set_on"): _set_on,
    ("binary_sensor", "set_off"): _set_off,
    ("binary_sensor", "pulse"): _pulse,
    ("event", "press"): _press,
}


class ActionFactory:
    """Creates the action for a platform and an action name."""

    def create(self, platform: str, action: str) -> Action:
        """Return the action or raise SCH_UNKNOWN_ACTION."""
        found = _ACTIONS.get((platform, action))
        if found is None:
            raise ScheduleError(ErrorCode.SCH_UNKNOWN_ACTION)
        return found

    def names(self) -> dict[str, list[str]]:
        """Return the action names per platform."""
        result: dict[str, list[str]] = {}
        for platform, action in _ACTIONS:
            result.setdefault(platform, []).append(action)
        return result
