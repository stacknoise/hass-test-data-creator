# Code index – HASS Test Data Creator

> GENERATED FILE – do not edit by hand. Regenerate with `python scripts/code_index.py` (concept 13.5).

Lists every module, class and function of the integration with signature, file and a one-line summary, grouped by topic. Read it before writing code to reuse existing functions instead of duplicating them.

## (root)

| Symbol | Signature | File | Description |
| --- | --- | --- | --- |
| `hass_test_data_creator.__init__` | `module` | `custom_components/hass_test_data_creator/__init__.py` | HASS Test Data Creator: test devices and test data for test environments. |
| `async_setup_entry` | `async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool` | `custom_components/hass_test_data_creator/__init__.py` | Load the store and templates, set up the platforms, start the tick, register the panel. |
| `_reload_after_options` | `async def _reload_after_options(hass: HomeAssistant, entry: ConfigEntry) -> None` | `custom_components/hass_test_data_creator/__init__.py` | Reload the entry when the options changed, so that new base topics take effect. |
| `async_unload_entry` | `async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool` | `custom_components/hass_test_data_creator/__init__.py` | Stop the tick, unload the platforms and remove services and panel. |
| `async_remove_entry` | `async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None` | `custom_components/hass_test_data_creator/__init__.py` | Delete everything left behind: created areas and the storage file. |
| `hass_test_data_creator.binary_sensor` | `module` | `custom_components/hass_test_data_creator/binary_sensor.py` | The binary_sensor platform of the generated devices. |
| `hass_test_data_creator.bootstrap` | `module` | `custom_components/hass_test_data_creator/bootstrap.py` | Builds the runtime data of a config entry: creates the factories and managers and wires them together (concept 2). |
| `build_data` | `def build_data(hass: HomeAssistant, entry: ConfigEntry) -> TdcData` | `custom_components/hass_test_data_creator/bootstrap.py` | Create the factories and managers of `entry` and wire them together. |
| `hass_test_data_creator.climate` | `module` | `custom_components/hass_test_data_creator/climate.py` | The climate platform of the generated devices. |
| `hass_test_data_creator.config_flow` | `module` | `custom_components/hass_test_data_creator/config_flow.py` | Config flow: one entry, created after the test environment confirmation (concept 10.4). |
| `_valid_topic` | `def _valid_topic(topic: str) -> bool` | `custom_components/hass_test_data_creator/config_flow.py` | Whether `topic` can be a base topic: printable, no wildcards, not broker or discovery space. |
| `_overlap` | `def _overlap(first: str, second: str) -> bool` | `custom_components/hass_test_data_creator/config_flow.py` | Whether the topics are equal or one lies below the other. |
| `TestDataCreatorConfigFlow` | `class TestDataCreatorConfigFlow(ConfigFlow)` | `custom_components/hass_test_data_creator/config_flow.py` | Asks once whether this is a test instance and for the seed and tick interval. |
| `TestDataCreatorConfigFlow.async_step_user` | `async def async_step_user(self, user_input: dict[str, Any] \| None=None) -> ConfigFlowResult` | `custom_components/hass_test_data_creator/config_flow.py` | Create the entry if the user confirms that this is a test environment. |
| `TestDataCreatorConfigFlow.async_get_options_flow` | `def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow` | `custom_components/hass_test_data_creator/config_flow.py` | Return the options flow with the MQTT base topics and the time lapse. |
| `TestDataCreatorOptionsFlow` | `class TestDataCreatorOptionsFlow(OptionsFlow)` | `custom_components/hass_test_data_creator/config_flow.py` | Sets the MQTT base topics and the time lapse; the entry reloads after a change. |
| `TestDataCreatorOptionsFlow.async_step_init` | `async def async_step_init(self, user_input: dict[str, Any] \| None=None) -> ConfigFlowResult` | `custom_components/hass_test_data_creator/config_flow.py` | Check the topics and store them as options. |
| `TestDataCreatorOptionsFlow._errors` | `def _errors(self, values: dict[str, Any]) -> dict[str, str]` | `custom_components/hass_test_data_creator/config_flow.py` | Return the error of the first wrong field. |
| `hass_test_data_creator.const` | `module` | `custom_components/hass_test_data_creator/const.py` | Constants of the HASS Test Data Creator. |
| `hass_test_data_creator.cover` | `module` | `custom_components/hass_test_data_creator/cover.py` | The cover platform of the generated devices. |
| `hass_test_data_creator.data` | `module` | `custom_components/hass_test_data_creator/data.py` | Runtime data: the factories and managers of one loaded config entry (concept 2). |
| `TdcData` | `class TdcData` | `custom_components/hass_test_data_creator/data.py` | Everything a loaded config entry needs; created once in `async_setup_entry`. |
| `get_data` | `def get_data(hass: HomeAssistant) -> TdcData` | `custom_components/hass_test_data_creator/data.py` | Return the runtime data or raise TDC-CFG-002 if the integration is not loaded. |
| `hass_test_data_creator.event` | `module` | `custom_components/hass_test_data_creator/event.py` | The event platform of the generated devices. |
| `hass_test_data_creator.light` | `module` | `custom_components/hass_test_data_creator/light.py` | The light platform of the generated devices. |
| `hass_test_data_creator.panel` | `module` | `custom_components/hass_test_data_creator/panel.py` | Registers the sidebar panel and serves the built panel file (concept 9). |
| `_built_at` | `def _built_at() -> int` | `custom_components/hass_test_data_creator/panel.py` | Return when the built panel file was last changed, so that a new build is not served from the cache. |
| `async_register_panel` | `async def async_register_panel(hass: HomeAssistant, version: str) -> None` | `custom_components/hass_test_data_creator/panel.py` | Serve the `frontend` folder (once) and add the admin-only sidebar panel. |
| `async_remove_panel` | `def async_remove_panel(hass: HomeAssistant) -> None` | `custom_components/hass_test_data_creator/panel.py` | Remove the sidebar panel. |
| `hass_test_data_creator.sensor` | `module` | `custom_components/hass_test_data_creator/sensor.py` | The sensor platform of the generated devices. |
| `hass_test_data_creator.services` | `module` | `custom_components/hass_test_data_creator/services.py` | Services of the integration (concept 8.1); all of them need an administrator. |
| `_create` | `async def _create(call: ServiceCall) -> dict[str, object]` | `custom_components/hass_test_data_creator/services.py` | Create the devices of a job. |
| `_fire` | `async def _fire(call: ServiceCall) -> None` | `custom_components/hass_test_data_creator/services.py` | Run an action on one entity of a device. |
| `_remove` | `async def _remove(call: ServiceCall) -> dict[str, object]` | `custom_components/hass_test_data_creator/services.py` | Remove one device or one run. |
| `_remove_all` | `async def _remove_all(call: ServiceCall) -> dict[str, object]` | `custom_components/hass_test_data_creator/services.py` | Remove everything the integration created. |
| `_add_schedule` | `async def _add_schedule(call: ServiceCall) -> dict[str, object]` | `custom_components/hass_test_data_creator/services.py` | Add a schedule. |
| `_remove_schedule` | `async def _remove_schedule(call: ServiceCall) -> None` | `custom_components/hass_test_data_creator/services.py` | Delete a schedule. |
| `_set_schedule_enabled` | `async def _set_schedule_enabled(call: ServiceCall) -> None` | `custom_components/hass_test_data_creator/services.py` | Switch a schedule on or off. |
| `_add_scenario` | `async def _add_scenario(call: ServiceCall) -> dict[str, object]` | `custom_components/hass_test_data_creator/services.py` | Add a scenario. |
| `_remove_scenario` | `async def _remove_scenario(call: ServiceCall) -> None` | `custom_components/hass_test_data_creator/services.py` | Delete a scenario. |
| `_run_scenario` | `async def _run_scenario(call: ServiceCall) -> dict[str, object]` | `custom_components/hass_test_data_creator/services.py` | Start a scenario. |
| `_add_group` | `async def _add_group(call: ServiceCall) -> dict[str, object]` | `custom_components/hass_test_data_creator/services.py` | Add a group of Zigbee2MQTT devices. |
| `_remove_group` | `async def _remove_group(call: ServiceCall) -> None` | `custom_components/hass_test_data_creator/services.py` | Delete a group. |
| `_import_history` | `async def _import_history(call: ServiceCall) -> dict[str, object]` | `custom_components/hass_test_data_creator/services.py` | Write hourly statistics for the past days of the test sensors. |
| `async_register_services` | `def async_register_services(hass: HomeAssistant) -> None` | `custom_components/hass_test_data_creator/services.py` | Register the services as administrator services. |
| `async_remove_services` | `def async_remove_services(hass: HomeAssistant) -> None` | `custom_components/hass_test_data_creator/services.py` | Remove the services when the entry is unloaded. |
| `hass_test_data_creator.switch` | `module` | `custom_components/hass_test_data_creator/switch.py` | The switch platform of the generated devices. |

## core

| Symbol | Signature | File | Description |
| --- | --- | --- | --- |
| `hass_test_data_creator.core.__init__` | `module` | `custom_components/hass_test_data_creator/core/__init__.py` | Core package of the HASS Test Data Creator. |
| `hass_test_data_creator.core.command` | `module` | `custom_components/hass_test_data_creator/core/command.py` | The command wrapper: every panel command runs in it (concept 8.2, 13.3). |
| `tdc_command` | `def tdc_command(command_type: str, fields: dict[Any, Any] \| None=None) -> Callable[[Handler], Any]` | `custom_components/hass_test_data_creator/core/command.py` | Return a decorator that turns `handler` into an admin-only WebSocket command. |
| `tdc_command.decorator` | `def decorator(handler: Handler) -> Any` | `custom_components/hass_test_data_creator/core/command.py` | Wrap `handler` with schema, admin check and error conversion. |
| `tdc_command.decorator.command` | `async def command(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> None` | `custom_components/hass_test_data_creator/core/command.py` | Run the handler and send its result or the converted error. |
| `hass_test_data_creator.core.error_factory` | `module` | `custom_components/hass_test_data_creator/core/error_factory.py` | Factory that turns any caught exception into a TdcError (concept 13.2). |
| `ErrorFactory` | `class ErrorFactory` | `custom_components/hass_test_data_creator/core/error_factory.py` | Creates a TdcError from any exception. |
| `ErrorFactory.from_exception` | `def from_exception(self, exc: BaseException) -> TdcError` | `custom_components/hass_test_data_creator/core/error_factory.py` | Return `exc` as TdcError; schema errors become request errors, the rest internal. |
| `hass_test_data_creator.core.errors` | `module` | `custom_components/hass_test_data_creator/core/errors.py` | Error codes and exception classes of the integration (concept 13.3). |
| `ErrorCode` | `class ErrorCode(StrEnum)` | `custom_components/hass_test_data_creator/core/errors.py` | Every error code of the integration, format TDC-<AREA>-<NNN>; never reuse or renumber. |
| `TdcError` | `class TdcError(HomeAssistantError)` | `custom_components/hass_test_data_creator/core/errors.py` | Base of every error of the integration; carries an ErrorCode. |
| `TdcError.__init__` | `def __init__(self, code: ErrorCode \| None=None, **placeholders: str) -> None` | `custom_components/hass_test_data_creator/core/errors.py` | Create the error; `placeholders` fill the `{name}` fields of the translated text. |
| `ConfigError` | `class ConfigError(TdcError)` | `custom_components/hass_test_data_creator/core/errors.py` | Error in the configuration or the setup of the integration. |
| `TemplateError` | `class TemplateError(TdcError)` | `custom_components/hass_test_data_creator/core/errors.py` | Error in a template or a custom entity definition. |
| `GenerationError` | `class GenerationError(TdcError)` | `custom_components/hass_test_data_creator/core/errors.py` | Error while creating devices. |
| `SignalError` | `class SignalError(TdcError)` | `custom_components/hass_test_data_creator/core/errors.py` | Error in a signal definition. |
| `ScheduleError` | `class ScheduleError(TdcError)` | `custom_components/hass_test_data_creator/core/errors.py` | Error in an action, a schedule or a fault. |
| `OutputError` | `class OutputError(TdcError)` | `custom_components/hass_test_data_creator/core/errors.py` | Error in an output adapter. |
| `RemovalError` | `class RemovalError(TdcError)` | `custom_components/hass_test_data_creator/core/errors.py` | Error while removing generated data. |
| `RequestError` | `class RequestError(TdcError)` | `custom_components/hass_test_data_creator/core/errors.py` | Error in the format of a WebSocket request. |
| `InternalError` | `class InternalError(TdcError)` | `custom_components/hass_test_data_creator/core/errors.py` | Unexpected error that is not caused by the user. |
| `hass_test_data_creator.core.hashing` | `module` | `custom_components/hass_test_data_creator/core/hashing.py` | The deterministic hash that signals, triggers and area distribution share (concept 5). |
| `hash01` | `def hash01(seed: int, n: int) -> float` | `custom_components/hass_test_data_creator/core/hashing.py` | Return a deterministic number in [0, 1) for the integers `seed` and `n` (SplitMix64). |
| `hass_test_data_creator.core.ids` | `module` | `custom_components/hass_test_data_creator/core/ids.py` | Identifier helpers. |
| `new_id` | `def new_id() -> str` | `custom_components/hass_test_data_creator/core/ids.py` | Return a new time-ordered hexadecimal identifier (`ID_LENGTH` characters). |
| `hass_test_data_creator.core.keys` | `module` | `custom_components/hass_test_data_creator/core/keys.py` | Names of the keys and values that several modules use. |
| `hass_test_data_creator.core.labels` | `module` | `custom_components/hass_test_data_creator/core/labels.py` | The label that marks the registry devices of generated test data (concept 4.4). |
| `marker_label_id` | `def marker_label_id(hass: HomeAssistant) -> str` | `custom_components/hass_test_data_creator/core/labels.py` | Return the id of the label "test data"; create the label if it does not exist. |
| `hass_test_data_creator.core.limits` | `module` | `custom_components/hass_test_data_creator/core/limits.py` | Validators that bound free-form request fields (concept 12). |
| `json_size` | `def json_size(max_bytes: int) -> Callable[[Any], Any]` | `custom_components/hass_test_data_creator/core/limits.py` | Return a validator for a value whose JSON text is at most `max_bytes` long. |
| `json_size._bounded` | `def _bounded(value: Any) -> Any` | `custom_components/hass_test_data_creator/core/limits.py` | Return `value` or raise vol.Invalid if it is too large to store. |
| `json_object` | `def json_object(max_bytes: int) -> vol.All` | `custom_components/hass_test_data_creator/core/limits.py` | Return a validator for a dict whose JSON text is at most `max_bytes` long. |
| `hass_test_data_creator.core.protocols` | `module` | `custom_components/hass_test_data_creator/core/protocols.py` | Narrow interfaces that let one topic use another without importing it (concept 13.1). |
| `ScenarioRunner` | `class ScenarioRunner(Protocol)` | `custom_components/hass_test_data_creator/core/protocols.py` | What the scheduler needs of the scenarios: check that one exists and run it. |
| `ScenarioRunner.get` | `def get(self, scenario_id: str) -> object` | `custom_components/hass_test_data_creator/core/protocols.py` | Return the scenario or raise if it does not exist. |
| `ScenarioRunner.async_run` | `async def async_run(self, scenario_id: str) -> int` | `custom_components/hass_test_data_creator/core/protocols.py` | Run the scenario and return the number of actions it ran. |
| `GroupPublisher` | `class GroupPublisher(Protocol)` | `custom_components/hass_test_data_creator/core/protocols.py` | What the outputs need of the groups: drop groups and take devices out of the others. |
| `GroupPublisher.async_drop` | `async def async_drop(self, group_ids: list[str], device_ids: set[str]) -> None` | `custom_components/hass_test_data_creator/core/protocols.py` | Delete groups and remove `device_ids` from the remaining groups. |
| `HasReplies` | `class HasReplies(Protocol)` | `custom_components/hass_test_data_creator/core/protocols.py` | The runtime data as far as the command wrapper needs it: the reply and error factories. |
| `hass_test_data_creator.core.response_factory` | `module` | `custom_components/hass_test_data_creator/core/response_factory.py` | Factory for WebSocket replies (concept 13.2). |
| `ResponseFactory` | `class ResponseFactory` | `custom_components/hass_test_data_creator/core/response_factory.py` | Creates the result and error replies of the panel commands. |
| `ResponseFactory.result` | `def result(self, msg_id: int, payload: Any) -> dict[str, Any]` | `custom_components/hass_test_data_creator/core/response_factory.py` | Return the success reply with `payload`. |
| `ResponseFactory.error` | `def error(self, msg_id: int, error: TdcError) -> dict[str, Any]` | `custom_components/hass_test_data_creator/core/response_factory.py` | Return the error reply: the TDC code as error code, the translated text as message. |
| `hass_test_data_creator.core.targets` | `module` | `custom_components/hass_test_data_creator/core/targets.py` | What a schedule, a scenario step or a history import aims at: the target and its schema. |
| `device_references` | `def device_references(value: str \| list[str] \| None) -> set[str]` | `custom_components/hass_test_data_creator/core/targets.py` | Return the ids or names that the `device` part of a target names: one text or a list. |

## model

| Symbol | Signature | File | Description |
| --- | --- | --- | --- |
| `hass_test_data_creator.model.__init__` | `module` | `custom_components/hass_test_data_creator/model/__init__.py` | Model package of the HASS Test Data Creator. |
| `hass_test_data_creator.model.identifiers` | `module` | `custom_components/hass_test_data_creator/model/identifiers.py` | The names a generated device and its entities carry in Home Assistant and in MQTT discovery. |
| `mqtt_device_identifier` | `def mqtt_device_identifier(device_id: str) -> str` | `custom_components/hass_test_data_creator/model/identifiers.py` | Return the identifier of the registry device that MQTT discovery creates for `device_id`. |
| `mqtt_unique_id` | `def mqtt_unique_id(device_id: str, key: str) -> str` | `custom_components/hass_test_data_creator/model/identifiers.py` | Return the unique id of the MQTT entity of `key` of a device. |
| `entity_id_of` | `def entity_id_of(registry: er.EntityRegistry, device: DeviceDef, definition: EntityDef) -> str \| None` | `custom_components/hass_test_data_creator/model/identifiers.py` | Return the entity id of `definition` (native or MQTT unique id), or None if not registered. |
| `hass_test_data_creator.model.models` | `module` | `custom_components/hass_test_data_creator/model/models.py` | Data classes of devices, entities and creation runs (concept 4.1). |
| `_known` | `def _known(cls: type, data: dict[str, Any]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/model/models.py` | Return the items of `data` that are fields of `cls`; keys of another version are dropped. |
| `EntityDef` | `class EntityDef` | `custom_components/hass_test_data_creator/model/models.py` | Definition of one entity of a device. |
| `EntityDef.to_dict` | `def to_dict(self) -> dict[str, Any]` | `custom_components/hass_test_data_creator/model/models.py` | Return the JSON-serialisable form. |
| `EntityDef.from_dict` | `def from_dict(cls, data: dict[str, Any]) -> EntityDef` | `custom_components/hass_test_data_creator/model/models.py` | Return the entity definition stored in `data`. |
| `DeviceDef` | `class DeviceDef` | `custom_components/hass_test_data_creator/model/models.py` | One generated device with its entities. |
| `DeviceDef.to_dict` | `def to_dict(self) -> dict[str, Any]` | `custom_components/hass_test_data_creator/model/models.py` | Return the JSON-serialisable form. |
| `DeviceDef.from_dict` | `def from_dict(cls, data: dict[str, Any]) -> DeviceDef` | `custom_components/hass_test_data_creator/model/models.py` | Return the device stored in `data`. |
| `RunRecord` | `class RunRecord` | `custom_components/hass_test_data_creator/model/models.py` | One creation job; the unit of removal besides device and template. |
| `RunRecord.to_dict` | `def to_dict(self) -> dict[str, Any]` | `custom_components/hass_test_data_creator/model/models.py` | Return the JSON-serialisable form. |
| `RunRecord.from_dict` | `def from_dict(cls, data: dict[str, Any]) -> RunRecord` | `custom_components/hass_test_data_creator/model/models.py` | Return the run stored in `data`. |
| `ScheduleDef` | `class ScheduleDef` | `custom_components/hass_test_data_creator/model/models.py` | An action that runs on devices at times given by a trigger (concept 6). |
| `ScheduleDef.to_dict` | `def to_dict(self) -> dict[str, Any]` | `custom_components/hass_test_data_creator/model/models.py` | Return the JSON-serialisable form. |
| `ScheduleDef.from_dict` | `def from_dict(cls, data: dict[str, Any]) -> ScheduleDef` | `custom_components/hass_test_data_creator/model/models.py` | Return the schedule stored in `data`. |
| `ScenarioDef` | `class ScenarioDef` | `custom_components/hass_test_data_creator/model/models.py` | A named list of steps; each step runs an action `after_s` seconds after the step before. |
| `ScenarioDef.to_dict` | `def to_dict(self) -> dict[str, Any]` | `custom_components/hass_test_data_creator/model/models.py` | Return the JSON-serialisable form. |
| `ScenarioDef.from_dict` | `def from_dict(cls, data: dict[str, Any]) -> ScenarioDef` | `custom_components/hass_test_data_creator/model/models.py` | Return the scenario stored in `data`. |
| `GroupDef` | `class GroupDef` | `custom_components/hass_test_data_creator/model/models.py` | A named group of Zigbee2MQTT devices; `number` is the id Zigbee2MQTT shows. |
| `GroupDef.to_dict` | `def to_dict(self) -> dict[str, Any]` | `custom_components/hass_test_data_creator/model/models.py` | Return the JSON-serialisable form. |
| `GroupDef.from_dict` | `def from_dict(cls, data: dict[str, Any]) -> GroupDef` | `custom_components/hass_test_data_creator/model/models.py` | Return the group stored in `data`. |

## store

