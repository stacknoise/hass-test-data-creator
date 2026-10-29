# HASS Test Data Creator – technical concept

Status: draft v0.1 (concept). This file is the only version of the specification. Chapter 13 holds the development rules; [development.md](development.md) is the practical summary of them. The visual overview with UI mocks is in [mockups/overview.html](mockups/overview.html).

## 1. Scope

### 1.1 Goal

A Home Assistant custom integration (domain `hass_test_data_creator`, display name "HASS Test Data Creator", distributed via HACS) that creates and manages test devices, test entities and test data **in a test environment**. It supports development and performance tests of dashboards, cards, automations and add-ons.

### 1.2 Requirements

| # | Requirement |
| --- | --- |
| R1 | Create many devices at once from templates (for example 200 plugs distributed over 12 areas). |
| R2 | Templates for the common device types create all usual entities; custom entities can be defined freely. |
| R3 | Devices are assigned to areas on creation. |
| R4 | The user chooses the values, the unit and, for sensors, a range from–to. |
| R5 | Values come from selectable signal shapes (sine, saw, daily load curve and more). |
| R6 | Events (switch, button, motion, faults) are triggered by schedule: fixed times, random times, rates. |
| R7 | The same devices can be published over MQTT, also in the Zigbee2MQTT format including groups. |
| R8 | Everything that was generated can be removed again at any time, completely. |
| R9 | The user interface is German and English. |

### 1.3 Assumptions and non-goals

- The integration runs **only in a test environment**, never in a regular instance. The config flow asks for this confirmation (10.4). Operation next to real devices is not supported.
- Home Assistant is the only runtime. No cloud, no extra server.
- MQTT uses the broker that the MQTT integration of the same instance already uses. The integration starts no broker.
- Not in scope: Zigbee2MQTT network map (`bridge/response/networkmap`), real radio or device protocols, user management.

### 1.4 Release plan

| Version | Content |
| --- | --- |
| v0.1 | Engine (sine, noise, random walk, min/max), templates plug, button, climate sensor, motion/contact, custom; areas; native output; panel with list and wizard; removal; CI and HACS package |
| v0.2 | Scheduler (fixed, interval, random window, Poisson), scenarios, faults (without `late` and `duplicate`, which need the MQTT output), the shapes `household_load`, `pv_day`, `steps` and `discharge`, the curve editor, light/cover/thermostat templates, and the schedule and scenario tabs. The shapes `enum` and `state_machine` and the faults `late` and `duplicate` moved to v0.3 (text states, the MQTT output) |
| v0.3 | MQTT discovery output, Z2M emulation with groups, cleanup of retained messages, conflict check; the shapes `enum` and `state_machine` (washer template); the faults `late` and `duplicate`; scheduling a scenario in the panel; the Groups tab. Native Home Assistant groups are not part of it |
| v0.4 | Statistics backfill (done, 5.3a), time lapse (done, 5.1), CSV replay (done); YAML import/export and sharing of templates dropped for now |

## 2. Architecture

One engine, two outputs. A device is first a description (the model). The engine produces values and events from it. An output adapter turns them into Home Assistant entities or MQTT messages, so the native and the MQTT variant behave the same.

```text
panel (TypeScript) ──WebSocket──▶ api/ (parse only) ──▶ topic modules
                                                          │
 model/store ──▶ engine (signals, scheduler, faults) ──▶ OutputAdapterFactory
                                                          ├─ native   → entity platforms (sensor, binary_sensor, switch, …)
                                                          ├─ mqtt     → HA MQTT discovery topics
                                                          └─ z2m      → Zigbee2MQTT topics (bridge, devices, groups)
```

- **Model and store** hold devices, groups, schedules, runs and markers (4).
- **Engine** is deterministic: the same seed gives the same values and events (5, 6).
- **One tick** drives all signals. There is no timer per entity (5.3).
- **Adapters** are interchangeable per device; one device has exactly one output.
- **Panel** is a custom panel of the sidebar (9). It talks to the backend only through `hass_test_data_creator/*` WebSocket commands and the services.

## 3. Stack and layout

| Part | Choice |
| --- | --- |
| Backend | Python, async only, `voluptuous` for schemas, YAML for templates |
| Minimum versions | Home Assistant 2026.9.0, Python >= 3.14.2 (same as `haac-bridge`; decided, see 15) |
| Panel | TypeScript, Lit, Vite (library build), Vitest; the built file is committed |
| Tests | `pytest` with `pytest-homeassistant-custom-component`, Vitest |
| Lint | `ruff`, `bandit`, `hassfest`, HACS validation, PMD CPD; `eslint`, `tsc --noEmit` for the panel |
| Licence | Apache-2.0; dependencies only under Apache-2.0-compatible licences |

