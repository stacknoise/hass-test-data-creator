# Dependency maps

| File | What it is |
| --- | --- |
| `dependencies.html` | Self-contained, clickable dependency map of the integration and the panel (light/dark, phone friendly). **Generated**, do not edit. |
| `dependency-graph.html` | Interactive diagram of the same dependencies: topic packages, modules and panel files. **Generated**, do not edit. |
| `build_dependencies.py` | Generator of `dependencies.html` (Python 3.14, standard library only). The "implementation details" texts are the `NOTES` dictionary at the top. |
| `build_graph.py` | Generator of `dependency-graph.html`; it reuses the analysis of `build_dependencies.py`. |

Regenerate both from the repository root after a change of modules, imports or topic behaviour:

```bash
python docs/review/build_dependencies.py
python docs/review/build_graph.py
```

CI runs both generators with `--check` and rejects a pull request whose maps are out of date; run them without `--check` and commit the result.

The maps are a **static approximation**: module imports are exact, but caller/callee and "used by" lists are resolved by name through the imports and the class hierarchy. Callbacks and table entries are listed as "used as a value", overrides and protocol implementations as "implements", and framework hooks (Home Assistant entry points, entities, WebSocket commands, platforms, packages) carry a note why no Python code calls them. Calls through objects of unknown type are matched by method name only (marked `~`). The section "Objects without a production use" at the end lists what remains: code that only tests use, and removal candidates.

These are documentation tools, not part of the integration. They do not satisfy the strict ruff configuration (docstrings, complexity) and are excluded in `pyproject.toml`.