| Symbol | Signature | File | Description |
| --- | --- | --- | --- |
| `hass_test_data_creator.store.__init__` | `module` | `custom_components/hass_test_data_creator/store/__init__.py` | Store package of the HASS Test Data Creator. |
| `hass_test_data_creator.store.migrate` | `module` | `custom_components/hass_test_data_creator/store/migrate.py` | Migrates the stored data of older versions to the current layout (concept 4.3). |
| `_to_version_2` | `def _to_version_2(data: dict[str, Any]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/store/migrate.py` | Version 2 remembers when the time lapse began; older data has no such base. |
| `migrate` | `def migrate(version: int, data: dict[str, Any]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/store/migrate.py` | Return `data` of `version` in the layout of the current version, one step at a time. |
| `hass_test_data_creator.store.store` | `module` | `custom_components/hass_test_data_creator/store/store.py` | Persistent storage of devices, runs and markers (concept 4.3, 4.4). |
| `_empty` | `def _empty() -> dict[str, Any]` | `custom_components/hass_test_data_creator/store/store.py` | Return the content of a new store. |
| `_readable` | `def _readable(kind: str, entries: Any, read: Callable[[dict[str, Any]], object]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/store/store.py` | Return the entries that `read` accepts; an unreadable one is logged with its code and skipped. |
| `_Storage` | `class _Storage(Store[dict[str, Any]])` | `custom_components/hass_test_data_creator/store/store.py` | The storage file of the integration; older versions are migrated when they are loaded. |
| `_Storage._async_migrate_func` | `async def _async_migrate_func(self, old_major_version: int, old_minor_version: int, old_data: dict[str, Any]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/store/store.py` | Return the data of an older version in the current layout. |
| `TdcStore` | `class TdcStore` | `custom_components/hass_test_data_creator/store/store.py` | Holds the generated devices, the runs and the list of areas the integration created. |
| `TdcStore.__init__` | `def __init__(self, hass: HomeAssistant) -> None` | `custom_components/hass_test_data_creator/store/store.py` | Create the store; call `async_load` before use. |
| `TdcStore.async_load` | `async def async_load(self) -> None` | `custom_components/hass_test_data_creator/store/store.py` | Load the stored content, if any. |
| `TdcStore._snapshot` | `def _snapshot(self) -> dict[str, Any]` | `custom_components/hass_test_data_creator/store/store.py` | Return the content to write: the devices are serialised here, not on every change. |
| `TdcStore.devices` | `def devices(self) -> list[DeviceDef]` | `custom_components/hass_test_data_creator/store/store.py` | Return all stored devices in creation order; they are the working copy, so copy to edit. |
| `TdcStore.device` | `def device(self, device_id: str) -> DeviceDef \| None` | `custom_components/hass_test_data_creator/store/store.py` | Return the stored device with `device_id`, or None. |
| `TdcStore.device_id_of` | `def device_id_of(self, reference: str) -> str \| None` | `custom_components/hass_test_data_creator/store/store.py` | Return the id of the device whose id or name is `reference`. |
| `TdcStore.device_count` | `def device_count(self) -> int` | `custom_components/hass_test_data_creator/store/store.py` | Return the number of stored devices. |
| `TdcStore.add_device` | `def add_device(self, device: DeviceDef) -> None` | `custom_components/hass_test_data_creator/store/store.py` | Store `device`, replacing one with the same id. |
| `TdcStore.remove_device` | `def remove_device(self, device_id: str) -> None` | `custom_components/hass_test_data_creator/store/store.py` | Delete the device and its id in the run it belongs to. |
| `TdcStore.runs` | `def runs(self) -> list[RunRecord]` | `custom_components/hass_test_data_creator/store/store.py` | Return all runs. |
| `TdcStore.add_run` | `def add_run(self, run: RunRecord) -> None` | `custom_components/hass_test_data_creator/store/store.py` | Store `run`. |
| `TdcStore.schedules` | `def schedules(self) -> list[ScheduleDef]` | `custom_components/hass_test_data_creator/store/store.py` | Return all schedules in creation order. |
| `TdcStore.schedule_count` | `def schedule_count(self) -> int` | `custom_components/hass_test_data_creator/store/store.py` | Return the number of stored schedules. |
| `TdcStore.schedule` | `def schedule(self, schedule_id: str) -> ScheduleDef \| None` | `custom_components/hass_test_data_creator/store/store.py` | Return the schedule with `schedule_id`, or None. |
| `TdcStore.put_schedule` | `def put_schedule(self, schedule: ScheduleDef) -> None` | `custom_components/hass_test_data_creator/store/store.py` | Store `schedule`, replacing one with the same id. |
| `TdcStore.remove_schedule` | `def remove_schedule(self, schedule_id: str) -> None` | `custom_components/hass_test_data_creator/store/store.py` | Delete the schedule `schedule_id`. |
| `TdcStore.scenarios` | `def scenarios(self) -> list[ScenarioDef]` | `custom_components/hass_test_data_creator/store/store.py` | Return all scenarios in creation order. |
| `TdcStore.scenario_count` | `def scenario_count(self) -> int` | `custom_components/hass_test_data_creator/store/store.py` | Return the number of stored scenarios. |
| `TdcStore.scenario` | `def scenario(self, scenario_id: str) -> ScenarioDef \| None` | `custom_components/hass_test_data_creator/store/store.py` | Return the scenario with `scenario_id`, or None. |
| `TdcStore.put_scenario` | `def put_scenario(self, scenario: ScenarioDef) -> None` | `custom_components/hass_test_data_creator/store/store.py` | Store `scenario`, replacing one with the same id. |
| `TdcStore.remove_scenario` | `def remove_scenario(self, scenario_id: str) -> None` | `custom_components/hass_test_data_creator/store/store.py` | Delete the scenario `scenario_id`. |
| `TdcStore.groups` | `def groups(self) -> list[GroupDef]` | `custom_components/hass_test_data_creator/store/store.py` | Return all groups in creation order. |
| `TdcStore.group_count` | `def group_count(self) -> int` | `custom_components/hass_test_data_creator/store/store.py` | Return the number of stored groups. |
| `TdcStore.group` | `def group(self, group_id: str) -> GroupDef \| None` | `custom_components/hass_test_data_creator/store/store.py` | Return the group with `group_id`, or None. |
| `TdcStore.put_group` | `def put_group(self, group: GroupDef) -> None` | `custom_components/hass_test_data_creator/store/store.py` | Store `group`, replacing one with the same id. |
| `TdcStore.remove_group` | `def remove_group(self, group_id: str) -> None` | `custom_components/hass_test_data_creator/store/store.py` | Delete the group `group_id`. |
| `TdcStore.add_topic` | `def add_topic(self, topic: str, device_id: str \| None) -> bool` | `custom_components/hass_test_data_creator/store/store.py` | Record a retained MQTT topic and its device (None: shared); True if it was new. |
| `TdcStore.topics` | `def topics(self, device_ids: set[str] \| None=None) -> list[str]` | `custom_components/hass_test_data_creator/store/store.py` | Return the recorded topics: all, or those of the given devices. |
| `TdcStore.forget_topics` | `def forget_topics(self, topics: list[str]) -> None` | `custom_components/hass_test_data_creator/store/store.py` | Forget recorded topics, for example after their retained messages were deleted. |
| `TdcStore.add_statistic` | `def add_statistic(self, statistic_id: str, device_id: str) -> None` | `custom_components/hass_test_data_creator/store/store.py` | Record a statistic id the integration imported and the device it belongs to. |
| `TdcStore.statistics` | `def statistics(self, device_ids: set[str] \| None=None) -> list[str]` | `custom_components/hass_test_data_creator/store/store.py` | Return the imported statistic ids: all, or those of the given devices. |
| `TdcStore.forget_statistics` | `def forget_statistics(self, statistic_ids: list[str]) -> None` | `custom_components/hass_test_data_creator/store/store.py` | Forget imported statistic ids, for example after they were cleared. |
| `TdcStore.remove_run` | `def remove_run(self, run_id: str) -> None` | `custom_components/hass_test_data_creator/store/store.py` | Delete the run record `run_id`. |
| `TdcStore.next_index` | `def next_index(self, template_id: str, count: int) -> int` | `custom_components/hass_test_data_creator/store/store.py` | Reserve `count` device numbers of a template and return the first one (from 1). |
| `TdcStore.created_areas` | `def created_areas(self) -> list[str]` | `custom_components/hass_test_data_creator/store/store.py` | Return the ids of the areas the integration created itself. |
| `TdcStore.add_created_area` | `def add_created_area(self, area_id: str) -> None` | `custom_components/hass_test_data_creator/store/store.py` | Remember that the integration created the area. |
| `TdcStore.forget_area` | `def forget_area(self, area_id: str) -> None` | `custom_components/hass_test_data_creator/store/store.py` | Forget an area, for example after it was deleted. |
| `TdcStore.time_lapse_start` | `def time_lapse_start(self, factor: float, now: datetime) -> datetime` | `custom_components/hass_test_data_creator/store/store.py` | Return when the time lapse of `factor` began; a new factor begins at `now` and is kept. |
| `TdcStore.schedule_save` | `def schedule_save(self) -> None` | `custom_components/hass_test_data_creator/store/store.py` | Save after a short delay; used for frequent writes. |
| `TdcStore.async_save` | `async def async_save(self) -> None` | `custom_components/hass_test_data_creator/store/store.py` | Save at once; used for changes made by the user. |
| `TdcStore.async_remove` | `async def async_remove(self) -> None` | `custom_components/hass_test_data_creator/store/store.py` | Delete the storage file. |

## engine

| Symbol | Signature | File | Description |
| --- | --- | --- | --- |
| `hass_test_data_creator.engine.__init__` | `module` | `custom_components/hass_test_data_creator/engine/__init__.py` | Engine package of the HASS Test Data Creator. |
| `hass_test_data_creator.engine.behaviour_factory` | `module` | `custom_components/hass_test_data_creator/engine/behaviour_factory.py` | Factory that creates the behaviour per platform (concept 13.2). |
| `entity_seed` | `def entity_seed(device_seed: int, key: str) -> int` | `custom_components/hass_test_data_creator/engine/behaviour_factory.py` | Return the seed of one entity from the seed of its device and its key. |
| `BehaviourFactory` | `class BehaviourFactory` | `custom_components/hass_test_data_creator/engine/behaviour_factory.py` | Creates the behaviour for an entity definition. |
| `BehaviourFactory.__init__` | `def __init__(self, signals: SignalFactory, scheduler: Scheduler) -> None` | `custom_components/hass_test_data_creator/engine/behaviour_factory.py` | Keep the signal factory and the scheduler the behaviours use. |
| `BehaviourFactory.signal_for` | `def signal_for(self, device: DeviceDef, definition: EntityDef) -> Signal` | `custom_components/hass_test_data_creator/engine/behaviour_factory.py` | Return the signal of `definition` of `device`, with the seed and origin of the entity. |
| `BehaviourFactory.create` | `def create(self, device: DeviceDef, definition: EntityDef) -> Behaviour` | `custom_components/hass_test_data_creator/engine/behaviour_factory.py` | Return the behaviour for `definition` of `device`. |
| `hass_test_data_creator.engine.behaviours` | `module` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Behaviours: the state and logic of one generated entity, independent of any output (concept 2). |
| `Scheduler` | `class Scheduler(Protocol)` | `custom_components/hass_test_data_creator/engine/behaviours.py` | The clock and the timers of the output; the behaviours know nothing else about time. |
| `Scheduler.now` | `def now(self) -> float` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Return the signal time in seconds. |
| `Scheduler.at` | `def at(self, moment: datetime) -> float` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Return the signal time in seconds that belongs to the real `moment`. |
| `Scheduler.call_later` | `def call_later(self, delay_s: float, callback: Callable[[], None]) -> Cancel` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Run `callback` after `delay_s` seconds and return the function that cancels it. |
| `_ignore` | `def _ignore() -> None` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Do nothing; the default of the change callbacks. |
| `_ignore_event` | `def _ignore_event(event_type: str) -> None` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Do nothing with an event; the default of the event callback. |
| `Behaviour` | `class Behaviour` | `custom_components/hass_test_data_creator/engine/behaviours.py` | What every entity has: its place in a device, a fault and a callback for changes. |
| `Behaviour.__init__` | `def __init__(self, device_id: str, definition: EntityDef, scheduler: Scheduler) -> None` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Keep the ids, the definition and the scheduler. |
| `Behaviour.now` | `def now(self) -> float` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Return the current signal time in seconds. |
| `Behaviour.available` | `def available(self) -> bool` | `custom_components/hass_test_data_creator/engine/behaviours.py` | False while a fault makes the entity unavailable. |
| `Behaviour.fault_kind` | `def fault_kind(self) -> str \| None` | `custom_components/hass_test_data_creator/engine/behaviours.py` | The kind of the active fault, if there is one. |
| `Behaviour.message_delay_s` | `def message_delay_s(self) -> float` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Seconds that the messages of this entity are held back (fault late). |
| `Behaviour.message_repeats` | `def message_repeats(self) -> int` | `custom_components/hass_test_data_creator/engine/behaviours.py` | How many extra copies of every message are sent (fault duplicate). |
| `Behaviour.start_fault` | `def start_fault(self, fault: Fault) -> None` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Make `fault` active; it ends by itself after its duration and replaces a running one. |
| `Behaviour.tick` | `def tick(self, now: float) -> bool` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Follow the clock; True if the state changed. Most entities do not move by themselves. |
| `Behaviour.close` | `def close(self) -> None` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Cancel the timers and stop reporting; the behaviour is no longer used. |
| `Behaviour._end_fault` | `def _end_fault(self) -> None` | `custom_components/hass_test_data_creator/engine/behaviours.py` | End the active fault. |
| `Behaviour._clear_fault_timer` | `def _clear_fault_timer(self) -> None` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Cancel the timer that ends the active fault. |
| `Behaviour._fault_changed` | `def _fault_changed(self) -> None` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Apply the new fault (or its end) to the state; sensors recompute their value. |
| `SensorBehaviour` | `class SensorBehaviour(Behaviour)` | `custom_components/hass_test_data_creator/engine/behaviours.py` | A sensor whose value comes from a signal. |
| `SensorBehaviour.__init__` | `def __init__(self, device_id: str, definition: EntityDef, scheduler: Scheduler, signal: Signal) -> None` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Compute the first value at the current signal time. |
| `SensorBehaviour.tick` | `def tick(self, now: float) -> bool` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Compute a new value if the interval has passed and the sensor is not frozen. |
| `SensorBehaviour._value` | `def _value(self, now: float) -> float \| str` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Return the value of the signal at `now` with the transformation of an active fault. |
| `SensorBehaviour.replace_signal` | `def replace_signal(self, signal: Signal) -> None` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Follow another curve from now on and show its value at once, unless the sensor is frozen. |
| `SensorBehaviour._fault_changed` | `def _fault_changed(self) -> None` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Show the changed value at once, unless the sensor is frozen. |
| `OnOffBehaviour` | `class OnOffBehaviour(Behaviour)` | `custom_components/hass_test_data_creator/engine/behaviours.py` | An entity with an on/off state that survives a restart. |
| `OnOffBehaviour.__init__` | `def __init__(self, device_id: str, definition: EntityDef, scheduler: Scheduler) -> None` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Start in the initial state of the definition. |
| `OnOffBehaviour.restore` | `def restore(self, is_on: bool) -> None` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Set the last state without telling anyone. |
| `OnOffBehaviour.turn_on` | `def turn_on(self) -> None` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Switch on. |
| `OnOffBehaviour.turn_off` | `def turn_off(self) -> None` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Switch off. |
| `OnOffBehaviour.toggle` | `def toggle(self) -> None` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Switch to the other state. |
| `LightBehaviour` | `class LightBehaviour(OnOffBehaviour)` | `custom_components/hass_test_data_creator/engine/behaviours.py` | A dimmable light; the brightness is kept for the next time it is switched on. |
| `LightBehaviour.__init__` | `def __init__(self, device_id: str, definition: EntityDef, scheduler: Scheduler) -> None` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Start at full brightness. |
| `LightBehaviour.turn_on` | `def turn_on(self, brightness: int \| None=None) -> None` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Switch on, at `brightness` or the last one. |
| `BinarySensorBehaviour` | `class BinarySensorBehaviour(OnOffBehaviour)` | `custom_components/hass_test_data_creator/engine/behaviours.py` | A binary sensor that is set by actions; motion sensors switch off after a pulse. |
| `BinarySensorBehaviour.__init__` | `def __init__(self, device_id: str, definition: EntityDef, scheduler: Scheduler) -> None` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Start without a running pulse. |
| `BinarySensorBehaviour.close` | `def close(self) -> None` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Cancel a running pulse and the fault timer. |
| `BinarySensorBehaviour.set_state` | `def set_state(self, is_on: bool) -> None` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Set the state; a running pulse is cancelled. |
| `BinarySensorBehaviour.pulse` | `def pulse(self, seconds: float \| None) -> None` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Switch on and off again after `seconds` (default: the pulse of the template). |
| `BinarySensorBehaviour._end_pulse` | `def _end_pulse(self) -> None` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Switch off at the end of a pulse. |
| `BinarySensorBehaviour._clear_pulse` | `def _clear_pulse(self) -> None` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Cancel a running pulse timer. |
| `EventBehaviour` | `class EventBehaviour(Behaviour)` | `custom_components/hass_test_data_creator/engine/behaviours.py` | An entity that fires events, for example the buttons of a wall button. |
| `EventBehaviour.__init__` | `def __init__(self, device_id: str, definition: EntityDef, scheduler: Scheduler) -> None` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Keep the event types and start without a listener. |
| `EventBehaviour.press` | `def press(self, event_type: str) -> None` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Fire the event `event_type`. |
| `CoverBehaviour` | `class CoverBehaviour(Behaviour)` | `custom_components/hass_test_data_creator/engine/behaviours.py` | A cover that moves to a position at once; 100 is open, 0 is closed. |
| `CoverBehaviour.__init__` | `def __init__(self, device_id: str, definition: EntityDef, scheduler: Scheduler) -> None` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Start open if the definition says `initial_on`, otherwise closed. |
| `CoverBehaviour.is_closed` | `def is_closed(self) -> bool` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Whether the cover is fully closed. |
| `CoverBehaviour.restore` | `def restore(self, position: int) -> None` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Set the last position without telling anyone. |
| `CoverBehaviour.set_position` | `def set_position(self, position: int) -> None` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Move to `position` (0 to 100) at once. |
| `CoverBehaviour.open_cover` | `def open_cover(self) -> None` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Open fully. |
| `CoverBehaviour.close_cover` | `def close_cover(self) -> None` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Close fully. |
| `ClimateBehaviour` | `class ClimateBehaviour(Behaviour)` | `custom_components/hass_test_data_creator/engine/behaviours.py` | A thermostat: the measured temperature follows a signal, the target is set by actions. |
| `ClimateBehaviour.__init__` | `def __init__(self, device_id: str, definition: EntityDef, scheduler: Scheduler, signal: Signal) -> None` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Start in heat mode at the default target temperature. |
| `ClimateBehaviour.current_temperature` | `def current_temperature(self, now: float) -> float \| str` | `custom_components/hass_test_data_creator/engine/behaviours.py` | The measured temperature at signal time `now`. |
| `ClimateBehaviour.replace_signal` | `def replace_signal(self, signal: Signal) -> None` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Measure another curve from now on. |
| `ClimateBehaviour._measure` | `def _measure(self, now: float) -> float` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Return the measured temperature at `now`, rounded to what a thermostat reports. |
| `ClimateBehaviour.measured` | `def measured(self) -> float \| str` | `custom_components/hass_test_data_creator/engine/behaviours.py` | The measured temperature now. |
| `ClimateBehaviour.tick` | `def tick(self, now: float) -> bool` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Measure again; True only if the rounded temperature differs from the last one. |
| `ClimateBehaviour.restore` | `def restore(self, heating: bool, target: float \| None) -> None` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Set the last mode and target without telling anyone. |
| `ClimateBehaviour.update` | `def update(self, *, heating: bool \| None=None, target: float \| None=None) -> None` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Change the mode and the target together and report once. |
| `ClimateBehaviour.set_heating` | `def set_heating(self, heating: bool) -> None` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Switch between heat and off. |
| `ClimateBehaviour.set_target` | `def set_target(self, target: float) -> None` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Set the target temperature. |
| `ClimateBehaviour.turn_on` | `def turn_on(self) -> None` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Switch to heat. |
| `ClimateBehaviour.turn_off` | `def turn_off(self) -> None` | `custom_components/hass_test_data_creator/engine/behaviours.py` | Switch to off. |
| `hass_test_data_creator.engine.clock` | `module` | `custom_components/hass_test_data_creator/engine/clock.py` | The clock of the signals, with an optional time lapse (concept 5.1). |
| `Clock` | `class Clock` | `custom_components/hass_test_data_creator/engine/clock.py` | Maps real moments to signal time; from its start on, signal time runs `factor` times faster. |
| `Clock.__init__` | `def __init__(self, factor: float=1.0, start: datetime \| None=None) -> None` | `custom_components/hass_test_data_creator/engine/clock.py` | Start the clock at `start` (default: now); up to then signal time equals real time. |
| `Clock.resume` | `def resume(self, start: datetime) -> None` | `custom_components/hass_test_data_creator/engine/clock.py` | Continue a time lapse that began at `start`, for example before a restart. |
| `Clock.at` | `def at(self, moment: datetime) -> float` | `custom_components/hass_test_data_creator/engine/clock.py` | Return the signal time in seconds that belongs to the real `moment`. |
| `Clock.now` | `def now(self) -> float` | `custom_components/hass_test_data_creator/engine/clock.py` | Return the current signal time in seconds. |
| `hass_test_data_creator.engine.signal_factory` | `module` | `custom_components/hass_test_data_creator/engine/signal_factory.py` | Factory that creates a signal per shape (concept 13.2). |
| `Signal` | `class Signal` | `custom_components/hass_test_data_creator/engine/signal_factory.py` | A configured signal that returns its value for a point in time. |
| `Signal.__init__` | `def __init__(self, spec: SignalSpec) -> None` | `custom_components/hass_test_data_creator/engine/signal_factory.py` | Keep the validated spec. |
| `Signal.value` | `def value(self, t: float) -> float \| str` | `custom_components/hass_test_data_creator/engine/signal_factory.py` | Return the value or state at signal time `t` in seconds. |
| `TableSource` | `class TableSource(Protocol)` | `custom_components/hass_test_data_creator/engine/signal_factory.py` | Where the tables of csv signals come from. |
| `TableSource.table` | `def table(self, file: str, step_s: float) -> tuple[tuple[tuple[float, float], ...], float]` | `custom_components/hass_test_data_creator/engine/signal_factory.py` | Return the table of `(seconds, value)` points and the loop length of `file`. |
| `SignalFactory` | `class SignalFactory` | `custom_components/hass_test_data_creator/engine/signal_factory.py` | Creates validated signals from the signal block of a template. |
| `SignalFactory.__init__` | `def __init__(self, tables: TableSource \| None=None) -> None` | `custom_components/hass_test_data_creator/engine/signal_factory.py` | Keep the source of the tables of csv signals. |
| `SignalFactory.shapes` | `def shapes(self) -> tuple[str, ...]` | `custom_components/hass_test_data_creator/engine/signal_factory.py` | Return the names of all shapes. |
| `SignalFactory.create` | `def create(self, definition: dict[str, Any], seed: int, origin: float) -> Signal` | `custom_components/hass_test_data_creator/engine/signal_factory.py` | Return the signal for `definition` of one entity with its `seed` and time `origin`. |
| `hass_test_data_creator.engine.signals` | `module` | `custom_components/hass_test_data_creator/engine/signals.py` | Pure signal functions: the value of a signal is a function of time and seed (concept 5). |
| `SignalSpec` | `class SignalSpec` | `custom_components/hass_test_data_creator/engine/signals.py` | Parameters of one signal; `seed` and `origin` are set per entity. |
| `SignalSpec.from_dict` | `def from_dict(cls, data: dict[str, Any], seed: int, origin: float) -> SignalSpec` | `custom_components/hass_test_data_creator/engine/signals.py` | Return the spec of a template signal `data` for one entity. |
| `_cycle` | `def _cycle(spec: SignalSpec, t: float) -> float` | `custom_components/hass_test_data_creator/engine/signals.py` | Return the position inside one period in [0, 1) including the phase. |
| `_constant` | `def _constant(spec: SignalSpec, t: float) -> float` | `custom_components/hass_test_data_creator/engine/signals.py` | Return the middle of the range. |
| `_sine` | `def _sine(spec: SignalSpec, t: float) -> float` | `custom_components/hass_test_data_creator/engine/signals.py` | Return a sine wave between 0 and 1. |
| `_saw` | `def _saw(spec: SignalSpec, t: float) -> float` | `custom_components/hass_test_data_creator/engine/signals.py` | Return a rising saw tooth. |
| `_square` | `def _square(spec: SignalSpec, t: float) -> float` | `custom_components/hass_test_data_creator/engine/signals.py` | Return a square wave: high in the first half of the period. |
| `_triangle` | `def _triangle(spec: SignalSpec, t: float) -> float` | `custom_components/hass_test_data_creator/engine/signals.py` | Return a triangle wave. |
| `_noise` | `def _noise(spec: SignalSpec, t: float) -> float` | `custom_components/hass_test_data_creator/engine/signals.py` | Return white noise that changes every `interval_s` seconds. |
| `_smooth_noise` | `def _smooth_noise(seed: int, x: float) -> float` | `custom_components/hass_test_data_creator/engine/signals.py` | Return random points one unit apart, joined by a smooth curve. |
| `_random_walk` | `def _random_walk(spec: SignalSpec, t: float) -> float` | `custom_components/hass_test_data_creator/engine/signals.py` | Return smooth noise: random points one period apart, joined by a smooth curve. |
| `_hour_of_day` | `def _hour_of_day(t: float) -> float` | `custom_components/hass_test_data_creator/engine/signals.py` | Return the local hour of the day in [0, 24) for signal time `t`. |
| `_peak` | `def _peak(hour: float, centre: float, width: float) -> float` | `custom_components/hass_test_data_creator/engine/signals.py` | Return a bell curve around `centre` hours that wraps around midnight. |
| `_household_load` | `def _household_load(spec: SignalSpec, t: float) -> float` | `custom_components/hass_test_data_creator/engine/signals.py` | Return a household load: low at night, peaks in the morning, at noon and in the evening. |
| `_pv_day` | `def _pv_day(spec: SignalSpec, t: float) -> float` | `custom_components/hass_test_data_creator/engine/signals.py` | Return photovoltaic power: zero at night, a bell between sunrise and sunset, with clouds. |
| `_steps` | `def _steps(spec: SignalSpec, t: float) -> float` | `custom_components/hass_test_data_creator/engine/signals.py` | Return a rising staircase: steps of `interval_s` seconds, one climb per period. |
| `_discharge` | `def _discharge(spec: SignalSpec, t: float) -> float` | `custom_components/hass_test_data_creator/engine/signals.py` | Return a battery discharge: from full to empty over the period, steeper at the end. |
| `_enum` | `def _enum(spec: SignalSpec, t: float) -> str` | `custom_components/hass_test_data_creator/engine/signals.py` | Return a value drawn by weight; a new draw every `interval_s` seconds. |
| `_state_machine` | `def _state_machine(spec: SignalSpec, t: float) -> str` | `custom_components/hass_test_data_creator/engine/signals.py` | Return the state of a cycle of states with durations; `phase` shifts the start. |
| `options_of` | `def options_of(spec: SignalSpec) -> list[str]` | `custom_components/hass_test_data_creator/engine/signals.py` | Return the distinct states of a discrete signal in the order they are defined. |
| `has_invalid_states` | `def has_invalid_states(spec: SignalSpec) -> bool` | `custom_components/hass_test_data_creator/engine/signals.py` | Whether a discrete shape lacks its states or has a weight or duration that is not positive. |
| `_csv_value` | `def _csv_value(spec: SignalSpec, t: float) -> float` | `custom_components/hass_test_data_creator/engine/signals.py` | Return the replayed value: the table loops every `loop_s` seconds from the origin, joined linearly. |
| `value_at` | `def value_at(spec: SignalSpec, t: float) -> float \| str` | `custom_components/hass_test_data_creator/engine/signals.py` | Return the value at signal time `t` (seconds): a number scaled to min..max or a state name. |
| `hass_test_data_creator.engine.tick` | `module` | `custom_components/hass_test_data_creator/engine/tick.py` | The tick that drives all signals with one timer (concept 5.3). |
| `signal_time` | `def signal_time(now: datetime \| None=None) -> float` | `custom_components/hass_test_data_creator/engine/tick.py` | Return the signal time: seconds of the local wall clock, so daily curves follow the day. |
| `Tick` | `class Tick` | `custom_components/hass_test_data_creator/engine/tick.py` | Sends one dispatcher signal per interval and reports a tick that takes too long. |
| `Tick.__init__` | `def __init__(self, hass: HomeAssistant, seconds: int, now: Callable[[], float], on_slow: Callable[[float, float], None]) -> None` | `custom_components/hass_test_data_creator/engine/tick.py` | Keep the interval in seconds, the source of the signal time and `on_slow(duration, interval)`. |
| `Tick.start` | `def start(self) -> None` | `custom_components/hass_test_data_creator/engine/tick.py` | Start the timer. |
| `Tick.stop` | `def stop(self) -> None` | `custom_components/hass_test_data_creator/engine/tick.py` | Stop the timer. |
| `Tick._fire` | `def _fire(self, _now: datetime) -> None` | `custom_components/hass_test_data_creator/engine/tick.py` | Send the tick with the signal time, computed once; measure it to the end of the iteration. |
| `Tick._measure` | `def _measure(self, started: float) -> None` | `custom_components/hass_test_data_creator/engine/tick.py` | Warn when the tick took too long; warn again after a fast tick has passed in between. |

