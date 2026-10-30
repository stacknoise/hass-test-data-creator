"""Filter, facets and sort order of the device list (concept 16.1); pure functions, no I/O."""

from __future__ import annotations

from collections.abc import Callable, Iterable
from dataclasses import dataclass
import re
from typing import Any

from ..core.protocols import UsageLookup
from ..model.models import DeviceDef

STATE_ANY = "any"
STATE_FAULT = "fault"
STATE_USED = "used"
STATE_UNUSED = "unused"
STATE_PAUSED = "paused"
STATES = (STATE_ANY, STATE_FAULT, STATE_USED, STATE_UNUSED, STATE_PAUSED)
SORT_NAME = "name"
SORT_CREATED = "created"
SORT_TEMPLATE = "template"
SORTS = (SORT_NAME, SORT_CREATED, SORT_TEMPLATE)
GROUPS = ("templates", "areas", "outputs", "platforms", "runs")
_NUMBERS = re.compile(r"(\d+)")


@dataclass(frozen=True)
class DeviceFilter:
    """What the panel asks of the device list; an empty filter keeps every device in store order."""

    query: str = ""
    templates: tuple[str, ...] = ()
    areas: tuple[str, ...] = ()
    outputs: tuple[str, ...] = ()
    platforms: tuple[str, ...] = ()
    runs: tuple[str, ...] = ()
    custom: bool = False
    state: str = STATE_ANY
    sort: str | None = None
    descending: bool = False

    @classmethod
    def from_request(cls, data: dict[str, Any]) -> DeviceFilter:
        """Return the filter for a validated request; absent fields mean no restriction."""
        return cls(
            query=data.get("query", "").strip(),
            templates=tuple(data.get("templates", ())),
            areas=tuple(data.get("areas", ())),
            outputs=tuple(data.get("outputs", ())),
            platforms=tuple(data.get("platforms", ())),
            runs=tuple(data.get("runs", ())),
            custom=data.get("custom", False),
            state=data.get("state", STATE_ANY),
            sort=data.get("sort"),
            descending=data.get("descending", False),
        )


@dataclass(frozen=True)
class FilterContext:
    """What the filter needs besides the device: usage, faults and the built-in templates."""

    usage: UsageLookup
    has_fault: Callable[[DeviceDef], bool]
    bundled: frozenset[str]


def natural_key(text: str) -> tuple[Any, ...]:
    """Return the sort key of `text`: case-insensitive, digit runs by value ("2" before "10")."""
    return tuple(
        (0, int(part), "") if part.isdigit() else (1, 0, part)
        for part in _NUMBERS.split(text.casefold())
        if part
    )


def _text_matches(device: DeviceDef, query: str) -> bool:
    """Whether `query` (lower case) is part of a searched text of `device`."""
    texts = (
        device.name,
        device.id,
        device.template,
        device.model,
        device.area or "",
        *(entity.name for entity in device.entities),
    )
    return any(query in text.casefold() for text in texts)


def _checks(
    device: DeviceDef, flt: DeviceFilter, context: FilterContext, query: str
) -> dict[str, bool]:
    """Return per group of the filter whether `device` passes it; unset groups pass."""
    return {
        "query": not query or _text_matches(device, query),
        "templates": not flt.templates or device.template in flt.templates,
        "areas": not flt.areas or (device.area or "") in flt.areas,
        "outputs": not flt.outputs or device.output in flt.outputs,
        "platforms": not flt.platforms
        or any(entity.platform in flt.platforms for entity in device.entities),
        "runs": not flt.runs or device.run_id in flt.runs,
        "custom": not flt.custom or device.template not in context.bundled,
        "state": _state_matches(device, flt.state, context),
    }


def _state_matches(device: DeviceDef, state: str, context: FilterContext) -> bool:
    """Whether `device` has the fault, usage or pause state asked for."""
    if state == STATE_FAULT:
        return context.has_fault(device)
    if state == STATE_PAUSED:
        return device.paused
    if state == STATE_USED:
        return context.usage.is_used(device)
    if state == STATE_UNUSED:
        return not context.usage.is_used(device)
    return True


def matches(device: DeviceDef, flt: DeviceFilter, context: FilterContext) -> bool:
    """Whether `device` passes every group of `flt`: OR inside a group, AND between groups."""
    return all(_checks(device, flt, context, flt.query.casefold()).values())


def filter_and_sort(
    devices: Iterable[DeviceDef], flt: DeviceFilter, context: FilterContext
) -> list[DeviceDef]:
    """Return the devices that pass `flt`, in the order it asks for."""
    found = [device for device in devices if matches(device, flt, context)]
    if flt.sort == SORT_CREATED:
        found.sort(key=lambda item: (item.created_at, item.id))
    elif flt.sort == SORT_TEMPLATE:
        found.sort(key=lambda item: (natural_key(item.template), natural_key(item.name), item.id))
    elif flt.sort == SORT_NAME:
        found.sort(key=lambda item: (natural_key(item.name), item.id))
    if flt.descending:
        found.reverse()
    return found


def _values(device: DeviceDef) -> dict[str, set[str]]:
    """Return the values of `device` in each facet group."""
    return {
        "templates": {device.template},
        "areas": {device.area or ""},
        "outputs": {device.output},
        "platforms": {entity.platform for entity in device.entities},
        "runs": {device.run_id},
    }


def facets(
    devices: Iterable[DeviceDef], flt: DeviceFilter, context: FilterContext
) -> dict[str, list[dict[str, Any]]]:
    """Return per group the possible values with their counts.

    A group is counted with the other groups' filters applied but not its own, so the user sees
    what choosing one more value would give. `state` counts the three states over all devices that
    pass the other groups.
    """
    query = flt.query.casefold()
    counts: dict[str, dict[str, int]] = {name: {} for name in (*GROUPS, "state")}
    for device in devices:
        checks = _checks(device, flt, context, query)
        values = _values(device)
        for group, found in values.items():
            if all(passed for key, passed in checks.items() if key != group):
                for value in found:
                    counts[group][value] = counts[group].get(value, 0) + 1
        if all(passed for key, passed in checks.items() if key != "state"):
            for state in (STATE_FAULT, STATE_USED, STATE_UNUSED):
                if _state_matches(device, state, context):
                    counts["state"][state] = counts["state"].get(state, 0) + 1
    return {
        group: [
            {"value": value, "count": count}
            for value, count in sorted(table.items(), key=lambda pair: natural_key(pair[0]))
        ]
        for group, table in counts.items()
    }
