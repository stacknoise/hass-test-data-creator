"""Build docs/review/dependencies.html: a clickable dependency map of the integration and the panel.

Usage (Python 3.14, stdlib only):
    python docs/review/build_dependencies.py            # write the file
    python docs/review/build_dependencies.py --check    # CI: fail if the file is out of date

The map is derived with `ast` (Python) and regular expressions (TypeScript). Calls are resolved by
name through the imports of each module, so the caller/callee and "used by" lists are a static
approximation: dynamic dispatch, callbacks and attribute calls on objects of unknown type are
resolved only when the method name is unique among the classes a module can see.
"""

from __future__ import annotations

import ast
from collections import defaultdict
from dataclasses import dataclass, field
import html
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent.parent.parent
PKG = ROOT / "custom_components" / "hass_test_data_creator"
PANEL = ROOT / "panel-src" / "src"
OUT = Path(__file__).resolve().parent / "dependencies.html"
PKG_NAME = "hass_test_data_creator"

# Method names that mostly belong to builtins; never resolved by name alone.
COMMON = {
    "get",
    "pop",
    "add",
    "append",
    "items",
    "values",
    "keys",
    "update",
    "remove",
    "join",
    "split",
    "format",
    "copy",
    "clear",
    "discard",
    "index",
    "count",
    "startswith",
    "endswith",
    "replace",
    "strip",
    "lower",
    "upper",
    "setdefault",
    "extend",
    "sort",
    "create",
    "run",
    "start",
    "stop",
    "load",
    "all",
    "of",
    "check",
    "now",
    "at",
    "write",
    "save",
    "close",
    "plan",
    "forget",
}

LAYERS = [
    ("Entry points and composition root", "(root) modules: bootstrap, data, services"),
    ("WebSocket API", "api"),
    (
        "Topic modules",
        "devices scheduler scenarios groups history removal areas templates platforms outputs",
    ),
    ("Domain parts", "engine faults audit"),
    ("Foundation", "core model store const"),
]


def layer_of(module: str) -> int:
    """Return the layer index of a module (see LAYERS)."""
    top = module.split(".")[0]
    if top in (
        "(root)",
        "bootstrap",
        "data",
        "__init__",
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
    ):
        return 0
    if top == "const":
        return 4
    if top == "api":
        return 1
    if top in ("engine", "faults", "audit"):
        return 3
    if top in ("core", "model", "store"):
        return 4
    return 2


def topic_of(module: str) -> str:
    """Return the topic (first package) of a module name, or `(root)` for top-level modules."""
    first = module.split(".")[0]
    return first if (PKG / first).is_dir() else "(root)"


def esc(text: object) -> str:
    """HTML-escape any value."""
    return html.escape(str(text), quote=True)


def anchor(kind: str, key: str) -> str:
    """Return an element id from a kind prefix and a key."""
    return kind + "-" + re.sub(r"[^A-Za-z0-9_.:-]", "_", key)


# ----------------------------------------------------------------------------- data classes
@dataclass
class Func:
    """One function or method."""

    module: str
    qual: str
    cls: str | None
    line: int
    end: int
    sig: str
    doc: str
    cc: int
    node: ast.AST = field(repr=False)
    callees: set[str] = field(default_factory=set)
    approx_callees: set[str] = field(default_factory=set)
    callers: set[str] = field(default_factory=set)
    ref_by: set[str] = field(default_factory=set)  # used as a value (callback, table entry)
    via: set[str] = field(default_factory=set)  # base/protocol methods this one implements
    note: str = ""  # why nothing in the package calls it
    used: bool = False  # called, referenced, reached through a base, or hooked by a framework
    test_only: bool = False

    @property
    def id(self) -> str:
        """Unique id `module:qual`."""
        return f"{self.module}:{self.qual}"


@dataclass
class Klass:
    """One class."""

    module: str
    name: str
    line: int
    bases: list[str]
    doc: str
    methods: list[str] = field(default_factory=list)
    created_in: set[str] = field(default_factory=set)
    referenced_in: set[str] = field(default_factory=set)
    note: str = ""  # why no code creates or references it

    @property
    def id(self) -> str:
        """Unique id `module:Name`."""
        return f"{self.module}:{self.name}"


@dataclass
class Module:
    """One module."""

    name: str
    path: Path
    doc: str
    lines: int
    code: int
    imports: set[str] = field(default_factory=set)
    lazy_imports: set[str] = field(default_factory=set)
    used_by: set[str] = field(default_factory=set)
    classes: list[Klass] = field(default_factory=list)
    funcs: list[Func] = field(default_factory=list)
    names: dict[str, tuple[str, str]] = field(
        default_factory=dict
    )  # local name -> (module, symbol)
    mod_alias: dict[str, str] = field(default_factory=dict)  # local name -> module
    note: str = ""  # why no module imports it


# ----------------------------------------------------------------------------- Python analysis
def module_name(path: Path) -> str:
    """Return the dotted module name relative to the package."""
    parts = list(path.relative_to(PKG).with_suffix("").parts)
    if parts[-1] == "__init__":
        parts = parts[:-1]
    return ".".join(parts) or "(root)"


def cc_of(func: ast.AST) -> int:
    """Return the cyclomatic complexity of a function (nested definitions excluded)."""
    value = 1

    def visit(node: ast.AST) -> None:
        nonlocal value
        for child in ast.iter_child_nodes(node):
            if isinstance(
                child, ast.FunctionDef | ast.AsyncFunctionDef | ast.Lambda | ast.ClassDef
            ):
                continue
            if isinstance(
                child, ast.If | ast.IfExp | ast.For | ast.AsyncFor | ast.While | ast.ExceptHandler
            ):
                value += 1
            elif isinstance(child, ast.BoolOp):
                value += len(child.values) - 1
            elif isinstance(child, ast.comprehension):
                value += 1 + len(child.ifs)
            visit(child)

    visit(func)
    return value


def first_line(doc: str | None) -> str:
    """Return the first line of a docstring."""
    return (doc or "").strip().splitlines()[0] if doc and doc.strip() else ""


def collect_module(path: Path, known: set[str]) -> Module:
    """Parse one file into a Module with its classes, functions and import tables."""
    text = path.read_text(encoding="utf-8")
    tree = ast.parse(text)
    name = module_name(path)
    lines = text.splitlines()
    mod = Module(
        name,
        path,
        first_line(ast.get_docstring(tree)),
        len(lines),
        sum(1 for x in lines if x.strip() and not x.strip().startswith("#")),
    )
    parts = [] if name == "(root)" else name.split(".")
    base = parts if path.name == "__init__.py" else parts[:-1]

    def resolve(level: int, module: str | None) -> str:
        anchor_parts = base[: len(base) - (level - 1)] if level > 1 else list(base)
        return ".".join(anchor_parts + (module.split(".") if module else [])) or "(root)"

    top_level = set(id(n) for n in ast.walk(tree) if False)
    function_nodes = [
        n for n in ast.walk(tree) if isinstance(n, ast.FunctionDef | ast.AsyncFunctionDef)
    ]
    inside_function: set[int] = set()
    for fn in function_nodes:
        for sub in ast.walk(fn):
            inside_function.add(id(sub))
    del top_level
    for node in ast.walk(tree):
        if not isinstance(node, ast.ImportFrom) or not node.level:
            continue
        target = resolve(node.level, node.module)
        lazy = id(node) in inside_function
        bucket = mod.lazy_imports if lazy else mod.imports
        if target in known:
            bucket.add(target)
        for alias in node.names:
            sub = f"{target}.{alias.name}" if target != "(root)" else alias.name
            local = alias.asname or alias.name
            if sub in known:
                bucket.add(sub)
                mod.mod_alias[local] = sub
            else:
                mod.names[local] = (target, alias.name)

    def visit(node: ast.AST, prefix: str, cls: Klass | None) -> None:
        for child in ast.iter_child_nodes(node):
            if isinstance(child, ast.ClassDef):
                k = Klass(
                    name,
                    prefix + child.name,
                    child.lineno,
                    [ast.unparse(b) for b in child.bases],
                    first_line(ast.get_docstring(child)),
                )
                mod.classes.append(k)
                visit(child, prefix + child.name + ".", k)
            elif isinstance(child, ast.FunctionDef | ast.AsyncFunctionDef):
                sig = (
                    "async def " if isinstance(child, ast.AsyncFunctionDef) else "def "
                ) + child.name
                sig += "(" + ast.unparse(child.args) + ")"
                if child.returns:
                    sig += " -> " + ast.unparse(child.returns)
                fn = Func(
                    name,
                    prefix + child.name,
                    cls.name if cls else None,
                    child.lineno,
                    child.end_lineno or child.lineno,
                    sig,
                    first_line(ast.get_docstring(child)),
                    cc_of(child),
                    child,
                )
                mod.funcs.append(fn)
                if cls:
                    cls.methods.append(fn.id)
                visit(child, prefix + child.name + ".", None)
            else:
                visit(child, prefix, cls)

    visit(tree, "", None)
    return mod