## templates

| Symbol | Signature | File | Description |
| --- | --- | --- | --- |
| `hass_test_data_creator.templates.__init__` | `module` | `custom_components/hass_test_data_creator/templates/__init__.py` | Templates package of the HASS Test Data Creator. |
| `hass_test_data_creator.templates.device_factory` | `module` | `custom_components/hass_test_data_creator/templates/device_factory.py` | Factory that creates the devices of one creation job (concept 13.2). |
| `format_name` | `def format_name(pattern: str, index: int, template: Template) -> str` | `custom_components/hass_test_data_creator/templates/device_factory.py` | Return the device name: `{n}`, `{nn}` (two digits) and `{template}` are replaced. |
| `device_seed` | `def device_seed(seed_text: str, template_id: str, index: int) -> int` | `custom_components/hass_test_data_creator/templates/device_factory.py` | Return the seed of one device; the same text, template and index give the same seed. |
| `DeviceFactory` | `class DeviceFactory` | `custom_components/hass_test_data_creator/templates/device_factory.py` | Creates device descriptions from a template and the inputs of a job. |
| `DeviceFactory.create` | `def create(self, template: Template, *, name_pattern: str, first_index: int, areas: list[str \| None], seed_text: str, run_id: str, output: str, now: float) -> list[DeviceDef]` | `custom_components/hass_test_data_creator/templates/device_factory.py` | Return one device per entry of `areas`, numbered from `first_index`. |
| `hass_test_data_creator.templates.factory` | `module` | `custom_components/hass_test_data_creator/templates/factory.py` | Factory that builds validated templates and entity definitions (concept 13.2). |
| `Template` | `class Template` | `custom_components/hass_test_data_creator/templates/factory.py` | A device type: its model name and the entities every device of it gets. |
| `Template.to_summary` | `def to_summary(self) -> dict[str, Any]` | `custom_components/hass_test_data_creator/templates/factory.py` | Return the description sent to the panel. |
| `Template.to_file` | `def to_file(self) -> dict[str, Any]` | `custom_components/hass_test_data_creator/templates/factory.py` | Return the content of the template file: only the fields that differ from the defaults. |
| `TemplateFactory` | `class TemplateFactory` | `custom_components/hass_test_data_creator/templates/factory.py` | Creates templates and entity definitions from plain dictionaries. |
| `TemplateFactory.entity` | `def entity(self, data: dict[str, Any]) -> EntityDef` | `custom_components/hass_test_data_creator/templates/factory.py` | Return the validated entity definition for `data`; fields that are `None` count as not set. |
| `TemplateFactory.with_signal` | `def with_signal(self, definition: EntityDef, signal: dict[str, Any]) -> EntityDef` | `custom_components/hass_test_data_creator/templates/factory.py` | Return a copy of `definition` that has `signal` as its curve. |
| `TemplateFactory.template` | `def template(self, data: dict[str, Any], *, bundled: bool=True) -> Template` | `custom_components/hass_test_data_creator/templates/factory.py` | Return the validated template for `data`. |
| `TemplateFactory.custom` | `def custom(self, entities: list[dict[str, Any]]) -> Template` | `custom_components/hass_test_data_creator/templates/factory.py` | Return a template for a device whose entities the user defined by hand. |
| `TemplateFactory._check_unique` | `def _check_unique(self, entities: list[EntityDef]) -> None` | `custom_components/hass_test_data_creator/templates/factory.py` | Raise if two entities of one template share a key. |
| `TemplateFactory._check_discrete` | `def _check_discrete(self, data: dict[str, Any], signal: dict[str, Any]) -> None` | `custom_components/hass_test_data_creator/templates/factory.py` | Check a sensor with states: valid states, no unit or state class, device class enum. |
| `TemplateFactory._check_content` | `def _check_content(self, data: dict[str, Any]) -> None` | `custom_components/hass_test_data_creator/templates/factory.py` | Check the rules that depend on the platform: signal, shape and device class. |
| `hass_test_data_creator.templates.registry` | `module` | `custom_components/hass_test_data_creator/templates/registry.py` | Loads the bundled and the user's template files (concept 4.2). |
| `_read_files` | `def _read_files(directory: Path) -> list[tuple[str, dict[str, Any]]]` | `custom_components/hass_test_data_creator/templates/registry.py` | Return (file name, content) of every YAML file in `directory`; runs in the executor. |
| `_read_user_files` | `def _read_user_files(directory: Path) -> list[tuple[str, dict[str, Any]]]` | `custom_components/hass_test_data_creator/templates/registry.py` | Return the usable user files; a link, a large or an unreadable file is skipped and logged. |
| `_write_file` | `def _write_file(path: Path, content: dict[str, Any]) -> None` | `custom_components/hass_test_data_creator/templates/registry.py` | Write `content` as YAML to `path` in one step, so that a crash leaves no half file. |
| `_remove_file` | `def _remove_file(path: Path) -> None` | `custom_components/hass_test_data_creator/templates/registry.py` | Delete the file at `path`; a file that is already gone is fine. |
| `TemplateRegistry` | `class TemplateRegistry` | `custom_components/hass_test_data_creator/templates/registry.py` | Holds all templates by id and saves and deletes the user's own ones. |
| `TemplateRegistry.__init__` | `def __init__(self, factory: TemplateFactory, audit: AuditLog, audit_factory: AuditEntryFactory) -> None` | `custom_components/hass_test_data_creator/templates/registry.py` | Create an empty registry that builds templates with `factory`. |
| `TemplateRegistry.async_load` | `async def async_load(self, hass: HomeAssistant) -> None` | `custom_components/hass_test_data_creator/templates/registry.py` | Load the bundled templates and then the user's; a user template can replace one. |
| `TemplateRegistry.get` | `def get(self, template_id: str) -> Template` | `custom_components/hass_test_data_creator/templates/registry.py` | Return the template with `template_id` or raise TPL_NOT_FOUND. |
| `TemplateRegistry.all` | `def all(self) -> list[Template]` | `custom_components/hass_test_data_creator/templates/registry.py` | Return all templates sorted by name. |
| `TemplateRegistry._user_file` | `def _user_file(self, hass: HomeAssistant, template_id: str) -> Path` | `custom_components/hass_test_data_creator/templates/registry.py` | Return the path of the file of the own template `template_id`. |
| `TemplateRegistry._check_changeable` | `def _check_changeable(self, template_id: str) -> None` | `custom_components/hass_test_data_creator/templates/registry.py` | Raise TPL_BUNDLED if `template_id` is a built-in template or the custom device. |
| `TemplateRegistry.async_save` | `async def async_save(self, hass: HomeAssistant, data: dict[str, Any]) -> Template` | `custom_components/hass_test_data_creator/templates/registry.py` | Validate `data`, write it as an own template (new or replaced) and return it. |
| `TemplateRegistry.async_delete` | `async def async_delete(self, hass: HomeAssistant, template_id: str) -> None` | `custom_components/hass_test_data_creator/templates/registry.py` | Delete the own template `template_id` and its file. |
| `TemplateRegistry._user_count` | `def _user_count(self) -> int` | `custom_components/hass_test_data_creator/templates/registry.py` | Return how many own templates there are. |
| `hass_test_data_creator.templates.schema` | `module` | `custom_components/hass_test_data_creator/templates/schema.py` | Voluptuous schemas of templates and custom entities (concept 4.2). |
| `_finite` | `def _finite(value: float) -> float` | `custom_components/hass_test_data_creator/templates/schema.py` | Return `value` as a finite number or raise `vol.Invalid`. |

## devices

| Symbol | Signature | File | Description |
| --- | --- | --- | --- |
| `hass_test_data_creator.devices.__init__` | `module` | `custom_components/hass_test_data_creator/devices/__init__.py` | Devices package of the HASS Test Data Creator. |
| `hass_test_data_creator.devices.manager` | `module` | `custom_components/hass_test_data_creator/devices/manager.py` | Creates devices for a creation job (concept 4.1, 12). |
| `CreationJob` | `class CreationJob` | `custom_components/hass_test_data_creator/devices/manager.py` | The inputs of one creation job. |
| `DevicesManager` | `class DevicesManager` | `custom_components/hass_test_data_creator/devices/manager.py` | Creates devices with their registry entries, areas and entities. |
| `DevicesManager.__init__` | `def __init__(self, store: TdcStore, templates: TemplateRegistry, template_factory: TemplateFactory, device_factory: DeviceFactory, outputs: OutputAdapterFactory, areas: AreaAssigner, audit: AuditLog, audit_factory: AuditEntryFactory) -> None` | `custom_components/hass_test_data_creator/devices/manager.py` | Keep the collaborators. |
| `DevicesManager.async_set_area` | `async def async_set_area(self, device_id: str, area: str \| None) -> DeviceDef` | `custom_components/hass_test_data_creator/devices/manager.py` | Put the device into the area `area` (created if new), or into none; return the device. |
| `DevicesManager._template_for` | `def _template_for(self, job: CreationJob) -> Template` | `custom_components/hass_test_data_creator/devices/manager.py` | Return the template of `job`: a stored one, or one built from its custom entities. |
| `DevicesManager._check_limits` | `def _check_limits(self, job: CreationJob, template: Template) -> None` | `custom_components/hass_test_data_creator/devices/manager.py` | Raise if the job exceeds a limit of concept 12. |
| `DevicesManager.async_create` | `async def async_create(self, job: CreationJob) -> RunRecord` | `custom_components/hass_test_data_creator/devices/manager.py` | Create the devices of `job` in chunks and return the run that holds them. |
| `DevicesManager.async_duplicate` | `async def async_duplicate(self, device_id: str, job: CreationJob) -> RunRecord` | `custom_components/hass_test_data_creator/devices/manager.py` | Create `job.count` copies of a device: same template, model, output, area and signals. |
| `DevicesManager._async_run` | `async def _async_run(self, job: CreationJob, template: Template, template_key: str) -> RunRecord` | `custom_components/hass_test_data_creator/devices/manager.py` | Create the devices of `job` from `template`; numbers and seeds count per `template_key`. |
| `hass_test_data_creator.devices.schema` | `module` | `custom_components/hass_test_data_creator/devices/schema.py` | Request fields of a creation job, shared by the service and the WebSocket command. |
| `job_from_request` | `def job_from_request(data: dict[str, Any], default_seed: str) -> CreationJob` | `custom_components/hass_test_data_creator/devices/schema.py` | Return the creation job for a validated request; `default_seed` is used without a seed. |
| `duplicate_job_from_request` | `def duplicate_job_from_request(data: dict[str, Any], default_seed: str) -> CreationJob` | `custom_components/hass_test_data_creator/devices/schema.py` | Return the job for copies of a device; template, output and entities come from the device. |
| `hass_test_data_creator.devices.signal_editor` | `module` | `custom_components/hass_test_data_creator/devices/signal_editor.py` | Changes the curve of a sensor of a generated device (concept 5). |
| `SignalEditor` | `class SignalEditor` | `custom_components/hass_test_data_creator/devices/signal_editor.py` | Replaces the signal of a stored entity and of its live behaviour. |
| `SignalEditor.__init__` | `def __init__(self, store: TdcStore, live: Live, behaviours: BehaviourFactory, templates: TemplateFactory, audit: AuditLog, audit_factory: AuditEntryFactory) -> None` | `custom_components/hass_test_data_creator/devices/signal_editor.py` | Keep the collaborators. |
| `SignalEditor.async_set` | `async def async_set(self, device_id: str, key: str, signal: dict[str, Any]) -> EntityDef` | `custom_components/hass_test_data_creator/devices/signal_editor.py` | Give entity `key` of the device the numeric signal `signal`; return the entity. |
| `hass_test_data_creator.devices.usage` | `module` | `custom_components/hass_test_data_creator/devices/usage.py` | Where a generated device is used: the schedules, scenarios and groups that name it (concept 10). |
| `UsageIndex` | `class UsageIndex` | `custom_components/hass_test_data_creator/devices/usage.py` | The users of devices, looked up by device id or name; build it once per request. |
| `UsageIndex.__init__` | `def __init__(self, store: TdcStore) -> None` | `custom_components/hass_test_data_creator/devices/usage.py` | Read the schedules, scenarios and groups once. |
| `UsageIndex._add` | `def _add(table: dict[str, list[tuple[int, dict[str, str]]]], references: set[str], position: int, item_id: str, name: str) -> None` | `custom_components/hass_test_data_creator/devices/usage.py` | Record that the item at `position` names each of `references`. |
| `UsageIndex.of` | `def of(self, device: DeviceDef) -> Usage` | `custom_components/hass_test_data_creator/devices/usage.py` | Return `{kind: [{id, name}]}` for the three kinds of user of `device`. |
| `UsageIndex._users` | `def _users(table: dict[str, list[tuple[int, dict[str, str]]]], *references: str) -> list[dict[str, str]]` | `custom_components/hass_test_data_creator/devices/usage.py` | Return the items that name one of `references`, once each, in creation order. |
| `DeviceUsage` | `class DeviceUsage` | `custom_components/hass_test_data_creator/devices/usage.py` | Finds the schedules, scenarios and groups that name a device itself. |
| `DeviceUsage.__init__` | `def __init__(self, store: TdcStore) -> None` | `custom_components/hass_test_data_creator/devices/usage.py` | Keep the store. |
| `DeviceUsage.index` | `def index(self) -> UsageIndex` | `custom_components/hass_test_data_creator/devices/usage.py` | Return the users of all devices, read once. |
| `DeviceUsage.of` | `def of(self, device: DeviceDef) -> Usage` | `custom_components/hass_test_data_creator/devices/usage.py` | Return `{kind: [{id, name}]}` for the three kinds of user of `device`. |
| `DeviceUsage.is_used` | `def is_used(usage: Usage) -> bool` | `custom_components/hass_test_data_creator/devices/usage.py` | Whether anything uses the device. |
| `hass_test_data_creator.devices.view` | `module` | `custom_components/hass_test_data_creator/devices/view.py` | What the panel shows of devices: pages with live states, one device in full, and light name lists. |
| `DeviceView` | `class DeviceView` | `custom_components/hass_test_data_creator/devices/view.py` | Builds the replies of the device commands from the store, the registry and the states. |
| `DeviceView.__init__` | `def __init__(self, hass: HomeAssistant, store: TdcStore, usage: DeviceUsage, live: Live) -> None` | `custom_components/hass_test_data_creator/devices/view.py` | Keep the collaborators. |
| `DeviceView.page` | `def page(self, offset: int, limit: int) -> dict[str, Any]` | `custom_components/hass_test_data_creator/devices/view.py` | Return `limit` devices from `offset` with the state of their entities and their users. |
| `DeviceView.one` | `def one(self, device_id: str) -> dict[str, Any]` | `custom_components/hass_test_data_creator/devices/view.py` | Return one device in full, including the signal of each entity. |
| `DeviceView.names` | `def names(self) -> list[dict[str, Any]]` | `custom_components/hass_test_data_creator/devices/view.py` | Return what pickers and run lists need of every device: entities with key, name, platform. |
| `DeviceView._device` | `def _device(self, device: DeviceDef, index: UsageIndex, *, with_signal: bool) -> dict[str, Any]` | `custom_components/hass_test_data_creator/devices/view.py` | Return the reply for one device. |
| `DeviceView._entity` | `def _entity(self, registry: er.EntityRegistry, device: DeviceDef, definition: EntityDef, *, with_signal: bool) -> dict[str, Any]` | `custom_components/hass_test_data_creator/devices/view.py` | Return key, entity id and current state of one entity; the signal only when asked. |

## areas

| Symbol | Signature | File | Description |
| --- | --- | --- | --- |
| `hass_test_data_creator.areas.__init__` | `module` | `custom_components/hass_test_data_creator/areas/__init__.py` | Areas package of the HASS Test Data Creator. |
| `hass_test_data_creator.areas.assigner` | `module` | `custom_components/hass_test_data_creator/areas/assigner.py` | Finds or creates areas and records the ones the integration created (concept 4.4). |
| `AreaAssigner` | `class AreaAssigner` | `custom_components/hass_test_data_creator/areas/assigner.py` | Resolves area names to area ids and cleans up the areas it created. |
| `AreaAssigner.__init__` | `def __init__(self, hass: HomeAssistant, store: TdcStore) -> None` | `custom_components/hass_test_data_creator/areas/assigner.py` | Keep the Home Assistant instance and the store with the list of created areas. |
| `AreaAssigner.ensure` | `def ensure(self, name: str) -> str` | `custom_components/hass_test_data_creator/areas/assigner.py` | Return the id of the area `name`; create it and remember it if it does not exist. |
| `AreaAssigner.move` | `def move(self, device: DeviceDef, name: str \| None) -> None` | `custom_components/hass_test_data_creator/areas/assigner.py` | Put the registry device of `device` into the area `name`, or into no area if None. |
| `AreaAssigner.delete_empty_created` | `def delete_empty_created(self) -> list[str]` | `custom_components/hass_test_data_creator/areas/assigner.py` | Delete the created areas that hold no device and no entity; return their names. |
| `hass_test_data_creator.areas.distribution` | `module` | `custom_components/hass_test_data_creator/areas/distribution.py` | Distribution of new devices over areas (concept 4.1, 7.2). |
| `distribute` | `def distribute(names: list[str], count: int, mode: str, seed: int) -> list[str \| None]` | `custom_components/hass_test_data_creator/areas/distribution.py` | Return an area name (or None without areas) for each of `count` devices. |

