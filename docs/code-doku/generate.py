"""Generate docs/code-doku/index.html: the browsable code documentation of the repository.

Usage (stdlib only), from the repository root:
    python docs/code-doku/generate.py          # rewrite index.html
    python docs/code-doku/generate.py --check  # fail if index.html is outdated

It reads the Python integration with `ast` and the TypeScript panel with a line scanner (the
panel is formatted by Prettier, so the indentation is reliable). The result is one
self-contained HTML file: an explorer (packages, classes, methods, source code, metrics) and a
dependency map. The page itself is the template `viewer.html` filled with the data as JSON.

Metrics are approximations of a source scanner, not a compiler analysis. The output does not
depend on the date or the Python version, so `--check` is stable.
"""

from __future__ import annotations

import ast
import json
import math
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent.parent.parent
HERE = Path(__file__).resolve().parent
PKG = ROOT / "custom_components" / "hass_test_data_creator"
PANEL = ROOT / "panel-src" / "src"
TESTS = ROOT / "tests"
OUT = HERE / "index.html"
TEMPLATE = HERE / "viewer.html"
PKG_PREFIX = "custom_components.hass_test_data_creator"

# Layers from top (uses everything below) to bottom (uses nothing above).
LAYERS = [
    ("Panel", "Panel (TypeScript)"),
    ("Entry", "Einstiegspunkte"),
    ("Api", "WebSocket-API"),
    ("Topics", "Themenmodule"),
    ("Domain", "Fachteile"),
    ("Foundation", "Fundament"),
]
ENTRY_MODULES = {
    "__init__",
    "bootstrap",
    "data",
    "config_flow",
    "services",
    "panel",
    "binary_sensor",
    "climate",
    "cover",
    "event",
    "light",
    "sensor",
    "switch",
}
START_ID = "core.errors|TdcError"


class Item:
    """One type (class, interface, module) of the documentation."""

    def __init__(self, module: "Mod", name: str, kind: str, start: int, end: int) -> None:
        """Create the item with its line range (1-based, inclusive)."""
        self.module = module
        self.name = name
        self.kind = kind
        self.start = start
        self.end = end
        self.doc = ""
        self.bases: list[str] = []
        self.meths: list[dict] = []
        self.refs: set[str] = set()
        self.loc_extra = 0

    @property
    def id(self) -> str:
        """Return the unique id `module|name`."""
        return f"{self.module.name}|{self.name}"


class Mod:
    """One source file with its items and import table."""

    def __init__(self, name: str, path: Path, lang: str) -> None:
        """Read the file and prepare empty tables."""
        self.name = name
        self.path = path
        self.lang = lang
        self.rel = path.relative_to(ROOT).as_posix()
        self.src = path.read_text(encoding="utf-8")
        self.lines = self.src.split("\n")
        self.items: list[Item] = []
        self.local: dict[str, str] = {}
        self.imports: dict[str, tuple[str, str]] = {}
        self.ns = ""
        self.layer = ""
        self.pseudo: Item | None = None


def code_lines(lines: list[str], start: int, end: int, lang: str) -> int:
    """Count the lines of a range that are neither blank nor comment-only."""
    count = 0
    mark = "#" if lang == "py" else "//"
    for text in lines[start - 1 : end]:
        stripped = text.strip()
        if stripped and not stripped.startswith(mark):
            count += 1
    return count


def maintainability(loc: int, cc: int) -> int:
    """Return the maintainability index (0-100) for a size and complexity."""
    value = (
        171 - 5.2 * math.log(max(1, loc * 8)) - 0.23 * cc - 16.2 * math.log(max(1, loc))
    ) * 100 / 171
    return int(math.floor(max(0.0, value) + 0.5))


def first_sentence(text: str | None) -> str:
    """Return the first non-empty line of a doc text."""
    for line in (text or "").strip().split("\n"):
        if line.strip():
            return line.strip()
    return ""


# ---------------------------------------------------------------- Python


def py_layer(name: str) -> str:
    """Return the layer id of a Python module name."""
    top = name.split(".")[0]
    if top in ENTRY_MODULES:
        return "Entry"
    if top == "api":
        return "Api"
    if top in ("engine", "faults", "audit"):
        return "Domain"
    if top in ("core", "model", "store", "const"):
        return "Foundation"
    return "Topics"


