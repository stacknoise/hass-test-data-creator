# Code index – HASS Test Data Creator

> GENERATED FILE – do not edit by hand. Regenerate with `python scripts/code_index.py` (concept 13.5).

Lists every module, class and function of the integration with signature, file and a one-line summary, grouped by topic. Read it before writing code to reuse existing functions instead of duplicating them.

## (root)

| Symbol | Signature | File | Description |
| --- | --- | --- | --- |
| `hass_test_data_creator.__init__` | `module` | `custom_components/hass_test_data_creator/__init__.py` | HASS Test Data Creator: test devices and test data for test environments. |
| `async_setup_entry` | `async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool` | `custom_components/hass_test_data_creator/__init__.py` | Load the store and templates, set up the platforms, start the tick, register the panel. |
| `async_unload_entry` | `async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool` | `custom_components/hass_test_data_creator/__init__.py` | Stop the tick, unload the platforms and remove services and panel. |
| `async_remove_entry` | `async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None` | `custom_components/hass_test_data_creator/__init__.py` | Delete everything left behind: created areas and the storage file. |
| `hass_test_data_creator.binary_sensor` | `module` | `custom_components/hass_test_data_creator/binary_sensor.py` | The binary_sensor platform of the generated devices. |
| `hass_test_data_creator.config_flow` | `module` | `custom_components/hass_test_data_creator/config_flow.py` | Config flow: one entry, created after the test environment confirmation (concept 10.4). |
| `TestDataCreatorConfigFlow` | `class TestDataCreatorConfigFlow(ConfigFlow)` | `custom_components/hass_test_data_creator/config_flow.py` | Asks once whether this is a test instance and for the seed and tick interval. |
| `TestDataCreatorConfigFlow.async_step_user` | `async def async_step_user(self, user_input: dict[str, Any] \| None=None) -> ConfigFlowResult` | `custom_components/hass_test_data_creator/config_flow.py` | Create the entry if the user confirms that this is a test environment. |
| `hass_test_data_creator.const` | `module` | `custom_components/hass_test_data_creator/const.py` | Constants of the HASS Test Data Creator. |
| `hass_test_data_creator.event` | `module` | `custom_components/hass_test_data_creator/event.py` | The event platform of the generated devices. |
| `hass_test_data_creator.panel` | `module` | `custom_components/hass_test_data_creator/panel.py` | Registers the sidebar panel and serves the built panel file (concept 9). |
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
| `hass_test_data_creator.core.ids` | `module` | `custom_components/hass_test_data_creator/core/ids.py` | Identifier helpers. |
| `new_id` | `def new_id() -> str` | `custom_components/hass_test_data_creator/core/ids.py` | Return a new time-ordered hexadecimal identifier (26 characters). |
| `hass_test_data_creator.core.response_factory` | `module` | `custom_components/hass_test_data_creator/core/response_factory.py` | Factory for WebSocket replies (concept 13.2). |
| `ResponseFactory` | `class ResponseFactory` | `custom_components/hass_test_data_creator/core/response_factory.py` | Creates the result and error replies of the panel commands. |
| `ResponseFactory.result` | `def result(self, msg_id: int, payload: Any) -> dict[str, Any]` | `custom_components/hass_test_data_creator/core/response_factory.py` | Return the success reply with `payload`. |
| `ResponseFactory.error` | `def error(self, msg_id: int, error: TdcError) -> dict[str, Any]` | `custom_components/hass_test_data_creator/core/response_factory.py` | Return the error reply: the TDC code as error code, the translated text as message. |
| `hass_test_data_creator.core.runtime` | `module` | `custom_components/hass_test_data_creator/core/runtime.py` | Runtime data: the factories and managers of one loaded config entry (concept 2). |
| `TdcData` | `class TdcData` | `custom_components/hass_test_data_creator/core/runtime.py` | Everything a loaded config entry needs; created once in `async_setup_entry`. |
| `build_data` | `def build_data(hass: HomeAssistant, entry: ConfigEntry) -> TdcData` | `custom_components/hass_test_data_creator/core/runtime.py` | Create the factories and managers of `entry` and wire them together. |
| `get_data` | `def get_data(hass: HomeAssistant) -> TdcData` | `custom_components/hass_test_data_creator/core/runtime.py` | Return the runtime data or raise TDC-CFG-002 if the integration is not loaded. |

## model

| Symbol | Signature | File | Description |
| --- | --- | --- | --- |
| `hass_test_data_creator.model.__init__` | `module` | `custom_components/hass_test_data_creator/model/__init__.py` | Model package of the HASS Test Data Creator. |
| `hass_test_data_creator.model.models` | `module` | `custom_components/hass_test_data_creator/model/models.py` | Data classes of devices, entities and creation runs (concept 4.1). |
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

## store