## outputs

| Symbol | Signature | File | Description |
| --- | --- | --- | --- |
| `hass_test_data_creator.outputs.__init__` | `module` | `custom_components/hass_test_data_creator/outputs/__init__.py` | Outputs package of the HASS Test Data Creator. |
| `hass_test_data_creator.outputs.adapter` | `module` | `custom_components/hass_test_data_creator/outputs/adapter.py` | Output adapters and their factory (concept 7.1, 13.2). |
| `OutputAdapterFactory` | `class OutputAdapterFactory` | `custom_components/hass_test_data_creator/outputs/adapter.py` | Creates the adapter for the output of a device. |
| `OutputAdapterFactory.__init__` | `def __init__(self, hass: HomeAssistant, entry: ConfigEntry, mqtt: MqttClient, devices: MqttDevices, z2m_devices: Z2mDevices, groups: GroupPublisher) -> None` | `custom_components/hass_test_data_creator/outputs/adapter.py` | Keep the instance, the config entry, the MQTT client and the runtimes of the outputs. |
| `OutputAdapterFactory.async_drop_groups` | `async def async_drop_groups(self, group_ids: list[str], device_ids: set[str]) -> None` | `custom_components/hass_test_data_creator/outputs/adapter.py` | Delete groups and take removed devices out of the other groups. |
| `OutputAdapterFactory.check_clearable` | `def check_clearable(self, topics: list[str]) -> None` | `custom_components/hass_test_data_creator/outputs/adapter.py` | Raise TDC-OUT-002 if there are topics to clear and MQTT is not usable. |
| `OutputAdapterFactory.async_clear_topics` | `async def async_clear_topics(self, topics: list[str]) -> None` | `custom_components/hass_test_data_creator/outputs/adapter.py` | Delete the retained messages on `topics`; raises TDC-OUT-002 if MQTT is not usable. |
| `OutputAdapterFactory.runtime_for` | `def runtime_for(self, output: str) -> BehaviourRuntime \| None` | `custom_components/hass_test_data_creator/outputs/adapter.py` | Return the runtime of an MQTT-based output, or None for the native output. |
| `OutputAdapterFactory.runtimes` | `def runtimes(self) -> dict[str, BehaviourRuntime]` | `custom_components/hass_test_data_creator/outputs/adapter.py` | Return the runtimes of all MQTT-based outputs by output name. |
| `OutputAdapterFactory.create` | `def create(self, output: str) -> OutputAdapter` | `custom_components/hass_test_data_creator/outputs/adapter.py` | Return the adapter for `output`; native, MQTT discovery or Zigbee2MQTT. |
| `hass_test_data_creator.outputs.base` | `module` | `custom_components/hass_test_data_creator/outputs/base.py` | The interface of an output adapter (concept 7.1). |
| `OutputAdapter` | `class OutputAdapter(ABC)` | `custom_components/hass_test_data_creator/outputs/base.py` | Turns a device description into Home Assistant objects or MQTT messages. |
| `OutputAdapter.create` | `async def create(self, device: DeviceDef, area_id: str \| None) -> None` | `custom_components/hass_test_data_creator/outputs/base.py` | Register `device` in its output; `area_id` is the resolved area, if any. |
| `OutputAdapter.announce` | `async def announce(self, devices: list[DeviceDef]) -> None` | `custom_components/hass_test_data_creator/outputs/base.py` | Make the entities of the registered `devices` appear. |
| `OutputAdapter.remove` | `async def remove(self, device: DeviceDef) -> None` | `custom_components/hass_test_data_creator/outputs/base.py` | Remove `device` and everything it created from its output. |
| `hass_test_data_creator.outputs.mqtt.__init__` | `module` | `custom_components/hass_test_data_creator/outputs/mqtt/__init__.py` | MQTT outputs of the HASS Test Data Creator (concept 7.3, 7.4). |
| `hass_test_data_creator.outputs.mqtt.adapter` | `module` | `custom_components/hass_test_data_creator/outputs/mqtt/adapter.py` | The adapter of the MQTT outputs: discovery and Zigbee2MQTT share it. |
| `MqttAdapter` | `class MqttAdapter(OutputAdapter)` | `custom_components/hass_test_data_creator/outputs/mqtt/adapter.py` | Hands the devices to the runtime of its output, which publishes their topics. |
| `MqttAdapter.__init__` | `def __init__(self, devices: BehaviourRuntime) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/adapter.py` | Keep the runtime of the output. |
| `MqttAdapter.create` | `async def create(self, device: DeviceDef, area_id: str \| None) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/adapter.py` | Check that the output may be used; the area travels as `suggested_area` in discovery. |
| `MqttAdapter.announce` | `async def announce(self, devices: list[DeviceDef]) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/adapter.py` | Start the devices and publish their topics. |
| `MqttAdapter.remove` | `async def remove(self, device: DeviceDef) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/adapter.py` | Stop the behaviours of the device; the removal deletes its retained topics. |
| `hass_test_data_creator.outputs.mqtt.client` | `module` | `custom_components/hass_test_data_creator/outputs/mqtt/client.py` | Access to the MQTT integration of the same instance: publish, subscribe, clean up (concept 7.3). |
| `MqttClient` | `class MqttClient` | `custom_components/hass_test_data_creator/outputs/mqtt/client.py` | Uses the broker of the MQTT integration and records every retained topic it publishes. |
| `MqttClient.__init__` | `def __init__(self, hass: HomeAssistant, store: TdcStore) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/client.py` | Keep the instance and the store that holds `published_topics`. |
| `MqttClient.available` | `def available(self) -> bool` | `custom_components/hass_test_data_creator/outputs/mqtt/client.py` | Whether the MQTT integration is set up and connected to its broker. |
| `MqttClient.async_wait` | `async def async_wait(self) -> bool` | `custom_components/hass_test_data_creator/outputs/mqtt/client.py` | Wait until the MQTT integration is connected; False if it is not set up. |
| `MqttClient.async_foreign_topic` | `async def async_foreign_topic(self, base: str, *, long: bool=False) -> str \| None` | `custom_components/hass_test_data_creator/outputs/mqtt/client.py` | Return a retained topic under `base` that this integration did not publish, if one shows up. |
| `MqttClient.async_foreign_topic.received` | `def received(message: mqtt.ReceiveMessage) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/client.py` | Take the first retained message of a topic that is not ours. |
| `MqttClient.async_collect` | `async def async_collect(self, patterns: list[str]) -> set[str]` | `custom_components/hass_test_data_creator/outputs/mqtt/client.py` | Return the retained topics that match `patterns` and show up within `SCAN_SECONDS`. |
| `MqttClient.async_collect.received` | `def received(message: mqtt.ReceiveMessage) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/client.py` | Note the topic of a retained message that is not empty. |
| `MqttClient.async_publish` | `async def async_publish(self, topic: str, payload: str, *, retain: bool=True, device_id: str \| None=None) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/client.py` | Publish `payload`; a retained topic is recorded for `device_id` (None: shared topics). |
| `MqttClient.async_subscribe` | `async def async_subscribe(self, topic: str, callback: MESSAGE_CALLBACK) -> Callable[[], None]` | `custom_components/hass_test_data_creator/outputs/mqtt/client.py` | Call `callback(topic, payload)` for every message on `topic`; return the unsubscribe. |
| `MqttClient.async_subscribe.received` | `def received(message: mqtt.ReceiveMessage) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/client.py` | Pass topic and text payload on, on the event loop. |
| `MqttClient.async_clear` | `async def async_clear(self, topics: list[str]) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/client.py` | Delete the retained messages on `topics` and forget the topics. |
| `MqttClient.require` | `def require(self) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/client.py` | Raise TDC-OUT-002 unless MQTT is set up and connected. |
| `hass_test_data_creator.outputs.mqtt.devices` | `module` | `custom_components/hass_test_data_creator/outputs/mqtt/devices.py` | The devices of the MQTT discovery output: discovery, states and commands (concept 7.3). |
| `_Entry` | `class _Entry(RuntimeEntry)` | `custom_components/hass_test_data_creator/outputs/mqtt/devices.py` | One entity published over MQTT discovery: its profile and topics. |
| `_Entry.__init__` | `def __init__(self, device: DeviceDef, definition: EntityDef, behaviour: Behaviour, profile: MqttProfile, base: str) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/devices.py` | Keep the profile and build the topics. |
| `MqttDevices` | `class MqttDevices(BehaviourRuntime)` | `custom_components/hass_test_data_creator/outputs/mqtt/devices.py` | Runs the behaviours of the devices with the output `mqtt` and talks to the broker for them. |
| `MqttDevices.__init__` | `def __init__(self, parts: RuntimeParts, profiles: MqttProfileFactory, base_topic: str) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/devices.py` | Keep the profiles and the base topic. |
| `MqttDevices._make_entry` | `def _make_entry(self, device: DeviceDef, definition: EntityDef, behaviour: Behaviour) -> RuntimeEntry` | `custom_components/hass_test_data_creator/outputs/mqtt/devices.py` | Return the entry with the profile of the platform. |
| `MqttDevices._wire` | `def _wire(self, entry: RuntimeEntry) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/devices.py` | Let the profile publish events of the behaviour without retain. |
| `MqttDevices._command_pattern` | `def _command_pattern(self) -> str` | `custom_components/hass_test_data_creator/outputs/mqtt/devices.py` | Return the filter for `<base>/<device>/<key>/<facet>/set`. |
| `MqttDevices._on_message` | `def _on_message(self, topic: str, payload: str) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/devices.py` | Apply a command received on `<base>/<device>/<key>/<facet>/set`. |
| `MqttDevices._async_announce` | `async def _async_announce(self, added: list[RuntimeEntry], devices: list[DeviceDef]) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/devices.py` | Publish the discovery config, availability and states of the started entities. |
| `MqttDevices._async_changed` | `async def _async_changed(self, entry: RuntimeEntry) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/devices.py` | Publish availability and every state of an entity. |
| `MqttDevices._async_offline` | `async def _async_offline(self, entries: list[RuntimeEntry]) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/devices.py` | Mark the entities offline. |
| `MqttDevices._async_send` | `async def _async_send(self, entry: _Entry, facet: str, payload: str, *, retain: bool=True) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/devices.py` | Publish `payload` on the topic of `facet`. |
| `MqttDevices._mqtt` | `def _mqtt(self, entry: RuntimeEntry) -> _Entry` | `custom_components/hass_test_data_creator/outputs/mqtt/devices.py` | Return the entry as one of this output. |
| `hass_test_data_creator.outputs.mqtt.labels` | `module` | `custom_components/hass_test_data_creator/outputs/mqtt/labels.py` | Puts the label "test data" on the devices that MQTT discovery creates for generated devices. |
| `MqttLabeler` | `class MqttLabeler` | `custom_components/hass_test_data_creator/outputs/mqtt/labels.py` | Home Assistant creates the registry device of an MQTT entity; this adds the label to it. |
| `MqttLabeler.__init__` | `def __init__(self, hass: HomeAssistant) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/labels.py` | Keep the instance. |
| `MqttLabeler.start` | `def start(self) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/labels.py` | Label the devices that exist and every device that is created from now on. |
| `MqttLabeler.stop` | `def stop(self) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/labels.py` | Stop following the device registry. |
| `MqttLabeler._on_registry_update` | `def _on_registry_update(self, event: Event[dr.EventDeviceRegistryUpdatedData]) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/labels.py` | Label a device that was just created. |
| `MqttLabeler._label` | `def _label(self, entry: dr.DeviceEntry) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/labels.py` | Add the label to `entry` if MQTT discovery created it for a generated device. |
| `hass_test_data_creator.outputs.mqtt.profiles` | `module` | `custom_components/hass_test_data_creator/outputs/mqtt/profiles.py` | How each platform looks over MQTT discovery: config, states and commands (concept 7.3). |
| `Topics` | `class Topics` | `custom_components/hass_test_data_creator/outputs/mqtt/profiles.py` | The topics of one entity below the base topic: `<base>/<device>/<key>/<facet>[/set]`. |
| `Topics.facet` | `def facet(self, name: str, *, command: bool=False) -> str` | `custom_components/hass_test_data_creator/outputs/mqtt/profiles.py` | Return the state topic of `name`, or its command topic. |
| `MqttProfile` | `class MqttProfile(ABC)` | `custom_components/hass_test_data_creator/outputs/mqtt/profiles.py` | What one platform publishes and accepts; created only by the MqttProfileFactory. |
| `MqttProfile.config` | `def config(self, topics: Topics, device: DeviceDef, definition: EntityDef) -> dict[str, Any]` | `custom_components/hass_test_data_creator/outputs/mqtt/profiles.py` | Return the discovery payload: the common part plus what the platform adds. |
| `MqttProfile.platform_fields` | `def platform_fields(self, topics: Topics, definition: EntityDef) -> dict[str, Any]` | `custom_components/hass_test_data_creator/outputs/mqtt/profiles.py` | Return the platform specific part of the discovery payload. |
| `MqttProfile.states` | `def states(self, behaviour: Any) -> dict[str, str]` | `custom_components/hass_test_data_creator/outputs/mqtt/profiles.py` | Return the payload of every state facet of the behaviour. |
| `MqttProfile.command` | `def command(self, behaviour: Any, facet: str, payload: str) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/profiles.py` | Apply a command received on `<facet>/set`; platforms without commands ignore it. |
| `MqttProfile.attach` | `def attach(self, behaviour: Behaviour, send: Send) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/profiles.py` | Let the behaviour publish things that are not states (events); `send(facet, payload)`. |
| `SensorProfile` | `class SensorProfile(MqttProfile)` | `custom_components/hass_test_data_creator/outputs/mqtt/profiles.py` | A sensor: one state, a number or a state name. |
| `SensorProfile.platform_fields` | `def platform_fields(self, topics: Topics, definition: EntityDef) -> dict[str, Any]` | `custom_components/hass_test_data_creator/outputs/mqtt/profiles.py` | Return the state topic, unit and state class. |
| `SensorProfile.config` | `def config(self, topics: Topics, device: DeviceDef, definition: EntityDef) -> dict[str, Any]` | `custom_components/hass_test_data_creator/outputs/mqtt/profiles.py` | Add the options of a sensor with states. |
| `SensorProfile.states` | `def states(self, behaviour: SensorBehaviour) -> dict[str, str]` | `custom_components/hass_test_data_creator/outputs/mqtt/profiles.py` | Return the current value. |
| `_options` | `def _options(definition: EntityDef) -> list[str]` | `custom_components/hass_test_data_creator/outputs/mqtt/profiles.py` | Return the states of a sensor with a discrete signal, or an empty list. |
| `BinarySensorProfile` | `class BinarySensorProfile(MqttProfile)` | `custom_components/hass_test_data_creator/outputs/mqtt/profiles.py` | A binary sensor: ON or OFF. |
| `BinarySensorProfile.platform_fields` | `def platform_fields(self, topics: Topics, definition: EntityDef) -> dict[str, Any]` | `custom_components/hass_test_data_creator/outputs/mqtt/profiles.py` | Return the state topic and the payloads. |
| `BinarySensorProfile.states` | `def states(self, behaviour: BinarySensorBehaviour) -> dict[str, str]` | `custom_components/hass_test_data_creator/outputs/mqtt/profiles.py` | Return ON or OFF. |
| `SwitchProfile` | `class SwitchProfile(MqttProfile)` | `custom_components/hass_test_data_creator/outputs/mqtt/profiles.py` | A switch: ON or OFF, set by the same payloads. |
| `SwitchProfile.platform_fields` | `def platform_fields(self, topics: Topics, definition: EntityDef) -> dict[str, Any]` | `custom_components/hass_test_data_creator/outputs/mqtt/profiles.py` | Return the state and command topics. |
| `SwitchProfile.states` | `def states(self, behaviour: OnOffBehaviour) -> dict[str, str]` | `custom_components/hass_test_data_creator/outputs/mqtt/profiles.py` | Return ON or OFF. |
| `SwitchProfile.command` | `def command(self, behaviour: OnOffBehaviour, facet: str, payload: str) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/profiles.py` | Switch on or off. |
| `LightProfile` | `class LightProfile(MqttProfile)` | `custom_components/hass_test_data_creator/outputs/mqtt/profiles.py` | A dimmable light with the JSON schema. |
| `LightProfile.platform_fields` | `def platform_fields(self, topics: Topics, definition: EntityDef) -> dict[str, Any]` | `custom_components/hass_test_data_creator/outputs/mqtt/profiles.py` | Return the JSON schema with brightness. |
| `LightProfile.states` | `def states(self, behaviour: LightBehaviour) -> dict[str, str]` | `custom_components/hass_test_data_creator/outputs/mqtt/profiles.py` | Return state, brightness and color mode as JSON. |
| `LightProfile.command` | `def command(self, behaviour: LightBehaviour, facet: str, payload: str) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/profiles.py` | Apply a JSON command with `state` and optionally `brightness`. |
| `CoverProfile` | `class CoverProfile(MqttProfile)` | `custom_components/hass_test_data_creator/outputs/mqtt/profiles.py` | A cover with a position; open and close are commands. |
| `CoverProfile.platform_fields` | `def platform_fields(self, topics: Topics, definition: EntityDef) -> dict[str, Any]` | `custom_components/hass_test_data_creator/outputs/mqtt/profiles.py` | Return the position, command and set position topics. |
| `CoverProfile.states` | `def states(self, behaviour: CoverBehaviour) -> dict[str, str]` | `custom_components/hass_test_data_creator/outputs/mqtt/profiles.py` | Return the position. |
| `CoverProfile.command` | `def command(self, behaviour: CoverBehaviour, facet: str, payload: str) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/profiles.py` | Open, close or move to a position. |
| `ClimateProfile` | `class ClimateProfile(MqttProfile)` | `custom_components/hass_test_data_creator/outputs/mqtt/profiles.py` | A thermostat with off and heat. |
| `ClimateProfile.platform_fields` | `def platform_fields(self, topics: Topics, definition: EntityDef) -> dict[str, Any]` | `custom_components/hass_test_data_creator/outputs/mqtt/profiles.py` | Return the topics of mode, target and measured temperature. |
| `ClimateProfile.states` | `def states(self, behaviour: ClimateBehaviour) -> dict[str, str]` | `custom_components/hass_test_data_creator/outputs/mqtt/profiles.py` | Return mode, target and measured temperature. |
| `ClimateProfile.command` | `def command(self, behaviour: ClimateBehaviour, facet: str, payload: str) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/profiles.py` | Set the mode or the target temperature. |
| `EventProfile` | `class EventProfile(MqttProfile)` | `custom_components/hass_test_data_creator/outputs/mqtt/profiles.py` | An event entity: events are published as JSON and are not retained. |
| `EventProfile.platform_fields` | `def platform_fields(self, topics: Topics, definition: EntityDef) -> dict[str, Any]` | `custom_components/hass_test_data_creator/outputs/mqtt/profiles.py` | Return the event topic and the event types. |
| `EventProfile.states` | `def states(self, behaviour: EventBehaviour) -> dict[str, str]` | `custom_components/hass_test_data_creator/outputs/mqtt/profiles.py` | Events have no state to publish. |
| `EventProfile.attach` | `def attach(self, behaviour: Behaviour, send: Send) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/profiles.py` | Publish every event of the behaviour as `{"event_type": ...}`. |
| `MqttProfileFactory` | `class MqttProfileFactory(ProfileFactory[MqttProfile])` | `custom_components/hass_test_data_creator/outputs/mqtt/profiles.py` | Creates the MQTT profile for a platform. |
| `MqttProfileFactory.__init__` | `def __init__(self) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/profiles.py` | Use the table of this output. |
| `hass_test_data_creator.outputs.mqtt.runtime` | `module` | `custom_components/hass_test_data_creator/outputs/mqtt/runtime.py` | Base of the MQTT outputs: runs the behaviours of their devices and publishes for them. |
| `RuntimeEntry` | `class RuntimeEntry` | `custom_components/hass_test_data_creator/outputs/mqtt/runtime.py` | One entity of an MQTT output: its device, definition and behaviour. |
| `RuntimeEntry.__init__` | `def __init__(self, device: DeviceDef, definition: EntityDef, behaviour: Behaviour) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/runtime.py` | Keep the parts. |
| `RuntimeParts` | `class RuntimeParts` | `custom_components/hass_test_data_creator/outputs/mqtt/runtime.py` | What every MQTT output needs: the instance, the client, the factories and the audit log. |
| `BehaviourRuntime` | `class BehaviourRuntime(ABC)` | `custom_components/hass_test_data_creator/outputs/mqtt/runtime.py` | Starts the behaviours of devices, follows the tick and calls the output to publish. |
| `BehaviourRuntime.__init__` | `def __init__(self, parts: RuntimeParts) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/runtime.py` | Keep the parts. |
| `BehaviourRuntime.require_connection` | `def require_connection(self) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/runtime.py` | Raise TDC-OUT-002 unless MQTT is usable. |
| `BehaviourRuntime.async_check` | `async def async_check(self) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/runtime.py` | Raise unless the output may be used now; the default is a usable MQTT connection. |
| `BehaviourRuntime.check_device` | `def check_device(self, device: DeviceDef) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/runtime.py` | Raise if `device` cannot be published by this output; the default accepts every device. |
| `BehaviourRuntime.async_start` | `async def async_start(self, devices: list[DeviceDef]) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/runtime.py` | Start the stored devices after a restart once MQTT is connected. |
| `BehaviourRuntime.async_add` | `async def async_add(self, devices: list[DeviceDef]) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/runtime.py` | Start the behaviours of `devices` and publish what the output publishes at the start. |
| `BehaviourRuntime.async_remove` | `async def async_remove(self, device: DeviceDef) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/runtime.py` | Stop the behaviours of `device`; the removal deletes its retained topics. |
| `BehaviourRuntime.async_stop` | `async def async_stop(self) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/runtime.py` | Mark everything offline, stop the behaviours and stop listening. |
| `BehaviourRuntime._make_entry` | `def _make_entry(self, device: DeviceDef, definition: EntityDef, behaviour: Behaviour) -> RuntimeEntry` | `custom_components/hass_test_data_creator/outputs/mqtt/runtime.py` | Return the entry of an entity, with what the output needs besides the behaviour. |
| `BehaviourRuntime._command_pattern` | `def _command_pattern(self) -> str` | `custom_components/hass_test_data_creator/outputs/mqtt/runtime.py` | Return the topic filter that receives every command of this output. |
| `BehaviourRuntime._on_message` | `def _on_message(self, topic: str, payload: str) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/runtime.py` | Apply a command message (runs on the event loop). |
| `BehaviourRuntime._async_announce` | `async def _async_announce(self, added: list[RuntimeEntry], devices: list[DeviceDef]) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/runtime.py` | Publish discovery, availability and states of the entities that were just started. |
| `BehaviourRuntime._async_changed` | `async def _async_changed(self, entry: RuntimeEntry) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/runtime.py` | Publish what changed on an entity. |
| `BehaviourRuntime._async_offline` | `async def _async_offline(self, entries: list[RuntimeEntry]) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/runtime.py` | Mark the entities offline. |
| `BehaviourRuntime._wire` | `def _wire(self, entry: RuntimeEntry) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/runtime.py` | Connect the events of the behaviour to the output, if the platform has any. |
| `BehaviourRuntime._async_prepare` | `async def _async_prepare(self) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/runtime.py` | Check or publish what has to be in place before devices start; default: nothing. |
| `BehaviourRuntime._async_removed` | `async def _async_removed(self, device: DeviceDef) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/runtime.py` | Update shared topics after a device was removed; default: nothing. |
| `BehaviourRuntime._start` | `def _start(self, device: DeviceDef, definition: EntityDef) -> RuntimeEntry` | `custom_components/hass_test_data_creator/outputs/mqtt/runtime.py` | Create the behaviour of one entity and connect it to MQTT. |
| `BehaviourRuntime._schedule` | `def _schedule(self, work: Any) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/runtime.py` | Run `work` on the event loop without waiting for it. |
| `BehaviourRuntime._device_entries` | `def _device_entries(self, device_id: str) -> list[RuntimeEntry]` | `custom_components/hass_test_data_creator/outputs/mqtt/runtime.py` | Return the started entries of one device without scanning the others. |
| `BehaviourRuntime._async_listen` | `async def _async_listen(self) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/runtime.py` | Subscribe to the commands and follow the tick, once. |
| `BehaviourRuntime._stop_listening` | `def _stop_listening(self) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/runtime.py` | Cancel the subscription and the tick. |
| `BehaviourRuntime._on_tick` | `def _on_tick(self, now: float) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/runtime.py` | Publish the entities whose value changed, from one task for the whole tick. |
| `BehaviourRuntime._async_changed_many` | `async def _async_changed_many(self, entries: list[RuntimeEntry]) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/runtime.py` | Publish what changed on several entities; the default publishes them one after another. |
| `BehaviourRuntime._async_deliver` | `async def _async_deliver(self, behaviours: list[Behaviour], topic: str, payload: str, device_id: str, *, retain: bool=True) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/runtime.py` | Publish a state or an event, held back by a late fault and repeated by a duplicate one. |
| `BehaviourRuntime._async_deliver.fire` | `def fire(_now: datetime) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/runtime.py` | Send the held back message. |
| `BehaviourRuntime._async_copies` | `async def _async_copies(self, topic: str, payload: str, device_id: str, copies: int, retain: bool) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/runtime.py` | Publish the same message `copies` times. |
| `BehaviourRuntime._cancel_late` | `def _cancel_late(self, device_id: str) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/runtime.py` | Drop the messages of a device that are still held back. |
| `BehaviourRuntime._async_publish` | `async def _async_publish(self, topic: str, payload: str, device_id: str \| None, *, retain: bool=True) -> None` | `custom_components/hass_test_data_creator/outputs/mqtt/runtime.py` | Publish; a failure while the system runs is logged and does not stop the rest. |
| `hass_test_data_creator.outputs.native.__init__` | `module` | `custom_components/hass_test_data_creator/outputs/native/__init__.py` | Native package of the HASS Test Data Creator. |
| `hass_test_data_creator.outputs.native.adapter` | `module` | `custom_components/hass_test_data_creator/outputs/native/adapter.py` | Native output: devices in the registry and entities on the Home Assistant platforms. |
| `NativeAdapter` | `class NativeAdapter(OutputAdapter)` | `custom_components/hass_test_data_creator/outputs/native/adapter.py` | Registers devices with markers (concept 4.4) and lets the platforms add the entities. |
| `NativeAdapter.__init__` | `def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None` | `custom_components/hass_test_data_creator/outputs/native/adapter.py` | Keep the instance and the config entry that owns the devices. |
| `NativeAdapter.create` | `async def create(self, device: DeviceDef, area_id: str \| None) -> None` | `custom_components/hass_test_data_creator/outputs/native/adapter.py` | Add `device` to the device registry with the entry, manufacturer and test label. |
| `NativeAdapter.announce` | `async def announce(self, devices: list[DeviceDef]) -> None` | `custom_components/hass_test_data_creator/outputs/native/adapter.py` | Tell the platforms to add the entities of `devices`. |
| `NativeAdapter.remove` | `async def remove(self, device: DeviceDef) -> None` | `custom_components/hass_test_data_creator/outputs/native/adapter.py` | Remove the registry device of `device`; Home Assistant removes its entities. |
| `hass_test_data_creator.outputs.profile_factory` | `module` | `custom_components/hass_test_data_creator/outputs/profile_factory.py` | Generic factory for the per-platform profiles of an MQTT output (concept 13.2). |
| `ProfileFactory` | `class ProfileFactory` | `custom_components/hass_test_data_creator/outputs/profile_factory.py` | Creates the profile of a platform from a table of profile classes. |
| `ProfileFactory.__init__` | `def __init__(self, profiles: dict[str, type[T]]) -> None` | `custom_components/hass_test_data_creator/outputs/profile_factory.py` | Keep the table of profile classes by platform. |
| `ProfileFactory.create` | `def create(self, platform: str) -> T` | `custom_components/hass_test_data_creator/outputs/profile_factory.py` | Return the profile of `platform` or raise TDC-OUT-001. |
| `hass_test_data_creator.outputs.z2m.__init__` | `module` | `custom_components/hass_test_data_creator/outputs/z2m/__init__.py` | Zigbee2MQTT emulation of the HASS Test Data Creator (concept 7.4). |
| `hass_test_data_creator.outputs.z2m.devices` | `module` | `custom_components/hass_test_data_creator/outputs/z2m/devices.py` | The devices of the Zigbee2MQTT output: bridge topics, device states and commands (concept 7.4). |
| `Z2mSettings` | `class Z2mSettings` | `custom_components/hass_test_data_creator/outputs/z2m/devices.py` | The options of the Zigbee2MQTT output. |
| `_Entry` | `class _Entry(RuntimeEntry)` | `custom_components/hass_test_data_creator/outputs/z2m/devices.py` | One entity published in the Zigbee2MQTT format: its profile. |
| `_Entry.__init__` | `def __init__(self, device: DeviceDef, definition: EntityDef, behaviour: Behaviour, profile: Z2mProfile) -> None` | `custom_components/hass_test_data_creator/outputs/z2m/devices.py` | Keep the profile. |
| `Z2mDevices` | `class Z2mDevices(BehaviourRuntime)` | `custom_components/hass_test_data_creator/outputs/z2m/devices.py` | Behaves like a Zigbee2MQTT bridge for the devices with the output `z2m`. |
| `Z2mDevices.__init__` | `def __init__(self, parts: RuntimeParts, profiles: Z2mProfileFactory, payloads: Z2mPayloadFactory, templates: TemplateRegistry, settings: Z2mSettings, store: TdcStore) -> None` | `custom_components/hass_test_data_creator/outputs/z2m/devices.py` | Keep the factories, the template registry, the settings and the store. |
| `Z2mDevices.set_groups` | `def set_groups(self, groups: list[GroupDef]) -> None` | `custom_components/hass_test_data_creator/outputs/z2m/devices.py` | Hand over the stored groups; they are published when the devices start. |
| `Z2mDevices.async_groups_changed` | `async def async_groups_changed(self, groups: list[GroupDef]) -> None` | `custom_components/hass_test_data_creator/outputs/z2m/devices.py` | Publish the groups after one was added, removed or lost a member. |
| `Z2mDevices.check_device` | `def check_device(self, device: DeviceDef) -> None` | `custom_components/hass_test_data_creator/outputs/z2m/devices.py` | Raise TDC-OUT-007 unless the name is a valid friendly name, TDC-OUT-008 if it is taken. |
| `Z2mDevices.async_check` | `async def async_check(self) -> None` | `custom_components/hass_test_data_creator/outputs/z2m/devices.py` | Raise unless MQTT is usable and the base topic may be used; then publish the bridge. |
| `Z2mDevices._ensure_bridge` | `async def _ensure_bridge(self) -> None` | `custom_components/hass_test_data_creator/outputs/z2m/devices.py` | Refuse a foreign base topic or retained topics that are not ours, then publish `bridge/state` and `bridge/info`. |
| `Z2mDevices._async_prepare` | `async def _async_prepare(self) -> None` | `custom_components/hass_test_data_creator/outputs/z2m/devices.py` | Make sure the bridge is up before devices start. |
| `Z2mDevices._make_entry` | `def _make_entry(self, device: DeviceDef, definition: EntityDef, behaviour: Behaviour) -> RuntimeEntry` | `custom_components/hass_test_data_creator/outputs/z2m/devices.py` | Return the entry with the profile of the platform. |
| `Z2mDevices._wire` | `def _wire(self, entry: RuntimeEntry) -> None` | `custom_components/hass_test_data_creator/outputs/z2m/devices.py` | Publish the events of the behaviour as actions. |
| `Z2mDevices._command_pattern` | `def _command_pattern(self) -> str` | `custom_components/hass_test_data_creator/outputs/z2m/devices.py` | Return the filter for `<base>/<friendly name>/set`. |
| `Z2mDevices._on_message` | `def _on_message(self, topic: str, payload: str) -> None` | `custom_components/hass_test_data_creator/outputs/z2m/devices.py` | Apply a `/set` message to every entity of the device with that friendly name. |
| `Z2mDevices._targets` | `def _targets(self, name: str) -> list[_Entry]` | `custom_components/hass_test_data_creator/outputs/z2m/devices.py` | Return the entries a `/set` to `name` reaches: one device, or the members of a group. |
| `Z2mDevices._async_announce` | `async def _async_announce(self, added: list[RuntimeEntry], devices: list[DeviceDef]) -> None` | `custom_components/hass_test_data_creator/outputs/z2m/devices.py` | Publish `bridge/devices` and the state and availability of the new devices. |
| `Z2mDevices._async_changed_many` | `async def _async_changed_many(self, entries: list[RuntimeEntry]) -> None` | `custom_components/hass_test_data_creator/outputs/z2m/devices.py` | Publish each changed device once, however many of its entities changed. |
| `Z2mDevices._async_changed` | `async def _async_changed(self, entry: RuntimeEntry) -> None` | `custom_components/hass_test_data_creator/outputs/z2m/devices.py` | Publish the state of the device once, however many of its entities changed. |
| `Z2mDevices._enter` | `def _enter(self) -> None` | `custom_components/hass_test_data_creator/outputs/z2m/devices.py` | Note that a device publish is under way. |
| `Z2mDevices._leave` | `def _leave(self) -> None` | `custom_components/hass_test_data_creator/outputs/z2m/devices.py` | Note that a device publish is over; wake the group flush when none is left. |
| `Z2mDevices._async_offline` | `async def _async_offline(self, entries: list[RuntimeEntry]) -> None` | `custom_components/hass_test_data_creator/outputs/z2m/devices.py` | Mark the devices and the bridge offline. |
| `Z2mDevices._async_removed` | `async def _async_removed(self, device: DeviceDef) -> None` | `custom_components/hass_test_data_creator/outputs/z2m/devices.py` | Publish `bridge/devices` without the removed device. |
| `Z2mDevices._async_bridge_groups` | `async def _async_bridge_groups(self) -> None` | `custom_components/hass_test_data_creator/outputs/z2m/devices.py` | Publish the group list of the bridge. |
| `Z2mDevices._async_publish_group` | `async def _async_publish_group(self, group: GroupDef) -> None` | `custom_components/hass_test_data_creator/outputs/z2m/devices.py` | Publish the state of a group, derived from the states of its started members. |
| `Z2mDevices._async_bridge_devices` | `async def _async_bridge_devices(self) -> None` | `custom_components/hass_test_data_creator/outputs/z2m/devices.py` | Publish the device list of the bridge. |
| `Z2mDevices._bridge_entry` | `def _bridge_entry(self, device: DeviceDef) -> dict[str, Any]` | `custom_components/hass_test_data_creator/outputs/z2m/devices.py` | Return the description of a device for `bridge/devices`. |
| `Z2mDevices._async_publish_device` | `async def _async_publish_device(self, device_id: str) -> None` | `custom_components/hass_test_data_creator/outputs/z2m/devices.py` | Publish availability and the state of a device; it is offline if any entity is. |
| `Z2mDevices._async_publish_entries` | `async def _async_publish_entries(self, device_id: str, entries: list[_Entry]) -> None` | `custom_components/hass_test_data_creator/outputs/z2m/devices.py` | Publish availability and state of one device from its started entries. |
| `Z2mDevices._mark_groups` | `def _mark_groups(self, device_id: str) -> None` | `custom_components/hass_test_data_creator/outputs/z2m/devices.py` | Mark the groups of a device dirty and flush them once the devices are published. |
| `Z2mDevices._async_flush_groups` | `async def _async_flush_groups(self) -> None` | `custom_components/hass_test_data_creator/outputs/z2m/devices.py` | Publish each dirty group once, after the device publishes of this round are done. |
| `Z2mDevices._z2m` | `def _z2m(self, entry: RuntimeEntry) -> _Entry` | `custom_components/hass_test_data_creator/outputs/z2m/devices.py` | Return the entry as one of this output. |
| `hass_test_data_creator.outputs.z2m.names` | `module` | `custom_components/hass_test_data_creator/outputs/z2m/names.py` | Rules for the names that become Zigbee2MQTT topics (concept 7.3, 7.4). |
| `is_friendly_name` | `def is_friendly_name(name: str) -> bool` | `custom_components/hass_test_data_creator/outputs/z2m/names.py` | Whether `name` can be a Zigbee2MQTT friendly name: a single, printable topic level. |
| `hass_test_data_creator.outputs.z2m.payloads` | `module` | `custom_components/hass_test_data_creator/outputs/z2m/payloads.py` | The payloads of the Zigbee2MQTT bridge, created only here (concept 7.4, 13.2). |
| `ieee_address` | `def ieee_address(device_id: str) -> str` | `custom_components/hass_test_data_creator/outputs/z2m/payloads.py` | Return a stable fake IEEE address for a device id. |
| `network_address` | `def network_address(device_id: str) -> int` | `custom_components/hass_test_data_creator/outputs/z2m/payloads.py` | Return a stable fake network address (16 bit) for a device id. |
| `Z2mPayloadFactory` | `class Z2mPayloadFactory` | `custom_components/hass_test_data_creator/outputs/z2m/payloads.py` | Builds the retained JSON payloads of the bridge and the devices. |
| `Z2mPayloadFactory.bridge_state` | `def bridge_state(self, online: bool) -> str` | `custom_components/hass_test_data_creator/outputs/z2m/payloads.py` | Return the payload of `bridge/state`. |
| `Z2mPayloadFactory.availability` | `def availability(self, online: bool) -> str` | `custom_components/hass_test_data_creator/outputs/z2m/payloads.py` | Return the payload of `<device>/availability`. |
| `Z2mPayloadFactory.bridge_info` | `def bridge_info(self, base_topic: str) -> str` | `custom_components/hass_test_data_creator/outputs/z2m/payloads.py` | Return the payload of `bridge/info`: version, coordinator and a subset of the config. |
| `Z2mPayloadFactory.bridge_devices` | `def bridge_devices(self, entries: list[dict[str, Any]]) -> str` | `custom_components/hass_test_data_creator/outputs/z2m/payloads.py` | Return the payload of `bridge/devices`: the coordinator and the given devices. |
| `Z2mPayloadFactory.device_entry` | `def device_entry(self, device: DeviceDef, meta: dict[str, str], exposes: list[dict[str, Any]]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/outputs/z2m/payloads.py` | Return one device of `bridge/devices`; `meta` is the z2m block of its template. |
| `Z2mPayloadFactory.bridge_groups` | `def bridge_groups(self, groups: list[dict[str, Any]]) -> str` | `custom_components/hass_test_data_creator/outputs/z2m/payloads.py` | Return the payload of `bridge/groups`. |
| `Z2mPayloadFactory.group_entry` | `def group_entry(self, group: GroupDef, devices: list[DeviceDef]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/outputs/z2m/payloads.py` | Return one group of `bridge/groups` with its member devices. |
| `Z2mPayloadFactory.group_state` | `def group_state(self, member_states: list[dict[str, Any]]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/outputs/z2m/payloads.py` | Return the state of a group from the states of its members. |
| `Z2mPayloadFactory.device_state` | `def device_state(self, properties: dict[str, Any]) -> str` | `custom_components/hass_test_data_creator/outputs/z2m/payloads.py` | Return the payload of `<device>`: all properties as JSON. |
| `hass_test_data_creator.outputs.z2m.profiles` | `module` | `custom_components/hass_test_data_creator/outputs/z2m/profiles.py` | How each platform looks in the Zigbee2MQTT format: exposes, state values and commands (concept 7.4). |
| `numeric` | `def numeric(name: str, label: str, access: int, **extra: Any) -> dict[str, Any]` | `custom_components/hass_test_data_creator/outputs/z2m/profiles.py` | Return a numeric expose (or feature) of Zigbee2MQTT. |
| `binary_state` | `def binary_state(access: int=READ_WRITE) -> dict[str, Any]` | `custom_components/hass_test_data_creator/outputs/z2m/profiles.py` | Return the ON/OFF/TOGGLE state feature of switches and lights. |
| `_on_off` | `def _on_off(behaviour: OnOffBehaviour, data: dict[str, Any]) -> bool` | `custom_components/hass_test_data_creator/outputs/z2m/profiles.py` | Apply `state` of a command (ON, OFF, TOGGLE); True if the command had a state. |
| `Z2mProfile` | `class Z2mProfile(ABC)` | `custom_components/hass_test_data_creator/outputs/z2m/profiles.py` | What one platform exposes and accepts; created only by the Z2mProfileFactory. |
| `Z2mProfile.expose` | `def expose(self, definition: EntityDef) -> dict[str, Any]` | `custom_components/hass_test_data_creator/outputs/z2m/profiles.py` | Return the expose of the entity for `bridge/devices`. |
| `Z2mProfile.values` | `def values(self, definition: EntityDef, behaviour: Any) -> dict[str, Any]` | `custom_components/hass_test_data_creator/outputs/z2m/profiles.py` | Return the properties of the entity for the device state. |
| `Z2mProfile.apply` | `def apply(self, definition: EntityDef, behaviour: Any, data: dict[str, Any]) -> None` | `custom_components/hass_test_data_creator/outputs/z2m/profiles.py` | Apply the properties of a `/set` message that belong to this entity. |
| `Z2mProfile.attach` | `def attach(self, definition: EntityDef, behaviour: Behaviour, send: SendAction) -> None` | `custom_components/hass_test_data_creator/outputs/z2m/profiles.py` | Let the behaviour publish actions on `<device>/action`. |
| `SensorProfile` | `class SensorProfile(Z2mProfile)` | `custom_components/hass_test_data_creator/outputs/z2m/profiles.py` | A sensor: a number, or a state name. |
| `SensorProfile.expose` | `def expose(self, definition: EntityDef) -> dict[str, Any]` | `custom_components/hass_test_data_creator/outputs/z2m/profiles.py` | Return a numeric expose with unit and range, or an enum for state sensors. |
| `SensorProfile.values` | `def values(self, definition: EntityDef, behaviour: SensorBehaviour) -> dict[str, Any]` | `custom_components/hass_test_data_creator/outputs/z2m/profiles.py` | Return the value under the key of the entity. |
| `BinarySensorProfile` | `class BinarySensorProfile(Z2mProfile)` | `custom_components/hass_test_data_creator/outputs/z2m/profiles.py` | A binary sensor: occupancy for motion, contact for doors and windows, else a boolean. |
| `BinarySensorProfile.name_of` | `def name_of(self, definition: EntityDef) -> str` | `custom_components/hass_test_data_creator/outputs/z2m/profiles.py` | Return the Zigbee2MQTT property name. |
| `BinarySensorProfile.expose` | `def expose(self, definition: EntityDef) -> dict[str, Any]` | `custom_components/hass_test_data_creator/outputs/z2m/profiles.py` | Return a binary expose with true and false. |
| `BinarySensorProfile.values` | `def values(self, definition: EntityDef, behaviour: BinarySensorBehaviour) -> dict[str, Any]` | `custom_components/hass_test_data_creator/outputs/z2m/profiles.py` | Return true or false; `contact` is true while the door is closed. |
| `SwitchProfile` | `class SwitchProfile(Z2mProfile)` | `custom_components/hass_test_data_creator/outputs/z2m/profiles.py` | A switch with the state ON or OFF. |
| `SwitchProfile.expose` | `def expose(self, definition: EntityDef) -> dict[str, Any]` | `custom_components/hass_test_data_creator/outputs/z2m/profiles.py` | Return the switch expose. |
| `SwitchProfile.values` | `def values(self, definition: EntityDef, behaviour: OnOffBehaviour) -> dict[str, Any]` | `custom_components/hass_test_data_creator/outputs/z2m/profiles.py` | Return the state. |
| `SwitchProfile.apply` | `def apply(self, definition: EntityDef, behaviour: OnOffBehaviour, data: dict[str, Any]) -> None` | `custom_components/hass_test_data_creator/outputs/z2m/profiles.py` | Apply `state`. |
| `LightProfile` | `class LightProfile(Z2mProfile)` | `custom_components/hass_test_data_creator/outputs/z2m/profiles.py` | A dimmable light with state and brightness (0 to 254). |
| `LightProfile.expose` | `def expose(self, definition: EntityDef) -> dict[str, Any]` | `custom_components/hass_test_data_creator/outputs/z2m/profiles.py` | Return the light expose. |
| `LightProfile.values` | `def values(self, definition: EntityDef, behaviour: LightBehaviour) -> dict[str, Any]` | `custom_components/hass_test_data_creator/outputs/z2m/profiles.py` | Return state and brightness. |
| `LightProfile.apply` | `def apply(self, definition: EntityDef, behaviour: LightBehaviour, data: dict[str, Any]) -> None` | `custom_components/hass_test_data_creator/outputs/z2m/profiles.py` | Apply `brightness` (which switches the light on) and `state`. |
| `CoverProfile` | `class CoverProfile(Z2mProfile)` | `custom_components/hass_test_data_creator/outputs/z2m/profiles.py` | A cover with the states OPEN, CLOSE, STOP and a position. |
| `CoverProfile.expose` | `def expose(self, definition: EntityDef) -> dict[str, Any]` | `custom_components/hass_test_data_creator/outputs/z2m/profiles.py` | Return the cover expose. |
| `CoverProfile.values` | `def values(self, definition: EntityDef, behaviour: CoverBehaviour) -> dict[str, Any]` | `custom_components/hass_test_data_creator/outputs/z2m/profiles.py` | Return state and position. |
| `CoverProfile.apply` | `def apply(self, definition: EntityDef, behaviour: CoverBehaviour, data: dict[str, Any]) -> None` | `custom_components/hass_test_data_creator/outputs/z2m/profiles.py` | Apply `position` or `state`. |
| `ClimateProfile` | `class ClimateProfile(Z2mProfile)` | `custom_components/hass_test_data_creator/outputs/z2m/profiles.py` | A thermostat with system mode, heating setpoint and local temperature. |
| `ClimateProfile.expose` | `def expose(self, definition: EntityDef) -> dict[str, Any]` | `custom_components/hass_test_data_creator/outputs/z2m/profiles.py` | Return the climate expose. |
| `ClimateProfile.values` | `def values(self, definition: EntityDef, behaviour: ClimateBehaviour) -> dict[str, Any]` | `custom_components/hass_test_data_creator/outputs/z2m/profiles.py` | Return mode, setpoint and the measured temperature. |
| `ClimateProfile.apply` | `def apply(self, definition: EntityDef, behaviour: ClimateBehaviour, data: dict[str, Any]) -> None` | `custom_components/hass_test_data_creator/outputs/z2m/profiles.py` | Apply the mode and the setpoint together. |
| `EventProfile` | `class EventProfile(Z2mProfile)` | `custom_components/hass_test_data_creator/outputs/z2m/profiles.py` | Buttons: every event is published as text on `<device>/action`. |
| `EventProfile.expose` | `def expose(self, definition: EntityDef) -> dict[str, Any]` | `custom_components/hass_test_data_creator/outputs/z2m/profiles.py` | Return the action enum. |
| `EventProfile.values` | `def values(self, definition: EntityDef, behaviour: EventBehaviour) -> dict[str, Any]` | `custom_components/hass_test_data_creator/outputs/z2m/profiles.py` | Events are not part of the state. |
| `EventProfile.attach` | `def attach(self, definition: EntityDef, behaviour: Behaviour, send: SendAction) -> None` | `custom_components/hass_test_data_creator/outputs/z2m/profiles.py` | Publish every event of the behaviour as an action. |
| `Z2mProfileFactory` | `class Z2mProfileFactory(ProfileFactory[Z2mProfile])` | `custom_components/hass_test_data_creator/outputs/z2m/profiles.py` | Creates the Zigbee2MQTT profile for a platform. |
| `Z2mProfileFactory.__init__` | `def __init__(self) -> None` | `custom_components/hass_test_data_creator/outputs/z2m/profiles.py` | Use the table of this output. |