def py_cc(node: ast.AST) -> int:
    """Return the cyclomatic complexity of a function or class body."""
    total = 1
    for sub in ast.walk(node):
        if isinstance(sub, ast.If | ast.For | ast.AsyncFor | ast.While | ast.IfExp):
            total += 1
        elif isinstance(sub, ast.ExceptHandler | ast.match_case):
            total += 1
        elif isinstance(sub, ast.BoolOp):
            total += len(sub.values) - 1
        elif isinstance(sub, ast.comprehension):
            total += 1 + len(sub.ifs)
    return total


def py_signature(mod: Mod, node: ast.FunctionDef | ast.AsyncFunctionDef) -> str:
    """Return the one-line signature of a function from its source text."""
    first = node.body[0].lineno if node.body else node.lineno + 1
    last = max(node.lineno, first - 1)
    text = " ".join(part.strip() for part in mod.lines[node.lineno - 1 : last])
    return text.split(":  #")[0].rstrip().removesuffix(":").strip()


def py_refs(mod: Mod, nodes: list[ast.AST]) -> set[str]:
    """Collect the plain names and `alias.attr` pairs used by some nodes."""
    refs: set[str] = set()
    for root in nodes:
        for sub in ast.walk(root):
            if isinstance(sub, ast.Name):
                refs.add(sub.id)
            elif isinstance(sub, ast.Attribute) and isinstance(sub.value, ast.Name):
                refs.add(f"{sub.value.id}.{sub.attr}")
    return refs


def py_resolve_from(mod: Mod, node: ast.ImportFrom, modules: dict[str, Mod]) -> str | None:
    """Return the module name that an `ImportFrom` points to, or None for foreign modules."""
    if node.level:
        base = mod.name.split(".") if mod.path.name == "__init__.py" else mod.name.split(".")[:-1]
        if mod.name == "__init__":
            base = []
        base = base[: max(0, len(base) - (node.level - 1))]
        return ".".join([*base, *([node.module] if node.module else [])])
    module = node.module or ""
    if module == PKG_PREFIX or module.startswith(PKG_PREFIX + "."):
        return module.removeprefix(PKG_PREFIX).lstrip(".")
    return None


def py_collect(path: Path) -> Mod:
    """Parse one Python file into a module with its items."""
    rel = path.relative_to(PKG).with_suffix("")
    parts = list(rel.parts)
    if parts[-1] == "__init__" and len(parts) > 1:
        parts = parts[:-1]
    mod = Mod(".".join(parts), path, "py")
    mod.layer = py_layer(mod.name)
    mod.ns = rel.parts[0] if len(rel.parts) > 1 else ("(root)" if mod.layer == "Entry" else rel.stem)
    tree = ast.parse(mod.src)
    pseudo_name = f"{path.stem}.py"
    funcs: list[ast.FunctionDef | ast.AsyncFunctionDef] = []
    consts = 0
    for node in tree.body:
        if isinstance(node, ast.ClassDef):
            item = Item(mod, node.name, "class", node.lineno, node.end_lineno or node.lineno)
            item.doc = first_sentence(ast.get_docstring(node))
            item.bases = [ast.get_source_segment(mod.src, base) or "" for base in node.bases]
            item.refs = py_refs(mod, [node])
            for sub in node.body:
                if isinstance(sub, ast.FunctionDef | ast.AsyncFunctionDef):
                    item.meths.append(py_method(mod, sub, public_default=True))
            mod.items.append(item)
            mod.local[node.name] = item.id
        elif isinstance(node, ast.FunctionDef | ast.AsyncFunctionDef):
            funcs.append(node)
        elif isinstance(node, ast.Assign | ast.AnnAssign):
            consts += code_lines(mod.lines, node.lineno, node.end_lineno or node.lineno, "py")
            targets = node.targets if isinstance(node, ast.Assign) else [node.target]
            for target in targets:
                if isinstance(target, ast.Name) and target.id != "__all__":
                    mod.local.setdefault(target.id, f"{mod.name}|{pseudo_name}")
    if funcs or consts:
        item = Item(mod, pseudo_name, "module", 1, len(mod.lines))
        item.doc = first_sentence(ast.get_docstring(tree))
        item.meths = [py_method(mod, fn, public_default=True) for fn in funcs]
        item.refs = py_refs(mod, list(funcs))
        item.loc_extra = consts
        mod.items.append(item)
        for fn in funcs:
            mod.local[fn.name] = item.id
        for key, value in list(mod.local.items()):
            if value.endswith(f"|{pseudo_name}"):
                mod.local[key] = item.id
    return mod


