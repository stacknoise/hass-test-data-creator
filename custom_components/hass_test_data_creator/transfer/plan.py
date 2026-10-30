"""What an import would do or did, per category (concept 16.5)."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from ..core.errors import TdcError


@dataclass
class ImportRequest:
    """One batch of entries of one category with the way to import them."""

    category: str
    mode: str
    items: list[dict[str, Any]]
    known: dict[str, set[str]] = field(default_factory=dict)
    replacing: set[str] = field(default_factory=set)
    first: bool = True
    file_name: str = ""


@dataclass
class CategoryPlan:
    """The counts of one category and the entries that cannot be imported."""

    category: str
    mode: str
    create: int = 0
    update: int = 0
    skip: int = 0
    conflict: int = 0
    delete: int = 0
    problems: list[dict[str, str]] = field(default_factory=list)

    def problem(self, name: str, error: TdcError) -> None:
        """Record that the entry `name` cannot be imported, with the code and text of `error`."""
        self.problems.append({"name": name, "code": error.code.value, "reason": str(error)})

    def to_dict(self) -> dict[str, Any]:
        """Return the plan as the panel shows it."""
        return {
            "category": self.category,
            "mode": self.mode,
            "create": self.create,
            "update": self.update,
            "skip": self.skip,
            "conflict": self.conflict,
            "delete": self.delete,
            "problems": self.problems,
        }
