# Developer guide – HASS Test Data Creator

This guide is for people (and coding agents) who change `stacknoise/hass-test-data-creator`. It explains how the integration is built and checked, and the rules every change has to follow: modules by topic, the factory pattern, error codes, the generated code index and the CI checks.

It is a practical summary. The specification is [concept.md](concept.md); the rules below are concept chapters 13 and 14. If this guide and the concept disagree, the concept wins. [CLAUDE.md](../CLAUDE.md) is the short version for coding agents.

The rules follow the guides of the sibling projects `haac-bridge` (Python) and `haac-android` (structure of the rules), so a change feels the same in all three repositories.

## 1. Get started

Requirements:

- Python **3.14.2 or newer** and Home Assistant **2026.9.0 or newer** (the same minimum versions as `haac-bridge`, concept 15).
- Node.js 22 and npm for the panel.
- Docker, because Home Assistant does not run on Windows (it needs `fcntl`): the **Python tests do not run on a Windows machine**. Lint, the code index and the panel build run everywhere.

```bash
# Python
python -m venv .venv && source .venv/bin/activate     # Linux, WSL or container
pip install -r requirements_test.txt                   # pytest-homeassistant-custom-component, pinned to the minimum HA version
pip install -r requirements_lint.txt                   # ruff, bandit

# Panel
cd panel-src && npm ci
```

Checks (all run in CI and must pass before a pull request is merged):

```bash
ruff check .                                # lint incl. pydocstyle and complexity
ruff format --check .                       # formatting (ruff format . fixes it)
bandit -c pyproject.toml -r custom_components scripts
python scripts/code_index.py --check        # code index and error code list up to date, docstrings present
pytest                                      # Linux, WSL, container or CI

cd panel-src
npm run typecheck                           # tsc --noEmit, strict
npm run lint                                # eslint incl. TSDoc rule
npm test                                    # Vitest
npm run build                               # writes custom_components/hass_test_data_creator/frontend/
git diff --exit-code ../custom_components/hass_test_data_creator/frontend   # built file is up to date
```

Tests in Docker on Windows:

```bash
docker compose -f dev/docker-compose.test.yml run --rm tests
```

Manual test with a real Home Assistant and Mosquitto: `docker compose -f dev/docker-compose.yml up`, then open `http://localhost:8123`. The integration folder is mounted into the container.

Besides these, CI runs `hassfest`, the HACS validation (`hacs/action`), PMD CPD (copy-paste detection) and CodeQL (Python and TypeScript).

## 2. Project layout

```text
custom_components/hass_test_data_creator/
  __init__.py  config_flow.py  const.py  manifest.json  services.yaml
  translations/   en.json, de.json
  core/ model/ store/ templates/ engine/ scheduler/ faults/ outputs/ platforms/ areas/ removal/ audit/ api/
  frontend/       BUILT panel, never edited by hand
panel-src/        TypeScript, Lit, Vite, Vitest
scripts/code_index.py
tests/            same topic structure as the integration
dev/              docker-compose.yml (HA + Mosquitto), docker-compose.test.yml (tests)
docs/             concept.md, development.md, code-index.md, error-codes.md, mockups/
.github/workflows/  validate.yml, tests.yml, release.yml, codeql.yml
```

### Modules by topic (concept 13.1)

- One subpackage per topic. A module belongs to exactly one topic; code used by several topics moves to `core/`.
- **`api/` only parses requests and calls the topic modules.** It contains no business logic.
- Topics never import each other's internals. They talk through the factories and the runtime data (`get_data(hass)`).
- The panel mirrors the split: one folder per topic under `panel-src/src/`. Components do not call `hass.callWS` directly; they use the `api` module.

### How a request flows

```text
panel ──WebSocket──▶ HA websocket_api ──▶ command wrapper (core/command.py)
                                             │ validates the request (voluptuous), admin only
                                             │ runs the handler in api/<group>.py
                                             ▼
                                          topic module (templates, engine, scheduler, outputs, removal, …)
                                             │
      result / error reply ◀── ResponseFactory ◀── ErrorFactory (on any exception)
```

## 3. Adding or changing a command

1. Add the handler to its group module in `api/`, declared with the decorator, returning a plain JSON-serialisable payload:

   ```python
   @tdc_command("hass_test_data_creator/removal/plan")
   async def ws_removal_plan(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> dict[str, Any]:
       """Return what a removal of the given target would delete."""
       return plan_removal(get_data(hass), RemovalTarget.from_request(msg))
   ```

2. Add it to `COMMANDS` in `api/__init__.py`. Never reply with `connection.send_*` yourself; return the payload or raise a `TdcError`.
3. Add the call to the panel's `api` module with its TypeScript type.
4. Write tests and document the command in concept 8.2.
5. A breaking change raises `API_VERSION` and the major version; a new optional feature is added to `FEATURES`.