| Symbol | Signature | File | Description |
| --- | --- | --- | --- |
| `hass_test_data_creator.store.__init__` | `module` | `custom_components/hass_test_data_creator/store/__init__.py` | Store package of the HASS Test Data Creator. |
| `hass_test_data_creator.store.store` | `module` | `custom_components/hass_test_data_creator/store/store.py` | Persistent storage of devices, runs and markers (concept 4.3, 4.4). |
| `_empty` | `def _empty() -> dict[str, Any]` | `custom_components/hass_test_data_creator/store/store.py` | Return the content of a new store. |
| `TdcStore` | `class TdcStore` | `custom_components/hass_test_data_creator/store/store.py` | Holds the generated devices, the runs and the list of areas the integration created. |
| `TdcStore.__init__` | `def __init__(self, hass: HomeAssistant) -> None` | `custom_components/hass_test_data_creator/store/store.py` | Create the store; call `async_load` before use. |
| `TdcStore.async_load` | `async def async_load(self) -> None` | `custom_components/hass_test_data_creator/store/store.py` | Load the stored content, if any. |
| `TdcStore.devices` | `def devices(self) -> list[DeviceDef]` | `custom_components/hass_test_data_creator/store/store.py` | Return all stored devices in creation order. |
| `TdcStore.device` | `def device(self, device_id: str) -> DeviceDef \| None` | `custom_components/hass_test_data_creator/store/store.py` | Return the device with `device_id`, or None. |
| `TdcStore.device_count` | `def device_count(self) -> int` | `custom_components/hass_test_data_creator/store/store.py` | Return the number of stored devices. |
| `TdcStore.add_device` | `def add_device(self, device: DeviceDef) -> None` | `custom_components/hass_test_data_creator/store/store.py` | Store `device`. |
| `TdcStore.remove_device` | `def remove_device(self, device_id: str) -> None` | `custom_components/hass_test_data_creator/store/store.py` | Delete the device and its id in the run it belongs to. |
| `TdcStore.runs` | `def runs(self) -> list[RunRecord]` | `custom_components/hass_test_data_creator/store/store.py` | Return all runs. |
| `TdcStore.add_run` | `def add_run(self, run: RunRecord) -> None` | `custom_components/hass_test_data_creator/store/store.py` | Store `run`. |
| `TdcStore.schedules` | `def schedules(self) -> list[ScheduleDef]` | `custom_components/hass_test_data_creator/store/store.py` | Return all schedules in creation order. |
| `TdcStore.schedule` | `def schedule(self, schedule_id: str) -> ScheduleDef \| None` | `custom_components/hass_test_data_creator/store/store.py` | Return the schedule with `schedule_id`, or None. |
| `TdcStore.put_schedule` | `def put_schedule(self, schedule: ScheduleDef) -> None` | `custom_components/hass_test_data_creator/store/store.py` | Store `schedule`, replacing one with the same id. |
| `TdcStore.remove_schedule` | `def remove_schedule(self, schedule_id: str) -> None` | `custom_components/hass_test_data_creator/store/store.py` | Delete the schedule `schedule_id`. |
| `TdcStore.remove_run` | `def remove_run(self, run_id: str) -> None` | `custom_components/hass_test_data_creator/store/store.py` | Delete the run record `run_id`. |
| `TdcStore.next_index` | `def next_index(self, template_id: str, count: int) -> int` | `custom_components/hass_test_data_creator/store/store.py` | Reserve `count` device numbers of a template and return the first one (from 1). |
| `TdcStore.created_areas` | `def created_areas(self) -> list[str]` | `custom_components/hass_test_data_creator/store/store.py` | Return the ids of the areas the integration created itself. |
| `TdcStore.add_created_area` | `def add_created_area(self, area_id: str) -> None` | `custom_components/hass_test_data_creator/store/store.py` | Remember that the integration created the area. |
| `TdcStore.forget_area` | `def forget_area(self, area_id: str) -> None` | `custom_components/hass_test_data_creator/store/store.py` | Forget an area, for example after it was deleted. |
| `TdcStore.schedule_save` | `def schedule_save(self) -> None` | `custom_components/hass_test_data_creator/store/store.py` | Save after a short delay; used for frequent writes. |
| `TdcStore.async_save` | `async def async_save(self) -> None` | `custom_components/hass_test_data_creator/store/store.py` | Save at once; used for changes made by the user. |
| `TdcStore.async_remove` | `async def async_remove(self) -> None` | `custom_components/hass_test_data_creator/store/store.py` | Delete the storage file. |

## engine