def analyse_python() -> dict[str, Module]:
    """Return all modules with resolved cross references."""
    files = sorted(p for p in PKG.rglob("*.py") if "__pycache__" not in p.parts)
    known = {module_name(p) for p in files}
    modules = {module_name(p): collect_module(p, known) for p in files}
    for mod in modules.values():
        for target in mod.imports | mod.lazy_imports:
            if target in modules and target != mod.name:
                modules[target].used_by.add(mod.name)
    classes = {k.id: k for m in modules.values() for k in m.classes}
    funcs = {f.id: f for m in modules.values() for f in m.funcs}
    methods_by_name: dict[str, list[str]] = defaultdict(list)
    for fn in funcs.values():
        if fn.cls:
            methods_by_name[fn.qual.split(".")[-1]].append(fn.id)

    def class_of(mod: Module, local: str) -> str | None:
        """Return the class id behind a local name, if any."""
        if f"{mod.name}:{local}" in classes:
            return f"{mod.name}:{local}"
        if local in mod.names:
            target, symbol = mod.names[local]
            return f"{target}:{symbol}" if f"{target}:{symbol}" in classes else None
        return None

    def func_of(mod: Module, local: str) -> str | None:
        """Return the module-level function id behind a local name, if any."""
        if f"{mod.name}:{local}" in funcs:
            return f"{mod.name}:{local}"
        if local in mod.names:
            target, symbol = mod.names[local]
            return f"{target}:{symbol}" if f"{target}:{symbol}" in funcs else None
        return None

    def mro_method(class_id: str, method: str, seen: set[str] | None = None) -> str | None:
        """Find `method` in a class or its (resolvable) bases."""
        seen = seen or set()
        if class_id in seen or class_id not in classes:
            return None
        seen.add(class_id)
        found = f"{class_id}.{method}".replace(":", ":", 1)
        k = classes[class_id]
        candidate = f"{k.module}:{k.name}.{method}"
        if candidate in funcs:
            return candidate
        owner = modules[k.module]
        for base in k.bases:
            base_id = class_of(
                owner, base.split(".")[0] if "." not in base else base.split(".")[-1]
            )
            if base_id:
                hit = mro_method(base_id, method, seen)
                if hit:
                    return hit
        del found
        return None

    for mod in modules.values():
        visible = {k.id for k in mod.classes}
        for local in mod.names:
            cid = class_of(mod, local)
            if cid:
                visible.add(cid)
        for fn in mod.funcs:
            own_class = f"{mod.name}:{fn.cls}" if fn.cls else None
            stack = list(ast.iter_child_nodes(fn.node))
            while stack:
                node = stack.pop()
                if isinstance(node, ast.FunctionDef | ast.AsyncFunctionDef | ast.ClassDef):
                    continue
                stack.extend(ast.iter_child_nodes(node))
                if isinstance(node, ast.Name) and isinstance(node.ctx, ast.Load):
                    cid = class_of(mod, node.id)
                    if cid:
                        classes[cid].referenced_in.add(fn.id)
                if not isinstance(node, ast.Call):
                    continue
                target = node.func
                if isinstance(target, ast.Name):
                    cid = class_of(mod, target.id)
                    if cid:
                        classes[cid].created_in.add(fn.id)
                        init = mro_method(cid, "__init__")
                        if init:
                            fn.callees.add(init)
                        continue
                    fid = func_of(mod, target.id)
                    if fid:
                        fn.callees.add(fid)
                elif isinstance(target, ast.Attribute):
                    method = target.attr
                    value = target.value
                    if isinstance(value, ast.Name) and value.id in ("self", "cls") and own_class:
                        hit = mro_method(own_class, method)
                        if hit:
                            fn.callees.add(hit)
                            continue
                    if isinstance(value, ast.Name):
                        if value.id in mod.mod_alias:
                            fid = f"{mod.mod_alias[value.id]}:{method}"
                            if fid in funcs:
                                fn.callees.add(fid)
                                continue
                        cid = class_of(mod, value.id)
                        if cid:
                            hit = mro_method(cid, method)
                            if hit:
                                fn.callees.add(hit)
                                continue
                    if method in COMMON or method.startswith("__"):
                        continue
                    options = [
                        m
                        for m in methods_by_name.get(method, [])
                        if classes_of(m, funcs) in visible
                    ]
                    if (
                        not options
                        and isinstance(value, ast.Attribute)
                        and len(methods_by_name.get(method, [])) == 1
                    ):
                        options = methods_by_name[method]  # unique in the whole package
                    if not options and len(methods_by_name.get(method, [])) <= 6:
                        options = methods_by_name.get(method, [])  # few candidates: name match
                    if 1 <= len(options) <= 6:
                        fn.approx_callees.update(options)
    for fn in funcs.values():
        for callee in fn.callees | fn.approx_callees:
            if callee in funcs and callee != fn.id:
                funcs[callee].callers.add(fn.id)
    enrich(modules, classes, funcs, class_of, func_of, mro_method)
    return modules


# Names Home Assistant calls on an integration module.
HA_MODULE_HOOKS = {
    "async_setup",
    "async_setup_entry",
    "async_unload_entry",
    "async_remove_entry",
    "async_migrate_entry",
}
# Base classes whose methods the framework calls.
FRAMEWORK_BASE = re.compile(r"(Entity|Flow|FlowHandler|Store)$")
NOT_FRAMEWORK = {"Protocol", "ABC", "Generic", "object", "Enum", "StrEnum", "NamedTuple", "TypedDict"}


def walk_shallow(node: ast.AST):
    """Yield the nodes of a body without entering nested defs (their decorators and signature count)."""
    stack = list(ast.iter_child_nodes(node))
    while stack:
        n = stack.pop()
        yield n
        if isinstance(n, ast.FunctionDef | ast.AsyncFunctionDef):
            stack.extend(n.decorator_list)
            stack.extend(ast.iter_child_nodes(n.args))
            if n.returns:
                stack.append(n.returns)
            continue
        stack.extend(ast.iter_child_nodes(n))


def base_name(base: str) -> str:
    """Return the plain class name of a base expression (`pkg.Foo[T]` -> `Foo`)."""
    return base.split("[")[0].split(".")[-1]


def tests_text() -> str:
    """Return the source of all tests (for the 'only used by tests' hint)."""
    return "\n".join(p.read_text(encoding="utf-8") for p in sorted((ROOT / "tests").rglob("*.py")))


