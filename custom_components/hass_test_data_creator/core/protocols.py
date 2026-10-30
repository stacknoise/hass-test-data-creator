"""Narrow interfaces that let one topic use another without importing it (concept 13.1)."""

from __future__ import annotations

from typing import TYPE_CHECKING, Protocol, runtime_checkable

from .error_factory import ErrorFactory
from .response_factory import ResponseFactory

if TYPE_CHECKING:
    from ..model.models import DeviceDef


class ScenarioRunner(Protocol):
    """What the scheduler needs of the scenarios: check that one exists and run it."""

    def get(self, scenario_id: str) -> object:
        """Return the scenario or raise if it does not exist."""

    async def async_run(self, scenario_id: str) -> int:
        """Run the scenario and return the number of actions it ran."""


class GroupPublisher(Protocol):
    """What the outputs need of the groups: drop groups and take devices out of the others."""

    async def async_drop(self, group_ids: list[str], device_ids: set[str]) -> None:
        """Delete groups and remove `device_ids` from the remaining groups."""


class UsageLookup(Protocol):
    """What the device filter needs of the usage index: whether anything names a device."""

    def is_used(self, device: DeviceDef) -> bool:
        """Whether a schedule, scenario or group names the device."""


@runtime_checkable
class HasReplies(Protocol):
    """The runtime data as far as the command wrapper needs it: the reply and error factories."""

    error_factory: ErrorFactory
    response_factory: ResponseFactory