| Symbol | Signature | File | Description |
| --- | --- | --- | --- |
| `hass_test_data_creator.engine.__init__` | `module` | `custom_components/hass_test_data_creator/engine/__init__.py` | Engine package of the HASS Test Data Creator. |
| `hass_test_data_creator.engine.signal_factory` | `module` | `custom_components/hass_test_data_creator/engine/signal_factory.py` | Factory that creates a signal per shape (concept 13.2). |
| `Signal` | `class Signal` | `custom_components/hass_test_data_creator/engine/signal_factory.py` | A configured signal that returns its value for a point in time. |
| `Signal.__init__` | `def __init__(self, spec: SignalSpec) -> None` | `custom_components/hass_test_data_creator/engine/signal_factory.py` | Keep the validated spec. |
| `Signal.value` | `def value(self, t: float) -> float` | `custom_components/hass_test_data_creator/engine/signal_factory.py` | Return the value at signal time `t` in seconds. |
| `SignalFactory` | `class SignalFactory` | `custom_components/hass_test_data_creator/engine/signal_factory.py` | Creates validated signals from the signal block of a template. |
| `SignalFactory.shapes` | `def shapes(self) -> tuple[str, ...]` | `custom_components/hass_test_data_creator/engine/signal_factory.py` | Return the names of all shapes. |
| `SignalFactory.create` | `def create(self, definition: dict[str, Any], seed: int, origin: float) -> Signal` | `custom_components/hass_test_data_creator/engine/signal_factory.py` | Return the signal for `definition` of one entity with its `seed` and time `origin`. |
| `hass_test_data_creator.engine.signals` | `module` | `custom_components/hass_test_data_creator/engine/signals.py` | Pure signal functions: the value of a signal is a function of time and seed (concept 5). |
| `SignalSpec` | `class SignalSpec` | `custom_components/hass_test_data_creator/engine/signals.py` | Parameters of one signal; `seed` and `origin` are set per entity. |
| `SignalSpec.from_dict` | `def from_dict(cls, data: dict[str, Any], seed: int, origin: float) -> SignalSpec` | `custom_components/hass_test_data_creator/engine/signals.py` | Return the spec of a template signal `data` for one entity. |
| `hash01` | `def hash01(seed: int, n: int) -> float` | `custom_components/hass_test_data_creator/engine/signals.py` | Return a deterministic number in [0, 1) for the integers `seed` and `n` (SplitMix64). |
| `_cycle` | `def _cycle(spec: SignalSpec, t: float) -> float` | `custom_components/hass_test_data_creator/engine/signals.py` | Return the position inside one period in [0, 1) including the phase. |
| `_constant` | `def _constant(spec: SignalSpec, t: float) -> float` | `custom_components/hass_test_data_creator/engine/signals.py` | Return the middle of the range. |
| `_sine` | `def _sine(spec: SignalSpec, t: float) -> float` | `custom_components/hass_test_data_creator/engine/signals.py` | Return a sine wave between 0 and 1. |
| `_saw` | `def _saw(spec: SignalSpec, t: float) -> float` | `custom_components/hass_test_data_creator/engine/signals.py` | Return a rising saw tooth. |
| `_square` | `def _square(spec: SignalSpec, t: float) -> float` | `custom_components/hass_test_data_creator/engine/signals.py` | Return a square wave: high in the first half of the period. |
| `_triangle` | `def _triangle(spec: SignalSpec, t: float) -> float` | `custom_components/hass_test_data_creator/engine/signals.py` | Return a triangle wave. |
| `_noise` | `def _noise(spec: SignalSpec, t: float) -> float` | `custom_components/hass_test_data_creator/engine/signals.py` | Return white noise that changes every `interval_s` seconds. |
| `_random_walk` | `def _random_walk(spec: SignalSpec, t: float) -> float` | `custom_components/hass_test_data_creator/engine/signals.py` | Return smooth noise: random points one period apart, joined by a smooth curve. |
| `value_at` | `def value_at(spec: SignalSpec, t: float) -> float` | `custom_components/hass_test_data_creator/engine/signals.py` | Return the value of the signal at signal time `t` (seconds), scaled to min..max. |
| `hass_test_data_creator.engine.tick` | `module` | `custom_components/hass_test_data_creator/engine/tick.py` | The tick that drives all signals with one timer (concept 5.3). |
| `signal_time` | `def signal_time(now: datetime \| None=None) -> float` | `custom_components/hass_test_data_creator/engine/tick.py` | Return the signal time: seconds of the local wall clock, so daily curves follow the day. |
| `Tick` | `class Tick` | `custom_components/hass_test_data_creator/engine/tick.py` | Sends one dispatcher signal per interval and reports a tick that takes too long. |
| `Tick.__init__` | `def __init__(self, hass: HomeAssistant, seconds: int, on_slow: Callable[[float, float], None]) -> None` | `custom_components/hass_test_data_creator/engine/tick.py` | Keep the interval in seconds and the callback `on_slow(duration, interval)`. |
| `Tick.start` | `def start(self) -> None` | `custom_components/hass_test_data_creator/engine/tick.py` | Start the timer. |
| `Tick.stop` | `def stop(self) -> None` | `custom_components/hass_test_data_creator/engine/tick.py` | Stop the timer. |
| `Tick._fire` | `def _fire(self, _now: datetime) -> None` | `custom_components/hass_test_data_creator/engine/tick.py` | Send the tick signal and warn once if it took more than the allowed share. |

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
| `TemplateFactory` | `class TemplateFactory` | `custom_components/hass_test_data_creator/templates/factory.py` | Creates templates and entity definitions from plain dictionaries. |
| `TemplateFactory.entity` | `def entity(self, data: dict[str, Any]) -> EntityDef` | `custom_components/hass_test_data_creator/templates/factory.py` | Return the validated entity definition for `data`. |
| `TemplateFactory.template` | `def template(self, data: dict[str, Any], *, bundled: bool=True) -> Template` | `custom_components/hass_test_data_creator/templates/factory.py` | Return the validated template for `data`. |
| `TemplateFactory.custom` | `def custom(self, entities: list[dict[str, Any]]) -> Template` | `custom_components/hass_test_data_creator/templates/factory.py` | Return a template for a device whose entities the user defined by hand. |
| `TemplateFactory._check_unique` | `def _check_unique(self, entities: list[EntityDef]) -> None` | `custom_components/hass_test_data_creator/templates/factory.py` | Raise if two entities of one template share a key. |
| `TemplateFactory._check_content` | `def _check_content(self, data: dict[str, Any]) -> None` | `custom_components/hass_test_data_creator/templates/factory.py` | Check the rules that depend on the platform: signal, shape and device class. |
| `hass_test_data_creator.templates.registry` | `module` | `custom_components/hass_test_data_creator/templates/registry.py` | Loads the bundled and the user's template files (concept 4.2). |
| `_read_files` | `def _read_files(directory: Path) -> list[tuple[str, dict[str, Any]]]` | `custom_components/hass_test_data_creator/templates/registry.py` | Return (file name, content) of every YAML file in `directory`; runs in the executor. |
| `TemplateRegistry` | `class TemplateRegistry` | `custom_components/hass_test_data_creator/templates/registry.py` | Holds all templates by id. |
| `TemplateRegistry.__init__` | `def __init__(self, factory: TemplateFactory) -> None` | `custom_components/hass_test_data_creator/templates/registry.py` | Create an empty registry that builds templates with `factory`. |
| `TemplateRegistry.async_load` | `async def async_load(self, hass: HomeAssistant) -> None` | `custom_components/hass_test_data_creator/templates/registry.py` | Load the bundled templates and then the user's; a user template can replace one. |
| `TemplateRegistry.get` | `def get(self, template_id: str) -> Template` | `custom_components/hass_test_data_creator/templates/registry.py` | Return the template with `template_id` or raise TPL_NOT_FOUND. |
| `TemplateRegistry.all` | `def all(self) -> list[Template]` | `custom_components/hass_test_data_creator/templates/registry.py` | Return all templates sorted by name. |
| `hass_test_data_creator.templates.schema` | `module` | `custom_components/hass_test_data_creator/templates/schema.py` | Voluptuous schemas of templates and custom entities (concept 4.2). |

