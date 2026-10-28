# HASS Test Data Creator

Home Assistant custom integration that creates and manages **test devices, test entities and test data** for development and performance tests. It is meant for **test environments only**, never for an instance with real devices.

- Create many devices at once from templates (plug with metering, wall button, climate sensor, motion sensor, contact sensor, dimmable light, blind, radiator thermostat, washing machine) or from your own entity definitions.
- Assign the devices to areas on creation.
- Value curves: constant, sine, saw, square, triangle, noise, random walk, counter, and the daily profiles `household_load` and `pv_day`, a staircase (`steps`), a battery `discharge`, and the state shapes `enum` (states drawn by weight) and `state_machine` (a cycle of states with durations, as in the `washer` template). Every curve is a function of time and seed, so the same seed gives the same values.
- Values come from signal curves with a range from–to and a unit (sine, saw, square, triangle, noise, random walk, counter).
- Trigger actions by hand: switch, press a button, set or pulse a binary sensor, dim a light (`set_brightness` 0 to 255), move a blind (`open`, `close`, `set_position` 0 to 100), set a thermostat (`set_temperature`, `turn_on`, `turn_off`). A blind moves at once. Wrong parameters give error `TDC-SCH-006`.
- Run actions by schedule: at fixed times, every N seconds, once, at random moments inside a window, or at an average rate (Poisson). Random times follow a seed, so the same seed gives the same day.
- Scenarios: a named list of steps, each with a target, an entity, an action and `after_s`, the wait after the step before. Start one by hand, from the scenario tab, or from a schedule (`scenario: <id>` instead of target, entity and action; the schedule form of the panel has a "Runs" select).
- Inject faults for a limited time, by hand or by schedule: `unavailable`, `dropout`, `frozen`, `spike`, `battery_low`, `linkquality_drop`, and for the MQTT outputs `late` and `duplicate` messages. The device list shows active faults.
- Publish the devices over MQTT discovery instead (output `mqtt`, base topic `tdc`): Home Assistant creates the entities through its MQTT integration, values follow the curves, commands and faults work, and a removal deletes the retained messages. MQTT must be set up and connected.
- Publish the devices as a Zigbee2MQTT bridge instead (output `z2m`, base topic `tdc_z2m`): `bridge/state`, `bridge/info`, `bridge/devices` with exposes, one JSON state per device, availability, `<name>/set` and button actions. Groups of such devices (`add_group`, `remove_group`, the Groups tab) are listed in `bridge/groups`, publish a state derived from their members and pass `set` on to every member. It refuses a base topic with a foreign bridge on it. The base topics are set in the options of the integration.
- Time lapse: the option `time_lapse` (1 to 10000, in the options of the integration) makes the curves run faster, for example 60 for one hour per minute, so that daily curves and counters can be watched without waiting. Schedules, fault durations and pulses stay in real time; the panel shows the factor in its header. Statistics backfill is not affected.
- Backfill the past: `import_history` (or the History tab) writes hourly long-term statistics for the last 1 to 365 days of the sensors that have a state class, computed from their curves (`measurement`: mean, minimum, maximum; `total` and `total_increasing`: state and running sum). Counters grow through the whole period. Statistics of those hours that already exist are replaced; the current hour is left to the recorder. It needs the recorder, and a removal clears exactly the statistics that were imported. The state history is not backfilled.
- The Devices tab offers the main action of every entity, such as toggling a switch, and "Remove" in one "Actions" menu, and turns into a grid of cards on narrow screens such as a phone; the schedule, scenario and group tables do the same. Click a device to open its details: change its area (an existing one or a new name; an area the integration created goes when it is empty), and run every action of every entity by hand from one "Choose action" menu; actions with a number (brightness, position, target temperature) and faults with a duration ask for their value first. A sensor with a number curve gets a "Change curve" button that opens the curve editor with a live preview; the new curve replaces the old one at once. A sensor with states (`enum`, `state_machine`) keeps its states, and a number curve cannot become a list of states.
- Everything that was generated can be removed again, completely, and nothing else is touched.
- Sidebar panel in German and English with a schedule tab (list, create, switch on or off, remove, preview of the next 24 hours) a scenario tab (list, create with several steps, run, remove) and a curve editor for custom sensors (shape, range, period, noise, with a live preview of one day); services for scripts.

Planned: CSV replay, YAML import and export, sharing of templates. See [docs/concept.md](docs/concept.md) chapter 1.4.

## Status

Version 0.3.0. Requires Home Assistant 2026.9.0 or newer. The integration creates devices over the native output and, with the MQTT integration set up, over MQTT discovery and in the Zigbee2MQTT format including groups (see the release plan in [docs/concept.md](docs/concept.md)). New since 0.2.0: the MQTT discovery and Zigbee2MQTT outputs with groups and base topic options, the state shapes `enum` and `state_machine` with the washing machine template, the faults `late` and `duplicate`, the Groups tab, and scheduling a scenario from the panel. Not tried yet in a running Home Assistant or against a real broker beyond the automatic tests; native Home Assistant groups are not created.

## Installation (HACS)