def py_method(mod: Mod, node: ast.FunctionDef | ast.AsyncFunctionDef, public_default: bool) -> dict:
    """Return the data row of one function or method."""
    name = node.name
    private = name.startswith("_") and not (name.startswith("__") and name.endswith("__"))
    end = node.end_lineno or node.lineno
    return {
        "n": name,
        "l": node.lineno,
        "e": end,
        "loc": code_lines(mod.lines, node.lineno, end, "py"),
        "cc": py_cc(node),
        "sig": py_signature(mod, node),
        "doc": first_sentence(ast.get_docstring(node)),
        "vis": "private" if private else "public",
    }


def py_imports(mod: Mod, modules: dict[str, Mod]) -> None:
    """Fill the import table of a Python module (alias to module or to a symbol)."""
    tree = ast.parse(mod.src)
    for node in ast.walk(tree):
        if isinstance(node, ast.ImportFrom):
            target = py_resolve_from(mod, node, modules)
            if target is None:
                continue
            for alias in node.names:
                local = alias.asname or alias.name
                sub = f"{target}.{alias.name}" if target else alias.name
                if sub in modules:
                    mod.imports[local] = ("mod", sub)
                else:
                    mod.imports[local] = ("sym", f"{target}\0{alias.name}")
        elif isinstance(node, ast.Import):
            for alias in node.names:
                if alias.name.startswith(PKG_PREFIX + "."):
                    name = alias.name.removeprefix(PKG_PREFIX + ".")
                    if name in modules and alias.asname:
                        mod.imports[alias.asname] = ("mod", name)


def py_lookup(modules: dict[str, Mod], module: str, name: str, depth: int = 0) -> str | None:
    """Return the item id of a symbol of a module, following re-exports."""
    target = modules.get(module)
    if target is None or depth > 4:
        return None
    if name in target.local:
        return target.local[name]
    entry = target.imports.get(name)
    if entry and entry[0] == "sym":
        inner, symbol = entry[1].split("\0")
        return py_lookup(modules, inner, symbol, depth + 1)
    return None


def py_deps(mod: Mod, item: Item, modules: dict[str, Mod]) -> set[str]:
    """Resolve the names an item uses to the ids of other items."""
    found: set[str] = set()
    for ref in item.refs:
        target: str | None = None
        if "." in ref:
            alias, attr = ref.split(".", 1)
            entry = mod.imports.get(alias)
            if entry and entry[0] == "mod":
                target = py_lookup(modules, entry[1], attr)
        else:
            if ref in mod.local:
                target = mod.local[ref]
            else:
                entry = mod.imports.get(ref)
                if entry and entry[0] == "sym":
                    inner, symbol = entry[1].split("\0")
                    target = py_lookup(modules, inner, symbol)
        if target and target != item.id:
            found.add(target)
    return found


# ------------------------------------------------------------ TypeScript

TS_DECL = re.compile(
    r"^(?:export\s+)?(?:default\s+)?(?:declare\s+)?(?:abstract\s+)?"
    r"(?P<kw>class|interface|enum|type|function|const|let)\s+(?:\*\s*)?(?P<name>[A-Za-z_$][\w$]*)"
)
TS_METHOD = re.compile(
    r"^  (?:(?:public|private|protected|static|async|override|readonly|get|set|abstract)\s+)*"
    r"(?P<name>#?[A-Za-z_$][\w$]*)\s*(?:<[^>(]*>)?\s*(?P<rest>\(|(?::[^=]+)?=\s*(?:async\s*)?\()"
)
TS_IMPORT = re.compile(
    r"import\s+(?:type\s+)?(?:(?P<default>[A-Za-z_$][\w$]*)\s*,?\s*)?(?:\{(?P<names>[^}]*)\})?"
    r"\s*from\s*[\"'](?P<src>[^\"']+)[\"']"
)
TS_CC = re.compile(r"\bif\b|\bfor\b|\bwhile\b|\bcase\b|\bcatch\b|&&|\|\||\?\?|\?\.|\?:|\?")
TS_WORD = re.compile(r"[A-Za-z_$][\w$]*")
TS_STRING = re.compile(r"\"[^\"\n]*\"|'[^'\n]*'|//[^\n]*")