## platforms

| Symbol | Signature | File | Description |
| --- | --- | --- | --- |
| `hass_test_data_creator.platforms.__init__` | `module` | `custom_components/hass_test_data_creator/platforms/__init__.py` | Platforms package of the HASS Test Data Creator. |
| `hass_test_data_creator.platforms.actuators` | `module` | `custom_components/hass_test_data_creator/platforms/actuators.py` | Entity classes of the actuators: light, cover and climate (concept 7.2). |
| `TdcLight` | `class TdcLight(TdcStatefulEntity, LightEntity)` | `custom_components/hass_test_data_creator/platforms/actuators.py` | A dimmable light that keeps its on/off state. |
| `TdcLight.__init__` | `def __init__(self, device: DeviceDef, definition: EntityDef, behaviour: LightBehaviour, live: Live) -> None` | `custom_components/hass_test_data_creator/platforms/actuators.py` | Create the light; it can only be dimmed. |
| `TdcLight.brightness` | `def brightness(self) -> int` | `custom_components/hass_test_data_creator/platforms/actuators.py` | The brightness from 1 to 255. |
| `TdcLight.async_turn_on` | `async def async_turn_on(self, **kwargs: Any) -> None` | `custom_components/hass_test_data_creator/platforms/actuators.py` | Switch on, at the brightness of the call or the last one. |
| `TdcLight.async_turn_off` | `async def async_turn_off(self, **kwargs: Any) -> None` | `custom_components/hass_test_data_creator/platforms/actuators.py` | Switch off; the brightness is kept for the next time. |
| `TdcCover` | `class TdcCover(TdcEntity, RestoreEntity, CoverEntity)` | `custom_components/hass_test_data_creator/platforms/actuators.py` | A cover (blind, shutter) that moves to a position at once; 100 is open, 0 is closed. |
| `TdcCover.current_cover_position` | `def current_cover_position(self) -> int` | `custom_components/hass_test_data_creator/platforms/actuators.py` | The position from 0 (closed) to 100 (open). |
| `TdcCover.is_closed` | `def is_closed(self) -> bool` | `custom_components/hass_test_data_creator/platforms/actuators.py` | Whether the cover is fully closed. |
| `TdcCover.async_added_to_hass` | `async def async_added_to_hass(self) -> None` | `custom_components/hass_test_data_creator/platforms/actuators.py` | Restore the last position. |
| `TdcCover.async_open_cover` | `async def async_open_cover(self, **kwargs: Any) -> None` | `custom_components/hass_test_data_creator/platforms/actuators.py` | Open fully. |
| `TdcCover.async_close_cover` | `async def async_close_cover(self, **kwargs: Any) -> None` | `custom_components/hass_test_data_creator/platforms/actuators.py` | Close fully. |
| `TdcCover.async_set_cover_position` | `async def async_set_cover_position(self, **kwargs: Any) -> None` | `custom_components/hass_test_data_creator/platforms/actuators.py` | Move to the position of the call. |
| `TdcCover.async_stop_cover` | `async def async_stop_cover(self, **kwargs: Any) -> None` | `custom_components/hass_test_data_creator/platforms/actuators.py` | Do nothing: the cover never moves slowly. |
| `TdcClimate` | `class TdcClimate(TdcEntity, RestoreEntity, ClimateEntity)` | `custom_components/hass_test_data_creator/platforms/actuators.py` | A thermostat: the measured temperature follows a signal, the target is set by actions. |
| `TdcClimate.__init__` | `def __init__(self, device: DeviceDef, definition: EntityDef, behaviour: ClimateBehaviour, live: Live) -> None` | `custom_components/hass_test_data_creator/platforms/actuators.py` | Create the thermostat with the range of its behaviour. |
| `TdcClimate.hvac_mode` | `def hvac_mode(self) -> HVACMode` | `custom_components/hass_test_data_creator/platforms/actuators.py` | Heat or off. |
| `TdcClimate.target_temperature` | `def target_temperature(self) -> float` | `custom_components/hass_test_data_creator/platforms/actuators.py` | The target temperature. |
| `TdcClimate.current_temperature` | `def current_temperature(self) -> float` | `custom_components/hass_test_data_creator/platforms/actuators.py` | The measured temperature, computed from the signal. |
| `TdcClimate.async_added_to_hass` | `async def async_added_to_hass(self) -> None` | `custom_components/hass_test_data_creator/platforms/actuators.py` | Restore mode and target, then follow the tick. |
| `TdcClimate._handle_tick` | `def _handle_tick(self, now: float) -> None` | `custom_components/hass_test_data_creator/platforms/actuators.py` | Publish the measured temperature if it changed. |
| `TdcClimate.async_set_hvac_mode` | `async def async_set_hvac_mode(self, hvac_mode: HVACMode) -> None` | `custom_components/hass_test_data_creator/platforms/actuators.py` | Switch between off and heat. |
| `TdcClimate.async_set_temperature` | `async def async_set_temperature(self, **kwargs: Any) -> None` | `custom_components/hass_test_data_creator/platforms/actuators.py` | Set the target temperature and, if given, the mode. |
| `hass_test_data_creator.platforms.entities` | `module` | `custom_components/hass_test_data_creator/platforms/entities.py` | Entity classes of the native output: thin shells around the behaviours (concept 5.4, 7.2). |
| `TdcEntity` | `class TdcEntity` | `custom_components/hass_test_data_creator/platforms/entities.py` | Mixin with what every generated entity has: ids, device info and its behaviour. |
| `TdcEntity.__init__` | `def __init__(self, device: DeviceDef, definition: EntityDef, behaviour: Behaviour, live: Live) -> None` | `custom_components/hass_test_data_creator/platforms/entities.py` | Set unique id, name, device info and category from the definitions. |
| `TdcEntity.async_added_to_hass` | `async def async_added_to_hass(self) -> None` | `custom_components/hass_test_data_creator/platforms/entities.py` | Make the behaviour findable for actions and let it report changes. |
| `TdcEntity.async_will_remove_from_hass` | `async def async_will_remove_from_hass(self) -> None` | `custom_components/hass_test_data_creator/platforms/entities.py` | Stop the behaviour and remove it from the live registry. |
| `TdcEntity.available` | `def available(self) -> bool` | `custom_components/hass_test_data_creator/platforms/entities.py` | False while a fault makes the entity unavailable. |
| `TdcEntity._write` | `def _write(self) -> None` | `custom_components/hass_test_data_creator/platforms/entities.py` | Publish the state after the behaviour changed. |
| `TdcStatefulEntity` | `class TdcStatefulEntity(TdcEntity, RestoreEntity)` | `custom_components/hass_test_data_creator/platforms/entities.py` | A generated entity with an on/off state that survives a restart. |
| `TdcStatefulEntity.is_on` | `def is_on(self) -> bool` | `custom_components/hass_test_data_creator/platforms/entities.py` | Whether the entity is on. |
| `TdcStatefulEntity.async_added_to_hass` | `async def async_added_to_hass(self) -> None` | `custom_components/hass_test_data_creator/platforms/entities.py` | Restore the last state. |
| `TdcSensor` | `class TdcSensor(TdcEntity, SensorEntity)` | `custom_components/hass_test_data_creator/platforms/entities.py` | A sensor whose value comes from a signal. |
| `TdcSensor.__init__` | `def __init__(self, device: DeviceDef, definition: EntityDef, behaviour: SensorBehaviour, live: Live) -> None` | `custom_components/hass_test_data_creator/platforms/entities.py` | Create the sensor; sensors with states get the enum device class and their options. |
| `TdcSensor.native_value` | `def native_value(self) -> float \| str` | `custom_components/hass_test_data_creator/platforms/entities.py` | The current value. |
| `TdcSensor.async_added_to_hass` | `async def async_added_to_hass(self) -> None` | `custom_components/hass_test_data_creator/platforms/entities.py` | Follow the tick. |
| `TdcSensor._handle_tick` | `def _handle_tick(self, now: float) -> None` | `custom_components/hass_test_data_creator/platforms/entities.py` | Compute a new value if the interval of the signal has passed. |
| `TdcBinarySensor` | `class TdcBinarySensor(TdcStatefulEntity, BinarySensorEntity)` | `custom_components/hass_test_data_creator/platforms/entities.py` | A binary sensor that is set by actions; motion sensors switch off after a pulse. |
| `TdcSwitch` | `class TdcSwitch(TdcStatefulEntity, SwitchEntity)` | `custom_components/hass_test_data_creator/platforms/entities.py` | A switch that keeps its state. |
| `TdcSwitch.async_turn_on` | `async def async_turn_on(self, **kwargs: Any) -> None` | `custom_components/hass_test_data_creator/platforms/entities.py` | Switch on. |
| `TdcSwitch.async_turn_off` | `async def async_turn_off(self, **kwargs: Any) -> None` | `custom_components/hass_test_data_creator/platforms/entities.py` | Switch off. |
| `TdcEvent` | `class TdcEvent(TdcEntity, EventEntity)` | `custom_components/hass_test_data_creator/platforms/entities.py` | An event entity, for example the buttons of a wall button. |
| `TdcEvent.__init__` | `def __init__(self, device: DeviceDef, definition: EntityDef, behaviour: EventBehaviour, live: Live) -> None` | `custom_components/hass_test_data_creator/platforms/entities.py` | Create the event entity with the event types of its behaviour. |
| `TdcEvent.async_added_to_hass` | `async def async_added_to_hass(self) -> None` | `custom_components/hass_test_data_creator/platforms/entities.py` | Fire the events of the behaviour. |
| `TdcEvent._fire` | `def _fire(self, event_type: str) -> None` | `custom_components/hass_test_data_creator/platforms/entities.py` | Fire the event `event_type` and publish the state. |
| `hass_test_data_creator.platforms.factory` | `module` | `custom_components/hass_test_data_creator/platforms/factory.py` | Factory that creates the entity class per platform (concept 13.2). |
| `EntityFactory` | `class EntityFactory` | `custom_components/hass_test_data_creator/platforms/factory.py` | Creates the Home Assistant entity, and its behaviour, for an entity definition. |
| `EntityFactory.__init__` | `def __init__(self, behaviours: BehaviourFactory, live: Live) -> None` | `custom_components/hass_test_data_creator/platforms/factory.py` | Keep the behaviour factory and the live registry the entities register in. |
| `EntityFactory.create` | `def create(self, device: DeviceDef, definition: EntityDef) -> TdcEntity` | `custom_components/hass_test_data_creator/platforms/factory.py` | Return the entity for `definition` of `device`. |
| `hass_test_data_creator.platforms.scheduler` | `module` | `custom_components/hass_test_data_creator/platforms/scheduler.py` | The clock and the timers of the native output (concept 7.2). |
| `HassScheduler` | `class HassScheduler` | `custom_components/hass_test_data_creator/platforms/scheduler.py` | Gives the behaviours the signal time and timers of Home Assistant. |
| `HassScheduler.__init__` | `def __init__(self, hass: HomeAssistant, clock: Clock) -> None` | `custom_components/hass_test_data_creator/platforms/scheduler.py` | Keep the instance the timers run in and the clock of the signals. |
| `HassScheduler.now` | `def now(self) -> float` | `custom_components/hass_test_data_creator/platforms/scheduler.py` | Return the signal time in seconds. |
| `HassScheduler.at` | `def at(self, moment: datetime) -> float` | `custom_components/hass_test_data_creator/platforms/scheduler.py` | Return the signal time in seconds that belongs to the real `moment`. |
| `HassScheduler.call_later` | `def call_later(self, delay_s: float, callback: Callable[[], None]) -> Cancel` | `custom_components/hass_test_data_creator/platforms/scheduler.py` | Run `callback` after `delay_s` seconds and return the function that cancels it. |
| `HassScheduler.call_later.fire` | `def fire(_now: datetime) -> None` | `custom_components/hass_test_data_creator/platforms/scheduler.py` | Run the callback on the event loop. |
| `hass_test_data_creator.platforms.setup` | `module` | `custom_components/hass_test_data_creator/platforms/setup.py` | Common setup of the entity platforms (concept 7.2). |
| `platform_setup` | `def platform_setup(platform: str) -> Callable[[HomeAssistant, ConfigEntry, AddEntitiesCallback], Awaitable[None]]` | `custom_components/hass_test_data_creator/platforms/setup.py` | Return the `async_setup_entry` of the platform `platform`. |
| `platform_setup.async_setup_entry` | `async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback) -> None` | `custom_components/hass_test_data_creator/platforms/setup.py` | Add the stored entities and the ones of devices created later. |
| `platform_setup.async_setup_entry._add` | `def _add(devices: list[DeviceDef]) -> None` | `custom_components/hass_test_data_creator/platforms/setup.py` | Add the entities of this platform for `devices`. |