```text
custom_components/hass_test_data_creator/
  __init__.py  config_flow.py  const.py  manifest.json  services.yaml
  translations/        en.json, de.json
  core/        errors.py, error_factory.py, response_factory.py, command.py, runtime.py, ids.py
  model/       device, entity, group, schedule, signal spec dataclasses; marker handling
  store/       persistent storage, schema version, migrations
  templates/   template loader, TemplateFactory, DeviceFactory, bundled *.yaml
  devices/     DevicesManager (creation jobs in chunks), request schema of a job
  engine/      signals.py (pure functions and the hash, no Home Assistant import), signal_factory.py, behaviours.py (the state and logic of one entity: sensor, switch, light, cover, climate, binary sensor, event, faults; it talks to its output only through `on_change`, `on_event` and a `Scheduler` for the clock and the timers), behaviour_factory.py, tick.py
  scheduler/   triggers.py (TriggerFactory), actions.py (ActionFactory), planner.py, runner.py
  faults/      FaultFactory and the fault kinds
  outputs/     adapter.py (OutputAdapterFactory), native/, mqtt_discovery/, z2m/
  platforms/   sensor.py, binary_sensor.py, switch.py, light.py, event.py, ... (entity classes: thin shells around a behaviour; `scheduler.py` gives it the clock and the timers of Home Assistant)
  areas/       area assignment (distribution rules) and tracking of created areas
  removal/     RemovalPlanner, RemovalRunner, cleanup of registries, areas, statistics, retained messages
  audit/       AuditLog, AuditEntryFactory
  api/         the hass_test_data_creator/* WebSocket commands, one module per group
  frontend/    BUILT panel (hass-test-data-creator-panel.js); never edited by hand
panel-src/     TypeScript sources of the panel
scripts/       code_index.py
tests/         same topic structure as the integration
docs/          concept.md, development.md, code-index.md, error-codes.md, mockups/
dev/           docker-compose setup with Home Assistant and Mosquitto
```

## 4. Data model

### 4.1 Objects

- **Device**: `id` (time-ordered hex id), `name`, `template` (id or `custom`), `area`, `output` (`native`, `mqtt`, `z2m`), `run_id`, `seed`, `created_at`, `entities[]`, `group_ids[]`.
- **Entity definition**: `key`, `platform`, `name`, `device_class`, `unit`, `state_class`, `attributes`, `signal` (sensors) or `states` (discrete), `commands` (switches, lights).
- **Signal spec**: `shape`, `min`, `max`, `period`, `interval`, `noise`, `spikes`, `decimals`, `phase`. Parameters of one shape are validated by the shape (5.2).
- **Group**: `id`, `name`, `members[]`. Z2M groups are created from it (7.4); native Home Assistant groups are not.
- **Schedule**: `id`, `target` (device, group or template), `action`, `trigger`, `enabled`, `seed`.
- **Run**: one creation job with `id`, `label`, `created_at`, `seed` and the ids of everything it created. A run is the unit of removal besides device and template.

### 4.2 Template files

A template is a YAML file in `templates/` (bundled) or in the user's config folder `hass_test_data_creator/templates/` (own). It lists entities with their default signal. The loader validates it with a `voluptuous` schema and reports errors with a code (`TDC-TPL-*`). Own templates can be created from any existing device in the panel. Own templates are read up to 200 files of 256 KiB; a link, an unreadable or an invalid own file (own files are read with `yaml.safe_load`, so `!secret` and `!include` are not understood) is skipped with a `TDC-TPL-002` warning and does not stop the integration (a bundled file that is invalid still does). Signal numbers must be finite, periods are limited to 366 days and `rate_per_hour` to 3600. Discrete shapes (`enum`, `state_machine`) are allowed on sensors only.

```yaml
id: plug_metering
name: Plug with metering
model: { vendor: HASS Test Data Creator, name: Plug (metering) }
entities:
  - { key: state,  platform: switch }
  - { key: power,  platform: sensor, device_class: power,  unit: W,   state_class: measurement,
      signal: { shape: household_load, min: 0, max: 2300, interval: 10s, noise: 0.03, decimals: 1 } }
  - { key: energy, platform: sensor, device_class: energy, unit: kWh, state_class: total_increasing,
      signal: { shape: counter, rate_per_hour: 0.35, decimals: 3 } }
```

### 4.3 Storage