## devices

| Symbol | Signature | File | Description |
| --- | --- | --- | --- |
| `hass_test_data_creator.devices.__init__` | `module` | `custom_components/hass_test_data_creator/devices/__init__.py` | Devices package of the HASS Test Data Creator. |
| `hass_test_data_creator.devices.manager` | `module` | `custom_components/hass_test_data_creator/devices/manager.py` | Creates devices for a creation job (concept 4.1, 12). |
| `CreationJob` | `class CreationJob` | `custom_components/hass_test_data_creator/devices/manager.py` | The inputs of one creation job. |
| `DevicesManager` | `class DevicesManager` | `custom_components/hass_test_data_creator/devices/manager.py` | Creates devices with their registry entries, areas and entities. |
| `DevicesManager.__init__` | `def __init__(self, store: TdcStore, templates: TemplateRegistry, template_factory: TemplateFactory, device_factory: DeviceFactory, outputs: OutputAdapterFactory, areas: AreaAssigner, audit: AuditLog, audit_factory: AuditEntryFactory) -> None` | `custom_components/hass_test_data_creator/devices/manager.py` | Keep the collaborators. |
| `DevicesManager._template_for` | `def _template_for(self, job: CreationJob) -> Template` | `custom_components/hass_test_data_creator/devices/manager.py` | Return the template of `job`: a stored one, or one built from its custom entities. |
| `DevicesManager._check_limits` | `def _check_limits(self, job: CreationJob, template: Template) -> None` | `custom_components/hass_test_data_creator/devices/manager.py` | Raise if the job exceeds a limit of concept 12. |
| `DevicesManager.async_create` | `async def async_create(self, job: CreationJob) -> RunRecord` | `custom_components/hass_test_data_creator/devices/manager.py` | Create the devices of `job` in chunks and return the run that holds them. |
| `hass_test_data_creator.devices.schema` | `module` | `custom_components/hass_test_data_creator/devices/schema.py` | Request fields of a creation job, shared by the service and the WebSocket command. |
| `job_from_request` | `def job_from_request(data: dict[str, Any], default_seed: str) -> CreationJob` | `custom_components/hass_test_data_creator/devices/schema.py` | Return the creation job for a validated request; `default_seed` is used without a seed. |

## areas

| Symbol | Signature | File | Description |
| --- | --- | --- | --- |
| `hass_test_data_creator.areas.__init__` | `module` | `custom_components/hass_test_data_creator/areas/__init__.py` | Areas package of the HASS Test Data Creator. |
| `hass_test_data_creator.areas.assigner` | `module` | `custom_components/hass_test_data_creator/areas/assigner.py` | Finds or creates areas and records the ones the integration created (concept 4.4). |
| `AreaAssigner` | `class AreaAssigner` | `custom_components/hass_test_data_creator/areas/assigner.py` | Resolves area names to area ids and cleans up the areas it created. |
| `AreaAssigner.__init__` | `def __init__(self, hass: HomeAssistant, store: TdcStore) -> None` | `custom_components/hass_test_data_creator/areas/assigner.py` | Keep the Home Assistant instance and the store with the list of created areas. |
| `AreaAssigner.ensure` | `def ensure(self, name: str) -> str` | `custom_components/hass_test_data_creator/areas/assigner.py` | Return the id of the area `name`; create it and remember it if it does not exist. |
| `AreaAssigner.delete_empty_created` | `def delete_empty_created(self) -> list[str]` | `custom_components/hass_test_data_creator/areas/assigner.py` | Delete the created areas that hold no device and no entity; return their names. |
| `hass_test_data_creator.areas.distribution` | `module` | `custom_components/hass_test_data_creator/areas/distribution.py` | Distribution of new devices over areas (concept 4.1, 7.2). |
| `distribute` | `def distribute(names: list[str], count: int, mode: str, seed: int) -> list[str \| None]` | `custom_components/hass_test_data_creator/areas/distribution.py` | Return an area name (or None without areas) for each of `count` devices. |

## outputs

| Symbol | Signature | File | Description |
| --- | --- | --- | --- |
| `hass_test_data_creator.outputs.__init__` | `module` | `custom_components/hass_test_data_creator/outputs/__init__.py` | Outputs package of the HASS Test Data Creator. |
| `hass_test_data_creator.outputs.adapter` | `module` | `custom_components/hass_test_data_creator/outputs/adapter.py` | Output adapters and their factory (concept 7.1, 13.2). |
| `OutputAdapter` | `class OutputAdapter(ABC)` | `custom_components/hass_test_data_creator/outputs/adapter.py` | Turns a device description into Home Assistant objects or MQTT messages. |
| `OutputAdapter.create` | `def create(self, device: DeviceDef, area_id: str \| None) -> None` | `custom_components/hass_test_data_creator/outputs/adapter.py` | Register `device` in its output; `area_id` is the resolved area, if any. |
| `OutputAdapter.announce` | `def announce(self, devices: list[DeviceDef]) -> None` | `custom_components/hass_test_data_creator/outputs/adapter.py` | Make the entities of the registered `devices` appear. |
| `OutputAdapter.remove` | `def remove(self, device: DeviceDef) -> None` | `custom_components/hass_test_data_creator/outputs/adapter.py` | Remove `device` and everything it created from its output. |
| `OutputAdapterFactory` | `class OutputAdapterFactory` | `custom_components/hass_test_data_creator/outputs/adapter.py` | Creates the adapter for the output of a device. |
| `OutputAdapterFactory.__init__` | `def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None` | `custom_components/hass_test_data_creator/outputs/adapter.py` | Keep the instance and the config entry the adapters work for. |
| `OutputAdapterFactory.create` | `def create(self, output: str) -> OutputAdapter` | `custom_components/hass_test_data_creator/outputs/adapter.py` | Return the adapter for `output`; MQTT outputs arrive in v0.3. |
| `hass_test_data_creator.outputs.native.__init__` | `module` | `custom_components/hass_test_data_creator/outputs/native/__init__.py` | Native package of the HASS Test Data Creator. |
| `hass_test_data_creator.outputs.native.adapter` | `module` | `custom_components/hass_test_data_creator/outputs/native/adapter.py` | Native output: devices in the registry and entities on the Home Assistant platforms. |
| `NativeAdapter` | `class NativeAdapter(OutputAdapter)` | `custom_components/hass_test_data_creator/outputs/native/adapter.py` | Registers devices with markers (concept 4.4) and lets the platforms add the entities. |
| `NativeAdapter.__init__` | `def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None` | `custom_components/hass_test_data_creator/outputs/native/adapter.py` | Keep the instance and the config entry that owns the devices. |
| `NativeAdapter.create` | `def create(self, device: DeviceDef, area_id: str \| None) -> None` | `custom_components/hass_test_data_creator/outputs/native/adapter.py` | Add `device` to the device registry with the entry, manufacturer and test label. |
| `NativeAdapter.announce` | `def announce(self, devices: list[DeviceDef]) -> None` | `custom_components/hass_test_data_creator/outputs/native/adapter.py` | Tell the platforms to add the entities of `devices`. |
| `NativeAdapter.remove` | `def remove(self, device: DeviceDef) -> None` | `custom_components/hass_test_data_creator/outputs/native/adapter.py` | Remove the registry device of `device`; Home Assistant removes its entities. |