def ts_doc_above(lines: list[str], start: int) -> str:
    """Return the first line of the comment right above a declaration (1-based start)."""
    idx = start - 2
    while idx >= 0 and lines[idx].lstrip().startswith("@"):
        idx -= 1
    if idx < 0:
        return ""
    text = lines[idx].strip()
    if text.startswith("//"):
        return text.lstrip("/ ").strip()
    if not text.endswith("*/"):
        return ""
    if text.startswith("/**"):
        return text.removeprefix("/**").removesuffix("*/").strip()
    while idx >= 0 and not lines[idx].strip().startswith("/**"):
        idx -= 1
    for line in lines[idx + 1 :]:
        body = line.strip().lstrip("*").strip()
        if body and not body.startswith("/"):
            return body
    return ""


def ts_cc(lines: list[str], start: int, end: int) -> int:
    """Return the approximate complexity of a TypeScript range."""
    text = "\n".join(lines[start - 1 : end])
    return 1 + sum(1 for token in TS_CC.findall(TS_STRING.sub("", text)) if token not in ("?.", "?:"))


def ts_items(mod: Mod) -> None:
    """Find the top-level declarations of a TypeScript file."""
    lines = mod.lines
    count = len(lines)
    item_start: list[tuple[int, int, re.Match[str]]] = []
    in_comment = False
    decorator = 0
    stops: list[int] = []
    for number, text in enumerate(lines, 1):
        if in_comment:
            if "*/" in text:
                in_comment = False
            continue
        if not text or text[0] in " \t":
            continue
        if text[0] in "})];>`":
            continue
        if text.startswith("/*") and "*/" not in text:
            in_comment = True
        stops.append(number)
        if text.startswith("@"):
            decorator = decorator or number
            continue
        match = TS_DECL.match(text)
        if match and not text.startswith(("export {", "export *")):
            start = decorator if decorator and decorator == number - 1 else number
            item_start.append((start, number, match))
        decorator = 0
    bounds = sorted(set(stops))
    for start, line_no, match in item_start:
        later = [b for b in bounds if b > line_no]
        end = (later[0] - 1) if later else count
        while end > start and not lines[end - 1].strip():
            end -= 1
        kw = match.group("kw")
        name = match.group("name")
        if kw in ("class", "interface", "enum", "type"):
            kind = {"class": "class", "interface": "interface", "enum": "enum", "type": "record"}[kw]
            item = Item(mod, name, kind, start, end)
            item.doc = ts_doc_above(lines, start)
            head = lines[line_no - 1]
            for found in re.finditer(r"(?:extends|implements)\s+([\w$.,<>\s]+?)(?:\s*\{|\s+implements|$)", head):
                item.bases += [part.strip().split("<")[0] for part in found.group(1).split(",") if part.strip()]
            if kw == "class":
                ts_methods(mod, item, line_no)
            mod.items.append(item)
            mod.local[name] = item.id
        else:
            ts_member(mod, name, kw, start, end, line_no)
    if mod.pseudo is not None:
        mod.items.append(mod.pseudo)


def ts_member(mod: Mod, name: str, kw: str, start: int, end: int, line_no: int) -> None:
    """Add a top-level function or constant to the module item of a TypeScript file."""
    pseudo = mod.pseudo
    if pseudo is None:
        pseudo = mod.pseudo = Item(mod, Path(mod.rel).name, "module", 1, len(mod.lines))
    mod.local[name] = pseudo.id
    head = mod.lines[line_no - 1]
    is_function = kw == "function" or "=>" in head or bool(re.search(r"=\s*(?:async\s*)?\(", head))
    if is_function:
        sig_lines = []
        for idx in range(line_no - 1, end):
            sig_lines.append(mod.lines[idx].strip())
            if mod.lines[idx].rstrip().endswith(("{", ";", "=>")):
                break
        signature = " ".join(sig_lines).rstrip("{").rstrip().removesuffix("=>").rstrip()
        pseudo.meths.append(
            {
                "n": name,
                "l": start,
                "e": end,
                "loc": code_lines(mod.lines, start, end, "ts"),
                "cc": ts_cc(mod.lines, start, end),
                "sig": signature,
                "doc": ts_doc_above(mod.lines, start),
                "vis": "public",
            }
        )
    else:
        pseudo.loc_extra += code_lines(mod.lines, start, end, "ts")
    pseudo.refs |= set(TS_WORD.findall(TS_STRING.sub("", "\n".join(mod.lines[start - 1 : end]))))