## scheduler

| Symbol | Signature | File | Description |
| --- | --- | --- | --- |
| `hass_test_data_creator.scheduler.__init__` | `module` | `custom_components/hass_test_data_creator/scheduler/__init__.py` | Scheduler package of the HASS Test Data Creator. |
| `hass_test_data_creator.scheduler.actions` | `module` | `custom_components/hass_test_data_creator/scheduler/actions.py` | Actions on entities and their factory (concept 6.2, 13.2); manual actions and faults. |
| `_turn_on` | `async def _turn_on(behaviour: Any, params: dict[str, Any]) -> None` | `custom_components/hass_test_data_creator/scheduler/actions.py` | Switch a switch, light or thermostat on. |
| `_turn_off` | `async def _turn_off(behaviour: Any, params: dict[str, Any]) -> None` | `custom_components/hass_test_data_creator/scheduler/actions.py` | Switch a switch, light or thermostat off. |
| `_toggle` | `async def _toggle(behaviour: Any, params: dict[str, Any]) -> None` | `custom_components/hass_test_data_creator/scheduler/actions.py` | Toggle a switch or a light. |
| `_set_on` | `async def _set_on(behaviour: Any, params: dict[str, Any]) -> None` | `custom_components/hass_test_data_creator/scheduler/actions.py` | Set a binary sensor to on. |
| `_set_off` | `async def _set_off(behaviour: Any, params: dict[str, Any]) -> None` | `custom_components/hass_test_data_creator/scheduler/actions.py` | Set a binary sensor to off. |
| `_pulse` | `async def _pulse(behaviour: Any, params: dict[str, Any]) -> None` | `custom_components/hass_test_data_creator/scheduler/actions.py` | Switch a binary sensor on for `duration_s` seconds. |
| `_press` | `async def _press(behaviour: Any, params: dict[str, Any]) -> None` | `custom_components/hass_test_data_creator/scheduler/actions.py` | Fire an event of an event entity; `event_type` defaults to the first one. |
| `_number` | `def _number(params: dict[str, Any], key: str, low: float, high: float) -> float` | `custom_components/hass_test_data_creator/scheduler/actions.py` | Return `params[key]` as a number within `low` and `high` or raise SCH_INVALID_PARAMS. |
| `_set_brightness` | `async def _set_brightness(behaviour: Any, params: dict[str, Any]) -> None` | `custom_components/hass_test_data_creator/scheduler/actions.py` | Set the brightness (0 to 255) of a light; 0 switches it off. |
| `_open_cover` | `async def _open_cover(behaviour: Any, params: dict[str, Any]) -> None` | `custom_components/hass_test_data_creator/scheduler/actions.py` | Open a cover fully. |
| `_close_cover` | `async def _close_cover(behaviour: Any, params: dict[str, Any]) -> None` | `custom_components/hass_test_data_creator/scheduler/actions.py` | Close a cover fully. |
| `_set_position` | `async def _set_position(behaviour: Any, params: dict[str, Any]) -> None` | `custom_components/hass_test_data_creator/scheduler/actions.py` | Move a cover to a position (0 closed, 100 open). |
| `_set_temperature` | `async def _set_temperature(behaviour: Any, params: dict[str, Any]) -> None` | `custom_components/hass_test_data_creator/scheduler/actions.py` | Set the target temperature of a thermostat. |
| `ActionFactory` | `class ActionFactory` | `custom_components/hass_test_data_creator/scheduler/actions.py` | Creates the action for a platform and an action name; faults are `fault_<kind>`. |
| `ActionFactory.__init__` | `def __init__(self, faults: FaultFactory) -> None` | `custom_components/hass_test_data_creator/scheduler/actions.py` | Keep the factory that builds the faults. |
| `ActionFactory.create` | `def create(self, platform: str, action: str) -> Action` | `custom_components/hass_test_data_creator/scheduler/actions.py` | Return the action or raise SCH_UNKNOWN_ACTION. |
| `ActionFactory.supports` | `def supports(self, platform: str, action: str) -> bool` | `custom_components/hass_test_data_creator/scheduler/actions.py` | Whether entities of `platform` can do `action`, a plain action or a fault. |
| `ActionFactory.names` | `def names(self) -> dict[str, list[str]]` | `custom_components/hass_test_data_creator/scheduler/actions.py` | Return the action names per platform. |
| `ActionFactory._fault_action` | `def _fault_action(self, kind: str) -> Action` | `custom_components/hass_test_data_creator/scheduler/actions.py` | Return the action that starts a fault of `kind` on an entity. |
| `ActionFactory._fault_action.start` | `async def start(behaviour: Any, params: dict[str, Any]) -> None` | `custom_components/hass_test_data_creator/scheduler/actions.py` | Start the fault; `duration_s` and the kind's parameters come from `params`. |
| `hass_test_data_creator.scheduler.manager` | `module` | `custom_components/hass_test_data_creator/scheduler/manager.py` | Stores schedules and runs their actions at the planned moments (concept 6). |
| `ScheduleManager` | `class ScheduleManager` | `custom_components/hass_test_data_creator/scheduler/manager.py` | Adds, changes, removes and enables schedules and fires them with a single timer. |
| `ScheduleManager.__init__` | `def __init__(self, hass: HomeAssistant, store: TdcStore, triggers: TriggerFactory, planner: SchedulePlanner, runner: ActionRunner, scenarios: ScenarioRunner, audit: AuditLog, audit_factory: AuditEntryFactory) -> None` | `custom_components/hass_test_data_creator/scheduler/manager.py` | Keep the collaborators. |
| `ScheduleManager.async_start` | `def async_start(self) -> None` | `custom_components/hass_test_data_creator/scheduler/manager.py` | Plan the rest of today, arm the timer and replan after every midnight. |
| `ScheduleManager.async_stop` | `def async_stop(self) -> None` | `custom_components/hass_test_data_creator/scheduler/manager.py` | Cancel the timers. |
| `ScheduleManager.all_schedules` | `def all_schedules(self) -> list[ScheduleDef]` | `custom_components/hass_test_data_creator/scheduler/manager.py` | Return all schedules. |
| `ScheduleManager.get` | `def get(self, schedule_id: str) -> ScheduleDef` | `custom_components/hass_test_data_creator/scheduler/manager.py` | Return the schedule or raise SCH_NOT_FOUND. |
| `ScheduleManager.async_add` | `async def async_add(self, data: dict[str, Any], default_seed: str) -> ScheduleDef` | `custom_components/hass_test_data_creator/scheduler/manager.py` | Validate and store a schedule: a scenario, or a target with entity and action. |
| `ScheduleManager.async_update` | `async def async_update(self, schedule_id: str, data: dict[str, Any]) -> ScheduleDef` | `custom_components/hass_test_data_creator/scheduler/manager.py` | Replace the work, trigger and name of a schedule; a wrong request changes nothing. |
| `ScheduleManager.async_remove` | `async def async_remove(self, schedule_id: str) -> None` | `custom_components/hass_test_data_creator/scheduler/manager.py` | Delete a schedule. |
| `ScheduleManager.async_set_enabled` | `async def async_set_enabled(self, schedule_id: str, enabled: bool) -> ScheduleDef` | `custom_components/hass_test_data_creator/scheduler/manager.py` | Switch a schedule on or off. |
| `ScheduleManager.preview` | `def preview(self, hours: int) -> list[dict[str, str]]` | `custom_components/hass_test_data_creator/scheduler/manager.py` | Return the planned runs of the next `hours` hours with the schedule names. |
| `ScheduleManager._check_work` | `def _check_work(self, data: dict[str, Any]) -> None` | `custom_components/hass_test_data_creator/scheduler/manager.py` | Raise unless `data` names an existing scenario or a target with a known action. |
| `ScheduleManager.forget` | `def forget(self, schedule_ids: list[str]) -> None` | `custom_components/hass_test_data_creator/scheduler/manager.py` | Delete schedules without saving; the removal saves the store afterwards. |
| `ScheduleManager._cancel` | `def _cancel(self) -> None` | `custom_components/hass_test_data_creator/scheduler/manager.py` | Cancel the timer of the next run. |
| `ScheduleManager._on_midnight` | `def _on_midnight(self, _now: datetime) -> None` | `custom_components/hass_test_data_creator/scheduler/manager.py` | Plan the new day. |
| `ScheduleManager._replan` | `def _replan(self, schedule_ids: list[str] \| None=None) -> None` | `custom_components/hass_test_data_creator/scheduler/manager.py` | Plan the rest of today for all schedules, or only for `schedule_ids`, and arm the timer. |
| `ScheduleManager._arm` | `def _arm(self) -> None` | `custom_components/hass_test_data_creator/scheduler/manager.py` | Arm the timer for the first planned run, if there is one. |
| `ScheduleManager._fire` | `async def _fire(self, now: datetime) -> None` | `custom_components/hass_test_data_creator/scheduler/manager.py` | Run every planned run that is due, then arm the timer for the next one. |
| `ScheduleManager._execute` | `async def _execute(self, run: PlannedRun) -> None` | `custom_components/hass_test_data_creator/scheduler/manager.py` | Run the action of one planned run on all devices of its target. |
| `ScheduleManager._run_scenario` | `async def _run_scenario(self, schedule: ScheduleDef) -> None` | `custom_components/hass_test_data_creator/scheduler/manager.py` | Start the scenario of a schedule; a missing scenario is logged. |
| `hass_test_data_creator.scheduler.planner` | `module` | `custom_components/hass_test_data_creator/scheduler/planner.py` | Plans the runs of schedules for a time range (concept 6.4). |
| `PlannedRun` | `class PlannedRun` | `custom_components/hass_test_data_creator/scheduler/planner.py` | One planned run: the moment and the schedule it belongs to. |
| `day_seed` | `def day_seed(schedule: ScheduleDef, day_text: str) -> int` | `custom_components/hass_test_data_creator/scheduler/planner.py` | Return the seed of one schedule on one day; the same input always gives the same seed. |
| `SchedulePlanner` | `class SchedulePlanner` | `custom_components/hass_test_data_creator/scheduler/planner.py` | Draws the times of every day from (schedule seed, date), so the same seed gives the same day. |
| `SchedulePlanner.__init__` | `def __init__(self, triggers: TriggerFactory) -> None` | `custom_components/hass_test_data_creator/scheduler/planner.py` | Keep the factory that builds the triggers. |
| `SchedulePlanner.plan` | `def plan(self, schedules: list[ScheduleDef], start: datetime, end: datetime) -> list[PlannedRun]` | `custom_components/hass_test_data_creator/scheduler/planner.py` | Return the runs of all enabled schedules from `start` (included) to `end` (excluded). |
| `hass_test_data_creator.scheduler.runner` | `module` | `custom_components/hass_test_data_creator/scheduler/runner.py` | Runs an action on one entity of a generated device (concept 6). |
| `ActionRunner` | `class ActionRunner` | `custom_components/hass_test_data_creator/scheduler/runner.py` | Finds the live entity for an action and runs it. |
| `ActionRunner.__init__` | `def __init__(self, store: TdcStore, live: Live, actions: ActionFactory, audit: AuditLog, audit_factory: AuditEntryFactory) -> None` | `custom_components/hass_test_data_creator/scheduler/runner.py` | Keep the collaborators. |
| `ActionRunner.actions` | `def actions(self) -> dict[str, list[str]]` | `custom_components/hass_test_data_creator/scheduler/runner.py` | Return the available action names per platform. |
| `ActionRunner.devices_for` | `def devices_for(self, target: dict[str, Any]) -> list[DeviceDef]` | `custom_components/hass_test_data_creator/scheduler/runner.py` | Return the devices a target selects: a device, a template, a run or all. |
| `ActionRunner.async_run_on` | `async def async_run_on(self, devices: list[DeviceDef], key: str, action: str, params: dict[str, Any], label: str) -> None` | `custom_components/hass_test_data_creator/scheduler/runner.py` | Run `action` on entity `key` (all that fit if empty) of every device; a failure is logged. |
| `ActionRunner.find_device_id` | `def find_device_id(self, reference: str) -> str` | `custom_components/hass_test_data_creator/scheduler/runner.py` | Return the id of the device whose id or name is `reference`. |
| `ActionRunner.async_run` | `async def async_run(self, reference: str, key: str, action: str, params: dict[str, Any] \| None=None) -> None` | `custom_components/hass_test_data_creator/scheduler/runner.py` | Run `action` on entity `key` of the device `reference` (id or name). |
| `ActionRunner._run_device` | `async def _run_device(self, device_id: str, reference: str, key: str, action: str, params: dict[str, Any] \| None) -> None` | `custom_components/hass_test_data_creator/scheduler/runner.py` | Run `action` on the entities of the device `device_id`; `reference` is audited. |
| `ActionRunner._keys` | `def _keys(self, device_id: str, key: str, action: str) -> list[str]` | `custom_components/hass_test_data_creator/scheduler/runner.py` | Return the keys of the entities that an action runs on: the one named, or all that fit. |
| `hass_test_data_creator.scheduler.schema` | `module` | `custom_components/hass_test_data_creator/scheduler/schema.py` | Request fields of a schedule, shared by the services and the WebSocket commands. |
| `hass_test_data_creator.scheduler.triggers` | `module` | `custom_components/hass_test_data_creator/scheduler/triggers.py` | Schedule triggers and their factory (concept 6.1, 13.2). |
| `parse_clock` | `def parse_clock(text: str) -> int` | `custom_components/hass_test_data_creator/scheduler/triggers.py` | Return the seconds after midnight of a clock time `HH:MM` or `HH:MM:SS` (24:00 allowed). |
| `Trigger` | `class Trigger(ABC)` | `custom_components/hass_test_data_creator/scheduler/triggers.py` | Computes the times of one day at which a schedule runs. |
| `Trigger.seconds_for_day` | `def seconds_for_day(self, day: date, seed: int) -> list[float]` | `custom_components/hass_test_data_creator/scheduler/triggers.py` | Return the sorted seconds after local midnight of `day` at which the trigger fires. |
| `TimesTrigger` | `class TimesTrigger(Trigger)` | `custom_components/hass_test_data_creator/scheduler/triggers.py` | Fixed times of the day, optionally only on some weekdays (Monday is 0). |
| `TimesTrigger.__init__` | `def __init__(self, times: list[str], weekdays: list[int] \| None) -> None` | `custom_components/hass_test_data_creator/scheduler/triggers.py` | Parse the clock times. |
| `TimesTrigger.seconds_for_day` | `def seconds_for_day(self, day: date, seed: int) -> list[float]` | `custom_components/hass_test_data_creator/scheduler/triggers.py` | Return the fixed times if the weekday matches. |
| `IntervalTrigger` | `class IntervalTrigger(Trigger)` | `custom_components/hass_test_data_creator/scheduler/triggers.py` | Every N seconds inside a daily window. |
| `IntervalTrigger.__init__` | `def __init__(self, every_s: int, start: str, end: str) -> None` | `custom_components/hass_test_data_creator/scheduler/triggers.py` | Keep the step and the window. |
| `IntervalTrigger.seconds_for_day` | `def seconds_for_day(self, day: date, seed: int) -> list[float]` | `custom_components/hass_test_data_creator/scheduler/triggers.py` | Return start, start + step, … while inside the window. |
| `OnceTrigger` | `class OnceTrigger(Trigger)` | `custom_components/hass_test_data_creator/scheduler/triggers.py` | One moment, given as a local date and time. |
| `OnceTrigger.__init__` | `def __init__(self, at: datetime) -> None` | `custom_components/hass_test_data_creator/scheduler/triggers.py` | Keep the moment. |
| `OnceTrigger.seconds_for_day` | `def seconds_for_day(self, day: date, seed: int) -> list[float]` | `custom_components/hass_test_data_creator/scheduler/triggers.py` | Return the time of day if `day` is the day of the moment. |
| `RandomWindowTrigger` | `class RandomWindowTrigger(Trigger)` | `custom_components/hass_test_data_creator/scheduler/triggers.py` | N moments at random inside a daily window; the seed decides where. |
| `RandomWindowTrigger.__init__` | `def __init__(self, count: int, start: str, end: str) -> None` | `custom_components/hass_test_data_creator/scheduler/triggers.py` | Keep the number and the window. |
| `RandomWindowTrigger.seconds_for_day` | `def seconds_for_day(self, day: date, seed: int) -> list[float]` | `custom_components/hass_test_data_creator/scheduler/triggers.py` | Return `count` seconds in the window, drawn from the seed of the day. |
| `PoissonTrigger` | `class PoissonTrigger(Trigger)` | `custom_components/hass_test_data_creator/scheduler/triggers.py` | Events at an average rate; the gaps between them are exponentially distributed. |
| `PoissonTrigger.__init__` | `def __init__(self, per_day: float) -> None` | `custom_components/hass_test_data_creator/scheduler/triggers.py` | Keep the average number of events per day. |
| `PoissonTrigger.seconds_for_day` | `def seconds_for_day(self, day: date, seed: int) -> list[float]` | `custom_components/hass_test_data_creator/scheduler/triggers.py` | Return the event times of the day, drawn from the seed of the day. |
| `TriggerFactory` | `class TriggerFactory` | `custom_components/hass_test_data_creator/scheduler/triggers.py` | Creates the trigger for a trigger description. |
| `TriggerFactory.create` | `def create(self, data: dict[str, Any]) -> Trigger` | `custom_components/hass_test_data_creator/scheduler/triggers.py` | Return the trigger for `data` or raise SCH_INVALID_TRIGGER. |
| `TriggerFactory._moment` | `def _moment(self, text: str) -> datetime` | `custom_components/hass_test_data_creator/scheduler/triggers.py` | Return the local date and time of an ISO text like `2026-11-01T18:30`. |