1. In HACS, open the menu and choose **Custom repositories**.
2. Add `https://github.com/stacknoise/hass-test-data-creator` as category **Integration**.
3. Install **HASS Test Data Creator** and restart Home Assistant.
4. Go to **Settings → Devices & services → Add integration** and add **HASS Test Data Creator**. Confirm that this is a test environment.
5. Open **Test data** in the sidebar (administrators only).

## Services

| Service | Purpose |
| --- | --- |
| `hass_test_data_creator.create_devices` | Create devices from a template or custom entities |
| `hass_test_data_creator.fire_event` | Run an action on one entity of a test device |
| `hass_test_data_creator.remove` | Remove one device or one creation run |
| `hass_test_data_creator.remove_all` | Remove everything the integration created |
| `hass_test_data_creator.add_schedule` | Run an action on devices at fixed, repeating or random times |
| `hass_test_data_creator.remove_schedule` | Delete a schedule (`schedule_id`) |
| `hass_test_data_creator.set_schedule_enabled` | Switch a schedule on or off |
| `hass_test_data_creator.add_scenario` | Store a named list of timed steps |
| `hass_test_data_creator.run_scenario` | Start a scenario (`scenario_id`) |
| `hass_test_data_creator.remove_scenario` | Delete a scenario (`scenario_id`) |
| `hass_test_data_creator.add_group` | Group Zigbee2MQTT devices (`name`, `members` by name or id) |
| `hass_test_data_creator.remove_group` | Delete a group (`group_id`) |
| `hass_test_data_creator.import_history` | Write hourly statistics for the past days (`days`, optional `device` and `entity`); returns `series`, `rows` and `skipped` |

```yaml
action: hass_test_data_creator.create_devices
data:
  template: plug_metering
  count: 24
  name_pattern: "Plug {nn}"
  areas: ["Living room", "Kitchen", "Bedroom"]
```

Actions of `fire_event` per entity type: switch `turn_on`, `turn_off`, `toggle`; binary sensor `set_on`, `set_off`, `pulse` (optional `duration_s`); event `press` (optional `event_type`).

Limits: at most 500 devices per call, 2000 devices and 40 entities per device in total.

Schedules: the target is one of `device` (id or name), `template`, `run` or `all`. The trigger has a `type`:

| Trigger | Fields | Example |
| --- | --- | --- |
| `times` | `times` (`HH:MM`), optional `weekdays` (0 = Monday) | `{type: times, times: ["07:00", "17:30"]}` |
| `interval` | `every_s`, optional `start`, `end` | `{type: interval, every_s: 600, start: "08:00", end: "20:00"}` |
| `once` | `at` (local date and time) | `{type: once, at: "2026-11-02T18:30"}` |
| `random_window` | `count`, `start`, `end` | `{type: random_window, count: 3, start: "18:00", end: "23:00"}` |
| `poisson` | `per_day` (average) | `{type: poisson, per_day: 24}` |

Faults are actions named `fault_<kind>` (for `fire_event` and schedules); `params` takes `duration_s` (1 to 86400 seconds) and the extras of the kind. A new fault replaces a running one on the same entity and ends by itself.

| Fault | Entities | Effect | Extra params (default duration) |
| --- | --- | --- | --- |
| `unavailable` | all | state `unavailable` | – (60 s) |
| `dropout` | sensors | state `unavailable`, short | – (10 s) |
| `frozen` | sensors | value stops changing | – (300 s) |
| `spike` | sensors | value times `factor` | `factor` = 5 (30 s) |
| `battery_low` | sensors | value fixed at `value` | `value` = 5 (3600 s) |
| `linkquality_drop` | sensors | value fixed at `value` | `value` = 20 (600 s) |
| `late` | all, MQTT outputs only | state and event messages arrive `delay_s` seconds late, with the old payload | `delay_s` = 30 (120 s) |
| `duplicate` | all, MQTT outputs only | every state and event message is sent `copies` more times | `copies` = 1 (120 s) |

```yaml
action: hass_test_data_creator.fire_event
data: { device: Plug 01, entity: power, action: fault_spike, params: { factor: 3, duration_s: 20 } }
```

A scenario is stored once and then run by service or schedule; `remove_all` deletes the scenarios too:

```yaml
action: hass_test_data_creator.add_scenario
data:
  name: Leaving home
  steps:
    - { target: { template: light }, entity: light, action: turn_off }
    - { after_s: 30, target: { all: true }, entity: state, action: turn_off }
```

```yaml
action: hass_test_data_creator.add_schedule
data:
  name: Evening toggles
  target: { template: plug_metering }
  entity: state
  action: toggle
  trigger: { type: random_window, count: 3, start: "18:00", end: "23:00" }
```

Own templates: put YAML files in `<config>/hass_test_data_creator/templates/`; the format is described in [docs/concept.md](docs/concept.md) chapter 4.2.

## Development

Read [docs/development.md](docs/development.md) first. In short:

```bash
docker compose -f dev/docker-compose.yml up          # Home Assistant + Mosquitto for manual tests
docker compose -f dev/docker-compose.test.yml run --rm tests   # Python checks and tests (Linux container)
cd panel-src && npm ci && npm run build               # build the panel
```

## License

Apache-2.0, see [LICENSE](LICENSE) and [NOTICE](NOTICE).
