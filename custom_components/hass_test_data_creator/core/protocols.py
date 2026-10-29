"""Narrow interfaces that let one topic use another without importing it (concept 13.1)."""

from __future__ import annotations

from typing import Protocol


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
