"""Factory for the entries of a transfer file (concept 13.2, 16.5)."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from ..core.keys import (
    KEY_ACTION,
    KEY_AREA,
    KEY_DEVICE,
    KEY_ENABLED,
    KEY_ENTITIES,
    KEY_ENTITY,
    KEY_MEMBERS,
    KEY_MODEL,
    KEY_NAME,
    KEY_OUTPUT,
    KEY_PARAMS,
    KEY_RUN,
    KEY_SCENARIO,
    KEY_STEPS,
    KEY_TARGET,
    KEY_TEMPLATE,
    KEY_TRIGGER,
)
from ..core.targets import device_references
from ..model.models import DeviceDef, GroupDef, ScenarioDef, ScheduleDef
from ..templates.factory import Template
from .schema import KEY_OVERRIDES


@dataclass
class ReferenceNames:
    """The names that stand for ids in a file: devices by name, runs by label, scenarios by name."""

    devices: dict[str, str] = field(default_factory=dict)
    runs: dict[str, str] = field(default_factory=dict)
    scenarios: dict[str, str] = field(default_factory=dict)

    def device(self, reference: str) -> str:
        """Return the name of the device with id `reference`; a name or unknown text stays."""
        return self.devices.get(reference, reference)


class TransferFactory:
    """Creates the file entry of a device, template, schedule, scenario or group."""

    def template(self, template: Template) -> dict[str, Any]:
        """Return the entry of an own template: the content of its template file."""
        return template.to_file()

    def device(self, device: DeviceDef, template: Template | None) -> dict[str, Any]:
        """Return the entry of a device: its template and what differs, or all entities.

        The entity list is written in full for a device without a matching template, that is a
        custom device. Otherwise only the fields that differ from the template are written.
        """
        entry: dict[str, Any] = {
            KEY_NAME: device.name,
            KEY_TEMPLATE: device.template,
            KEY_MODEL: device.model,
            KEY_AREA: device.area,
            KEY_OUTPUT: device.output,
            "seed": device.seed,
        }
        entities = [item.to_dict() for item in device.entities]
        overrides = self._overrides(entities, template)
        if overrides is None:
            entry[KEY_ENTITIES] = entities
        elif overrides:
            entry[KEY_OVERRIDES] = overrides
        return entry

    def _overrides(
        self, entities: list[dict[str, Any]], template: Template | None
    ) -> dict[str, dict[str, Any]] | None:
        """Return the differing fields per entity key; None if the entities do not match the template."""
        if template is None or [item["key"] for item in entities] != [
            item.key for item in template.entities
        ]:
            return None
        found: dict[str, dict[str, Any]] = {}
        for stored, original in zip(entities, template.entities, strict=True):
            changed = {
                key: value for key, value in stored.items() if value != original.to_dict()[key]
            }
            if changed:
                found[stored["key"]] = changed
        return found

    def target(self, target: dict[str, Any], names: ReferenceNames) -> dict[str, Any]:
        """Return a target with devices and runs by name."""
        if KEY_DEVICE in target:
            value = target[KEY_DEVICE]
            if isinstance(value, str):
                return {KEY_DEVICE: names.device(value)}
            return {KEY_DEVICE: [names.device(item) for item in sorted(device_references(value))]}
        if KEY_RUN in target:
            return {KEY_RUN: names.runs.get(target[KEY_RUN], target[KEY_RUN])}
        return dict(target)

    def schedule(self, schedule: ScheduleDef, names: ReferenceNames) -> dict[str, Any]:
        """Return the entry of a schedule; its target and scenario are written by name."""
        entry: dict[str, Any] = {
            KEY_NAME: schedule.name,
            KEY_TRIGGER: schedule.trigger,
            "seed": schedule.seed,
            KEY_ENABLED: schedule.enabled,
            KEY_PARAMS: schedule.params,
        }
        if schedule.scenario is not None:
            entry[KEY_SCENARIO] = names.scenarios.get(schedule.scenario, schedule.scenario)
        else:
            entry[KEY_TARGET] = self.target(schedule.target, names)
            entry[KEY_ENTITY] = schedule.entity
            entry[KEY_ACTION] = schedule.action
        return entry

    def scenario(self, scenario: ScenarioDef, names: ReferenceNames) -> dict[str, Any]:
        """Return the entry of a scenario; the target of each step is written by name."""
        return {
            KEY_NAME: scenario.name,
            KEY_STEPS: [
                {**step, KEY_TARGET: self.target(step[KEY_TARGET], names)}
                for step in scenario.steps
            ],
        }

    def group(self, group: GroupDef, names: ReferenceNames) -> dict[str, Any]:
        """Return the entry of a group; its members are written by name."""
        return {KEY_NAME: group.name, KEY_MEMBERS: [names.device(item) for item in group.members]}