## 4. Factory pattern (concept 13.2)

**Rule:** whenever the kind of an object depends on a type or on runtime data, a factory creates it. Outside a factory no code branches on the entity platform, the shape name, the trigger type or the output type to construct objects. A new platform or shape is then added in one place.

Factories are plain classes created once in `async_setup`, stored in the runtime data (`core/runtime.py`) and replaced by fakes in tests. The list of factories is in concept 13.2.

Adding a factory (or a kind to one):

1. Implement it in its topic module, with docstrings.
2. Create it in `async_setup` and add it to the runtime data.
3. Test the cases per type; use a fake of the factory in the tests of its users.
4. Add it to the table in concept 13.2 and regenerate the code index (section 6).

Example: a new signal shape is a function plus one entry in `SignalFactory`, a case in `tests/vectors/signals.json` (read by pytest and Vitest), and a line in the shape table of concept 5.2. Nothing else may change.

## 5. Error codes (concept 13.3)

Every error is a `TdcError` with an `ErrorCode`.

- **All codes are defined in one file:** `custom_components/hass_test_data_creator/core/errors.py`. Nowhere else.
- Format `TDC-<AREA>-<NNN>`. Areas: `CFG`, `TPL`, `GEN`, `SIG`, `SCH`, `OUT`, `REM`, `WS`, `INT`. A code is never reused or renumbered.
- `docs/error-codes.md` is **generated** from `core/errors.py` and `translations/en.json`; never edit it by hand.
- Exception classes by area (`ConfigError`, `TemplateError`, `GenerationError`, `SignalError`, `ScheduleError`, `OutputError`, `RemovalError`, `RequestError`, `InternalError`), each with a `default_code`; a more specific code is passed in: `raise TemplateError(ErrorCode.TPL_UNKNOWN_SHAPE)`.

**Adding an error code**

1. Take the next free number of the area and add a member to `ErrorCode`. The docstring below the member is its technical description:

   ```python
   GEN_LIMIT = "TDC-GEN-002"
   """A creation job would exceed MAX_DEVICES."""
   ```

2. Add the user text to `translations/en.json` **and** `translations/de.json`, section `exceptions`, under the lowercase member name (`gen_limit`). Short, plain language, no technical terms, no tokens, no trailing period (Home Assistant strips it).
3. Run `python scripts/code_index.py` and commit `docs/error-codes.md`.
4. `tests/core/test_errors.py` checks that codes are unique, well-formed and translated in both languages. It must stay green.

**Rules**

- No bare `except:` and no `except Exception` outside the command wrapper (`core/command.py`). Never catch `asyncio.CancelledError`.
- Every error is logged once with its code (the wrapper does it for commands), never with tokens or passwords.
- `TDC-CFG-*` errors also create an issue in Repairs; it disappears after a successful reload.
- The panel shows the code with every error message.

## 6. Code index (concept 13.5)

`docs/code-index.md` lists **every module, class and function** with signature, file and a one-line summary, grouped by topic. It exists so that existing code is found and reused instead of written again.

- **Before writing code**, search `docs/code-index.md` for a function or class with the same purpose. Reuse or extend it.
- Every module, class and function, including private ones, has a **one-line docstring summary** (Google style; `ruff` enforces pydocstyle).
- After adding, renaming or removing a symbol, or changing a docstring or signature: `python scripts/code_index.py`, and commit the regenerated `docs/code-index.md` and `docs/error-codes.md` **in the same commit**. CI (`--check`) fails otherwise.
- Never edit the files by hand. After a merge or rebase conflict, regenerate them.
- The generator reads the sources with Python's `ast` module and runs without Home Assistant. Run it with Python 3.14, the version CI uses, because `ast.unparse` differs between versions. Keep sources parseable by older versions (no `type X = …` statements).
- TypeScript symbols in `panel-src/src` need a one-line TSDoc comment (`eslint-plugin-jsdoc`). They are not part of the index (concept 15).

## 7. No duplicate code and code style (concept 13.6)

- Code needed in a second place is extracted into its own function right away, in the topic module or in `core/`.
- CI runs PMD CPD over `custom_components`, `scripts` and `panel-src/src` and fails from **100 duplicated tokens**. This includes tests: shared fakes belong in `conftest.py` or one shared test module.
- `ruff` (`pyproject.toml`): line length 100, Google docstrings, McCabe complexity at most 10, isort with `force-sort-within-sections`, bandit (`S`), async pitfalls (`ASYNC`), blind-except (`BLE`, only allowed in `core/command.py`). Tests are exempt from docstring and assert rules.
- TypeScript: `strict`, no `any`, no unused code, Prettier formatting, line length 100, no hard-coded colours (use Home Assistant CSS variables).
- Async code only. No blocking I/O in the event loop: file access (templates, CSV) runs in the executor.
- No magic numbers for limits: put them in `const.py`.