- Home Assistant `Store`, key `hass_test_data_creator.data`, with `version`. Frequent writes use delayed saves, changes made by the user are written at once.
- Every schema change raises the store version and has a migration with a test. The migrations are the steps in `store/migrate.py`; the store is at version 2.
- Loading is tolerant: keys a version does not know are dropped, and an entry that cannot be read (a missing field, a wrong type) is skipped and logged with `TDC-INT-002`, so one bad entry does not stop the integration from loading.
- **No secrets** are stored. The seed is not a secret.

### 4.4 Markers (basis of removal)

Everything the integration creates is marked, so that nothing has to be searched by name:

| Object | Marker |
| --- | --- |
| Device in registry | config entry id, identifier `(hass_test_data_creator, <device id>)`, manufacturer "HASS Test Data Creator" |
| Entity in registry | config entry id, unique id `<device id>_<key>` |
| Area | id listed in `created_areas` of the store (only areas the integration made itself) |
| Statistics | statistic ids listed in `created_statistics` |
| MQTT topics | base topic of the integration plus a list of all published topics (`published_topics`) |
| Label | HA label "test data" on devices (entities follow in a later version) |

## 5. Signal engine

### 5.1 Time and determinism

`value_at(spec, t, seed, origin)` is a pure function. `t` is the signal time in seconds: local wall-clock time of the instance (so daily curves follow the local day) mapped by the time-lapse clock (v0.4): from the start of the time lapse on, signal time runs `factor` times faster than real time, `signal = base + (real - base) * factor`, with `base` the signal time at the start. The factor is the option `time_lapse` (1 to 10000, default 1). The start is stored with the factor (store version 2, key `time_lapse`), so a restart or a reload continues the same time lapse and the curves do not jump back; only a changed factor starts a new time lapse at that moment, so counters and state shapes may jump then. Only the signals are accelerated: schedules, scenarios, fault durations, pulses and the tick stay in real time, and the statistics backfill uses real time. Noise and spikes use an integer hash of `(seed, n)`, not a stateful generator, so a value can be computed for any `t` without history. This is also what makes statistics backfill and the curve preview in the panel possible. The panel computes the preview with the same shapes.

### 5.2 Shapes

| Shape | Definition | Version |
| --- | --- | --- |
| `constant`, `sine`, `saw`, `square`, `triangle` | periodic, scaled to min..max | v0.1 |
| `noise`, `random_walk` | hash noise, smoothed noise | v0.1 |
| `household_load`, `pv_day` | daily profiles with small variation: load with peaks at 07:30, 12:30 and 19:00; PV between 06:00 and 20:00 with clouds | v0.2 |
| `counter` | monotonic counter for `total_increasing` sensors (energy) | v0.1 |
| `steps`, `discharge` | stairs (`interval_s` per step, one climb per `period_s`), battery discharge (full to empty over `period_s`) | v0.2 |
| `csv` | replay of a file, looped | v0.4 |
| `enum`, `state_machine` | discrete values with weights (new draw every `interval_s`); a cycle of states with durations (`states`, `phase`). The sensor gets the device class `enum` with the states as options; no unit or state class; faults that change numbers do not touch them | v0.3 |

Modifiers (all optional): `noise` (fraction of the range), `drift`, `spikes` (rate and factor), `rounding`, `hourly_factor[24]`.

A shape is created only by `SignalFactory` (13.2). Adding a shape is a new entry there plus a test with fixed expected values.

### 5.3 Tick

One `Tick` per config entry calls `async_dispatcher_send` every `tick_seconds` (default 10, minimum 1) and passes the signal time, computed once per tick. Entities subscribe to it and compute their own value for that time. An entity whose interval is longer than the tick skips ticks. A thermostat writes its state only when the rounded temperature changed. The MQTT outputs start one task per tick that publishes everything that changed; the Zigbee2MQTT output publishes each changed device once. The tick measures its own duration up to the end of the event loop iteration, so the tasks the listeners started count too; if it takes longer than 50 % of the interval, a warning with code `TDC-GEN-005` is shown, and again after a tick that was fast in between (12).

### 5.3a Statistics backfill (v0.4)

