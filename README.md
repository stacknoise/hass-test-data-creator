# HASS Test Data Creator

Home Assistant custom integration that creates and manages **test devices, test entities and test data** for development and performance tests. It is meant for **test environments only**, never for an instance with real devices.

- Create many devices at once from templates (plug with metering, wall button, climate sensor, motion sensor, contact sensor) or from your own entity definitions.
- Assign the devices to areas on creation.
- Values come from signal curves with a range from–to and a unit (sine, saw, square, triangle, noise, random walk, counter).
- Trigger actions by hand: switch, press a button, set or pulse a binary sensor.
- Everything that was generated can be removed again, completely, and nothing else is touched.
- Sidebar panel in German and English; services for scripts.

Planned: scheduled and random events, faults, more curve shapes, MQTT and Zigbee2MQTT emulation with groups, statistics backfill. See [docs/concept.md](docs/concept.md) chapter 1.4.

## Status

Version 0.1.0, the first release. Requires Home Assistant 2026.9.0 or newer. The integration creates devices over the native output only; MQTT and Zigbee2MQTT, scheduled events and faults are planned (see the release plan in [docs/concept.md](docs/concept.md)).

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
