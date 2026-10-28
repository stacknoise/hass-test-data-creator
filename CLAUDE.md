# HASS Test Data Creator (repo: stacknoise/hass-test-data-creator)

Home Assistant custom integration (domain `hass_test_data_creator`) that creates and manages test devices, entities and test data in a **test environment**: templates, signal curves, scheduled events, areas, and optional MQTT / Zigbee2MQTT emulation. Distributed via HACS. It must never run in a regular instance.

## Source of truth

- `docs/concept.md` is the full technical concept and the only version of it. Read the chapter that matches the task before writing code.
- `docs/development.md` is the developer guide (setup, checks, factories, error codes, code index, releases).
- `docs/mockups/overview.html` shows the planned UI; the concept wins if they disagree.
- Items in concept 15 ("Open points") are undecided. Do not pick an answer silently: ask, or implement behind a clearly marked TODO.

## Repository layout

```text
CLAUDE.md  README.md  hacs.json  pyproject.toml  requirements_test.txt  requirements_lint.txt
docs/            concept.md, development.md, code-index.md (GENERATED), error-codes.md (GENERATED), mockups/
scripts/code_index.py
custom_components/hass_test_data_creator/
  __init__.py config_flow.py const.py manifest.json services.yaml translations/{en,de}.json
  core/ model/ store/ templates/ engine/ scheduler/ faults/ outputs/ platforms/ areas/ removal/ audit/ api/
  frontend/      BUILT panel (never edit by hand)
panel-src/       TypeScript, Lit, Vite, Vitest
tests/  dev/  .github/workflows/
```

## Build and checks

- Python tests do not run on Windows: use Docker (`docker compose -f dev/docker-compose.test.yml run --rm tests`) or CI.
- Must pass before a PR: `ruff check .`, `ruff format --check .`, `bandit`, `python scripts/code_index.py --check`, `pytest`, and in `panel-src`: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` with no diff in `frontend/`. CI also runs `hassfest`, HACS validation, PMD CPD and CodeQL.
- Run the code index generator with Python 3.14.

## Development rules (concept 13) – follow for every change

**Before writing code**
1. Read `docs/code-index.md` and search it for a function or class with the same purpose. Reuse or extend it; never write a second implementation.
2. Code needed in a second place is extracted into its own function right away: in the topic module, or in `core/` if several topics need it. CPD fails from 100 duplicated tokens.

**Modules by topic (13.1)**
- One subpackage per topic. `api/` only parses requests and calls topic modules; no business logic. The panel mirrors the topics and talks to the backend only through its `api` module.

**Factories (13.2)**
- Templates, devices, entities, signals, triggers, actions, faults, output adapters, Z2M payloads, audit entries, replies and errors are created only by their factory. Never branch on the platform, shape name, trigger type or output type to construct objects outside a factory. Factories are created in `async_setup`, held in the runtime data and faked in tests.

**Errors (13.3)**
- Every raised exception is a `TdcError` subclass with an `ErrorCode`, derived from `HomeAssistantError`. Never raise plain `Exception`, `ValueError` or `RuntimeError` for a handled case.
- All codes live only in `core/errors.py`, format `TDC-<AREA>-<NNN>` (areas CFG, TPL, GEN, SIG, SCH, OUT, REM, WS, INT). A new error gets the next free number of its area; codes are never reused or renumbered. Add the user text to `translations/en.json` **and** `de.json` (short, plain, no trailing period).
- Every command runs in the wrapper in `core/command.py`. No bare `except`, no `except Exception` outside it, never catch `asyncio.CancelledError`. Log every error once with its code.

**Logging (13.4)**
- Actions are logged only through `AuditLog.record(AuditEntryFactory…)`; user-typed values through `format_value`; no tokens, passwords or broker credentials.

**Code index (13.5)**
- Every module, class and function, including private ones, has a one-line docstring (TypeScript: one-line TSDoc). After adding, renaming or removing a symbol run `python scripts/code_index.py` and commit `docs/code-index.md` and `docs/error-codes.md` in the same commit. Never edit them by hand.

## Non-negotiable rules

- Everything the integration creates carries a marker (concept 4.4). Removal works from the markers and never touches foreign devices, entities, areas, statistics or MQTT topics. All generated data must be removable at any time.
- Keep the test-environment confirmation in the config flow and the "Test environment" badge in the panel.
- The panel and all commands are admin only.
- The Z2M base topic defaults to `tdc_z2m`, never `zigbee2mqtt`. Refuse to start MQTT outputs on a topic with a foreign retained bridge state.
- No secrets in the store, templates or logs. Signal values are computed by pure functions of time and seed; keep them deterministic.
- A breaking change of a `hass_test_data_creator/*` command raises `API_VERSION` and the major version. A store change needs a version bump and a migration with a test.
- Generated files are never edited by hand: `docs/code-index.md`, `docs/error-codes.md`, `custom_components/hass_test_data_creator/frontend/*.js`. Rebuild the panel and commit the result with the source change.

## Conventions

- Python >= 3.14.2 and Home Assistant >= 2026.9.0 (same as `haac-bridge`, concept 15), async only, `voluptuous` schemas, blocking I/O in the executor.
- Panel: TypeScript `strict`, Lit, Vite; colours only from Home Assistant CSS variables; texts only through `i18n` (`de` informal "Du", `en`).
- UI and exception texts in German and English. Code, comments and docs in English.
- Git: protected `main`, squash merge, branches `feat|fix|docs|chore|ci/<topic>`, Conventional Commits, tags `vX.Y.Z`; the version in `manifest.json`, `pyproject.toml` and `panel-src/package.json` equals the tag. Do not create a release in the GitHub UI first.
- Licence Apache-2.0. No licence headers in source files. Dependencies only under Apache-2.0-compatible licences (Apache-2.0, MIT, BSD), never GPL.