`import_history` (service) and `history/import` (command) write hourly long-term statistics with `async_import_statistics` (source `recorder`, statistic id = entity id) for the `days` (1 to 365, default 7) full hours before the current one; the current hour is left to the recorder. Per hour the signal is sampled 12 times. `measurement` sensors get mean, minimum and maximum, `total` and `total_increasing` sensors get the state at the end of the hour and a running sum that starts at 0 (a drop of a `total_increasing` value counts as a reset). A `counter` gets its origin at the beginning of the period if the device is younger, so the past shows consumption. Sensors without a state class, state shapes and non-sensors are skipped and counted. Statistics of the same hours are replaced, so the import can be repeated. A request for more than `MAX_HISTORY_ROWS` (500 000) rows fails with `TDC-GEN-006`; without a recorder it fails with `TDC-CFG-003`. The imported statistic ids are stored in `created_statistics` (id to device); removal clears them in the recorder, and a missing recorder stops the removal before anything is gone.

### 5.4 Entity state

Sensor values are computed, never stored. Discrete states (switch, binary sensor) are stored in the entity and changed by commands, schedules and faults. After a restart they are restored from the last state (`RestoreEntity`).

## 6. Scheduler

### 6.1 Triggers (TriggerFactory)

| `type` | Meaning | Version |
| --- | --- | --- |
| `times` | list of times of day (optional weekdays) | v0.2 |
| `interval` | every N seconds/minutes | v0.2 |
| `once` | once, at a local date and time (`2026-11-02T18:30`) | v0.2 |
| `random_window` | N times within a window, positions drawn from the seed | v0.2 |
| `poisson` | on average N per hour/day, exponentially distributed gaps | v0.2 |
| `manual`, `service` | button in the panel, service call | v0.1 |
| `after` | delay after another action | v0.2, as `after_s` of a scenario step |

### 6.2 Actions (ActionFactory)

Switch on/off/toggle, button press (`single`, `double`, `hold`), motion for N seconds, contact open/close, set value, run a scene (list of steps), and faults (6.3). A scene is stored as a scenario: a named list of steps, each with a target, an entity, an action, parameters and `after_s`, the wait after the step before (the delays add up). A scenario starts by service, command or a schedule with `scenario` instead of target, entity and action; a step that fails on a device is logged and the rest goes on. `remove_all` deletes the scenarios. An action is created per entity platform; code outside the factory does not branch on the platform.

### 6.3 Faults (FaultFactory)

`unavailable`, `dropout` (sensor only), `frozen`, `spike`, `battery_low`, `linkquality_drop`, `late` and `duplicate` message. A fault has a duration and ends itself; a new fault replaces a running one on the same entity. All faults are visible in the panel while active. All eight are actions `fault_<kind>` of the `ActionFactory` (parameters `duration_s`, `factor`, `value`, `delay_s`, `copies`). `late` and `duplicate` act on the messages of the MQTT outputs only: while one is active, every state and event message of the entity (for Zigbee2MQTT the state of its device) is held back by `delay_s` seconds (1 to 3600, default 30) or sent `copies` extra times (1 to 10, default 1). The payload is the one of the moment the message was made, so a late message is a stale one. Availability and discovery are not delayed; messages still waiting when a device is removed or the integration is unloaded are dropped. The native output has no messages, so the fault has no effect there.

### 6.4 Determinism and restart

The planner draws the times of a day from `(schedule seed, date)`; the same seed gives the same day. The next run times are recomputed after a restart and runs of the past are not repeated. A preview of the next 24 hours is available in the panel and through the API.

## 7. Outputs

### 7.1 Output adapter

`OutputAdapterFactory` returns the adapter for a device. An adapter implements `create(device)`, `update(device, values)`, `emit(device, event)`, `remove(device)` and reports its published artefacts for the markers (4.4).

### 7.2 Native

Entity platforms are set up once by the single config entry and receive devices at runtime through `async_add_entities` (stored callbacks, dispatcher signal for new devices). Devices go into the device registry with the markers of 4.4. Areas are assigned through the area registry; a missing area is created and recorded in `created_areas`. Entities are removed through the registry, never by hiding them.

### 7.3 MQTT discovery (v0.3)

Publishes discovery configs under `homeassistant/<component>/<node>/<object>/config` and states on topics below the integration's own base topic. Home Assistant creates the entities through the MQTT integration. All discovery and state topics are recorded in `published_topics`.

Topics (base topic `tdc` by default, option `mqtt_base_topic`):

| Topic | Content |
| --- | --- |
| `homeassistant/<component>/tdc_<device id>/<key>/config` | discovery config, retained |
| `<base>/<device id>/<key>/availability` | `online` or `offline`, retained; `offline` while a fault makes the entity unavailable and after the integration is unloaded |
| `<base>/<device id>/<key>/<facet>` | state, retained: `state` (sensor, binary sensor, switch, light as JSON), `position` (cover), `mode`, `temperature`, `current_temperature` (thermostat); `event` for events (not retained) |
| `<base>/<device id>/<key>/<facet>/set` | commands: `state` for switch (`ON`/`OFF`) and light (JSON), `command` (`OPEN`/`CLOSE`) and `position` for covers, `mode` and `temperature` for thermostats |