def enrich(modules, classes, funcs, class_of, func_of, mro_method) -> None:  # noqa: C901
    """Second pass: value references, overrides, framework hooks and 'why unused' notes."""

    def own_ref(mod: Module, owner: str, own_class: str | None, nested: dict[str, str], root):
        """Record every function/class used as a value (callback, table entry, annotation, base)."""
        for node in walk_shallow(root):
            if isinstance(node, ast.Name) and isinstance(node.ctx, ast.Load):
                cid = class_of(mod, node.id)
                if cid:
                    classes[cid].referenced_in.add(owner)
                fid = nested.get(node.id) or func_of(mod, node.id)
                if fid and fid != owner:
                    funcs[fid].ref_by.add(owner)
            elif isinstance(node, ast.Attribute) and isinstance(node.value, ast.Name):
                value = node.value.id
                hit = None
                if value in ("self", "cls") and own_class:
                    hit = mro_method(f"{mod.name}:{own_class}", node.attr)
                elif value in mod.mod_alias:
                    cand = f"{mod.mod_alias[value]}:{node.attr}"
                    hit = cand if cand in funcs else None
                else:
                    cid = class_of(mod, value)
                    hit = mro_method(cid, node.attr) if cid else None
                if hit and hit != owner:
                    funcs[hit].ref_by.add(owner)

    for mod in modules.values():
        own_ref(mod, f"{mod.name}:(module level)", None, {}, mod_tree(mod))
        for fn in mod.funcs:
            nested = {
                c.name: f"{fn.id}.{c.name}"
                for c in ast.iter_child_nodes(fn.node)
                if isinstance(c, ast.FunctionDef | ast.AsyncFunctionDef)
            }
            own_ref(mod, fn.id, fn.cls, nested, fn.node)

    # class hierarchy: subclasses reference their bases, methods implement base methods
    protocols = {
        cid
        for cid, k in classes.items()
        if any(base_name(b) == "Protocol" for b in k.bases)
    }
    external: dict[str, set[str]] = {}
    for cid, k in classes.items():
        owner = modules[k.module]
        ext = set()
        for base in k.bases:
            bid = class_of(owner, base_name(base))
            if bid:
                classes[bid].referenced_in.add(cid)
                for mid in k.methods:
                    hit = mro_method(bid, mid.split(".")[-1])
                    if hit:
                        funcs[mid].via.add(hit)
            elif base_name(base) not in NOT_FRAMEWORK:
                ext.add(base_name(base))
        external[cid] = ext
    by_name: dict[str, list[str]] = defaultdict(list)
    for fn in funcs.values():
        if fn.cls:
            by_name[fn.qual.split(".")[-1]].append(fn.id)
    for pid in protocols:
        for mid in classes[pid].methods:
            for other in by_name.get(mid.split(".")[-1], []):
                if other != mid and other.split(":")[1].split(".")[0] != classes[pid].name:
                    funcs[other].via.add(mid)

    # classes the framework drives: a subclass of a framework base, or a mixin of one
    hosted: dict[str, str] = {}
    for cid, ext in external.items():
        hits = sorted(e for e in ext if FRAMEWORK_BASE.search(e))
        if hits:
            hosted[cid] = hits[0]
    changed = True
    while changed:
        changed = False
        for cid, k in classes.items():
            if cid in hosted:
                for base in k.bases:
                    bid = class_of(modules[k.module], base_name(base))
                    if bid and bid not in hosted:
                        hosted[bid] = hosted[cid]
                        changed = True

    memo: dict[str, bool] = {}

    def reached(fid: str, seen: frozenset = frozenset()) -> bool:
        """Return whether a function is called, referenced or reached through a base."""
        if fid in memo:
            return memo[fid]
        f = funcs[fid]
        hit = bool(f.callers or f.ref_by) or any(
            v not in seen and reached(v, seen | {fid}) for v in f.via
        )
        memo[fid] = hit
        return hit

    tests = tests_text()
    package_lines = {
        m.name: m.path.read_text(encoding="utf-8").splitlines() for m in modules.values()
    }
    for fn in funcs.values():
        fn.used = reached(fn.id)
        if fn.used:
            continue
        name = fn.qual.split(".")[-1]
        decos = [ast.unparse(d) for d in getattr(fn.node, "decorator_list", [])]
        cid = f"{fn.module}:{fn.cls}" if fn.cls else None
        cmd = next((re.search(r"/([a-z_/]+)'", d) for d in decos if d.startswith("tdc_command(")), None)
        if cmd:
            fn.note = f"WebSocket command <code>{cmd.group(1)}</code>: called by the panel through <code>api.ts</code>, not by Python"
        elif any("websocket_api" in d for d in decos):
            fn.note = "registered with Home Assistant as WebSocket command handler"
        elif name.startswith("__"):
            fn.note = "special method, called by Python"
        elif fn.module == "(root)" and name in HA_MODULE_HOOKS:
            fn.note = "integration hook called by Home Assistant"
        elif cid in hosted:
            fn.note = f"called by Home Assistant (method of a {hosted[cid]} subclass)"
        else:
            pattern = re.compile(r"\b" + re.escape(name) + r"\b")
            defn = re.compile(r"\s*(async )?def " + re.escape(name) + r"\b")
            hits = sorted(
                {
                    module
                    for module, lines in package_lines.items()
                    for line in lines
                    if pattern.search(line) and not defn.match(line) and not line.lstrip().startswith("#")
                }
            )
            if hits:
                fn.note = (
                    "called through an object whose type the analysis cannot follow "
                    f"(the name appears in {len(hits)} other module{'s' if len(hits) > 1 else ''})"
                )
            elif pattern.search(tests):
                fn.note = "only used by tests"
                fn.test_only = True
        fn.used = bool(fn.note) and not fn.test_only

    for k in classes.values():
        if k.created_in or k.referenced_in:
            continue
        ext = sorted(e for e in external[k.id] if FRAMEWORK_BASE.search(e))
        if k.id == "config_flow:TestDataCreatorConfigFlow" or ext:
            k.note = f"found and driven by Home Assistant (subclass of {', '.join(ext) or 'ConfigFlow'})"
        else:
            k.note = "no reference found"

    for m in modules.values():
        if m.used_by:
            continue
        has_children = any(o.startswith(m.name + ".") for o in modules) or m.name == "(root)"
        if m.name == "(root)":
            m.note = "integration entry point, loaded by Home Assistant (<code>__init__.py</code>)"
        elif m.path.name == "__init__.py" and has_children:
            m.note = "package: loaded implicitly when one of its submodules is imported"
        elif m.name == "config_flow":
            m.note = "loaded by Home Assistant (<code>config_flow</code> in <code>manifest.json</code>)"
        elif "async_setup_entry" in m.path.read_text(encoding="utf-8"):
            m.note = "platform: loaded by Home Assistant through <code>async_forward_entry_setups</code>"
        else:
            m.note = "no import found"


def mod_tree(mod: Module) -> ast.AST:
    """Parse a module file again (module-level statements are not kept in `Module`)."""
    return ast.parse(mod.path.read_text(encoding="utf-8"))


def classes_of(method_id: str, funcs: dict[str, Func]) -> str:
    """Return the class id (`module:Class`) of a method id."""
    fn = funcs[method_id]
    return f"{fn.module}:{fn.cls}" if fn.cls else ""


# ----------------------------------------------------------------------------- graph helpers
def sccs(graph: dict[str, set[str]]) -> list[list[str]]:
    """Return the strongly connected components with more than one node (Tarjan)."""
    index: dict[str, int] = {}
    low: dict[str, int] = {}
    stack: list[str] = []
    on: set[str] = set()
    result: list[list[str]] = []
    counter = [0]

    def strong(v: str) -> None:
        index[v] = low[v] = counter[0]
        counter[0] += 1
        stack.append(v)
        on.add(v)
        for w in graph.get(v, ()):
            if w not in index:
                strong(w)
                low[v] = min(low[v], low[w])
            elif w in on:
                low[v] = min(low[v], index[w])
        if low[v] == index[v]:
            comp = []
            while True:
                w = stack.pop()
                on.discard(w)
                comp.append(w)
                if w == v:
                    break
            if len(comp) > 1:
                result.append(sorted(comp))

    for v in list(graph):
        if v not in index:
            strong(v)
    return result


# ----------------------------------------------------------------------------- TypeScript scan
@dataclass
class TsFile:
    """One TypeScript file."""

    rel: str
    lines: int
    size: int
    test: bool
    imports: set[str] = field(default_factory=set)
    imported_by: set[str] = field(default_factory=set)
    tags: list[tuple[str, str]] = field(default_factory=list)  # (tag, class)
    fires: set[str] = field(default_factory=set)
    listens: set[str] = field(default_factory=set)
    uses_tags: set[str] = field(default_factory=set)
    api_calls: set[str] = field(default_factory=set)
    extends: dict[str, str] = field(default_factory=dict)
    exports: list[str] = field(default_factory=list)
    commands: dict[str, str] = field(default_factory=dict)  # api method -> ws command
    note: str = ""  # why no file imports it
    export_notes: dict[str, str] = field(default_factory=dict)  # export -> why no other file uses it


def analyse_ts() -> dict[str, TsFile]:
    """Scan panel-src/src with regular expressions."""
    files: dict[str, TsFile] = {}
    for path in sorted(PANEL.rglob("*.ts")):
        text = path.read_text(encoding="utf-8")
        rel = str(path.relative_to(PANEL)).replace("\\", "/")
        files[rel] = TsFile(
            rel, len(text.splitlines()), path.stat().st_size, rel.endswith(".test.ts")
        )
    for rel, f in files.items():
        text = (PANEL / rel).read_text(encoding="utf-8")
        for m in re.finditer(r"""(?:from|import)\s+['"](\.[^'"]+)['"]""", text):
            target = Path(rel).parent / m.group(1)
            norm = str(Path(*[p for p in target.parts])).replace("\\", "/")
            parts: list[str] = []
            for part in norm.split("/"):
                if part == "..":
                    if parts:
                        parts.pop()
                elif part != ".":
                    parts.append(part)
            cand = "/".join(parts) + ".ts"
            if cand in files:
                f.imports.add(cand)
                files[cand].imported_by.add(rel)
        for m in re.finditer(
            r"@customElement\('([^']+)'\)\s*export (?:abstract )?class (\w+)", text
        ):
            f.tags.append((m.group(1), m.group(2)))
        for m in re.finditer(r"export (?:abstract )?class (\w+) extends (\w+)", text):
            f.extends[m.group(1)] = m.group(2)
        f.exports = re.findall(
            r"^export (?:abstract |async )?(?:class|function|const|interface|type) (\w+)",
            text,
            re.M,
        )
        if not f.test:
            f.fires = set(re.findall(r"new CustomEvent(?:<[^>]+>)?\(\s*'([^']+)'", text))
            f.listens = set(re.findall(r"@(tdc-[a-z-]+)=", text))
            f.uses_tags = set(re.findall(r"<(tdc-[a-z-]+)", text))
            f.api_calls = set(re.findall(r"(?:this\.)?api\.(\w+)\(", text))
        if rel == "common/api.ts":
            for chunk in re.split(r"\n(?=  \w+\()", text):
                head = re.match(r"  (\w+)\(", chunk)
                call = re.search(r"this\.call(?:<[^>]*>)?\('([^']+)'", chunk)
                if head and call:
                    f.commands[head.group(1)] = call.group(1)
    ts_notes(files)
    return files