def ts_methods(mod: Mod, item: Item, line_no: int) -> None:
    """Find the methods of a class: lines with two spaces of indentation."""
    lines = mod.lines
    idx = line_no
    while idx < item.end:
        text = lines[idx]
        match = TS_METHOD.match(text)
        idx += 1
        if not match or match.group("name") in ("if", "for", "while", "switch", "return", "catch"):
            continue
        start = idx
        end = start
        stripped = text.strip()
        balanced = text.count("{") == text.count("}") and text.count("(") == text.count(")")
        if not (balanced and stripped.endswith((";", "}", "};"))):
            end = start
            for probe in range(start, item.end):
                if lines[probe].startswith("  }"):
                    end = probe + 1
                    break
        sig = []
        for probe in range(start - 1, end):
            sig.append(lines[probe].strip())
            if lines[probe].rstrip().endswith(("{", ";", "=>")):
                break
        name = match.group("name")
        private = name.startswith("#") or bool(re.match(r"\s*(?:static\s+)?private\b", text))
        item.meths.append(
            {
                "n": name,
                "l": start,
                "e": end,
                "loc": code_lines(lines, start, end, "ts"),
                "cc": ts_cc(lines, start, end),
                "sig": " ".join(sig).rstrip("{").rstrip().removesuffix("=>").rstrip(),
                "doc": ts_doc_above(lines, start),
                "vis": "private" if private else "public",
            }
        )
        idx = max(idx, end)


def ts_imports(mod: Mod, modules: dict[str, Mod]) -> None:
    """Fill the import table of a TypeScript file from its relative imports."""
    folder = Path(mod.name).parent
    for match in TS_IMPORT.finditer(mod.src):
        source = match.group("src")
        if not source.startswith("."):
            continue
        base = (folder / source).as_posix()
        base = str(Path(base)).replace("\\", "/")
        norm = re.sub(r"\.js$", "", base)
        parts: list[str] = []
        for part in norm.split("/"):
            if part == "..":
                if parts:
                    parts.pop()
            elif part != ".":
                parts.append(part)
        target = "/".join(parts)
        found = next((c for c in (target, target + "/index") if c in modules), None)
        if not found:
            continue
        for raw in (match.group("names") or "").split(","):
            raw = raw.strip().removeprefix("type ").strip()
            if not raw:
                continue
            original, _, alias = raw.partition(" as ")
            mod.imports[(alias or original).strip()] = ("sym", f"{found}\0{original.strip()}")


def ts_deps(mod: Mod, item: Item, modules: dict[str, Mod]) -> set[str]:
    """Resolve the identifiers of a TypeScript item to the ids of other items."""
    if item.kind != "module":
        text = "\n".join(mod.lines[item.start - 1 : item.end])
        item.refs = set(TS_WORD.findall(TS_STRING.sub("", text)))
    found: set[str] = set()
    for word in item.refs:
        target = mod.local.get(word)
        if target is None:
            entry = mod.imports.get(word)
            if entry:
                inner, symbol = entry[1].split("\0")
                other = modules.get(inner)
                target = other.local.get(symbol) if other else None
        if target and target != item.id:
            found.add(target)
    return found


# --------------------------------------------------------------- Output