The behaviours (engine, 2) of the devices with the output `mqtt` run in `MqttDevices`; `MqttProfileFactory` creates one profile per platform that knows the discovery payload, the state payloads and the commands. One subscription `<base>/+/+/+/set` receives all commands; the tick publishes changed values. Stored devices are started again after a restart as soon as MQTT is connected. A command with an invalid payload is ignored and logged.

The MQTT outputs share one `MqttClient` (`outputs/mqtt/client.py`). It uses the MQTT integration of the instance (an `after_dependency`, not a requirement), publishes, subscribes and records every retained topic in `published_topics` (a map from topic to the device it belongs to; shared topics such as the bridge have none). Without a connected MQTT integration it raises `TDC-OUT-002`. A removal deletes the retained messages of its topics first; if MQTT is not usable it stops before anything else is removed, so nothing is left half done. Removing the config entry clears the topics if MQTT is connected.

### 7.4 Zigbee2MQTT emulation (v0.3)

The integration behaves like a Zigbee2MQTT bridge under a configurable base topic (default `tdc_z2m`, never `zigbee2mqtt` without an explicit confirmation).

| Topic below the base topic | Payload |
| --- | --- |
| `bridge/state` | `{"state":"online"}`, retained; offline as last will |
| `bridge/info` | version and config subset, retained |
| `bridge/devices` | device list with `definition.exposes`, retained |
| `bridge/groups` | group list with members, retained |
| `<friendly_name>` | state as JSON (`state`, `power`, `linkquality`, …), retained |
| `<friendly_name>/availability` | `{"state":"online"}` |
| `<friendly_name>/set` | received; command is applied to the device, new state follows |
| `<friendly_name>/action` | button events as plain string |
| `<group name>` and `<group name>/set` | group state derived from the members; a set is passed to all members |

Implemented in the first part (devices, without groups):

- The bridge is published when the first device starts: `bridge/state`, `bridge/info`, `bridge/devices` (the coordinator and every device with `definition.exposes`). `bridge/devices` is published again whenever a device is added or removed. Home Assistant's MQTT client owns the connection, so there is no last will of our own; the bridge and every device are set to `offline` when the integration is unloaded.
- A device is published under its name as the friendly name: the state `<base>/<name>` (JSON, retained) holds all properties, `<name>/availability` is `{"state": ...}`. A fault that makes any entity of the device unavailable marks the whole device offline.
- Properties follow Zigbee2MQTT: entity keys for sensors, `occupancy` for motion and `contact` (true while closed) for door sensors, `state` and `brightness` (0 to 254) for lights, `state` and `position` for covers, `system_mode`, `occupied_heating_setpoint` and `local_temperature` for thermostats. Buttons publish plain text on `<name>/action` (not retained).
- `<name>/set` takes a JSON object; every entity applies the properties that belong to it. An invalid payload or an unknown name is ignored and logged.
- The model catalogue is the optional `z2m` block of a template (`vendor`, `model`, `description`, `power_source`, `type`); a custom device gets vendor `TDC`.
- The base topic is the option `z2m_base_topic` (default `tdc_z2m`); `zigbee2mqtt` needs the confirmation `z2m_confirm_default_topic` (`TDC-OUT-004`). If the base topic already holds a retained `bridge/state` that this integration did not publish, the output refuses to start (`TDC-OUT-003`). The options flow checks both base topics. A base topic must be printable, at most 64 characters, without wildcards or `//`, not start with `$` or `homeassistant`, and the two base topics must not be equal or lie inside each other. A device name used as friendly name must be one topic level (no `/`, `+`, `#`, control character, not `bridge`); otherwise the creation stops with `TDC-OUT-007`. Group names follow the same rule.
- Home Assistant discovery is not published in the Zigbee2MQTT format; the devices are for consumers of the Zigbee2MQTT topics. Use the output `mqtt` to get Home Assistant entities.
- Groups: a group has a name, a number (the id Zigbee2MQTT shows) and members, which must be devices with the output `z2m`. The name must be free (no device, no group, not `bridge`, no slash). `bridge/groups` lists them with the IEEE addresses of the members. The group state `<base>/<group name>` is derived from the members (`state` is ON if any member is ON, `brightness` and `position` are averaged, mode and setpoint come from the first member) and is published again whenever a member changes. A `set` on `<group name>/set` is applied to every member. Removing a device takes it out of its groups; a group without members is deleted, and so is every group by `remove_all`. Native Home Assistant groups are not created.

