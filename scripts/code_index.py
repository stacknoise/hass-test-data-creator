"""Generate docs/code-index.md and docs/error-codes.md from the sources (concept 13.3, 13.5).

Usage:
    python scripts/code_index.py          # regenerate both files
    python scripts/code_index.py --check  # fail if a file is outdated or a docstring is missing

Reads the integration with Python's `ast` module only, so it runs without Home Assistant.
Run it with Python 3.14, the version CI uses: `ast.unparse` differs between versions.
"""

from __future__ import annotations

import argparse
import ast
from dataclasses import dataclass
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent
PACKAGE = ROOT / "custom_components" / "hass_test_data_creator"
ERRORS_FILE = PACKAGE / "core" / "errors.py"
TRANSLATIONS = {
    "en": PACKAGE / "translations" / "en.json",
    "de": PACKAGE / "translations" / "de.json",
}
CODE_INDEX = ROOT / "docs" / "code-index.md"
ERROR_CODES = ROOT / "docs" / "error-codes.md"

TOPIC_ORDER = (
    "(root)",
    "core",
    "model",
    "store",
    "engine",
    "templates",
    "devices",
    "areas",
    "outputs",
    "platforms",
    "scheduler",
    "removal",
    "audit",
    "api",
)

CODE_INDEX_HEADER = """# Code index – HASS Test Data Creator

> GENERATED FILE – do not edit by hand. Regenerate with `python scripts/code_index.py` (concept 13.5).

Lists every module, class and function of the integration with signature, file and a one-line summary, grouped by topic. Read it before writing code to reuse existing functions instead of duplicating them.
"""

ERROR_CODES_HEADER = """# Error codes – HASS Test Data Creator

> GENERATED FILE – do not edit by hand. Regenerated from `core/errors.py` and `translations/en.json` with `python scripts/code_index.py` (concept 13.3, 13.5).

Every error of the integration carries one of these codes (format `TDC-<AREA>-<NNN>`). The panel shows the code with the message.

| Code | Message (en) | Technical description |
| --- | --- | --- |
"""


@dataclass(frozen=True)
class Symbol:
    """One row of the code index."""

    topic: str
    name: str
    signature: str
    file: str
    summary: str


def _summary(node: ast.AST) -> str | None:
    """Return the first line of a node's docstring, or None if it has none."""
    doc = ast.get_docstring(node)  # type: ignore[arg-type]
    if not doc or not doc.strip():
        return None
    return doc.strip().splitlines()[0].strip()


def _topic(path: Path) -> str:
    """Return the topic of a source file: its subpackage, or `(root)` for top-level files."""
    parts = path.relative_to(PACKAGE).parts
    return parts[0] if len(parts) > 1 else "(root)"


def _signature(node: ast.ClassDef | ast.FunctionDef | ast.AsyncFunctionDef) -> str:
    """Return a readable signature for a class or function definition."""
    if isinstance(node, ast.ClassDef):
        bases = ", ".join(ast.unparse(base) for base in node.bases)
        return f"class {node.name}({bases})" if bases else f"class {node.name}"
    prefix = "async def" if isinstance(node, ast.AsyncFunctionDef) else "def"
    returns = f" -> {ast.unparse(node.returns)}" if node.returns else ""
    return f"{prefix} {node.name}({ast.unparse(node.args)}){returns}"


def _walk_definitions(
    body: list[ast.stmt], prefix: str
) -> list[tuple[str, ast.ClassDef | ast.FunctionDef | ast.AsyncFunctionDef]]:
    """Return all classes and functions in `body`, nested ones with a qualified name."""
    found: list[tuple[str, ast.ClassDef | ast.FunctionDef | ast.AsyncFunctionDef]] = []
    for node in body:
        if isinstance(node, (ast.ClassDef, ast.FunctionDef, ast.AsyncFunctionDef)):
            name = f"{prefix}{node.name}"
            found.append((name, node))
            found.extend(_walk_definitions(node.body, f"{name}."))
    return found


def collect_symbols(errors: list[str]) -> list[Symbol]:
    """Parse every module of the integration; append missing docstrings to `errors`."""
    symbols: list[Symbol] = []
    for path in sorted(PACKAGE.rglob("*.py")):
        rel = path.relative_to(ROOT).as_posix()
        tree = ast.parse(path.read_text(encoding="utf-8"), filename=rel)
        module = ".".join(path.relative_to(PACKAGE.parent).with_suffix("").parts)
        topic = _topic(path)
        module_summary = _summary(tree)
        if module_summary is None:
            errors.append(f"{rel}: module has no docstring")
        symbols.append(Symbol(topic, module, "module", rel, module_summary or ""))
        for name, node in _walk_definitions(tree.body, ""):
            summary = _summary(node)
            if summary is None:
                errors.append(f"{rel}:{node.lineno}: {name} has no docstring")
            symbols.append(Symbol(topic, name, _signature(node), rel, summary or ""))
    return symbols