def ts_notes(files: dict[str, TsFile]) -> None:
    """Explain files without importers and exports that no other production file uses."""
    texts = {rel: (PANEL / rel).read_text(encoding="utf-8") for rel in files}
    prod = {rel: t for rel, t in texts.items() if not files[rel].test}
    tests = {rel: t for rel, t in texts.items() if files[rel].test}
    for rel, f in files.items():
        if f.test:
            f.note = "test file, run by Vitest"
        elif not f.imported_by and rel == "panel.ts":
            f.note = "entry point of the Vite build; Home Assistant loads the built module as the panel"
        elif not f.imported_by:
            f.note = "no importer found"
        if f.test:
            continue
        elements = {cls for _tag, cls in f.tags}
        for name in f.exports:
            pattern = re.compile(r"\b" + re.escape(name) + r"\b")
            if any(pattern.search(t) for o, t in prod.items() if o != rel):
                continue
            if name in elements:
                f.export_notes[name] = "custom element, used through its tag in templates"
            elif len(pattern.findall(texts[rel])) > 1:
                f.export_notes[name] = "used inside this file only; exported for tests or typing"
            elif any(pattern.search(t) for t in tests.values()):
                f.export_notes[name] = "only used by tests"
            else:
                f.export_notes[name] = "no use found"
    api = texts.get("common/api.ts", "")
    for method in re.findall(r"^  (?:async )?(\w+)\(", api, re.M):
        if method in ("constructor", "call"):
            continue
        pattern = re.compile(r"\b" + method + r"\(")
        if not any(pattern.search(t) for o, t in prod.items() if o != "common/api.ts"):
            used_in_tests = any(pattern.search(t) for t in tests.values())
            files["common/api.ts"].export_notes[f"TdcApi.{method}"] = (
                "only used by tests" if used_in_tests else "no use found"
            )


def ws_handlers(modules: dict[str, Module]) -> dict[str, str]:
    """Map a WebSocket command (without prefix) to the id of its handler function."""
    result: dict[str, str] = {}
    for name, mod in modules.items():
        if not name.startswith("api."):
            continue
        text = mod.path.read_text(encoding="utf-8")
        for m in re.finditer(
            r'@tdc_command\(\s*f"\{DOMAIN\}/([a-z_/]+)"[^@]*?\)\s*async def (\w+)', text, re.S
        ):
            result[m.group(1)] = f"{name}:{m.group(2)}"
    return result