Rules: payloads are built only by `Z2mPayloadFactory`; the bridge info and the model catalogue come from the templates; the network map is not implemented. At startup the adapter listens to `<base>/#` for 3 seconds (10 seconds on the confirmed topic `zigbee2mqtt`) and refuses to start (`TDC-OUT-003`) if it sees a retained message on a topic the integration did not publish; a broker that delivers retained messages later than that is not noticed. A `late` fault holds back at most `MAX_LATE_MESSAGES` (100) messages per device and drops the oldest.

## 8. Services and WebSocket API

### 8.1 Services

`hass_test_data_creator.create_devices`, `fire_event`, `add_schedule`, `remove_schedule`, `set_schedule_enabled`, `add_scenario`, `remove_scenario`, `run_scenario`, `add_group`, `remove_group`, `import_history` (v0.4), `remove` (target: device or run) and `remove_all`. Services are described in `services.yaml` and have schemas.

### 8.2 WebSocket commands (panel)

Prefix `hass_test_data_creator/`. Every command runs inside the command wrapper in `core/command.py`, which validates the request, converts exceptions with `ErrorFactory` and replies with `ResponseFactory`. Commands need an admin user. Commands: `devices/*` (list, get, names, create, update, fire, signal; `list` returns the state and the shape of each entity, `get` the full device with its signals, `names` only id, name, template, model, output, run and creation time for pickers), `templates/list`, `schedules/*` (list, add, update, remove, enable, preview), `scenarios/*` (list, add, update, remove, run), `groups/*` (list, add, update, remove), `history/import`, `removal/plan`, `removal/run`, `removal/orphan_topics` (scan the broker for retained topics of generated devices that the store did not record), `removal/orphan_topics_clear` (delete those of the given topics that a new scan reports), `info` (version, features, `api_version`).

A breaking change of a command raises `API_VERSION` and the major version. A new optional feature is added to `FEATURES` in `info`; the panel checks it.

## 9. Panel

- Custom panel `hass-test-data-creator`, registered with `panel_custom`, `require_admin=True`. Static path serves `frontend/` of the integration.
- Lit web component, TypeScript with `strict`, one folder per topic in `panel-src/src/` (`devices`, `wizard`, `signals`, `schedule`, `removal`, `common`). Calls go through one `api` module; components do not call `hass.callWS` directly.
- Vite library build to one ES module. The built file is committed to `custom_components/.../frontend/`; CI rebuilds it and fails on a difference. HACS delivers it without Node.
- Colours and fonts only from Home Assistant's CSS variables (`--primary-color`, `--card-background-color`, …); no hard-coded colours. Light and dark follow the theme.
- All texts through the `i18n` module with `de` and `en`; German uses informal "Du". The language comes from `hass.language`.
- The signal preview uses the same shapes as the backend. A shared test vector file (`tests/vectors/signals.json`) is read by pytest and Vitest to keep both identical.

## 10. Removal and safety

### 10.1 Rule

All generated data must be removable at any time, completely, and without touching anything that the integration did not create.

### 10.2 Plan before removal

`removal/plan` returns what would be removed: devices, entities, groups, areas, schedules, statistics, MQTT topics. The panel shows this list before the user confirms. After a lost or damaged store the retained topics are no longer known: `removal/orphan_topics` listens for `SCAN_SECONDS` (3) to the own base topics (`<mqtt base>/#` limited to ids of generated devices, `<z2m base>/#` unless it is the foreign default `zigbee2mqtt`) and to `homeassistant/+/tdc_+/+/config`, and reports the retained topics that are not in `published_topics`. `removal/orphan_topics_clear` deletes only topics that a fresh scan reports, whatever the request names. The registry devices that MQTT discovery creates for generated devices get the label "test data" (`MqttLabeler`) when they are created and at every start. A removal can target one device, one group, a template, a run, or everything.

### 10.3 Execution

`RemovalRunner` removes in a fixed order: schedules, MQTT artefacts (empty retained payload on every recorded topic, offline state, discovery removal), devices (the registry removes their entities), groups, statistics, areas created by the integration that are now empty, store entries. Each step is idempotent, so a removal that was interrupted can be run again. Unknown or foreign objects are skipped, and an area that still holds foreign devices stays.

Removing the config entry (`async_remove_entry`) runs the same removal. The result is reported with counts. A removal never needs the store to be consistent: if it is damaged, the runner falls back to the registry markers of 4.4.

### 10.4 Test environment guard

