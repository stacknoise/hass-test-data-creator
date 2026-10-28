"""Actions on entities and their factory (concept 6.2, 13.2); manual actions and faults."""

from __future__ import annotations

from collections.abc import Awaitable, Callable
from typing import Any

from ..core.errors import ErrorCode, ScheduleError
from ..faults.factory import ACTION_PREFIX, FaultFactory

Action = Callable[[Any, dict[str, Any]], Awaitable[None]]


async def _turn_on(behaviour: Any, params: dict[str, Any]) -> None:
    """Switch a switch, light or thermostat on."""
    behaviour.turn_on()


async def _turn_off(behaviour: Any, params: dict[str, Any]) -> None:
    """Switch a switch, light or thermostat off."""
    behaviour.turn_off()


async def _toggle(behaviour: Any, params: dict[str, Any]) -> None:
    """Toggle a switch or a light."""
    behaviour.toggle()


async def _set_on(behaviour: Any, params: dict[str, Any]) -> None:
    """Set a binary sensor to on."""
    behaviour.set_state(True)


async def _set_off(behaviour: Any, params: dict[str, Any]) -> None:
    """Set a binary sensor to off."""
    behaviour.set_state(False)


async def _pulse(behaviour: Any, params: dict[str, Any]) -> None:
    """Switch a binary sensor on for `duration_s` seconds."""
    behaviour.pulse(params.get("duration_s"))


async def _press(behaviour: Any, params: dict[str, Any]) -> None:
    """Fire an event of an event entity; `event_type` defaults to the first one."""
    event_type = params.get("event_type") or behaviour.event_types[0]
    if event_type not in behaviour.event_types:
        raise ScheduleError(ErrorCode.SCH_UNKNOWN_ACTION)
    behaviour.press(event_type)


def _number(params: dict[str, Any], key: str, low: float, high: float) -> float:
    """Return `params[key]` as a number within `low` and `high` or raise SCH_INVALID_PARAMS."""
    try:
        value = float(params[key])
    except KeyError, TypeError, ValueError:
        raise ScheduleError(ErrorCode.SCH_INVALID_PARAMS) from None
    if not low <= value <= high:
        raise ScheduleError(ErrorCode.SCH_INVALID_PARAMS)
    return value


async def _set_brightness(behaviour: Any, params: dict[str, Any]) -> None:
    """Set the brightness (0 to 255) of a light; 0 switches it off."""
    brightness = int(_number(params, "brightness", 0, 255))
    if brightness == 0:
        behaviour.turn_off()
    else:
        behaviour.turn_on(brightness=brightness)


async def _open_cover(behaviour: Any, params: dict[str, Any]) -> None:
    """Open a cover fully."""
    behaviour.open_cover()


async def _close_cover(behaviour: Any, params: dict[str, Any]) -> None:
    """Close a cover fully."""
    behaviour.close_cover()


async def _set_position(behaviour: Any, params: dict[str, Any]) -> None:
    """Move a cover to a position (0 closed, 100 open)."""
    behaviour.set_position(int(_number(params, "position", 0, 100)))


async def _set_temperature(behaviour: Any, params: dict[str, Any]) -> None:
    """Set the target temperature of a thermostat."""
    behaviour.set_target(_number(params, "temperature", behaviour.min_temp, behaviour.max_temp))


_ACTIONS: dict[tuple[str, str], Action] = {
    ("switch", "turn_on"): _turn_on,
    ("switch", "turn_off"): _turn_off,
    ("switch", "toggle"): _toggle,
    ("binary_sensor", "set_on"): _set_on,
    ("binary_sensor", "set_off"): _set_off,
    ("binary_sensor", "pulse"): _pulse,
    ("event", "press"): _press,
    ("light", "turn_on"): _turn_on,
    ("light", "turn_off"): _turn_off,
    ("light", "toggle"): _toggle,
    ("light", "set_brightness"): _set_brightness,
    ("cover", "open"): _open_cover,
    ("cover", "close"): _close_cover,
    ("cover", "set_position"): _set_position,
    ("climate", "set_temperature"): _set_temperature,
    ("climate", "turn_on"): _turn_on,
    ("climate", "turn_off"): _turn_off,
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

    def supports(self, platform: str, action: str) -> bool:
        """Whether entities of `platform` can do `action`, a plain action or a fault."""
        if (platform, action) in _ACTIONS:
            return True
        kind = action.removeprefix(ACTION_PREFIX)
        return action.startswith(ACTION_PREFIX) and platform in self._faults.platforms(kind)

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

        async def start(behaviour: Any, params: dict[str, Any]) -> None:
            """Start the fault; `duration_s` and the kind's parameters come from `params`."""
            behaviour.start_fault(self._faults.create(kind, params))

        return start