## 8. UI rules

- All panel texts go through the `i18n` module with `de` and `en`; German uses informal "Du". Do not build German nouns in code; use a full string.
- Colours and typography only from Home Assistant CSS variables; the panel must work in light and dark themes.
- Every error is shown with its code.
- The permanent badge "Test environment" stays visible in the panel header.
- Mockups in `docs/mockups/` show the layout; the concept is the reference for behaviour.

## 9. Data and tests

- The store has a schema `version`. A change needs a version bump, a migration and a migration test.
- No secrets in the store, in templates or in logs.
- Tests: `pytest` with `pytest-homeassistant-custom-component`, `asyncio_mode = "auto"`, tests mirror the topic structure. Cases are listed in concept 11.
- Fixtures in `tests/conftest.py`: admin client, a loaded config entry, a fake clock and a fake MQTT client. Test commands through the WebSocket client so the wrapper, schema and admin check are exercised.
- Signals are tested with fixed expected values per shape and seed (`tests/vectors/signals.json`, shared with Vitest).
- Removal tests always check that foreign objects (a real device, an own area, a foreign retained topic) stay untouched.
- Slow performance tests are marked `slow` and run nightly.

## 10. Git, pull requests and CI

- `main` is protected: changes only by pull request, squash merge only, linear history, no force push or deletion; required checks: HACS validation, `hassfest`, ruff/bandit/code index, CPD, pytest, panel checks and build diff, CodeQL.
- Branches `feat/<topic>`, `fix/<topic>`, `docs/<topic>`, `chore/<topic>`, `ci/<topic>`. Commit messages and PR titles follow Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, optionally with a scope such as `feat(panel):`). Start every branch from the current `origin/main` (`git switch --no-track -c <name> origin/main`) and push with upstream set.
- After a squash merge, a second PR built on the first needs `git rebase --onto origin/main <last commit of the first branch> <second branch>` and a push with `--force-with-lease`.
- A change that touches the panel sources commits the rebuilt `frontend/hass-test-data-creator-panel.js` in the same commit.
- Workflows: `validate.yml` (hassfest, HACS validation, nightly), `tests.yml` (lint, CPD, pytest, panel job), `release.yml`, `codeql.yml`. A GitHub default CodeQL setup and a CodeQL workflow exclude each other; this repository uses the workflow.

### The concept document

`docs/concept.md` is the **only** version of the specification. Read the matching chapter before changing behaviour. Items in concept 15 ("Open points") are undecided: ask, or implement behind a clearly marked TODO. A change of behaviour starts with a change of the concept in a docs pull request, or the concept change is part of the same pull request.

## 11. Versions and releases

- The version is in `manifest.json` (`version`), `pyproject.toml`, `panel-src/package.json` and the expected value in the `info` test. All four are raised together in their own pull request (`chore(release): bump the version to X.Y.Z`).
- Tag the merge commit and push the tag: `git tag -a vX.Y.Z -m vX.Y.Z <sha>` and `git push origin vX.Y.Z`. `release.yml` checks that the manifest version equals the tag and creates the GitHub Release. **Do not create the release in the GitHub UI first**; the workflow then fails because the release exists.
- Tags `v*` are protected (no deleting, moving or overwriting), so check the version on `main` before tagging.
- Semantic versioning: a breaking change of a command raises `API_VERSION` and the major version; new optional features raise the minor version and extend `FEATURES`. Until 1.0.0 the minor version may contain breaking changes of the store, with a migration.
- Existing installations update through HACS (⋮ → Redownload) and a restart of Home Assistant.

## 12. Non-negotiable rules

- **Everything created carries a marker** (concept 4.4). Removal works from the markers and never touches foreign objects, areas or topics.
- The tool runs only in a test environment: keep the config flow confirmation and the header badge.
- The panel and all commands are admin only.
- The default Z2M base topic is never `zigbee2mqtt`; MQTT outputs refuse to start on a topic with a foreign retained bridge state.
- Every action is written only through `AuditLog.record(AuditEntryFactory…)`; never `_LOGGER.info` for an action; user-typed values go through `format_value`; no tokens, passwords or broker credentials in logs.
- Generated files are never edited by hand: `docs/code-index.md`, `docs/error-codes.md`, `frontend/*.js`.
- UI texts only through translations; exception texts only through `translations/*.json`.
- No licence headers in source files; dependencies only under Apache-2.0-compatible licences (Apache-2.0, MIT, BSD), never GPL.