The config flow requires the confirmation "this is a test instance". The panel shows a permanent badge "Test environment". The Z2M base topic must differ from `zigbee2mqtt` unless confirmed, and the integration refuses to start the MQTT outputs on a topic that has a foreign retained bridge state (7.4).

### 10.5 Other rules

- Test devices carry the label "test data" so they can be filtered in Home Assistant. Device numbers (`{n}`, `{nn}`) count per template, so a second job continues where the first one ended.
- Option "do not record" excludes the entities from the recorder for load tests that should not fill the database.

## 11. Tests

- Unit tests for pure parts: signals (fixed expected values per shape and seed), planner (fixed days), template schema, Z2M payloads, removal planner.
- Integration tests with `pytest-homeassistant-custom-component`: setup and unload of the entry, creating 1, 50 and 500 devices, area assignment, state updates on a tick, services, WebSocket commands through a client, full removal and removal after an interrupted run, restart restore.
- MQTT tests with the HA MQTT test fixtures: topics and payloads of discovery and Z2M, `/set` round trip, group set, cleanup of retained messages.
- Error code test: unique, well-formed, translated, every code reachable (same idea as the `haac-bridge` test).
- Performance test (marked `slow`, nightly): 1000 devices with 4 entities at a 10 s tick; the tick must finish within 50 % of the interval.
- Panel: Vitest for the `api`, `i18n` and signal modules, shared vectors with pytest.
- The Home Assistant tests do not run on Windows (needs `fcntl`). They run in Docker (`docker compose -f dev/docker-compose.test.yml run --rm tests`) and in CI.

## 12. Limits and performance

Constants in `const.py`: `MAX_DEVICES = 2000`, `MAX_ENTITIES_PER_DEVICE = 40`, `MIN_TICK_SECONDS = 1`, `MAX_BATCH = 500` per creation job, `MAX_SCHEDULES = 200`, `MAX_SCENARIOS = 100`, `MAX_GROUPS = 100` (`TDC-GEN-007` to `009`). Free-form request fields are bounded in `core/limits.py`: `MAX_SHORT_TEXT = 128`, `MAX_PARAMS_BYTES = 2048`, `MAX_TRIGGER_BYTES = 4096`, `MAX_ENTITIES_BYTES = 65536`, `MAX_AREAS_PER_JOB = 100`. The scheduler keeps its plan of the day in a heap and replans only the schedule that changed. A creation job above 500 entities runs in chunks and yields to the event loop between them. The wizard shows the estimated state rate (entities / interval) before the job starts and warns above 50 states per second.

## 13. Development rules

These rules apply to every change. [development.md](development.md) explains them with commands and examples, [CLAUDE.md](../CLAUDE.md) is the short version for coding agents. If they disagree, this concept wins.

### 13.1 Modules by topic

One subpackage per topic (3). A module belongs to exactly one topic; code several topics need goes to `core/`. `api/` only parses requests and calls topic modules, with no business logic. The panel follows the same split.

### 13.2 Factories

Objects whose kind depends on a type or on runtime data are created only by a factory. Outside a factory, no code branches on the entity platform, the shape name or the trigger type to build objects. Factories are plain classes created once in `async_setup`, held in the runtime data, and replaced by fakes in tests.

| Factory | Creates |
| --- | --- |
| `TemplateFactory` | device description from a template and the user's inputs |
| `DeviceFactory` | devices of a creation job (names, ids, seeds, area distribution) |
| `BehaviourFactory` | the behaviour (state and logic, without Home Assistant classes) per platform |
| `EntityFactory` | the Home Assistant entity per platform, a thin shell around a behaviour |
| `SignalFactory` | the signal function per shape |
| `TriggerFactory` | the planner per trigger type |
| `ActionFactory` | the action per platform and action name |
| `FaultFactory` | the fault per kind |
| `OutputAdapterFactory` | the output adapter per device (native, mqtt, z2m) |
| `MqttProfileFactory` | the discovery payload, state payloads and commands per platform |
| `Z2mPayloadFactory` | bridge, device, group and state payloads |
| `Z2mProfileFactory` | the exposes, state properties and commands per platform in the Zigbee2MQTT format |
| `AuditEntryFactory` | audit entry per kind of action |
| `ResponseFactory` | WebSocket result, error and event replies |
| `ErrorFactory` | `TdcError` from any caught exception |

### 13.3 Error codes

Every raised error is a `TdcError` (derived from `HomeAssistantError`, with `translation_domain` and `translation_key`) with an `ErrorCode`.

