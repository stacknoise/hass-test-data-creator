"""Plans and runs the import of one batch of entries of one category (concept 16.5)."""

from __future__ import annotations

from typing import Any

from ..audit.factory import AuditEntryFactory
from ..audit.log import AuditLog
from ..core.errors import ErrorCode, GenerationError, TdcError
from ..store.store import TdcStore
from ..templates.registry import TemplateRegistry
from .handlers import CategoryHandler
from .plan import CategoryPlan, ImportRequest
from .references import References
from .schema import MODE_ADD, MODE_REPLACE, MODE_SYNC


class _Decisions:
    """What each entry of a batch turns into: the lists of entries to create and to update."""

    def __init__(self, plan: CategoryPlan) -> None:
        """Start with empty lists for `plan`."""
        self.plan = plan
        self.create: list[dict[str, Any]] = []
        self.update: list[tuple[Any, dict[str, Any]]] = []


class TransferImporter:
    """Decides per entry whether it is created, updated or skipped, and does it."""

    def __init__(
        self,
        store: TdcStore,
        templates: TemplateRegistry,
        handlers: dict[str, CategoryHandler],
        audit: AuditLog,
        audit_factory: AuditEntryFactory,
    ) -> None:
        """Keep the sources of names, the handler of each category and the audit log."""
        self._store = store
        self._templates = templates
        self._handlers = handlers
        self._audit = audit
        self._audit_factory = audit_factory

    def plan(self, request: ImportRequest) -> dict[str, Any]:
        """Return what importing `request` would do; nothing is changed."""
        return self._decide(request, strict=False).plan.to_dict()

    async def async_run(self, request: ImportRequest) -> dict[str, Any]:
        """Import `request`; an entry that fails is reported and the others still go in."""
        decisions = self._decide(request, strict=True)
        plan, handler = decisions.plan, self._handlers[request.category]
        plan.update = 0
        failures = await handler.async_create_many(decisions.create, f"import {request.file_name}")
        for name, error in failures:
            plan.problem(name, error)
        plan.create = len(decisions.create) - len(failures)
        for existing, data in decisions.update:
            try:
                await handler.async_update(existing, data)
            except TdcError as error:
                plan.problem(existing.name, error)
            else:
                plan.update += 1
        counts = {"created": plan.create, "updated": plan.update, "failed": len(plan.problems)}
        self._audit.record(
            self._audit_factory.transfer_done(
                request.category, request.mode, counts, request.file_name
            )
        )
        return plan.to_dict()

    async def async_purge(self, request: ImportRequest) -> dict[str, Any]:
        """Remove all generated items of the category, the first step of a replace."""
        handler = self._handlers[request.category]
        error = handler.purge_problem(request.replacing)
        if error is not None:
            raise error
        deleted = await handler.async_purge()
        self._audit.record(
            self._audit_factory.transfer_done(
                request.category, MODE_REPLACE, {"deleted": deleted}, request.file_name
            )
        )
        return {"category": request.category, "mode": MODE_REPLACE, "delete": deleted}

    def _decide(self, request: ImportRequest, *, strict: bool) -> _Decisions:
        """Sort the entries of `request` into create, update, skip and problems."""
        handler = self._handlers[request.category]
        plan = CategoryPlan(request.category, request.mode)
        decisions = _Decisions(plan)
        refs = References(self._store, self._templates, request.known, strict=strict)
        existing = {} if request.mode == MODE_REPLACE else handler.existing()
        if request.mode == MODE_REPLACE and request.first:
            plan.delete = handler.count()
            blocked = handler.purge_problem(request.replacing)
            if blocked is not None:
                plan.problem("", blocked)
        seen: set[str] = set()
        room = None if request.mode == MODE_REPLACE else handler.capacity()
        for item in request.items:
            name = str(item.get(handler.key_field, ""))
            try:
                self._decide_one(handler, item, refs, existing, seen, decisions)
            except TdcError as error:
                plan.problem(name, error)
                if error.code is ErrorCode.GEN_TRANSFER_CONFLICT:
                    plan.conflict += 1
                else:
                    plan.skip += 1
        if room is not None and plan.create > room:
            plan.problem("", GenerationError(handler.limit_code or ErrorCode.GEN_LIMIT))
        return decisions

    def _decide_one(
        self,
        handler: CategoryHandler,
        item: dict[str, Any],
        refs: References,
        existing: dict[str, list[Any]],
        seen: set[str],
        decisions: _Decisions,
    ) -> None:
        """Decide one entry; raise the TdcError that keeps it out."""
        plan, name = decisions.plan, handler.name_of(item)
        if name in seen:
            raise GenerationError(ErrorCode.GEN_TRANSFER_DUPLICATE, name=name)
        seen.add(name)
        data = handler.prepare(item, refs)
        found = existing.get(name, [])
        if not found:
            decisions.create.append(data)
            plan.create += 1
        elif plan.mode == MODE_ADD:
            plan.skip += 1
        elif plan.mode == MODE_SYNC:
            if len(found) > 1 or handler.conflict(found[0], data):
                raise GenerationError(ErrorCode.GEN_TRANSFER_CONFLICT, name=name)
            if handler.unchanged(found[0], data):
                plan.skip += 1
            else:
                decisions.update.append((found[0], data))
                plan.update += 1