def _cell(text: str) -> str:
    """Escape text for a Markdown table cell."""
    return text.replace("|", "\\|").replace("\n", " ")


def render_code_index(symbols: list[Symbol]) -> str:
    """Return the Markdown of docs/code-index.md."""
    topics = sorted(
        {symbol.topic for symbol in symbols},
        key=lambda t: (TOPIC_ORDER.index(t) if t in TOPIC_ORDER else len(TOPIC_ORDER), t),
    )
    lines = [CODE_INDEX_HEADER.rstrip("\n")]
    for topic in topics:
        lines.append(f"\n## {topic}\n")
        lines.append("| Symbol | Signature | File | Description |")
        lines.append("| --- | --- | --- | --- |")
        for symbol in (s for s in symbols if s.topic == topic):
            lines.append(
                f"| `{_cell(symbol.name)}` | `{_cell(symbol.signature)}` "
                f"| `{symbol.file}` | {_cell(symbol.summary)} |"
            )
    return "\n".join(lines) + "\n"


def _error_code_members(tree: ast.Module) -> list[tuple[str, str, str | None]]:
    """Return (name, code, description) of every ErrorCode member in source order."""
    for node in tree.body:
        if isinstance(node, ast.ClassDef) and node.name == "ErrorCode":
            members: list[tuple[str, str, str | None]] = []
            body = node.body
            for index, stmt in enumerate(body):
                if (
                    isinstance(stmt, ast.Assign)
                    and isinstance(stmt.targets[0], ast.Name)
                    and isinstance(stmt.value, ast.Constant)
                    and isinstance(stmt.value.value, str)
                ):
                    following = body[index + 1] if index + 1 < len(body) else None
                    description = None
                    if (
                        isinstance(following, ast.Expr)
                        and isinstance(following.value, ast.Constant)
                        and isinstance(following.value.value, str)
                    ):
                        description = following.value.value.strip()
                    members.append((stmt.targets[0].id, stmt.value.value, description))
            return members
    return []


def _messages(language: str) -> dict[str, dict[str, str]]:
    """Return the `exceptions` section of the translation file of `language`."""
    data = json.loads(TRANSLATIONS[language].read_text(encoding="utf-8"))
    return data.get("exceptions", {})


def render_error_codes(errors: list[str]) -> str:
    """Return the Markdown of docs/error-codes.md; append problems to `errors`."""
    tree = ast.parse(ERRORS_FILE.read_text(encoding="utf-8"))
    texts = {language: _messages(language) for language in TRANSLATIONS}
    lines = [ERROR_CODES_HEADER.rstrip("\n")]
    for name, code, description in _error_code_members(tree):
        for language, messages in texts.items():
            if name.lower() not in messages:
                errors.append(
                    f"{code}: no message for '{name.lower()}' in translations/{language}.json"
                )
        if description is None:
            errors.append(f"{code}: no technical description (docstring) in core/errors.py")
        message = texts["en"].get(name.lower(), {}).get("message", "")
        lines.append(f"| {code} | {_cell(message)} | {_cell(description or '')} |")
    return "\n".join(lines) + "\n"


def _read(path: Path) -> str:
    """Return a file's content with normalized line endings, or '' if it does not exist."""
    return path.read_text(encoding="utf-8").replace("\r\n", "\n") if path.exists() else ""


def main() -> int:
    """Generate or check both files; return the process exit code."""
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--check", action="store_true", help="only check, write nothing")
    args = parser.parse_args()

    errors: list[str] = []
    outputs = {
        CODE_INDEX: render_code_index(collect_symbols(errors)),
        ERROR_CODES: render_error_codes(errors),
    }
    for path, content in outputs.items():
        rel = path.relative_to(ROOT).as_posix()
        if args.check:
            if _read(path) != content:
                errors.append(f"{rel} is outdated; run python scripts/code_index.py")
        else:
            path.write_text(content, encoding="utf-8", newline="\n")
            print(f"wrote {rel}")

    for error in errors:
        print(f"error: {error}", file=sys.stderr)
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