## platforms

| Symbol | Signature | File | Description |
| --- | --- | --- | --- |
| `hass_test_data_creator.platforms.__init__` | `module` | `custom_components/hass_test_data_creator/platforms/__init__.py` | Platforms package of the HASS Test Data Creator. |
| `hass_test_data_creator.platforms.entities` | `module` | `custom_components/hass_test_data_creator/platforms/entities.py` | Entity classes of the native output (concept 5.4, 7.2). |
| `TdcEntity` | `class TdcEntity` | `custom_components/hass_test_data_creator/platforms/entities.py` | Mixin with what every generated entity has: ids, device info and the live registry. |
| `TdcEntity.__init__` | `def __init__(self, device: DeviceDef, definition: EntityDef, live: Live) -> None` | `custom_components/hass_test_data_creator/platforms/entities.py` | Set unique id, name, device info and category from the definitions. |
| `TdcEntity.async_added_to_hass` | `async def async_added_to_hass(self) -> None` | `custom_components/hass_test_data_creator/platforms/entities.py` | Make the entity findable for actions. |
| `TdcEntity.async_will_remove_from_hass` | `async def async_will_remove_from_hass(self) -> None` | `custom_components/hass_test_data_creator/platforms/entities.py` | Remove the entity from the live registry. |
| `TdcStatefulEntity` | `class TdcStatefulEntity(TdcEntity, RestoreEntity)` | `custom_components/hass_test_data_creator/platforms/entities.py` | A generated entity with an on/off state that survives a restart. |
| `TdcStatefulEntity.__init__` | `def __init__(self, device: DeviceDef, definition: EntityDef, live: Live) -> None` | `custom_components/hass_test_data_creator/platforms/entities.py` | Start in the initial state of the definition. |
| `TdcStatefulEntity.async_added_to_hass` | `async def async_added_to_hass(self) -> None` | `custom_components/hass_test_data_creator/platforms/entities.py` | Restore the last state. |
| `TdcSensor` | `class TdcSensor(TdcEntity, SensorEntity)` | `custom_components/hass_test_data_creator/platforms/entities.py` | A sensor whose value comes from a signal. |
| `TdcSensor.__init__` | `def __init__(self, device: DeviceDef, definition: EntityDef, live: Live, signal: Signal) -> None` | `custom_components/hass_test_data_creator/platforms/entities.py` | Create the sensor with its signal and compute the first value. |
| `TdcSensor.async_added_to_hass` | `async def async_added_to_hass(self) -> None` | `custom_components/hass_test_data_creator/platforms/entities.py` | Follow the tick. |
| `TdcSensor._handle_tick` | `def _handle_tick(self) -> None` | `custom_components/hass_test_data_creator/platforms/entities.py` | Compute a new value if the interval of the signal has passed. |
| `TdcBinarySensor` | `class TdcBinarySensor(TdcStatefulEntity, BinarySensorEntity)` | `custom_components/hass_test_data_creator/platforms/entities.py` | A binary sensor that is set by actions; motion sensors switch off after a pulse. |
| `TdcBinarySensor.async_will_remove_from_hass` | `async def async_will_remove_from_hass(self) -> None` | `custom_components/hass_test_data_creator/platforms/entities.py` | Cancel a running pulse. |
| `TdcBinarySensor.set_state` | `def set_state(self, is_on: bool) -> None` | `custom_components/hass_test_data_creator/platforms/entities.py` | Set the state; a running pulse is cancelled. |
| `TdcBinarySensor.pulse` | `def pulse(self, seconds: float \| None) -> None` | `custom_components/hass_test_data_creator/platforms/entities.py` | Switch on and off again after `seconds` (default: the pulse of the template). |
| `TdcBinarySensor._end_pulse` | `def _end_pulse(self, _now: datetime) -> None` | `custom_components/hass_test_data_creator/platforms/entities.py` | Switch off at the end of a pulse. |
| `TdcBinarySensor._clear_pulse` | `def _clear_pulse(self) -> None` | `custom_components/hass_test_data_creator/platforms/entities.py` | Cancel a running pulse timer. |
| `TdcSwitch` | `class TdcSwitch(TdcStatefulEntity, SwitchEntity)` | `custom_components/hass_test_data_creator/platforms/entities.py` | A switch that keeps its state. |
| `TdcSwitch.async_turn_on` | `async def async_turn_on(self, **kwargs: Any) -> None` | `custom_components/hass_test_data_creator/platforms/entities.py` | Switch on. |
| `TdcSwitch.async_turn_off` | `async def async_turn_off(self, **kwargs: Any) -> None` | `custom_components/hass_test_data_creator/platforms/entities.py` | Switch off. |
| `TdcEvent` | `class TdcEvent(TdcEntity, EventEntity)` | `custom_components/hass_test_data_creator/platforms/entities.py` | An event entity, for example the buttons of a wall button. |
| `TdcEvent.__init__` | `def __init__(self, device: DeviceDef, definition: EntityDef, live: Live) -> None` | `custom_components/hass_test_data_creator/platforms/entities.py` | Create the event entity with the event types of its definition. |
| `TdcEvent.press` | `def press(self, event_type: str) -> None` | `custom_components/hass_test_data_creator/platforms/entities.py` | Fire the event `event_type`. |
| `hass_test_data_creator.platforms.factory` | `module` | `custom_components/hass_test_data_creator/platforms/factory.py` | Factory that creates the entity class per platform (concept 13.2). |
| `entity_seed` | `def entity_seed(device_seed: int, key: str) -> int` | `custom_components/hass_test_data_creator/platforms/factory.py` | Return the seed of one entity from the seed of its device and its key. |
| `EntityFactory` | `class EntityFactory` | `custom_components/hass_test_data_creator/platforms/factory.py` | Creates the Home Assistant entity for an entity definition. |
| `EntityFactory.__init__` | `def __init__(self, signals: SignalFactory, live: Live) -> None` | `custom_components/hass_test_data_creator/platforms/factory.py` | Keep the signal factory and the live registry the entities register in. |
| `EntityFactory.create` | `def create(self, device: DeviceDef, definition: EntityDef) -> TdcEntity` | `custom_components/hass_test_data_creator/platforms/factory.py` | Return the entity for `definition` of `device`. |
| `hass_test_data_creator.platforms.setup` | `module` | `custom_components/hass_test_data_creator/platforms/setup.py` | Common setup of the entity platforms (concept 7.2). |
| `platform_setup` | `def platform_setup(platform: str) -> Callable[[HomeAssistant, ConfigEntry, AddEntitiesCallback], Awaitable[None]]` | `custom_components/hass_test_data_creator/platforms/setup.py` | Return the `async_setup_entry` of the platform `platform`. |
| `platform_setup.async_setup_entry` | `async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback) -> None` | `custom_components/hass_test_data_creator/platforms/setup.py` | Add the stored entities and the ones of devices created later. |
| `platform_setup.async_setup_entry._add` | `def _add(devices: list[DeviceDef]) -> None` | `custom_components/hass_test_data_creator/platforms/setup.py` | Add the entities of this platform for `devices`. |