# ----------------------------------------------------------------------------- implementation notes
NOTES: dict[str, dict[str, str]] = {
    "core": {
        "Responsibility": "Cross-topic plumbing: error codes and exceptions, the command wrapper for WebSocket commands, reply and error factories, id generation, shared helpers and the protocols that let topics use each other without importing.",
        "Key classes": "<code>ErrorCode</code> and the <code>TdcError</code> family (<code>core.errors</code>), <code>tdc_command</code> (<code>core.command</code>), <code>ErrorFactory</code>, <code>ResponseFactory</code>, <code>HasReplies</code> and the other narrow protocols (<code>core.protocols</code>). The runtime data lives in the root modules <code>data</code> (<code>TdcData</code>, <code>get_data</code>) and <code>bootstrap</code> (<code>build_data</code>).",
        "Data flow": "<code>async_setup_entry</code> calls <code>build_data</code>, which creates every factory and manager once and wires them with constructor arguments; the result is stored in <code>hass.data[DOMAIN]</code> and fetched by <code>get_data(hass)</code>. A command arrives at HA's websocket_api, passes the schema and <code>require_admin</code>, runs the handler inside <code>tdc_command</code> and is answered by <code>ResponseFactory</code>; any exception becomes a <code>TdcError</code> through <code>ErrorFactory</code> and is logged once with its code.",
        "Notable decisions": "<code>core</code> is a leaf package: it imports no topic. The composition root is the root module <code>bootstrap</code>, the only place that knows all concrete classes; <code>data</code> holds the runtime data and the service locator <code>get_data(hass)</code>. The only <code>except Exception</code> is in <code>core.command</code>. Translation keys are the lower-case enum member names.",
    },
    "devices": {
        "Responsibility": "Creating generated devices from a creation job, changing their area or curve, and finding who uses a device.",
        "Key classes": "<code>DevicesManager</code>, <code>CreationJob</code>, <code>SignalEditor</code>, <code>DeviceUsage</code>; <code>entity_id_of</code> resolves an entity id for the native or the MQTT unique id.",
        "Data flow": "<code>create</code> request -> <code>job_from_request</code> -> <code>DevicesManager.async_create</code>: resolve template, check limits, reserve device numbers in the store, distribute areas, let <code>DeviceFactory</code> build <code>DeviceDef</code>s, then in chunks of 25 per device <code>adapter.create</code> + store + <code>adapter.announce</code> and a yield to the loop; the store is saved in a <code>finally</code> so a failed job keeps what exists.",
        "Notable decisions": "The store keeps plain dicts; every read builds fresh dataclasses (<code>store.devices()</code> is O(N)). Limits live in <code>const.py</code>. Area names are created through <code>AreaAssigner</code> which records only areas it created itself.",
    },
    "templates": {
        "Responsibility": "Bundled and user YAML templates, their voluptuous schemas, validation of entity definitions and the creation of <code>DeviceDef</code> objects from a template.",
        "Key classes": "<code>TemplateRegistry</code> (loads <code>bundled/*.yaml</code> and <code>&lt;config&gt;/hass_test_data_creator/templates/*.yaml</code> in the executor: bundled files with <code>load_yaml_dict</code>, user files with <code>yaml.safe_load</code>), <code>TemplateFactory</code>, <code>Template</code>, <code>DeviceFactory</code>.",
        "Data flow": "YAML -> <code>TEMPLATE_SCHEMA</code> -> <code>TemplateFactory.entity</code> (<code>ENTITY_SCHEMA</code> + content checks per platform) -> <code>Template</code>. A custom job builds a template from request dicts through the same factory.",
        "Notable decisions": "A user file with the same id replaces a bundled one; an invalid bundled file raises <code>TPL_INVALID</code> and stops setup, while a user file that is invalid, a link, too large or unreadable is skipped with a warning (at most 200 files of 256 KiB, read with <code>yaml.safe_load</code>). Device seeds are <code>crc32(seed:template:index)</code>, so they are stable across runs.",
    },
    "engine": {
        "Responsibility": "Pure signal functions, the clock with time lapse, the tick, and the behaviours (state and logic of one entity, independent of the output).",
        "Key classes": "<code>SignalSpec</code> + <code>value_at</code> (pure functions of time and seed, SplitMix64 hash), <code>SignalFactory</code>, <code>Clock</code>, <code>Tick</code>, <code>Behaviour</code> and its subclasses, <code>BehaviourFactory</code>.",
        "Data flow": "<code>Tick</code> fires one dispatcher signal per interval. Each native sensor/climate entity and each MQTT runtime is connected to it; they call <code>behaviour.tick(now)</code>, which returns whether the value changed, and write HA state or publish.",
        "Notable decisions": "Behaviours know only a <code>Scheduler</code> protocol (now, at, call_later), so native and MQTT outputs share them. Signal time is the local wall clock in seconds so daily curves follow the day; the clock base is reset on every start when time lapse is above 1.",
    },
    "faults": {
        "Responsibility": "Describes the faults that can be injected on an entity for a limited time.",
        "Key classes": "<code>FaultFactory</code> (spec table per kind, voluptuous schema per kind), <code>Fault</code> (frozen dataclass with flags: unavailable, frozen, transform, message delay/repeats).",
        "Data flow": "An action named <code>fault_&lt;kind&gt;</code> is resolved by <code>ActionFactory</code> to a closure that calls <code>FaultFactory.create</code> and <code>behaviour.start_fault</code>; the behaviour arms a timer that ends the fault.",
        "Notable decisions": "The fault only carries data; behaviours and the MQTT runtime interpret it. <code>FaultFactory.create</code> still branches on the kind to build the object (inside the factory, as the rules allow).",
    },
    "scheduler": {
        "Responsibility": "Actions on entities, triggers, planning of runs per day and firing them with a single timer.",
        "Key classes": "<code>ActionFactory</code> (table of (platform, action) -> coroutine), <code>ActionRunner</code>, <code>TriggerFactory</code> + <code>Trigger</code> subclasses, <code>SchedulePlanner</code>, <code>ScheduleManager</code>.",
        "Data flow": "<code>ScheduleManager._replan</code> asks the planner for all runs of the rest of today, keeps them in a sorted list and arms <code>async_track_point_in_utc_time</code> for the first. <code>_fire</code> executes all due runs, then re-arms. A midnight listener replans. A run resolves the target (<code>devices_for</code>) and calls <code>ActionRunner.async_run_on</code> for each device.",
        "Notable decisions": "Times of a day are drawn from <code>crc32(seed:schedule id:date)</code> so the same seed gives the same day, also after a restart. Failures of single devices are audited and do not stop the run; non-<code>TdcError</code> exceptions are not caught in <code>_fire</code>.",
    },
    "scenarios": {
        "Responsibility": "Named lists of steps with relative delays.",
        "Key classes": "<code>ScenarioManager</code>, <code>STEP_SCHEMA</code>/<code>SCENARIO_FIELDS</code>.",
        "Data flow": "<code>async_run</code> accumulates <code>after_s</code>; a step with zero delay runs at once, others get an <code>async_call_later</code> timer that is tracked in a set and cancelled on unload.",
        "Notable decisions": "Steps reuse <code>ActionRunner</code>; a scenario can be started by a schedule (<code>ScheduleManager</code> depends on <code>ScenarioManager</code>).",
    },
    "outputs": {
        "Responsibility": "Turns device descriptions into Home Assistant objects (native), MQTT discovery messages, or a Zigbee2MQTT bridge emulation.",
        "Key classes": "<code>OutputAdapterFactory</code> and <code>OutputAdapter</code>, <code>NativeAdapter</code>, <code>MqttAdapter</code>; <code>BehaviourRuntime</code> (base) with <code>MqttDevices</code> and <code>Z2mDevices</code>; <code>MqttProfileFactory</code>/<code>Z2mProfileFactory</code> (one profile per platform); <code>Z2mPayloadFactory</code>; <code>MqttClient</code>.",
        "Data flow": "MQTT outputs start behaviours themselves, subscribe to the command wildcard, follow the tick and publish through <code>MqttClient.async_publish</code>, which records every retained topic in the store. Z2M publishes one JSON state per device (coalesced with <code>_pending</code>), bridge topics and group states. The late fault holds messages back with timers; duplicate repeats them.",
        "Notable decisions": "Z2M refuses a foreign retained <code>bridge/state</code> and the default <code>zigbee2mqtt</code> topic without confirmation. Retained topics are cleaned up from the recorded list only. Device and group names that become Zigbee2MQTT topics are checked by <code>outputs.z2m.names.is_friendly_name</code> (one topic level, not <code>bridge</code>).",
    },
    "platforms": {
        "Responsibility": "Native Home Assistant entity classes (thin shells around behaviours).",
        "Key classes": "<code>TdcEntity</code> mixin, <code>TdcSensor</code>, <code>TdcSwitch</code>, <code>TdcLight</code>, <code>TdcCover</code>, <code>TdcClimate</code>, <code>EntityFactory</code>, <code>HassScheduler</code>, <code>platform_setup</code>.",
        "Data flow": "Each platform module (<code>sensor.py</code> ...) calls <code>platform_setup</code>; stored devices are added at setup and new ones through the <code>SIGNAL_DEVICES_ADDED</code> dispatcher signal. Entities register their behaviour in the shared <code>live</code> dict so actions can find it.",
        "Notable decisions": "State survives restart through <code>RestoreEntity</code> for switches, lights, covers and thermostats. Every sensor and climate entity has its own dispatcher subscription to the tick.",
    },
    "history": {
        "Responsibility": "Writes hourly long-term statistics for the past days and remembers which statistic ids it created.",
        "Key classes": "<code>HistoryManager</code>, <code>SeriesFactory</code> (+ <code>Series</code>), <code>StatisticsClient</code>.",
        "Data flow": "Request -> <code>_targets</code> (sensors with a state class) -> limit check against <code>MAX_HISTORY_ROWS</code> -> <code>_build</code> in the executor (12 samples per hour from the same signal functions) -> <code>async_import_statistics</code> per series on the loop -> ids stored in <code>created_statistics</code>.",
        "Notable decisions": "Counters start at the beginning of the history so that consumption is visible in the past. Everything is built in one executor job before any row is written.",
    },
    "removal": {
        "Responsibility": "Plans and runs the removal of everything the integration created, and cleans up when the config entry is deleted.",
        "Key classes": "<code>RemovalPlanner</code> + <code>RemovalPlan</code>, <code>RemovalRunner</code> + <code>Forgetters</code>, <code>async_cleanup_after_entry_removal</code>.",
        "Data flow": "<code>plan</code> reads the store (devices, runs, topics, statistics, created areas) and the device registry (orphans of this config entry). <code>RemovalRunner.async_run</code> refuses used devices, checks that MQTT and recorder are available if needed, forgets schedules/scenarios/groups, removes devices through their adapter, clears retained topics and statistics, deletes empty created areas and saves.",
        "Notable decisions": "Only ids recorded in the store or devices carrying this config entry are touched; areas are deleted only if the integration created them and they are empty. Retained topics are cleared last, when nothing publishes any more.",
    },
    "store": {
        "Responsibility": "Persistence in one Home Assistant <code>Store</code> (key <code>hass_test_data_creator.data</code>, version 4).",
        "Key classes": "<code>TdcStore</code>: dicts of devices, runs, schedules, scenarios, groups, published topics, created statistics, created areas and counters; <code>migrate</code> upgrades older versions.",
        "Data flow": "Reads build dataclasses from dicts on every call; writes replace the dict entry. User changes call <code>async_save</code> at once, retained-topic bookkeeping uses <code>async_delay_save</code>. On load <code>store/migrate.py</code> lifts older data to the current version (3 added <code>paused</code>, 4 added <code>source</code> per device).",
        "Notable decisions": "No secrets; a copy of a source device stores only references (device id, name, entity ids, deviation, seeds). Every store change has a version bump, a migration and a test. Loaded data is merged over an empty skeleton without validation.",
    },
    "log": {
        "Responsibility": "The live log: every state change of the generated entities, kept in memory only while the tab asks for it.",
        "Key classes": "<code>LogRecorder</code> (called by the outputs), <code>LogBuffer</code> (ring buffer), <code>LogEntryFactory</code> + <code>LogEntry</code>, <code>LogFilter</code>, <code>LogView</code> (reply of <code>log/get</code>).",
        "Data flow": "The native and MQTT outputs hand each change to <code>LogRecorder.record</code>; while capture is on it builds an entry and appends it to the buffer. <code>log/get</code> returns the entries after a sequence number through <code>LogFilter</code>; <code>log/set</code> switches capture on or off and <code>log/clear</code> empties the buffer.",
        "Notable decisions": "Capture stops when no reader asks for a while and the buffer is emptied; nothing is written to the store. Entries name the source of a copy so that the log can filter by it.",
    },
    "sources": {
        "Responsibility": "Copies that follow a real device: finding sources, deriving the entities of a copy, converting and deviating values, and the state of the source.",
        "Key classes": "<code>SourceRegistry</code> (search and read real devices), <code>SourceBindingFactory</code> + <code>SourceBinding</code> (one subscription per source entity, <code>online</code>, <code>value</code>, <code>raw</code>), <code>Deviation</code> (pure, seeded), <code>SourceSeeds</code>, <code>SourceStatus</code> (ok, offline, removed), <code>SourceDecision</code> (answer to \"remove the copies?\"), <code>derive</code>, <code>SourceFollower</code>.",
        "Data flow": "<code>sources/derive</code> proposes the entities of a copy from the states of the source; <code>devices/create</code> with a <code>source</code> stores the mapping and deviation on the device. Behaviours get an optional <code>ValueProvider</code> from the binding and read it at their tick; when the source is offline the copy reports <code>unavailable</code>.",
        "Notable decisions": "The deviation is a pure function of the source value, time and the seed per sensor. Copies are locked like bundled templates (<code>TDC-SRC-005</code>), actions on a copy with an offline source are refused (<code>TDC-SRC-007</code>), and removal never touches the source.",
    },
    "transfer": {
        "Responsibility": "Export and import of devices, own templates, schedules, scenarios and groups as a JSON file of definitions.",
        "Key classes": "<code>TransferExporter</code>, <code>TransferImporter</code> with one <code>CategoryHandler</code> per category, <code>TransferFactory</code> (file entries), <code>CategoryPlan</code>, <code>References</code>/<code>ReferenceNames</code>.",
        "Data flow": "The panel reads <code>transfer/export</code> page by page and joins the file; for an import it sends batches to <code>transfer/plan</code> (what would happen) and <code>transfer/run</code> (does it) in the order templates, devices, scenarios, schedules, groups.",
        "Notable decisions": "References are written by name and resolved on import; the file holds no runtime values, credentials or markers. Format version 2 adds the source of a copy; format 1 still imports. An entry that fails is reported and does not stop the others.",
    },
    "api": {
        "Responsibility": "The <code>hass_test_data_creator/*</code> WebSocket commands.",
        "Key classes": "Only handler functions decorated with <code>@tdc_command</code>; <code>COMMANDS</code> lists them for registration.",
        "Data flow": "Handler -> <code>get_data(hass)</code> -> topic manager -> plain dict reply. Services in <code>services.py</code> mirror most commands.",
        "Notable decisions": "<code>devices/list</code> builds its reply (entity states, usage) in the handler; <code>removal/run</code> plans and runs in one call.",
    },
    "groups": {
        "Responsibility": "Groups of Zigbee2MQTT devices.",
        "Key classes": "<code>GroupManager</code>.",
        "Data flow": "Add/update validate members and name, store the group, save, then tell <code>Z2mDevices</code> to republish the bridge groups and group states.",
        "Notable decisions": "Group numbers come from a counter in the store; the name cannot contain a slash or be <code>bridge</code>.",
    },
    "areas": {
        "Responsibility": "Distribution of devices over area names and creation/cleanup of areas.",
        "Key classes": "<code>AreaAssigner</code>, <code>distribute</code>.",
        "Data flow": "<code>distribute</code> returns one area name per device (even or seeded random); <code>ensure</code> finds or creates the area and records it when created.",
        "Notable decisions": "An existing area with the same name is reused and never deleted later.",
    },
    "audit": {
        "Responsibility": "The only place that logs actions.",
        "Key classes": "<code>AuditEntryFactory</code>, <code>AuditEntry</code>, <code>AuditLog</code>, <code>format_value</code>.",
        "Data flow": "A manager records an entry from the factory; <code>AuditLog.record</code> formats every field with <code>format_value</code> (single line, quoted, 120 characters).",
        "Notable decisions": "Entries are created per kind of action in one factory.",
    },
    "panel": {
        "Responsibility": "The Lit/TypeScript sidebar panel (<code>panel-src/src</code>), built to one ES module in <code>frontend/</code>.",
        "Key classes": "<code>TdcPanel</code> (tabs, badge), <code>TdcElement</code> (base: <code>hass</code>, <code>api</code>, <code>tr</code>), <code>TdcPollingElement</code> (10 s refresh), <code>TdcApi</code> (typed WebSocket client), forms and panels per topic.",
        "Data flow": "A tab element loads <code>info</code> and <code>templates</code> on connect, polls its list every 10 s, and calls <code>TdcApi</code> methods that map one to one to backend commands. Components talk through DOM events (<code>tdc-*</code>).",
        "Notable decisions": "Texts only through <code>i18n</code> (English and German tables, the German one typed as <code>Record&lt;TextKey, string&gt;</code>), colours from HA CSS variables; no <code>unsafeHTML</code>.",
    },
}