- All codes live only in `core/errors.py`. Format `TDC-<AREA>-<NNN>`. A code is never reused or renumbered.
- Areas: `CFG` configuration and config flow, `TPL` templates, `GEN` device generation, `SIG` signals, `SCH` schedules and faults, `OUT` outputs (native and MQTT), `REM` removal, `WS` request format, `INT` unexpected.
- The user text is in `translations/en.json` and `de.json`, section `exceptions`: short, plain language, no technical terms, no trailing period. `docs/error-codes.md` is generated.
- Every command runs in the command wrapper, which logs the error once with its code and replies. No bare `except`, no `except Exception` outside the wrapper, never catch `asyncio.CancelledError`.
- Configuration errors also create a Repairs issue.

### 13.4 Logging and audit

Every action (create, remove, fault, event, schedule run, settings change) is recorded only through `AuditLog.record(entry)` with an entry from `AuditEntryFactory`; never `_LOGGER.info` for an action. User-typed values are escaped by `format_value`. Default log level `warning`. No tokens, passwords or broker credentials in logs. An error is logged once.

### 13.5 Code index

`docs/code-index.md` lists every module, class and function with signature, file and a one-line summary; `docs/error-codes.md` lists all codes. Both are generated by `scripts/code_index.py`, committed in the same commit as the change, and checked in CI. Before writing code, search the index for a function with the same purpose. Every symbol, including private ones, has a one-line docstring. TypeScript symbols of the panel get a one-line TSDoc comment, enforced by `eslint-plugin-jsdoc`; they are not part of the index (decided, 15).

### 13.6 No duplicate code

Code needed in a second place becomes its own function at that moment. CI runs PMD CPD over the sources and tests and fails from 100 duplicated tokens. Shared fakes live in `conftest.py` or a shared test module.

### 13.7 Non-negotiable rules

- Everything the integration creates carries a marker (4.4), and removal never touches foreign objects (10).
- Only admins may use the panel and the commands.
- No secrets in the store, in logs or in templates.
- The API for the panel changes only with `API_VERSION` rules (8.2).
- Generated files (`docs/code-index.md`, `docs/error-codes.md`, `frontend/*.js`) are never edited by hand.
- The README is kept current from the first commit on and changes in the same pull request as the behaviour it describes (`docs/development.md`, section "The README").
- No licence headers in source files. Dependencies only under Apache-2.0-compatible licences (Apache-2.0, MIT, BSD), never GPL.
- UI texts only through translations (`de` and `en`); exception texts through `translations/*.json`.

## 14. Repository, CI and releases

- `main` is protected: pull requests only, squash merge, linear history, no force push, required checks. Branches `feat/<topic>`, `fix/<topic>`, `docs/<topic>`, `chore/<topic>`, `ci/<topic>`, started from the current `origin/main`. Commits and PR titles follow Conventional Commits.
- Workflows: `validate.yml` (hassfest, HACS validation, nightly too), `tests.yml` (ruff, bandit, code index check, CPD, pytest, panel typecheck, lint, Vitest, build and diff check of the built file), `release.yml`, `codeql.yml` (Python and TypeScript).
- Version: `manifest.json` `version`, `pyproject.toml`, `panel-src/package.json` and the `info` test are raised together in their own PR. Tag `vX.Y.Z` on the merge commit; `release.yml` checks that the manifest version equals the tag and creates the release. The release is never created in the GitHub UI first. Tags `v*` are protected.
- `hacs.json`: `homeassistant` minimum version; `render_readme: true`.
- `dev/docker-compose.yml` starts Home Assistant and Mosquitto with the integration mounted for manual tests.

## 15. Open points

No open points are left. A new one is added here as a table with a number, the question and the default that applies until it is decided.

### Decided

| # | Decision |
| --- | --- |
| O1 | Minimum versions are Home Assistant 2026.9.0 and Python 3.14.2, the same as `haac-bridge` (`hacs.json`, `manifest.json`, `pyproject.toml`). Older systems are not supported. |
| O2 | Platforms after the first four follow the order of the release plan (1.4): light, cover and thermostat in v0.2; further ones (lock, event extensions) when a template needs them. |
| O3 | TypeScript symbols are not part of the code index; the one-line TSDoc comment is enforced by lint only. |
| O4 | The Z2M emulation uses only its own models from the templates; no import from `zigbee-herdsman-converters`. |
| O5 | The statistics backfill (v0.4) writes only long-term statistics with `async_import_statistics`, only for sensors with a `state_class`. The state history is not backfilled. |
| O6 | The panel uses plain Lit components of its own, without a separate component library. |
