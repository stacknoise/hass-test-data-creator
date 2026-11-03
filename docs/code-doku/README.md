# Code documentation

| File | What it is |
| --- | --- |
| `index.html` | Self-contained, browsable code documentation of the integration and the panel (light/dark, phone friendly). **Generated**, do not edit. |
| `generate.py` | Generator (Python 3.14, standard library only). Reads the Python sources with `ast` and the TypeScript panel with a line scanner. |
| `viewer.html` | Template of the page (styles and script); the generator fills in the data. |

Open `index.html` in a browser (download the file or open it from a checkout). It has two tabs:

- **Explorer**: tree of layers, packages, classes and methods with a search; the middle column shows summary, base types, metrics, methods and who uses the type; the right column shows the source with the selected range marked. Identifiers in the source link to the types they name. A column header sorts the types of a layer or package.
- **Abhängigkeiten**: map of the packages by layer (arrows for "uses", dashed for mutual use, a warning for a use against the layering), or one type with its users and dependencies.

## Regenerate

From the repository root, after **every** code change:

```bash
python docs/code-doku/generate.py          # rewrite index.html
python docs/code-doku/generate.py --check  # what CI runs
```

Commit `index.html` in the same commit as the change. CI rejects a pull request whose page is outdated. The output depends only on the sources (no date), so a clean checkout reproduces it byte for byte.

## What the page shows

- **Types** are Python classes, TypeScript classes, interfaces and type aliases. Top-level functions and constants of a file are grouped into a module entry (`name.py`, `name.ts`, kind `M`).
- **Layers** (top to bottom): Panel, Entry points, WebSocket API, Topic modules, Domain parts, Foundation. The layering follows `docs/review/` and the rules of concept 13.1.
- **Summaries** are the first line of the docstring (Python) or TSDoc comment (TypeScript).
- **Metrics** are approximations of a source scanner, not a compiler analysis: lines of code without blanks and comment-only lines; cyclomatic complexity (branches, loops, `except`, boolean operators, conditional expressions, comprehensions); maintainability index (0-100, from size and complexity); instability = Ce / (Ca + Ce) with Ce = types used and Ca = types using it; "Test nennt Typ" = the name occurs in a test file.
- **Dependencies** are resolved by name through imports (relative and absolute, re-exports in `__init__.py`). Calls through objects of unknown type are not followed; for those see `docs/review/`.

The older maps in `docs/review/` stay: they add callers/callees per function and a list of unused objects. `docs/code-index.md` stays the quick text index for searching before writing code.