## removal

| Symbol | Signature | File | Description |
| --- | --- | --- | --- |
| `hass_test_data_creator.removal.__init__` | `module` | `custom_components/hass_test_data_creator/removal/__init__.py` | Removal package of the HASS Test Data Creator. |
| `hass_test_data_creator.removal.cleanup` | `module` | `custom_components/hass_test_data_creator/removal/cleanup.py` | Cleanup when the config entry is removed (concept 10.3). |
| `async_cleanup_after_entry_removal` | `async def async_cleanup_after_entry_removal(hass: HomeAssistant, entry: ConfigEntry) -> None` | `custom_components/hass_test_data_creator/removal/cleanup.py` | Remove the devices, retained topics and statistics, then empty created areas and the store. |
| `hass_test_data_creator.removal.orphans` | `module` | `custom_components/hass_test_data_creator/removal/orphans.py` | Finds retained MQTT topics of generated devices that the store does not know (concept 10.5). |
| `OrphanScanner` | `class OrphanScanner` | `custom_components/hass_test_data_creator/removal/orphans.py` | Lists and clears the retained topics left behind when the store was lost or damaged. |
| `OrphanScanner.__init__` | `def __init__(self, client: MqttClient, store: TdcStore, bases: tuple[str, str], audit: AuditLog, audit_factory: AuditEntryFactory) -> None` | `custom_components/hass_test_data_creator/removal/orphans.py` | Keep the client, the store, the MQTT and Zigbee2MQTT base topics and the audit log. |
| `OrphanScanner.async_scan` | `async def async_scan(self) -> list[str]` | `custom_components/hass_test_data_creator/removal/orphans.py` | Return the retained topics of generated devices that the store did not record, sorted. |
| `OrphanScanner.async_clear` | `async def async_clear(self, topics: list[str]) -> list[str]` | `custom_components/hass_test_data_creator/removal/orphans.py` | Delete those of `topics` that a new scan finds as well; return the deleted ones. |
| `OrphanScanner._patterns` | `def _patterns(self) -> list[str]` | `custom_components/hass_test_data_creator/removal/orphans.py` | Return the topic filters of a scan. |
| `OrphanScanner._is_ours` | `def _is_ours(self, topic: str) -> bool` | `custom_components/hass_test_data_creator/removal/orphans.py` | Whether `topic` is one of a generated device: discovery, MQTT state or Zigbee2MQTT. |
| `hass_test_data_creator.removal.planner` | `module` | `custom_components/hass_test_data_creator/removal/planner.py` | Plans a removal: what would be deleted (concept 10.2). |
| `RemovalPlan` | `class RemovalPlan` | `custom_components/hass_test_data_creator/removal/planner.py` | What a removal would delete. |
| `RemovalPlan.describe_in_use` | `def describe_in_use(self) -> str` | `custom_components/hass_test_data_creator/removal/planner.py` | Return the devices that are still used, each with the names of its users. |
| `RemovalPlan.to_dict` | `def to_dict(self) -> dict[str, Any]` | `custom_components/hass_test_data_creator/removal/planner.py` | Return the plan as the panel shows it before the user confirms. |
| `RemovalPlanner` | `class RemovalPlanner` | `custom_components/hass_test_data_creator/removal/planner.py` | Builds the plan for a target from the store and the registry markers. |
| `RemovalPlanner.__init__` | `def __init__(self, hass: HomeAssistant, entry: ConfigEntry, store: TdcStore, usage: DeviceUsage) -> None` | `custom_components/hass_test_data_creator/removal/planner.py` | Keep the instance, the config entry, the store and the finder of the users of devices. |
| `RemovalPlanner.plan` | `def plan(self, target: str, target_id: str \| None) -> RemovalPlan` | `custom_components/hass_test_data_creator/removal/planner.py` | Return the plan to remove `target` (`all`, `device` or `run`) with `target_id`. |
| `RemovalPlanner._in_use` | `def _in_use(self, plan: RemovalPlan) -> list[dict[str, Any]]` | `custom_components/hass_test_data_creator/removal/planner.py` | Return the devices of a plan that a schedule, scenario or group names; "all" has none. |
| `RemovalPlanner._group_ids` | `def _group_ids(self, plan: RemovalPlan) -> list[str]` | `custom_components/hass_test_data_creator/removal/planner.py` | Return the ids of the groups that go with the plan: all of them, or none. |
| `RemovalPlanner._schedule_ids` | `def _schedule_ids(self, plan: RemovalPlan) -> list[str]` | `custom_components/hass_test_data_creator/removal/planner.py` | Return the ids of the schedules that go with the plan: all, or those aimed at its runs. |
| `RemovalPlanner._orphans` | `def _orphans(self, known: set[str]) -> list[dict[str, str]]` | `custom_components/hass_test_data_creator/removal/planner.py` | Return registry devices of this entry that the store does not know (damaged store). |
| `RemovalPlanner._empty_areas` | `def _empty_areas(self, removed: set[str]) -> list[str]` | `custom_components/hass_test_data_creator/removal/planner.py` | Return the names of created areas that would be empty after removing `removed`. |
| `hass_test_data_creator.removal.runner` | `module` | `custom_components/hass_test_data_creator/removal/runner.py` | Runs a removal plan step by step; every step can be repeated (concept 10.3). |
| `Forgetters` | `class Forgetters` | `custom_components/hass_test_data_creator/removal/runner.py` | The managers that forget what a plan removes: schedules, scenarios and statistics. |
| `RemovalRunner` | `class RemovalRunner` | `custom_components/hass_test_data_creator/removal/runner.py` | Removes devices, run records, statistics and empty created areas. |
| `RemovalRunner.__init__` | `def __init__(self, hass: HomeAssistant, store: TdcStore, outputs: OutputAdapterFactory, areas: AreaAssigner, forgetters: Forgetters, audit: AuditLog, audit_factory: AuditEntryFactory) -> None` | `custom_components/hass_test_data_creator/removal/runner.py` | Keep the collaborators. |
| `RemovalRunner.async_run` | `async def async_run(self, plan: RemovalPlan) -> dict[str, Any]` | `custom_components/hass_test_data_creator/removal/runner.py` | Execute `plan` and return what was removed (concept 10.3). |

## audit

| Symbol | Signature | File | Description |
| --- | --- | --- | --- |
| `hass_test_data_creator.audit.__init__` | `module` | `custom_components/hass_test_data_creator/audit/__init__.py` | Audit package of the HASS Test Data Creator. |
| `hass_test_data_creator.audit.factory` | `module` | `custom_components/hass_test_data_creator/audit/factory.py` | Factory for audit entries (concept 13.2, 13.4). |
| `AuditEntry` | `class AuditEntry` | `custom_components/hass_test_data_creator/audit/factory.py` | One action with its log level and fields. |
| `AuditEntryFactory` | `class AuditEntryFactory` | `custom_components/hass_test_data_creator/audit/factory.py` | Creates one audit entry per kind of action. |
| `AuditEntryFactory.devices_created` | `def devices_created(self, run_id: str, template: str, count: int) -> AuditEntry` | `custom_components/hass_test_data_creator/audit/factory.py` | Return the entry for a finished creation job. |
| `AuditEntryFactory.removal_done` | `def removal_done(self, target: str, devices: int, areas: int) -> AuditEntry` | `custom_components/hass_test_data_creator/audit/factory.py` | Return the entry for a finished removal. |
| `AuditEntryFactory.orphan_topics_cleared` | `def orphan_topics_cleared(self, count: int) -> AuditEntry` | `custom_components/hass_test_data_creator/audit/factory.py` | Return the entry for deleted retained topics of generated devices that nobody recorded. |
| `AuditEntryFactory.history_imported` | `def history_imported(self, series: int, rows: int) -> AuditEntry` | `custom_components/hass_test_data_creator/audit/factory.py` | Return the entry for a finished statistics import. |
| `AuditEntryFactory.device_moved` | `def device_moved(self, device: str, area: str \| None) -> AuditEntry` | `custom_components/hass_test_data_creator/audit/factory.py` | Return the entry for a device that was put into another area. |
| `AuditEntryFactory.signal_changed` | `def signal_changed(self, device: str, key: str, shape: str) -> AuditEntry` | `custom_components/hass_test_data_creator/audit/factory.py` | Return the entry for a sensor that got another curve. |
| `AuditEntryFactory.action_fired` | `def action_fired(self, device: str, key: str, action: str) -> AuditEntry` | `custom_components/hass_test_data_creator/audit/factory.py` | Return the entry for an action on one entity. |
| `AuditEntryFactory.schedule_ran` | `def schedule_ran(self, name: str, action: str) -> AuditEntry` | `custom_components/hass_test_data_creator/audit/factory.py` | Return the entry for a schedule that ran. |
| `AuditEntryFactory.schedule_changed` | `def schedule_changed(self, name: str) -> AuditEntry` | `custom_components/hass_test_data_creator/audit/factory.py` | Return the entry for a schedule that was changed. |
| `AuditEntryFactory.scenario_started` | `def scenario_started(self, name: str, steps: int) -> AuditEntry` | `custom_components/hass_test_data_creator/audit/factory.py` | Return the entry for a scenario that was started. |
| `AuditEntryFactory.scenario_changed` | `def scenario_changed(self, name: str) -> AuditEntry` | `custom_components/hass_test_data_creator/audit/factory.py` | Return the entry for a scenario that was changed. |
| `AuditEntryFactory.template_saved` | `def template_saved(self, template: str, entities: int) -> AuditEntry` | `custom_components/hass_test_data_creator/audit/factory.py` | Return the entry for an own template that was saved. |
| `AuditEntryFactory.template_deleted` | `def template_deleted(self, template: str) -> AuditEntry` | `custom_components/hass_test_data_creator/audit/factory.py` | Return the entry for an own template that was deleted. |
| `AuditEntryFactory.mqtt_failed` | `def mqtt_failed(self, topic: str, reason: str) -> AuditEntry` | `custom_components/hass_test_data_creator/audit/factory.py` | Return the warning for an MQTT message that could not be sent or applied. |
| `AuditEntryFactory.schedule_failed` | `def schedule_failed(self, name: str, device: str, code: str) -> AuditEntry` | `custom_components/hass_test_data_creator/audit/factory.py` | Return the warning for a run that failed on one device. |
| `AuditEntryFactory.tick_slow` | `def tick_slow(self, duration: float, interval: float) -> AuditEntry` | `custom_components/hass_test_data_creator/audit/factory.py` | Return the warning for a tick that took too long (TDC-GEN-005). |
| `hass_test_data_creator.audit.log` | `module` | `custom_components/hass_test_data_creator/audit/log.py` | The audit log: the only place where actions are logged (concept 13.4). |
| `format_value` | `def format_value(value: Any) -> str` | `custom_components/hass_test_data_creator/audit/log.py` | Return `value` as a quoted, single-line, shortened string that is safe to log. |
| `AuditLog` | `class AuditLog` | `custom_components/hass_test_data_creator/audit/log.py` | Writes audit entries to the Home Assistant log. |
| `AuditLog.record` | `def record(self, entry: AuditEntry) -> None` | `custom_components/hass_test_data_creator/audit/log.py` | Log `entry` with its level; user-typed values are escaped. |

## api