## scheduler

| Symbol | Signature | File | Description |
| --- | --- | --- | --- |
| `hass_test_data_creator.scheduler.__init__` | `module` | `custom_components/hass_test_data_creator/scheduler/__init__.py` | Scheduler package of the HASS Test Data Creator. |
| `hass_test_data_creator.scheduler.actions` | `module` | `custom_components/hass_test_data_creator/scheduler/actions.py` | Actions on entities and their factory (concept 6.2, 13.2); v0.1 has manual actions only. |
| `_turn_on` | `async def _turn_on(entity: Any, params: dict[str, Any]) -> None` | `custom_components/hass_test_data_creator/scheduler/actions.py` | Switch a switch on. |
| `_turn_off` | `async def _turn_off(entity: Any, params: dict[str, Any]) -> None` | `custom_components/hass_test_data_creator/scheduler/actions.py` | Switch a switch off. |
| `_toggle` | `async def _toggle(entity: Any, params: dict[str, Any]) -> None` | `custom_components/hass_test_data_creator/scheduler/actions.py` | Toggle a switch. |
| `_set_on` | `async def _set_on(entity: Any, params: dict[str, Any]) -> None` | `custom_components/hass_test_data_creator/scheduler/actions.py` | Set a binary sensor to on. |
| `_set_off` | `async def _set_off(entity: Any, params: dict[str, Any]) -> None` | `custom_components/hass_test_data_creator/scheduler/actions.py` | Set a binary sensor to off. |
| `_pulse` | `async def _pulse(entity: Any, params: dict[str, Any]) -> None` | `custom_components/hass_test_data_creator/scheduler/actions.py` | Switch a binary sensor on for `duration_s` seconds. |
| `_press` | `async def _press(entity: Any, params: dict[str, Any]) -> None` | `custom_components/hass_test_data_creator/scheduler/actions.py` | Fire an event of an event entity; `event_type` defaults to the first one. |
| `ActionFactory` | `class ActionFactory` | `custom_components/hass_test_data_creator/scheduler/actions.py` | Creates the action for a platform and an action name. |
| `ActionFactory.create` | `def create(self, platform: str, action: str) -> Action` | `custom_components/hass_test_data_creator/scheduler/actions.py` | Return the action or raise SCH_UNKNOWN_ACTION. |
| `ActionFactory.names` | `def names(self) -> dict[str, list[str]]` | `custom_components/hass_test_data_creator/scheduler/actions.py` | Return the action names per platform. |
| `hass_test_data_creator.scheduler.manager` | `module` | `custom_components/hass_test_data_creator/scheduler/manager.py` | Stores schedules and runs their actions at the planned moments (concept 6). |
| `ScheduleManager` | `class ScheduleManager` | `custom_components/hass_test_data_creator/scheduler/manager.py` | Adds, removes and enables schedules and fires them with a single timer. |
| `ScheduleManager.__init__` | `def __init__(self, hass: HomeAssistant, store: TdcStore, triggers: TriggerFactory, planner: SchedulePlanner, actions: ActionFactory, runner: ActionRunner, audit: AuditLog, audit_factory: AuditEntryFactory) -> None` | `custom_components/hass_test_data_creator/scheduler/manager.py` | Keep the collaborators. |
| `ScheduleManager.async_start` | `def async_start(self) -> None` | `custom_components/hass_test_data_creator/scheduler/manager.py` | Plan the rest of today, arm the timer and replan after every midnight. |
| `ScheduleManager.async_stop` | `def async_stop(self) -> None` | `custom_components/hass_test_data_creator/scheduler/manager.py` | Cancel the timers. |
| `ScheduleManager.all_schedules` | `def all_schedules(self) -> list[ScheduleDef]` | `custom_components/hass_test_data_creator/scheduler/manager.py` | Return all schedules. |
| `ScheduleManager.get` | `def get(self, schedule_id: str) -> ScheduleDef` | `custom_components/hass_test_data_creator/scheduler/manager.py` | Return the schedule or raise SCH_NOT_FOUND. |
| `ScheduleManager.async_add` | `async def async_add(self, data: dict[str, Any], default_seed: str) -> ScheduleDef` | `custom_components/hass_test_data_creator/scheduler/manager.py` | Validate and store a new schedule; `data` has name, target, entity, action, trigger. |
| `ScheduleManager.async_remove` | `async def async_remove(self, schedule_id: str) -> None` | `custom_components/hass_test_data_creator/scheduler/manager.py` | Delete a schedule. |
| `ScheduleManager.async_set_enabled` | `async def async_set_enabled(self, schedule_id: str, enabled: bool) -> ScheduleDef` | `custom_components/hass_test_data_creator/scheduler/manager.py` | Switch a schedule on or off. |
| `ScheduleManager.preview` | `def preview(self, hours: int) -> list[dict[str, str]]` | `custom_components/hass_test_data_creator/scheduler/manager.py` | Return the planned runs of the next `hours` hours with the schedule names. |
| `ScheduleManager.devices_for` | `def devices_for(self, target: dict[str, Any]) -> list[DeviceDef]` | `custom_components/hass_test_data_creator/scheduler/manager.py` | Return the devices a target selects: a device, a template, a run or all. |
| `ScheduleManager.ids_targeting` | `def ids_targeting(self, device: DeviceDef) -> list[str]` | `custom_components/hass_test_data_creator/scheduler/manager.py` | Return the ids of the schedules that target exactly this device. |
| `ScheduleManager.forget` | `def forget(self, schedule_ids: list[str]) -> None` | `custom_components/hass_test_data_creator/scheduler/manager.py` | Delete schedules without saving; the removal saves the store afterwards. |
| `ScheduleManager._cancel` | `def _cancel(self) -> None` | `custom_components/hass_test_data_creator/scheduler/manager.py` | Cancel the timer of the next run. |
| `ScheduleManager._on_midnight` | `def _on_midnight(self, _now: datetime) -> None` | `custom_components/hass_test_data_creator/scheduler/manager.py` | Plan the new day. |
| `ScheduleManager._replan` | `def _replan(self) -> None` | `custom_components/hass_test_data_creator/scheduler/manager.py` | Plan the rest of today and arm the timer for the first run. |
| `ScheduleManager._fire` | `async def _fire(self, now: datetime) -> None` | `custom_components/hass_test_data_creator/scheduler/manager.py` | Run every planned run that is due, then arm the timer for the next one. |
| `ScheduleManager._execute` | `async def _execute(self, run: PlannedRun) -> None` | `custom_components/hass_test_data_creator/scheduler/manager.py` | Run the action of one planned run on all devices of its target. |
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
| `ActionRunner.find_device_id` | `def find_device_id(self, reference: str) -> str` | `custom_components/hass_test_data_creator/scheduler/runner.py` | Return the id of the device whose id or name is `reference`. |
| `ActionRunner.async_run` | `async def async_run(self, reference: str, key: str, action: str, params: dict[str, Any] \| None=None) -> None` | `custom_components/hass_test_data_creator/scheduler/runner.py` | Run `action` on entity `key` of the device `reference` (id or name). |
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
| `async_cleanup_after_entry_removal` | `async def async_cleanup_after_entry_removal(hass: HomeAssistant, entry: ConfigEntry) -> None` | `custom_components/hass_test_data_creator/removal/cleanup.py` | Remove the devices of the entry, then the created areas that are empty and the store. |
| `hass_test_data_creator.removal.planner` | `module` | `custom_components/hass_test_data_creator/removal/planner.py` | Plans a removal: what would be deleted (concept 10.2). |
| `RemovalPlan` | `class RemovalPlan` | `custom_components/hass_test_data_creator/removal/planner.py` | What a removal would delete. |
| `RemovalPlan.to_dict` | `def to_dict(self) -> dict[str, Any]` | `custom_components/hass_test_data_creator/removal/planner.py` | Return the plan as the panel shows it before the user confirms. |
| `RemovalPlanner` | `class RemovalPlanner` | `custom_components/hass_test_data_creator/removal/planner.py` | Builds the plan for a target from the store and the registry markers. |
| `RemovalPlanner.__init__` | `def __init__(self, hass: HomeAssistant, entry: ConfigEntry, store: TdcStore) -> None` | `custom_components/hass_test_data_creator/removal/planner.py` | Keep the instance, the config entry and the store. |
| `RemovalPlanner.plan` | `def plan(self, target: str, target_id: str \| None) -> RemovalPlan` | `custom_components/hass_test_data_creator/removal/planner.py` | Return the plan to remove `target` (`all`, `device` or `run`) with `target_id`. |
| `RemovalPlanner._schedule_ids` | `def _schedule_ids(self, plan: RemovalPlan) -> list[str]` | `custom_components/hass_test_data_creator/removal/planner.py` | Return the ids of the schedules that go with the plan: all, or those aimed at it. |
| `RemovalPlanner._orphans` | `def _orphans(self, known: set[str]) -> list[dict[str, str]]` | `custom_components/hass_test_data_creator/removal/planner.py` | Return registry devices of this entry that the store does not know (damaged store). |
| `RemovalPlanner._empty_areas` | `def _empty_areas(self, removed: set[str]) -> list[str]` | `custom_components/hass_test_data_creator/removal/planner.py` | Return the names of created areas that would be empty after removing `removed`. |
| `hass_test_data_creator.removal.runner` | `module` | `custom_components/hass_test_data_creator/removal/runner.py` | Runs a removal plan step by step; every step can be repeated (concept 10.3). |
| `RemovalRunner` | `class RemovalRunner` | `custom_components/hass_test_data_creator/removal/runner.py` | Removes devices, run records and empty created areas. |
| `RemovalRunner.__init__` | `def __init__(self, hass: HomeAssistant, store: TdcStore, outputs: OutputAdapterFactory, areas: AreaAssigner, schedules: ScheduleManager, audit: AuditLog, audit_factory: AuditEntryFactory) -> None` | `custom_components/hass_test_data_creator/removal/runner.py` | Keep the collaborators. |
| `RemovalRunner.async_run` | `async def async_run(self, plan: RemovalPlan) -> dict[str, Any]` | `custom_components/hass_test_data_creator/removal/runner.py` | Execute `plan` and return what was removed; schedules go first (concept 10.3). |