# ----------------------------------------------------------------------------- HTML rendering
CSS = """
:root{--bg:#fff;--fg:#1c1e21;--muted:#5f6670;--card:#f5f6f8;--line:#d9dce1;--accent:#0b63ce;--warn:#b45309;--ok:#1a7f37;--code:#eef0f3}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#14161a;--fg:#e6e8eb;--muted:#9aa3ad;--card:#1d2026;--line:#323741;--accent:#6aa9ff;--warn:#e3a008;--ok:#4ac26b;--code:#262a31}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
main{max-width:1100px;margin:0 auto;padding:12px 16px 80px}
a{color:var(--accent);text-decoration:none;word-break:break-word}a:hover{text-decoration:underline}
h1{font-size:1.5rem;margin:.6em 0 .2em}h2{font-size:1.25rem;margin:1.6em 0 .5em;border-bottom:1px solid var(--line);padding-bottom:.2em}
h3{font-size:1.05rem;margin:1.2em 0 .3em}h4{font-size:.95rem;margin:.9em 0 .2em}
code,pre{font:13px/1.45 ui-monospace,SFMono-Regular,Consolas,monospace;background:var(--code);border-radius:4px}
code{padding:1px 4px;word-break:break-word}pre{padding:8px;overflow-x:auto}
nav.top{position:sticky;top:0;background:var(--bg);border-bottom:1px solid var(--line);padding:6px 16px;z-index:5;display:flex;gap:12px;flex-wrap:wrap;align-items:center}
nav.top input{flex:1 1 200px;min-width:0;padding:6px 8px;border:1px solid var(--line);border-radius:6px;background:var(--card);color:var(--fg);font:inherit}
.muted{color:var(--muted)}.warn{color:var(--warn)}.ok{color:var(--ok)}
.card{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:8px 12px;margin:8px 0}
.fn{border-left:3px solid var(--line);padding:2px 0 2px 10px;margin:10px 0}
.fn:target,.card:target,section:target>h3{outline:2px solid var(--accent);outline-offset:2px}
.tags span{display:inline-block;background:var(--code);border-radius:10px;padding:0 8px;margin:1px 2px;font-size:12px}
table{border-collapse:collapse;width:100%;font-size:13px;display:block;overflow-x:auto}
th,td{border:1px solid var(--line);padding:3px 6px;text-align:left;vertical-align:top}th{background:var(--card)}
details>summary{cursor:pointer}ul.tight{margin:.2em 0;padding-left:1.2em}ul.tight li{margin:1px 0}
.cols{columns:2 280px;column-gap:24px}.cols>*{break-inside:avoid}
.hide{display:none!important}
svg text{fill:var(--fg);font:12px system-ui,sans-serif}svg rect.box{fill:var(--card);stroke:var(--line)}svg rect.layer{fill:none;stroke:var(--line);stroke-dasharray:4 3}
dl.notes dt{font-weight:600;margin-top:.5em}dl.notes dd{margin:0 0 0 0}
@media (max-width:600px){main{padding:8px 12px 80px}.cols{columns:1}}
"""

JS = """
(function(){
var q=document.getElementById('q');
if(q){q.addEventListener('input',function(){
 var v=q.value.toLowerCase();
 document.querySelectorAll('#index li[data-s]').forEach(function(li){li.classList.toggle('hide',v&&li.dataset.s.indexOf(v)<0)});
 document.querySelectorAll('#index details').forEach(function(d){if(v)d.open=true});
});}
function openTo(){var id=location.hash.slice(1);if(!id)return;var el=document.getElementById(id);
 while(el){if(el.tagName==='DETAILS')el.open=true;el=el.parentElement}
 var t=document.getElementById(id);if(t)t.scrollIntoView();}
window.addEventListener('hashchange',openTo);openTo();
})();
"""


def link_func(fid: str, funcs: dict[str, Func], approx: bool = False) -> str:
    """Return an anchor to a function."""
    fn = funcs[fid]
    label = f"{fn.module}.{fn.qual}"
    mark = " <span class='muted' title='resolved by method name only'>~</span>" if approx else ""
    return f"<a href='#{anchor('f', fid)}'>{esc(label)}</a>{mark}"


def link_ref(ref: str, funcs: dict[str, Func]) -> str:
    """Return a link for a function, a class or a module-level reference."""
    if ref in funcs:
        return link_func(ref, funcs)
    if ref.endswith(":(module level)"):
        return f"module level of {link_mod(ref.split(':')[0])}"
    return link_class(ref)


def link_class(cid: str) -> str:
    """Return an anchor to a class."""
    return f"<a href='#{anchor('c', cid)}'>{esc(cid.replace(':', '.'))}</a>"


def link_mod(name: str) -> str:
    """Return an anchor to a module."""
    return f"<a href='#{anchor('m', name)}'>{esc(name)}</a>"


def render_svg(modules: dict[str, Module]) -> str:
    """Return the layer overview as inline SVG."""
    topics_in_layer: dict[int, list[str]] = defaultdict(list)
    for name in modules:
        layer = layer_of(name)
        label = (
            "const"
            if name == "const"
            else topic_of(name)
            if layer
            else "(root)"
        )
        if label not in topics_in_layer[layer]:
            topics_in_layer[layer].append(label)
    width, row_h = 760, 74
    out = [
        f"<svg viewBox='0 0 {width} {row_h * len(LAYERS) + 10}' role='img' aria-label='Layers' style='width:100%;height:auto'>"
    ]
    for index, (title, _) in enumerate(LAYERS):
        y = 5 + index * row_h
        out.append(
            f"<rect class='layer' x='4' y='{y}' width='{width - 8}' height='{row_h - 8}' rx='8'/>"
        )
        out.append(
            f"<text x='12' y='{y + 16}' style='font-weight:600'>{index + 1}. {esc(title)}</text>"
        )
        items = sorted(topics_in_layer[index])
        box_w = (width - 40) / max(len(items), 1)
        box_w = min(box_w, 118)
        for i, label in enumerate(items):
            x = 12 + i * (box_w + 6)
            href = "#" + anchor("topic", label)
            out.append(
                f"<a href='{href}'><rect class='box' x='{x:.0f}' y='{y + 24}' width='{box_w:.0f}' height='30' rx='5'/>"
                f"<text x='{x + box_w / 2:.0f}' y='{y + 43}' text-anchor='middle'>{esc(label)}</text></a>"
            )
    out.append("</svg>")
    return "".join(out)


