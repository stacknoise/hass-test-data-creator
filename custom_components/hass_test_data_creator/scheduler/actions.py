"""Actions on entities and their factory (concept 6.2, 13.2); manual actions and faults."""

from __future__ import annotations

from collections.abc import Awaitable, Callable
from typing import Any

from ..core.errors import ErrorCode, ScheduleError
from ..faults.factory import ACTION_PREFIX, FaultFactory

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
    """Creates the action for a platform and an action name; faults are `fault_<kind>`."""

    def __init__(self, faults: FaultFactory) -> None:
        """Keep the factory that builds the faults."""
        self._faults = faults

    def create(self, platform: str, action: str) -> Action:
        """Return the action or raise SCH_UNKNOWN_ACTION."""
        found = _ACTIONS.get((platform, action))
        if found is not None:
            return found
        kind = action.removeprefix(ACTION_PREFIX)
        if action.startswith(ACTION_PREFIX) and platform in self._faults.platforms(kind):
            return self._fault_action(kind)
        raise ScheduleError(ErrorCode.SCH_UNKNOWN_ACTION)

    def names(self) -> dict[str, list[str]]:
        """Return the action names per platform."""
        result: dict[str, list[str]] = {}
        for platform, action in _ACTIONS:
            result.setdefault(platform, []).append(action)
        for kind in self._faults.kinds():
            for platform in self._faults.platforms(kind):
                result.setdefault(platform, []).append(f"{ACTION_PREFIX}{kind}")
        return result

    def _fault_action(self, kind: str) -> Action:
        """Return the action that starts a fault of `kind` on an entity."""

        async def start(entity: Any, params: dict[str, Any]) -> None:
            """Start the fault; `duration_s` and the kind's parameters come from `params`."""
            entity.start_fault(self._faults.create(kind, params))

        return start