def build() -> tuple[dict, dict]:
    """Scan the repository and return the documentation data and the source file map."""
    modules: dict[str, Mod] = {}
    for path in sorted(PKG.rglob("*.py")):
        if "frontend" in path.relative_to(PKG).parts:
            continue
        mod = py_collect(path)
        modules[mod.name] = mod
    for mod in modules.values():
        py_imports(mod, modules)
    ts_modules: dict[str, Mod] = {}
    for path in sorted(PANEL.rglob("*.ts")):
        if path.name.endswith((".test.ts", ".d.ts")):
            continue
        name = path.relative_to(PANEL).with_suffix("").as_posix()
        mod = Mod(name, path, "ts")
        folder = Path(name).parent.as_posix()
        mod.ns = "panel" if folder == "." else f"panel/{folder}"
        mod.layer = "Panel"
        ts_items(mod)
        ts_modules[name] = mod
    for mod in ts_modules.values():
        ts_imports(mod, ts_modules)
    tests = " ".join(p.read_text(encoding="utf-8") for p in sorted(TESTS.rglob("*.py")))
    tests += " ".join(p.read_text(encoding="utf-8") for p in sorted(PANEL.rglob("*.test.ts")))
    words = set(re.findall(r"[A-Za-z_]\w*", tests))
    types: list[dict] = []
    files: dict[str, str] = {}
    allmods = [*modules.values(), *ts_modules.values()]
    for mod in allmods:
        files[mod.rel] = mod.src
        for item in mod.items:
            if mod.lang == "py":
                deps = py_deps(mod, item, modules)
            else:
                deps = ts_deps(mod, item, ts_modules)
            sizes = sum(m["loc"] for m in item.meths)
            if item.kind == "module":
                loc = sizes + item.loc_extra
            else:
                loc = code_lines(mod.lines, item.start, item.end, mod.lang)
            cc = sum(m["cc"] for m in item.meths) or 1
            stem = Path(mod.rel).stem
            tested = (stem if item.kind == "module" else item.name) in words
            types.append(
                {
                    "id": item.id,
                    "name": item.name,
                    "project": mod.layer,
                    "ns": mod.ns,
                    "kind": item.kind,
                    "file": mod.rel,
                    "loc": loc,
                    "cc": cc,
                    "mi": maintainability(loc, cc),
                    "deps": sorted(deps),
                    "bases": item.bases,
                    "tested": tested,
                    "l": item.start,
                    "e": item.end,
                    "dl": item.start,
                    "doc": item.doc,
                    "meths": sorted(item.meths, key=lambda m: m["l"]),
                }
            )
    order = {layer: index for index, (layer, _) in enumerate(LAYERS)}
    types.sort(key=lambda t: (order[t["project"]], t["ns"], t["file"], t["l"]))
    known = {t["id"] for t in types}
    users: dict[str, int] = {}
    for entry in types:
        entry["deps"] = [d for d in entry["deps"] if d in known]
        for dep in entry["deps"]:
            users[dep] = users.get(dep, 0) + 1
    for entry in types:
        ce = len(entry["deps"])
        ca = users.get(entry["id"], 0)
        entry["ce"] = ce
        entry["ca"] = ca
        entry["instab"] = round(ce / (ce + ca), 2) if ce + ca else 0.0
    manifest = json.loads((PKG / "manifest.json").read_text(encoding="utf-8"))
    data = {
        "types": types,
        "layers": [{"id": key, "label": label} for key, label in LAYERS],
        "version": manifest.get("version", ""),
        "start": START_ID if START_ID in known else types[0]["id"],
    }
    return data, dict(sorted(files.items()))


def dump(value: object) -> str:
    """Return JSON that is safe inside a script element."""
    text = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    return text.replace("<", "\\u003c").replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")


def render() -> str:
    """Return the finished HTML page."""
    data, files = build()
    page = TEMPLATE.read_text(encoding="utf-8")
    return page.replace("/*DATA*/", dump(data)).replace("/*FILES*/", dump(files))


def main() -> int:
    """Write index.html, or with `--check` compare it with the sources."""
    page = render()
    if "--check" in sys.argv:
        current = OUT.read_text(encoding="utf-8") if OUT.exists() else ""
        if current != page:
            print("docs/code-doku/index.html is outdated: run python docs/code-doku/generate.py")
            return 1
        print("docs/code-doku/index.html is up to date")
        return 0
    OUT.write_text(page, encoding="utf-8", newline="\n")
    print(f"wrote {OUT.relative_to(ROOT)} ({len(page) // 1024} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