def render(modules: dict[str, Module], ts: dict[str, TsFile]) -> str:
    """Return the complete HTML document."""
    funcs = {f.id: f for m in modules.values() for f in m.funcs}
    classes = {k.id: k for m in modules.values() for k in m.classes}
    handlers = ws_handlers(modules)
    graph = {n: {i for i in m.imports if i != n} for n, m in modules.items()}
    cycles = sccs(graph)
    lazy_edges = [
        (n, t) for n, m in modules.items() for t in sorted(m.lazy_imports - m.imports) if t != n
    ]
    full_graph = {
        n: set(graph[n]) | {t for t in modules[n].lazy_imports if t != n} for n in modules
    }
    cycles_with_lazy = sccs(full_graph)
    matrix: dict[tuple[str, str], int] = defaultdict(int)
    for n, targets in graph.items():
        for t in targets:
            if topic_of(n) != topic_of(t):
                matrix[(topic_of(n), topic_of(t))] += 1
    topics = sorted({topic_of(n) for n in modules})
    upward = []
    for n, targets in graph.items():
        for t in sorted(targets):
            if layer_of(t) < layer_of(n):
                upward.append((n, t))
    out: list[str] = []
    w = out.append
    n_funcs = len(funcs)
    w(
        "<!doctype html><html lang='en'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>"
    )
    w("<title>Dependency map</title><style>" + CSS + "</style></head><body>")
    w(
        "<nav class='top'><a href='#overview'><b>Map</b></a><a href='#layers'>Layers</a><a href='#cycles'>Cycles</a><a href='#details'>Details</a>"
        "<a href='#index'>Index</a><a href='#modules'>Modules</a><a href='#panel'>Panel</a><a href='#unused'>Unused</a>"
        "<input id='q' type='search' placeholder='Filter the index (module, class, function)' aria-label='Filter'></nav><main>"
    )
    w("<h1 id='overview'>HASS Test Data Creator: dependency map</h1>")
    w(
        f"<p class='muted'>Generated by <code>docs/review/build_dependencies.py</code> from the sources: {len(modules)} Python modules, "
        f"{len(classes)} classes, {n_funcs} functions and methods, {len(ts)} TypeScript files. "
        "<b>Static approximation</b>: imports are exact; calls and &laquo;used by&raquo; lists are resolved by name through imports and the class hierarchy, "
        "so callbacks, dynamic dispatch and attribute calls on objects of unknown type are missing, and entries marked <code>~</code> are matched by method name only.</p>"
    )

    # layers
    w("<h2 id='layers'>Layers</h2>")
    w(
        "<p>Target direction: entry points call the API, the API calls topic modules, topic modules use domain parts and the foundation. Click a box for the topic notes.</p>"
    )
    w(render_svg(modules))
    w(
        "<h3>Imports between topics</h3><p class='muted'>Number of module-level imports from the row topic into the column topic.</p>"
    )
    w("<table><tr><th></th>" + "".join(f"<th>{esc(t)}</th>" for t in topics) + "</tr>")
    for r in topics:
        cells = "".join(f"<td>{matrix[(r, c)] or ''}</td>" for c in topics)
        w(f"<tr><th>{esc(r)}</th>{cells}</tr>")
    w("</table>")
    w(f"<h3>Imports against the layer direction ({len(upward)})</h3>")
    w(
        "<p class='muted'>A module in a lower layer importing a module of a higher layer. Same-layer imports are not listed.</p><ul class='tight'>"
    )
    for n, t in upward:
        w(
            f"<li>{link_mod(n)} (layer {layer_of(n) + 1}) &rarr; {link_mod(t)} (layer {layer_of(t) + 1})</li>"
        )
    w("</ul>" if upward else "<li>none</li></ul>")
    w(
        "<p class='muted'>All of these point at the root module <code>data</code>, the service locator <code>get_data(hass)</code> used by the API and the platform setup.</p>"
    )

    w("<h2 id='cycles'>Dependency cycles between modules</h2>")
    if cycles:
        w("<p class='warn'>Cycles of module-level imports:</p>")
        for comp in cycles:
            w("<div class='card'>" + " &harr; ".join(link_mod(x) for x in comp) + "</div>")
    else:
        w("<p class='ok'>No cycle among module-level imports.</p>")
    w(f"<p>Function-local (lazy) imports: {len(lazy_edges)}. ")
    w(
        "They avoid import cycles at load time: "
        + (", ".join(f"{link_mod(a)} &rarr; {link_mod(b)}" for a, b in lazy_edges) or "none")
        + ".</p>"
    )
    if len(cycles_with_lazy) != len(cycles):
        w("<p class='warn'>Counting the lazy imports as well, these modules form a cycle:</p>")
        for comp in cycles_with_lazy:
            if comp not in cycles:
                w("<div class='card'>" + " &harr; ".join(link_mod(x) for x in comp) + "</div>")

    # details
    w("<h2 id='details'>Implementation details per topic</h2>")
    for topic, notes in NOTES.items():
        w(f"<section id='{anchor('topic', topic)}'><h3>{esc(topic)}</h3><dl class='notes'>")
        for k, v in notes.items():
            w(f"<dt>{esc(k)}</dt><dd>{v}</dd>")
        members = sorted(
            n for n in modules if topic_of(n) == topic or (topic == "core" and n == "core")
        )
        if topic != "panel" and members:
            w("<dt>Modules</dt><dd>" + ", ".join(link_mod(m) for m in members) + "</dd>")
        if topic == "panel":
            w("<dt>Files</dt><dd><a href='#panel'>see the panel section</a></dd>")
        w("</dl></section>")

    # index
    w("<h2 id='index'>Index</h2><ul id='index' class='tight' style='list-style:none;padding:0'>")
    by_topic: dict[str, list[str]] = defaultdict(list)
    for n in sorted(modules):
        by_topic[topic_of(n)].append(n)
    for topic in sorted(by_topic, key=lambda t: (t != "(root)", t)):
        mods = by_topic[topic]
        w(
            f"<li data-s='{esc(topic.lower())}'><details><summary><b>{esc(topic)}</b> <span class='muted'>({len(mods)} modules)</span></summary><ul class='tight'>"
        )
        for n in mods:
            m = modules[n]
            search = " ".join([n, *[k.name for k in m.classes], *[f.qual for f in m.funcs]]).lower()
            w(
                f"<li data-s='{esc(search)}'><details><summary>{link_mod(n)} <span class='muted'>{esc(m.doc[:70])}</span></summary><ul class='tight'>"
            )
            for k in m.classes:
                w(f"<li>class <a href='#{anchor('c', k.id)}'>{esc(k.name)}</a><ul class='tight'>")
                for mid in k.methods:
                    w(
                        f"<li><a href='#{anchor('f', mid)}'>{esc(funcs[mid].qual.split('.')[-1])}</a></li>"
                    )
                w("</ul></li>")
            for f in m.funcs:
                if not f.cls and "." not in f.qual:
                    w(f"<li>def <a href='#{anchor('f', f.id)}'>{esc(f.qual)}</a></li>")
            w("</ul></details></li>")
        w("</ul></details></li>")
    w("</ul>")

    # module reference
    w("<h2 id='modules'>Module reference</h2>")
    for n in sorted(modules, key=lambda x: (topic_of(x) != "(root)", x)):
        m = modules[n]
        w(
            f"<section class='card' id='{anchor('m', n)}'><h3>{esc(n)} <span class='muted'>{esc(m.path.relative_to(ROOT).as_posix())}</span></h3>"
        )
        w(
            f"<p>{esc(m.doc)}</p><p class='muted'>{m.lines} lines ({m.code} code), {len(m.classes)} classes, {len(m.funcs)} functions/methods, layer {layer_of(n) + 1}</p>"
        )
        deps = sorted(m.imports - {n})
        lazy = sorted(m.lazy_imports - m.imports - {n})
        w(
            "<div class='cols'><div><h4>Depends on</h4>"
            + (
                "<ul class='tight'>"
                + "".join(f"<li>{link_mod(d)}</li>" for d in deps)
                + (
                    "".join(
                        f"<li>{link_mod(d)} <span class='muted'>(lazy)</span></li>" for d in lazy
                    )
                )
                + "</ul>"
                if deps or lazy
                else "<p class='muted'>nothing in the package</p>"
            )
            + "</div>"
        )
        w(
            "<div><h4>Used by</h4>"
            + (
                "<ul class='tight'>"
                + "".join(f"<li>{link_mod(u)}</li>" for u in sorted(m.used_by))
                + "</ul>"
                if m.used_by
                else f"<p class='muted'>no import found: {m.note}</p>"
            )
            + "</div></div>"
        )
        for k in m.classes:
            w(
                f"<div class='card' id='{anchor('c', k.id)}'><h4>class {esc(k.name)}"
                + (f"({esc(', '.join(k.bases))})" if k.bases else "")
                + f" <span class='muted'>line {k.line}</span></h4>"
            )
            w(f"<p>{esc(k.doc)}</p>")
            if k.methods:
                w("<table><tr><th>Method</th><th>Signature</th><th>CC</th><th>Doc</th></tr>")
                for mid in k.methods:
                    f = funcs[mid]
                    w(
                        f"<tr><td><a href='#{anchor('f', mid)}'>{esc(f.qual.split('.')[-1])}</a></td><td><code>{esc(f.sig)}</code></td><td>{f.cc}</td><td>{esc(f.doc)}</td></tr>"
                    )
                w("</table>")
            created = sorted(
                k.created_in
                - {x for x in k.created_in if x.startswith(k.module + ":" + k.name + ".")}
            )
            ref = sorted(
                k.referenced_in
                - set(created)
                - {x for x in k.referenced_in if x.startswith(k.module + ":" + k.name + ".")}
            )
            w(
                "<p><b>Created in</b> "
                + (
                    ", ".join(link_func(x, funcs) for x in created)
                    or f"<span class='muted'>no call found{': ' + k.note if k.note else ''}</span>"
                )
                + "</p>"
            )
            if ref:
                w(
                    "<details><summary>Otherwise referenced in "
                    + str(len(ref))
                    + " places</summary><div>"
                    + ", ".join(link_ref(x, funcs) for x in ref)
                    + "</div></details>"
                )
            importers = sorted(
                u
                for u in m.used_by
                if k.name
                in {
                    name
                    for name, (tgt, sym) in modules[u].names.items()
                    if tgt == n and sym == k.name
                }
                | {sym for _, (tgt, sym) in modules[u].names.items() if tgt == n and sym == k.name}
            )
            w(
                "<p><b>Imported by</b> "
                + (
                    ", ".join(link_mod(u) for u in importers)
                    or "<span class='muted'>no module (only used here)</span>"
                )
                + "</p></div>"
            )
        for f in m.funcs:
            if f.cls:
                continue
            render_func(w, f, funcs)
        for k in m.classes:
            for mid in k.methods:
                render_func(w, funcs[mid], funcs)
        w("</section>")

    # panel
    w("<h2 id='panel'>Panel (TypeScript, regex scan)</h2>")
    w(
        "<p class='muted'>Files below <code>panel-src/src</code>. Events are found by <code>new CustomEvent('name')</code> (fired) and <code>@name=</code> (listened); child elements by <code>&lt;tdc-...</code> tags in templates.</p>"
    )
    tag_owner = {tag: (rel, cls) for rel, f in ts.items() for tag, cls in f.tags}
    command_of = {}
    for f in ts.values():
        command_of.update(f.commands)
    w(
        "<h3>Components</h3><table><tr><th>Element</th><th>Class</th><th>File</th><th>Contains</th><th>Fires</th><th>Listens</th><th>API calls</th></tr>"
    )
    for rel, f in ts.items():
        for tag, cls in f.tags:
            contains = ", ".join(
                f"<a href='#{anchor('t', tag_owner[x][0])}'>{esc(x)}</a>"
                for x in sorted(f.uses_tags)
                if x in tag_owner and x != tag
            )
            fires = ", ".join(esc(e) for e in sorted(f.fires))
            listens = ", ".join(esc(e) for e in sorted(f.listens) if e not in tag_owner)
            calls = ", ".join(esc(c) for c in sorted(f.api_calls))
            w(
                f"<tr><td><code>{esc(tag)}</code></td><td>{esc(cls)} <span class='muted'>extends {esc(f.extends.get(cls, '?'))}</span></td><td><a href='#{anchor('t', rel)}'>{esc(rel)}</a></td><td>{contains}</td><td>{fires}</td><td>{listens}</td><td>{calls}</td></tr>"
            )
    w("</table>")
    w("<h3>Events</h3><table><tr><th>Event</th><th>Fired in</th><th>Listened in</th></tr>")
    events = sorted(
        {e for f in ts.values() for e in f.fires | {x for x in f.listens if x != "x"}}
        - set(tag_owner)
    )
    for e in events:
        fired = sorted(rel for rel, f in ts.items() if e in f.fires)
        heard = sorted(rel for rel, f in ts.items() if e in f.listens)
        w(
            f"<tr><td><code>{esc(e)}</code></td><td>{', '.join(f'<a href=#{anchor(chr(116), x)}>{esc(x)}</a>' for x in fired)}</td><td>{', '.join(f'<a href=#{anchor(chr(116), x)}>{esc(x)}</a>' for x in heard)}</td></tr>"
        )
    w("</table>")
    w(
        "<h3>TdcApi methods and backend handlers</h3><table><tr><th>Method</th><th>WebSocket command</th><th>Backend handler</th><th>Used in</th></tr>"
    )
    for method, command in sorted(command_of.items(), key=lambda kv: kv[1]):
        handler = handlers.get(command)
        used = sorted(rel for rel, f in ts.items() if method in f.api_calls)
        target = (
            f"<a href='#{anchor('f', handler)}'>{esc(handler.replace(':', '.'))}</a>"
            if handler in funcs
            else "<span class='warn'>not found</span>"
        )
        w(
            f"<tr><td><code>{esc(method)}</code></td><td><code>{esc(command)}</code></td><td>{target}</td><td>{', '.join(f'<a href=#{anchor(chr(116), x)}>{esc(x)}</a>' for x in used) or '<span class=muted>not used by a component</span>'}</td></tr>"
        )
    unmatched = sorted(set(handlers) - set(command_of.values()))
    w("</table>")
    if unmatched:
        w(
            "<p class='warn'>Backend commands without a TdcApi method: "
            + ", ".join(esc(x) for x in unmatched)
            + "</p>"
        )
    w("<h3>Files</h3>")
    for rel, f in ts.items():
        w(
            f"<div class='card' id='{anchor('t', rel)}'><b>{esc(rel)}</b> <span class='muted'>{f.lines} lines, {f.size} bytes{', test' if f.test else ''}</span>"
        )
        if f.tags:
            w("<br>Elements: " + ", ".join(f"<code>{esc(t)}</code> ({esc(c)})" for t, c in f.tags))
        if f.exports:
            w("<br>Exports: " + ", ".join(f"<code>{esc(x)}</code>" for x in f.exports))
        for name, why in f.export_notes.items():
            w(f"<br><span class='muted'><code>{esc(name)}</code>: {esc(why)}</span>")
        w(
            "<br>Imports: "
            + (
                ", ".join(f"<a href='#{anchor('t', x)}'>{esc(x)}</a>" for x in sorted(f.imports))
                or "<span class='muted'>none in the panel</span>"
            )
        )
        w(
            "<br>Imported by: "
            + (
                ", ".join(
                    f"<a href='#{anchor('t', x)}'>{esc(x)}</a>" for x in sorted(f.imported_by)
                )
                or f"<span class='muted'>nothing{': ' + esc(f.note) if f.note else ''}</span>"
            )
        )
        w("</div>")
    ts_graph = {rel: {i for i in f.imports} for rel, f in ts.items()}
    ts_cycles = sccs(ts_graph)
    w(
        "<h3>Panel import cycles</h3>"
        + (
            "".join(
                "<div class='card'>" + " &harr; ".join(esc(x) for x in c) + "</div>"
                for c in ts_cycles
            )
            if ts_cycles
            else "<p class='ok'>No import cycle between panel files.</p>"
        )
    )
    render_unused(w, modules, funcs, ts)
    w("</main><script>" + JS + "</script></body></html>")
    return "".join(out)


