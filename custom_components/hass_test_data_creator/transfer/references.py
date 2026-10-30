"""Resolves the names an import file uses for devices, templates, scenarios and runs (concept 16.5)."""

from __future__ import annotations

from typing import Any

from ..core.errors import ErrorCode, GenerationError
from ..core.keys import KEY_DEVICE, KEY_DEVICES, KEY_RUN, KEY_SCENARIOS, KEY_TEMPLATE
from ..core.targets import device_references
from ..store.store import TdcStore
from ..templates.registry import TemplateRegistry
from .schema import KEY_TEMPLATES


class References:
    """Tells whether a name exists here, or in the file; with `strict` only here counts."""

    def __init__(
        self,
        store: TdcStore,
        templates: TemplateRegistry,
        known: dict[str, set[str]],
        *,
        strict: bool,
    ) -> None:
        """Keep the sources of names; `known` holds the names of the file by category."""
        self._store = store
        self._templates = templates
        self._known = known
        self._strict = strict

    def _in_file(self, category: str, name: str) -> bool:
        """Whether the file has an entry `name` in `category` and a check may count on it."""
        return not self._strict and name in self._known.get(category, set())

    def device(self, reference: str) -> None:
        """Raise TDC-GEN-012 unless a device has this id or name here or in the file."""
        if self._store.device_id_of(reference) is None and not self._in_file(
            KEY_DEVICES, reference
        ):
            raise GenerationError(ErrorCode.GEN_TRANSFER_REFERENCE, name=reference)

    def template(self, template_id: str) -> None:
        """Raise TDC-GEN-012 unless the template exists here or in the file."""
        if any(item.id == template_id for item in self._templates.all()):
            return
        if not self._in_file(KEY_TEMPLATES, template_id):
            raise GenerationError(ErrorCode.GEN_TRANSFER_REFERENCE, name=template_id)

    def scenario_id(self, name: str) -> str:
        """Return the id of the scenario `name`; before the import runs, a name of the file gives "".

        Raises TDC-GEN-012 if there is none, and TDC-GEN-013 if the name is not unique.
        """
        found = [item.id for item in self._store.scenarios() if item.name == name]
        if len(found) > 1:
            raise GenerationError(ErrorCode.GEN_TRANSFER_CONFLICT, name=name)
        if found:
            return found[0]
        if not self._in_file(KEY_SCENARIOS, name):
            raise GenerationError(ErrorCode.GEN_TRANSFER_REFERENCE, name=name)
        return ""

    def run_id(self, label: str) -> str:
        """Return the id of the one run with this label, or raise TDC-GEN-012 or TDC-GEN-013."""
        found = [item.id for item in self._store.runs() if item.label == label]
        if not found:
            raise GenerationError(ErrorCode.GEN_TRANSFER_REFERENCE, name=label)
        if len(found) > 1:
            raise GenerationError(ErrorCode.GEN_TRANSFER_CONFLICT, name=label)
        return found[0]

    def target(self, target: dict[str, Any]) -> dict[str, Any]:
        """Check that what a target names exists and return the target with a run given by id."""
        if KEY_DEVICE in target:
            for reference in device_references(target[KEY_DEVICE]):
                self.device(reference)
        elif KEY_TEMPLATE in target:
            self.template(target[KEY_TEMPLATE])
        elif KEY_RUN in target:
            return {KEY_RUN: self.run_id(target[KEY_RUN])}
        return target
