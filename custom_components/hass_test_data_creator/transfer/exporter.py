"""Reads one category of the store as entries of a transfer file (concept 16.5)."""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

from ..core.errors import ErrorCode, TemplateError
from ..core.keys import KEY_DEVICES, KEY_GROUPS, KEY_SCENARIOS, KEY_SCHEDULES
from ..store.store import TdcStore
from ..templates.factory import Template
from ..templates.registry import TemplateRegistry
from .factory import ReferenceNames, TransferFactory
from .schema import KEY_ITEMS, KEY_TEMPLATES


class TransferExporter:
    """Builds the entries of a category, a page at a time."""

    def __init__(
        self, store: TdcStore, templates: TemplateRegistry, factory: TransferFactory
    ) -> None:
        """Keep the store, the templates and the factory of the entries."""
        self._store = store
        self._templates = templates
        self._factory = factory

    def page(self, category: str, offset: int, limit: int) -> dict[str, Any]:
        """Return `limit` entries of `category` from `offset` and the total; `limit` 0 only counts."""
        entries = self._entries(category)
        return {
            "category": category,
            "total": len(entries),
            KEY_ITEMS: entries[offset : offset + limit],
        }

    def names(self) -> ReferenceNames:
        """Return the names that stand for ids in the entries."""
        return ReferenceNames(
            devices={item.id: item.name for item in self._store.devices()},
            runs={item.id: item.label for item in self._store.runs()},
            scenarios={item.id: item.name for item in self._store.scenarios()},
        )

    def _template(self, template_id: str) -> Template | None:
        """Return the template with `template_id`, or None if there is none."""
        try:
            return self._templates.get(template_id)
        except TemplateError as error:
            if error.code is not ErrorCode.TPL_NOT_FOUND:
                raise
            return None

    def _entries(self, category: str) -> list[dict[str, Any]]:
        """Return all entries of `category` in the order of the store."""
        factory, store, names = self._factory, self._store, self.names()
        sources: dict[str, Callable[[], list[dict[str, Any]]]] = {
            KEY_TEMPLATES: lambda: [
                factory.template(item) for item in self._templates.all() if not item.bundled
            ],
            KEY_DEVICES: lambda: [
                factory.device(item, self._template(item.template)) for item in store.devices()
            ],
            KEY_SCHEDULES: lambda: [factory.schedule(item, names) for item in store.schedules()],
            KEY_SCENARIOS: lambda: [factory.scenario(item, names) for item in store.scenarios()],
            KEY_GROUPS: lambda: [factory.group(item, names) for item in store.groups()],
        }
        return sources[category]()