def render_unused(w, modules: dict[str, Module], funcs: dict[str, Func], ts: dict[str, TsFile]) -> None:
    """Write the list of objects that no production code uses (after all resolution rules)."""
    w("<h2 id='unused'>Objects without a production use</h2>")
    w(
        "<p class='muted'>Everything the analysis cannot connect to a caller, after resolving callbacks, tables, "
        "base classes, protocols and framework hooks. What remains is either used only by tests "
        "or a candidate for removal.</p>"
    )
    rows = [
        f"<li>{link_func(f.id, funcs)}: {'only used by tests' if f.test_only else 'no use found'}</li>"
        for f in funcs.values()
        if not f.used
    ]
    for rel, f in ts.items():
        for name, why in f.export_notes.items():
            if why in ("only used by tests", "no use found"):
                rows.append(f"<li><a href='#{anchor('t', rel)}'>{esc(rel)}</a> <code>{esc(name)}</code>: {esc(why)}</li>")
    classes = [k for m in modules.values() for k in m.classes if k.note == "no reference found"]
    rows += [f"<li>class {link_class(k.id)}: no reference found</li>" for k in classes]
    w("<ul class='tight'>" + "".join(rows) + "</ul>" if rows else "<p class='ok'>None.</p>")



def render_func(w, f: Func, funcs: dict[str, Func]) -> None:
    """Write the block of one function or method."""
    length = f.end - f.line + 1
    w(
        f"<div class='fn' id='{anchor('f', f.id)}'><code>{esc(f.qual)}</code> <span class='muted'>line {f.line}, {length} lines, CC {f.cc}</span><br><code>{esc(f.sig)}</code>"
    )
    if f.doc:
        w(f"<br>{esc(f.doc)}")
    callers = sorted(f.callers)
    callees = sorted(f.callees)
    approx = sorted(f.approx_callees - f.callees)
    refs = sorted(f.ref_by - f.callers)
    via = sorted(v for v in f.via if v in funcs)
    w(
        "<details><summary>Callers "
        + str(len(callers) + len(refs))
        + " / callees "
        + str(len(callees) + len(approx))
        + "</summary>"
    )
    w(
        "<div><b>Called by</b> "
        + (
            ", ".join(
                link_func(
                    c,
                    funcs,
                    c in funcs and f.id in funcs[c].approx_callees and f.id not in funcs[c].callees,
                )
                for c in callers
            )
            or "<span class='muted'>no direct call found</span>"
        )
        + "</div>"
    )
    if refs:
        w(
            "<div><b>Used as a value</b> (callback or table entry) in "
            + ", ".join(link_ref(r, funcs) for r in refs)
            + "</div>"
        )
    if via:
        w(
            "<div><b>Implements</b> "
            + ", ".join(link_func(v, funcs) for v in via)
            + " <span class='muted'>(called through the base or protocol)</span></div>"
        )
    if f.note:
        w(f"<div><b>Why no caller in the package</b> {f.note}</div>")
    w(
        "<div><b>Calls</b> "
        + (
            ", ".join(
                [link_func(c, funcs) for c in callees] + [link_func(c, funcs, True) for c in approx]
            )
            or "<span class='muted'>no in-package function found</span>"
        )
        + "</div></details></div>"
    )


def main() -> None:
    """Write the HTML file, or with `--check` only verify that the committed file is current."""
    modules = analyse_python()
    ts = analyse_ts()
    document = render(modules, ts)
    if "--check" in sys.argv[1:]:
        current = OUT.read_text(encoding="utf-8") if OUT.exists() else ""
        if current != document:
            print(f"{OUT.name} is out of date: run `python docs/review/build_dependencies.py`")
            raise SystemExit(1)
        print(f"{OUT.name} is up to date")
        return
    OUT.write_text(document, encoding="utf-8")
    print(
        f"wrote {OUT} ({len(document) / 1024:.0f} KiB): {len(modules)} modules, {len(ts)} TypeScript files"
    )


if __name__ == "__main__":
    main()