## audit

| Symbol | Signature | File | Description |
| --- | --- | --- | --- |
| `hass_test_data_creator.audit.__init__` | `module` | `custom_components/hass_test_data_creator/audit/__init__.py` | Audit package of the HASS Test Data Creator. |
| `hass_test_data_creator.audit.factory` | `module` | `custom_components/hass_test_data_creator/audit/factory.py` | Factory for audit entries (concept 13.2, 13.4). |
| `AuditEntry` | `class AuditEntry` | `custom_components/hass_test_data_creator/audit/factory.py` | One action with its log level and fields. |
| `AuditEntryFactory` | `class AuditEntryFactory` | `custom_components/hass_test_data_creator/audit/factory.py` | Creates one audit entry per kind of action. |
| `AuditEntryFactory.devices_created` | `def devices_created(self, run_id: str, template: str, count: int) -> AuditEntry` | `custom_components/hass_test_data_creator/audit/factory.py` | Return the entry for a finished creation job. |
| `AuditEntryFactory.removal_done` | `def removal_done(self, target: str, devices: int, areas: int) -> AuditEntry` | `custom_components/hass_test_data_creator/audit/factory.py` | Return the entry for a finished removal. |
| `AuditEntryFactory.action_fired` | `def action_fired(self, device: str, key: str, action: str) -> AuditEntry` | `custom_components/hass_test_data_creator/audit/factory.py` | Return the entry for an action on one entity. |
| `AuditEntryFactory.schedule_ran` | `def schedule_ran(self, name: str, action: str) -> AuditEntry` | `custom_components/hass_test_data_creator/audit/factory.py` | Return the entry for a schedule that ran. |
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
| `_entity_states` | `def _entity_states(hass: HomeAssistant, device: DeviceDef) -> list[dict[str, Any]]` | `custom_components/hass_test_data_creator/api/devices.py` | Return key, entity id and current state of every entity of `device`. |
| `ws_devices_list` | `async def ws_devices_list(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/api/devices.py` | Return one page of devices with the current state of their entities. |
| `ws_devices_create` | `async def ws_devices_create(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/api/devices.py` | Create the devices of a job and return the run. |
| `ws_devices_fire` | `async def ws_devices_fire(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/api/devices.py` | Run an action on one entity of a device. |
| `hass_test_data_creator.api.info` | `module` | `custom_components/hass_test_data_creator/api/info.py` | Commands about the integration itself and the templates (concept 8.2). |
| `ws_info` | `async def ws_info(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/api/info.py` | Return version, API version, features, limits, outputs, shapes and platforms. |
| `ws_templates_list` | `async def ws_templates_list(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> list[dict[str, Any]]` | `custom_components/hass_test_data_creator/api/info.py` | Return all templates with their entities. |
| `hass_test_data_creator.api.removal` | `module` | `custom_components/hass_test_data_creator/api/removal.py` | Commands about removal (concept 8.2, 10). |
| `ws_removal_plan` | `async def ws_removal_plan(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/api/removal.py` | Return what a removal of the target would delete. |
| `ws_removal_run` | `async def ws_removal_run(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/api/removal.py` | Remove the target and return what was removed. |
| `hass_test_data_creator.api.schedules` | `module` | `custom_components/hass_test_data_creator/api/schedules.py` | Commands about schedules (concept 8.2). |
| `ws_schedules_list` | `async def ws_schedules_list(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> list[dict[str, Any]]` | `custom_components/hass_test_data_creator/api/schedules.py` | Return all schedules. |
| `ws_schedules_add` | `async def ws_schedules_add(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/api/schedules.py` | Add a schedule and return it. |
| `ws_schedules_remove` | `async def ws_schedules_remove(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/api/schedules.py` | Delete a schedule. |
| `ws_schedules_enable` | `async def ws_schedules_enable(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> dict[str, Any]` | `custom_components/hass_test_data_creator/api/schedules.py` | Switch a schedule on or off and return it. |
| `ws_schedules_preview` | `async def ws_schedules_preview(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> list[dict[str, str]]` | `custom_components/hass_test_data_creator/api/schedules.py` | Return the planned runs of the next hours. |
