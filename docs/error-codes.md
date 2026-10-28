# Error codes – HASS Test Data Creator

> GENERATED FILE – do not edit by hand. Regenerated from `core/errors.py` and `translations/en.json` with `python scripts/code_index.py` (concept 13.3, 13.5).

Every error of the integration carries one of these codes (format `TDC-<AREA>-<NNN>`). The panel shows the code with the message.

| Code | Message (en) | Technical description |
| --- | --- | --- |
| TDC-CFG-001 | Confirm that this is a test environment | The confirmation that this is a test environment was not given. |
| TDC-CFG-002 | HASS Test Data Creator is not loaded | A command arrived while the integration is not loaded. |
| TDC-TPL-001 | The template does not exist | The requested template does not exist. |
| TDC-TPL-002 | A template or entity definition is invalid: {file} | A template file or a custom entity definition does not match the schema. |
| TDC-TPL-003 | The signal shape is unknown | A template or custom entity names a signal shape that does not exist. |
| TDC-GEN-001 | Too many devices. The limit is 2000 devices | A creation job would exceed MAX_DEVICES. |
| TDC-GEN-002 | Too many devices in one job. The limit is 500 | A creation job asks for more than MAX_BATCH devices. |
| TDC-GEN-003 | The name pattern is invalid. Allowed placeholders are n, nn and template in curly braces | The name pattern uses a placeholder that does not exist. |
| TDC-GEN-004 | A device can have at most 40 entities | A device would have more than MAX_ENTITIES_PER_DEVICE entities. |
| TDC-GEN-005 | The update took too long. Raise the tick interval or create fewer entities | One tick took longer than half of the tick interval. |
| TDC-SIG-001 | The signal shape is unknown | The signal shape is not registered in the SignalFactory. |
| TDC-SIG-002 | The minimum must not be greater than the maximum | The minimum of a signal is greater than its maximum. |
| TDC-SIG-003 | The states of the signal are invalid | The states, weights or durations of an enum or state machine signal are invalid. |
| TDC-SCH-001 | This action is not available for this entity | The platform of the entity does not support the requested action. |
| TDC-SCH-002 | The device or entity was not found | The device or entity of an action does not exist or is not loaded. |
| TDC-SCH-003 | The trigger of the schedule is invalid | The trigger of a schedule does not match the schema of its type. |
| TDC-SCH-004 | The schedule was not found | The schedule does not exist. |
| TDC-SCH-005 | The fault or its parameters are invalid | The kind or the parameters of a fault are invalid. |
| TDC-SCH-006 | A parameter of the action is missing or out of range | A parameter of an action is missing or outside its range. |
| TDC-SCH-007 | The scenario was not found | The scenario does not exist. |
| TDC-OUT-001 | This output is not available in this version | The requested output is not available in this version. |
| TDC-OUT-002 | MQTT is not set up or not connected | The MQTT integration is not set up or not connected to its broker. |
| TDC-OUT-003 | The Zigbee2MQTT base topic is used by another bridge | The Zigbee2MQTT base topic already carries a retained bridge state of someone else. |
| TDC-OUT-004 | Confirm in the options that the base topic zigbee2mqtt may be used | The base topic zigbee2mqtt is used without the confirmation in the options. |
| TDC-REM-001 | The removal was interrupted. Run it again to finish it | A step of a removal failed; the removal can be run again. |
| TDC-WS-001 | The request is invalid | The request does not match the schema of the command. |
| TDC-INT-001 | An unexpected error occurred. See the Home Assistant log | An unexpected error; the details are in the Home Assistant log. |