| Symbol | Signature | File | Description |
| --- | --- | --- | --- |
| `hass_test_data_creator.api.__init__` | `module` | `custom_components/hass_test_data_creator/api/__init__.py` | The hass_test_data_creator/* WebSocket commands of the panel (concept 8.2). |
| `async_register_commands` | `def async_register_commands(hass: HomeAssistant) -> None` | `custom_components/hass_test_data_creator/api/__init__.py` | Register every panel command. |
| `hass_test_data_creator.api.devices` | `module` | `custom_components/hass_test_data_creator/api/devices.py` | Commands about devices (concept 8.2). |
| `ws_devices_list` | `async def ws_devices_list(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/api/devices.py` | Return one page of devices with the current state of their entities. |
| `ws_devices_get` | `async def ws_devices_get(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/api/devices.py` | Return one device in full, with the signal of each entity. |
| `ws_devices_names` | `async def ws_devices_names(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/api/devices.py` | Return what pickers need of every device: no entities, states or users. |
| `ws_devices_create` | `async def ws_devices_create(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/api/devices.py` | Create the devices of a job and return the run. |
| `ws_devices_duplicate` | `async def ws_devices_duplicate(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/api/devices.py` | Create copies of a device as a new run and return the run. |
| `ws_devices_update` | `async def ws_devices_update(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/api/devices.py` | Put a device into another area, or into none, and return its new area. |
| `ws_devices_signal` | `async def ws_devices_signal(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/api/devices.py` | Give a sensor of a device another curve and return the new signal. |
| `ws_devices_fire` | `async def ws_devices_fire(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/api/devices.py` | Run an action on one entity of a device. |
| `hass_test_data_creator.api.groups` | `module` | `custom_components/hass_test_data_creator/api/groups.py` | Commands about groups (concept 8.2). |
| `ws_groups_list` | `async def ws_groups_list(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> list[dict[str, Any]]` | `custom_components/hass_test_data_creator/api/groups.py` | Return all groups. |
| `ws_groups_add` | `async def ws_groups_add(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/api/groups.py` | Add a group and return it. |
| `ws_groups_update` | `async def ws_groups_update(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/api/groups.py` | Rename a group and replace its members; return it. |
| `ws_groups_remove` | `async def ws_groups_remove(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/api/groups.py` | Delete a group. |
| `hass_test_data_creator.api.history` | `module` | `custom_components/hass_test_data_creator/api/history.py` | Commands about the statistics backfill (concept 8.2). |
| `ws_history_import` | `async def ws_history_import(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/api/history.py` | Write hourly statistics for the past days and return how many were written. |
| `hass_test_data_creator.api.info` | `module` | `custom_components/hass_test_data_creator/api/info.py` | Commands about the integration itself and the templates (concept 8.2). |
| `ws_info` | `async def ws_info(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/api/info.py` | Return version, API version, features, limits, outputs, shapes and platforms. |
| `ws_templates_list` | `async def ws_templates_list(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> list[dict[str, Any]]` | `custom_components/hass_test_data_creator/api/info.py` | Return all templates with their entities. |
| `ws_templates_save` | `async def ws_templates_save(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/api/info.py` | Save an own template (new or replacing one of the same id) and return it. |
| `ws_templates_delete` | `async def ws_templates_delete(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/api/info.py` | Delete an own template; built-in templates cannot be deleted. |
| `hass_test_data_creator.api.removal` | `module` | `custom_components/hass_test_data_creator/api/removal.py` | Commands about removal (concept 8.2, 10). |
| `ws_removal_plan` | `async def ws_removal_plan(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/api/removal.py` | Return what a removal of the target would delete. |
| `ws_removal_orphan_topics` | `async def ws_removal_orphan_topics(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/api/removal.py` | Return the retained topics of generated devices that the store does not know. |
| `ws_removal_orphan_topics_clear` | `async def ws_removal_orphan_topics_clear(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/api/removal.py` | Delete those of the given topics that a new scan reports as left behind. |
| `ws_removal_run` | `async def ws_removal_run(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/api/removal.py` | Remove the target and return what was removed. |
| `hass_test_data_creator.api.scenarios` | `module` | `custom_components/hass_test_data_creator/api/scenarios.py` | Commands about scenarios (concept 8.2). |
| `ws_scenarios_list` | `async def ws_scenarios_list(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> list[dict[str, Any]]` | `custom_components/hass_test_data_creator/api/scenarios.py` | Return all scenarios. |
| `ws_scenarios_add` | `async def ws_scenarios_add(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/api/scenarios.py` | Add a scenario and return it. |
| `ws_scenarios_update` | `async def ws_scenarios_update(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/api/scenarios.py` | Change a scenario and return it. |
| `ws_scenarios_remove` | `async def ws_scenarios_remove(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/api/scenarios.py` | Delete a scenario. |
| `ws_scenarios_run` | `async def ws_scenarios_run(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/api/scenarios.py` | Start a scenario and return the number of its steps. |
| `hass_test_data_creator.api.schedules` | `module` | `custom_components/hass_test_data_creator/api/schedules.py` | Commands about schedules (concept 8.2). |
| `ws_schedules_list` | `async def ws_schedules_list(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> list[dict[str, Any]]` | `custom_components/hass_test_data_creator/api/schedules.py` | Return all schedules. |
| `ws_schedules_add` | `async def ws_schedules_add(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/api/schedules.py` | Add a schedule and return it. |
| `ws_schedules_update` | `async def ws_schedules_update(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/api/schedules.py` | Change a schedule and return it. |
| `ws_schedules_remove` | `async def ws_schedules_remove(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/api/schedules.py` | Delete a schedule. |
| `ws_schedules_enable` | `async def ws_schedules_enable(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/api/schedules.py` | Switch a schedule on or off and return it. |
| `ws_schedules_preview` | `async def ws_schedules_preview(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> list[dict[str, str]]` | `custom_components/hass_test_data_creator/api/schedules.py` | Return the planned runs of the next hours. |

## faults

| Symbol | Signature | File | Description |
| --- | --- | --- | --- |
| `hass_test_data_creator.faults.__init__` | `module` | `custom_components/hass_test_data_creator/faults/__init__.py` | Faults of generated entities (concept 6.3). |
| `hass_test_data_creator.faults.factory` | `module` | `custom_components/hass_test_data_creator/faults/factory.py` | Faults of generated entities and their factory (concept 6.3, 13.2). |
| `Fault` | `class Fault` | `custom_components/hass_test_data_creator/faults/factory.py` | A fault that is active on one entity until `duration_s` has passed. |
| `FaultSpec` | `class FaultSpec` | `custom_components/hass_test_data_creator/faults/factory.py` | What a kind of fault does, where it applies and which parameters it takes. |
| `_scaled` | `def _scaled(factor: float) -> Transform` | `custom_components/hass_test_data_creator/faults/factory.py` | Return the transformation that multiplies a value by `factor`. |
| `_scaled.apply` | `def apply(value: float) -> float` | `custom_components/hass_test_data_creator/faults/factory.py` | Return the value multiplied by the factor. |
| `_fixed` | `def _fixed(level: float) -> Transform` | `custom_components/hass_test_data_creator/faults/factory.py` | Return the transformation that replaces every value by `level`. |
| `_fixed.apply` | `def apply(value: float) -> float` | `custom_components/hass_test_data_creator/faults/factory.py` | Return the fixed level. |
| `_plain` | `def _plain(**flags: bool) -> Callable[[str, float, dict[str, Any]], Fault]` | `custom_components/hass_test_data_creator/faults/factory.py` | Return the builder of a fault that only sets flags. |
| `_spike` | `def _spike(kind: str, duration: float, checked: dict[str, Any]) -> Fault` | `custom_components/hass_test_data_creator/faults/factory.py` | Return the fault that multiplies the values. |
| `_late` | `def _late(kind: str, duration: float, checked: dict[str, Any]) -> Fault` | `custom_components/hass_test_data_creator/faults/factory.py` | Return the fault that holds messages back. |
| `_duplicate` | `def _duplicate(kind: str, duration: float, checked: dict[str, Any]) -> Fault` | `custom_components/hass_test_data_creator/faults/factory.py` | Return the fault that publishes messages again. |
| `_fixed_level` | `def _fixed_level(default: float) -> Callable[[str, float, dict[str, Any]], Fault]` | `custom_components/hass_test_data_creator/faults/factory.py` | Return the builder of a fault that replaces the values by a level. |
| `FaultFactory` | `class FaultFactory` | `custom_components/hass_test_data_creator/faults/factory.py` | Creates the fault for a kind and its parameters. |
| `FaultFactory.kinds` | `def kinds(self) -> tuple[str, ...]` | `custom_components/hass_test_data_creator/faults/factory.py` | Return the names of all kinds of fault. |
| `FaultFactory.platforms` | `def platforms(self, kind: str) -> tuple[str, ...]` | `custom_components/hass_test_data_creator/faults/factory.py` | Return the platforms a kind of fault applies to; empty if the kind is unknown. |
| `FaultFactory.create` | `def create(self, kind: str, params: dict[str, Any]) -> Fault` | `custom_components/hass_test_data_creator/faults/factory.py` | Return the fault or raise SCH_INVALID_FAULT for unknown kinds and bad parameters. |

## groups

| Symbol | Signature | File | Description |
| --- | --- | --- | --- |
| `hass_test_data_creator.groups.__init__` | `module` | `custom_components/hass_test_data_creator/groups/__init__.py` | Groups of the Zigbee2MQTT emulation (concept 7.4). |
| `hass_test_data_creator.groups.manager` | `module` | `custom_components/hass_test_data_creator/groups/manager.py` | Groups of Zigbee2MQTT devices: a named list of members (concept 7.4). |
| `GroupManager` | `class GroupManager` | `custom_components/hass_test_data_creator/groups/manager.py` | Adds, changes and removes groups and keeps the Zigbee2MQTT bridge up to date. |
| `GroupManager.__init__` | `def __init__(self, store: TdcStore, client: MqttClient, z2m: Z2mDevices) -> None` | `custom_components/hass_test_data_creator/groups/manager.py` | Keep the store, the MQTT client and the Zigbee2MQTT runtime. |
| `GroupManager.all_groups` | `def all_groups(self) -> list[GroupDef]` | `custom_components/hass_test_data_creator/groups/manager.py` | Return all groups. |
| `GroupManager.load` | `def load(self) -> None` | `custom_components/hass_test_data_creator/groups/manager.py` | Hand the stored groups to the runtime, before the stored devices start. |
| `GroupManager.get` | `def get(self, group_id: str) -> GroupDef` | `custom_components/hass_test_data_creator/groups/manager.py` | Return the group or raise TDC-OUT-006. |
| `GroupManager.async_add` | `async def async_add(self, name: str, members: list[str]) -> GroupDef` | `custom_components/hass_test_data_creator/groups/manager.py` | Add a group of Zigbee2MQTT devices given by id or name and publish it. |
| `GroupManager.async_update` | `async def async_update(self, group_id: str, name: str, members: list[str]) -> GroupDef` | `custom_components/hass_test_data_creator/groups/manager.py` | Rename a group and replace its members; the retained state under the old name goes. |
| `GroupManager.async_remove` | `async def async_remove(self, group_id: str) -> None` | `custom_components/hass_test_data_creator/groups/manager.py` | Delete a group and its retained topics. |
| `GroupManager.async_drop` | `async def async_drop(self, group_ids: list[str], device_ids: set[str]) -> None` | `custom_components/hass_test_data_creator/groups/manager.py` | Delete groups and take removed devices out of the others; the topics are cleared later. |
| `GroupManager._member` | `def _member(self, reference: str) -> DeviceDef` | `custom_components/hass_test_data_creator/groups/manager.py` | Return the Zigbee2MQTT device with this id or name, or raise TDC-OUT-005. |
| `GroupManager._name_is_free` | `def _name_is_free(self, name: str, own_id: str \| None=None) -> bool` | `custom_components/hass_test_data_creator/groups/manager.py` | Whether `name` can be a group name: not reserved and used by no device or other group. |
| `hass_test_data_creator.groups.schema` | `module` | `custom_components/hass_test_data_creator/groups/schema.py` | Request fields of a group, shared by the services and the WebSocket commands. |

## history

| Symbol | Signature | File | Description |
| --- | --- | --- | --- |
| `hass_test_data_creator.history.__init__` | `module` | `custom_components/hass_test_data_creator/history/__init__.py` | Statistics backfill: hourly long-term statistics for the past days (concept 5.1, 15 O5). |
| `hass_test_data_creator.history.factory` | `module` | `custom_components/hass_test_data_creator/history/factory.py` | Factory that creates the hourly statistics of a sensor from its signal (concept 13.2). |
| `Series` | `class Series` | `custom_components/hass_test_data_creator/history/factory.py` | The statistics of one entity: its metadata and one row per hour. |
| `unit_class_of` | `def unit_class_of(device_class: str \| None, unit: str \| None) -> str \| None` | `custom_components/hass_test_data_creator/history/factory.py` | Return the unit conversion class the recorder expects for this device class and unit. |
| `SeriesFactory` | `class SeriesFactory` | `custom_components/hass_test_data_creator/history/factory.py` | Creates the series of a sensor for a list of hours. |
| `SeriesFactory.__init__` | `def __init__(self, signals: SignalFactory) -> None` | `custom_components/hass_test_data_creator/history/factory.py` | Keep the signal factory the series are computed with. |
| `SeriesFactory.supports` | `def supports(self, definition: EntityDef) -> bool` | `custom_components/hass_test_data_creator/history/factory.py` | Whether the entity is a sensor with a state class and numbers as values. |
| `SeriesFactory.create` | `def create(self, device: DeviceDef, definition: EntityDef, entity_id: str, hours: list[datetime]) -> Series` | `custom_components/hass_test_data_creator/history/factory.py` | Return the series of `definition` for the hours that start at `hours` (UTC, on the hour). |
| `SeriesFactory._signal` | `def _signal(self, device: DeviceDef, definition: EntityDef, first: datetime) -> Signal` | `custom_components/hass_test_data_creator/history/factory.py` | Return the signal of the entity; a counter gets an origin not later than `first`. |
| `_samples` | `def _samples(signal: Signal, begin: float) -> list[float]` | `custom_components/hass_test_data_creator/history/factory.py` | Return the values of the signal over the hour that starts at the signal time `begin`. |
| `_measurement_row` | `def _measurement_row(signal: Signal, start: datetime, begin: float) -> StatisticData` | `custom_components/hass_test_data_creator/history/factory.py` | Return mean, minimum and maximum of the hour that starts at `start`. |
| `_total_rows` | `def _total_rows(signal: Signal, state_class: str \| None, hours: list[datetime], times: list[float]) -> list[StatisticData]` | `custom_components/hass_test_data_creator/history/factory.py` | Return state and running sum at the end of every hour; the sum starts at 0. |
| `hass_test_data_creator.history.manager` | `module` | `custom_components/hass_test_data_creator/history/manager.py` | Imports hourly statistics for generated sensors and removes them again (concept 5.1, 10.3). |
| `last_hours` | `def last_hours(days: int, now: datetime \| None=None) -> list[datetime]` | `custom_components/hass_test_data_creator/history/manager.py` | Return the starts (UTC) of the `days` * 24 full hours before the current hour. |
| `HistoryManager` | `class HistoryManager` | `custom_components/hass_test_data_creator/history/manager.py` | Writes the statistics of generated sensors and clears them when they are removed. |
| `HistoryManager.__init__` | `def __init__(self, hass: HomeAssistant, store: TdcStore, client: StatisticsClient, series: SeriesFactory, audit: AuditLog, audit_factory: AuditEntryFactory) -> None` | `custom_components/hass_test_data_creator/history/manager.py` | Keep the collaborators. |
| `HistoryManager.async_import` | `async def async_import(self, days: int, device: str \| list[str] \| None=None, entity: str \| None=None) -> dict[str, Any]` | `custom_components/hass_test_data_creator/history/manager.py` | Write `days` of hourly statistics for the sensors with a state class and return counts. |
| `HistoryManager.check_clearable` | `def check_clearable(self, statistic_ids: list[str]) -> None` | `custom_components/hass_test_data_creator/history/manager.py` | Raise TDC-CFG-003 if there are statistics to clear but no recorder. |
| `HistoryManager.forget` | `def forget(self, statistic_ids: list[str]) -> None` | `custom_components/hass_test_data_creator/history/manager.py` | Clear the statistics `statistic_ids` in the recorder and forget them. |
| `HistoryManager._build` | `def _build(self, targets: list[Target], hours: list[datetime]) -> list[Series]` | `custom_components/hass_test_data_creator/history/manager.py` | Compute the series of all targets; runs in the executor. |
| `HistoryManager._targets` | `def _targets(self, device: str \| list[str] \| None, entity: str \| None) -> tuple[list[Target], int]` | `custom_components/hass_test_data_creator/history/manager.py` | Return the sensors to import and the number of sensors that cannot be imported. |
| `hass_test_data_creator.history.recorder` | `module` | `custom_components/hass_test_data_creator/history/recorder.py` | Access to the recorder: writing and clearing long-term statistics. |
| `StatisticsClient` | `class StatisticsClient` | `custom_components/hass_test_data_creator/history/recorder.py` | Writes and clears statistics of the recorder; fails with TDC-CFG-003 without a recorder. |
| `StatisticsClient.__init__` | `def __init__(self, hass: HomeAssistant) -> None` | `custom_components/hass_test_data_creator/history/recorder.py` | Keep the Home Assistant instance. |
| `StatisticsClient.available` | `def available(self) -> bool` | `custom_components/hass_test_data_creator/history/recorder.py` | Whether the recorder is loaded. |
| `StatisticsClient.check` | `def check(self) -> None` | `custom_components/hass_test_data_creator/history/recorder.py` | Raise TDC-CFG-003 if the recorder is not loaded. |
| `StatisticsClient.write` | `def write(self, metadata: StatisticMetaData, rows: Iterable[StatisticData]) -> None` | `custom_components/hass_test_data_creator/history/recorder.py` | Queue the hourly `rows` of one statistic; rows of the same hour are replaced. |
| `StatisticsClient.clear` | `def clear(self, statistic_ids: list[str]) -> None` | `custom_components/hass_test_data_creator/history/recorder.py` | Queue the deletion of the statistics `statistic_ids`. |
| `hass_test_data_creator.history.schema` | `module` | `custom_components/hass_test_data_creator/history/schema.py` | Request fields of a statistics import, shared by the service and the WebSocket command. |

## replay

| Symbol | Signature | File | Description |
| --- | --- | --- | --- |
| `hass_test_data_creator.replay.__init__` | `module` | `custom_components/hass_test_data_creator/replay/__init__.py` | CSV replay: files of values that a signal replays in a loop (concept 5.2). |
| `hass_test_data_creator.replay.library` | `module` | `custom_components/hass_test_data_creator/replay/library.py` | The replay files in the config folder, read once and handed to the signals. |
| `_read_folder` | `def _read_folder(folder: Path) -> dict[str, Rows \| str]` | `custom_components/hass_test_data_creator/replay/library.py` | Read every replay file of `folder`; a file that cannot be used maps to its reason. |
| `CsvLibrary` | `class CsvLibrary` | `custom_components/hass_test_data_creator/replay/library.py` | Holds the parsed replay files; call `async_refresh` to read the folder again. |
| `CsvLibrary.__init__` | `def __init__(self, hass: HomeAssistant) -> None` | `custom_components/hass_test_data_creator/replay/library.py` | Keep the instance; the folder is `<config>/hass_test_data_creator/csv`. |
| `CsvLibrary.async_refresh` | `async def async_refresh(self) -> None` | `custom_components/hass_test_data_creator/replay/library.py` | Read the folder again, off the event loop. |
| `CsvLibrary.names` | `def names(self) -> list[str]` | `custom_components/hass_test_data_creator/replay/library.py` | Return the names of the files that can be used. |
| `CsvLibrary.table` | `def table(self, file: str, step_s: float) -> tuple[Table, float]` | `custom_components/hass_test_data_creator/replay/library.py` | Return the table and the loop length of `file`, or raise TDC-SIG-004 or TDC-SIG-005. |
| `hass_test_data_creator.replay.parser` | `module` | `custom_components/hass_test_data_creator/replay/parser.py` | Pure parsing of replay files: text to rows, rows to the table of a signal. |
| `_invalid` | `def _invalid(file: str, reason: str) -> SignalError` | `custom_components/hass_test_data_creator/replay/parser.py` | Return TDC-SIG-005 for `file` with the reason. |
| `_number` | `def _number(text: str, decimal_comma: bool) -> float` | `custom_components/hass_test_data_creator/replay/parser.py` | Return `text` as a finite number; a comma is the decimal mark if the delimiter is `;`. |
| `_is_header` | `def _is_header(cells: list[str], decimal_comma: bool) -> bool` | `custom_components/hass_test_data_creator/replay/parser.py` | Whether the first row names its columns instead of holding numbers. |
| `parse_rows` | `def parse_rows(text: str, file: str) -> Rows` | `custom_components/hass_test_data_creator/replay/parser.py` | Return the rows of a replay file: `(None, value)` for one column, `(seconds, value)` for two. |
| `build_table` | `def build_table(rows: Rows, step_s: float) -> tuple[Table, float]` | `custom_components/hass_test_data_creator/replay/parser.py` | Return the table of `(seconds, value)` points from 0 and the loop length in seconds. |

## scenarios

| Symbol | Signature | File | Description |
| --- | --- | --- | --- |
| `hass_test_data_creator.scenarios.__init__` | `module` | `custom_components/hass_test_data_creator/scenarios/__init__.py` | Scenarios: named lists of timed steps (concept 6.2). |
| `hass_test_data_creator.scenarios.manager` | `module` | `custom_components/hass_test_data_creator/scenarios/manager.py` | Stores scenarios and runs their steps one after the other (concept 6.2). |
| `ScenarioManager` | `class ScenarioManager` | `custom_components/hass_test_data_creator/scenarios/manager.py` | Adds, changes and removes scenarios and runs one: each step waits `after_s` after the step before. |
| `ScenarioManager.__init__` | `def __init__(self, hass: HomeAssistant, store: TdcStore, actions: ActionFactory, runner: ActionRunner, audit: AuditLog, audit_factory: AuditEntryFactory) -> None` | `custom_components/hass_test_data_creator/scenarios/manager.py` | Keep the collaborators. |
| `ScenarioManager.async_stop` | `def async_stop(self) -> None` | `custom_components/hass_test_data_creator/scenarios/manager.py` | Cancel the steps that still wait. |
| `ScenarioManager.all_scenarios` | `def all_scenarios(self) -> list[ScenarioDef]` | `custom_components/hass_test_data_creator/scenarios/manager.py` | Return all scenarios. |
| `ScenarioManager.get` | `def get(self, scenario_id: str) -> ScenarioDef` | `custom_components/hass_test_data_creator/scenarios/manager.py` | Return the scenario or raise SCH_SCENARIO_NOT_FOUND. |
| `ScenarioManager._check_steps` | `def _check_steps(self, data: dict[str, Any]) -> None` | `custom_components/hass_test_data_creator/scenarios/manager.py` | Raise TDC-SCH-001 unless every step names an action that exists. |
| `ScenarioManager.async_add` | `async def async_add(self, data: dict[str, Any]) -> ScenarioDef` | `custom_components/hass_test_data_creator/scenarios/manager.py` | Validate and store a scenario; `data` has a name and the list of steps. |
| `ScenarioManager.async_update` | `async def async_update(self, scenario_id: str, data: dict[str, Any]) -> ScenarioDef` | `custom_components/hass_test_data_creator/scenarios/manager.py` | Replace the name and the steps of a scenario; a wrong request changes nothing. |
| `ScenarioManager.async_remove` | `async def async_remove(self, scenario_id: str) -> None` | `custom_components/hass_test_data_creator/scenarios/manager.py` | Delete a scenario. |
| `ScenarioManager.forget` | `def forget(self, scenario_ids: list[str]) -> None` | `custom_components/hass_test_data_creator/scenarios/manager.py` | Delete scenarios without saving; the removal saves the store afterwards. |
| `ScenarioManager.async_run` | `async def async_run(self, scenario_id: str) -> int` | `custom_components/hass_test_data_creator/scenarios/manager.py` | Start the scenario and return the number of steps; waiting steps run in the background. |
| `ScenarioManager._run_later` | `def _run_later(self, delay: float, name: str, step: dict[str, Any]) -> None` | `custom_components/hass_test_data_creator/scenarios/manager.py` | Run `step` after `delay` seconds. |
| `ScenarioManager._run_later.fire` | `async def fire(_now: datetime) -> None` | `custom_components/hass_test_data_creator/scenarios/manager.py` | Run the step and forget its timer. |
| `ScenarioManager._run_step` | `async def _run_step(self, name: str, step: dict[str, Any]) -> None` | `custom_components/hass_test_data_creator/scenarios/manager.py` | Run the action of one step on all devices of its target. |
| `hass_test_data_creator.scenarios.schema` | `module` | `custom_components/hass_test_data_creator/scenarios/schema.py` | Request fields of a scenario, shared by the services and the WebSocket commands. |
