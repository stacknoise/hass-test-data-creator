"""Runtime data: the factories and managers of one loaded config entry (concept 2)."""

from __future__ import annotations

from dataclasses import dataclass, field

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .core.error_factory import ErrorFactory
from .core.errors import ConfigError
from .core.response_factory import ResponseFactory
from .devices.manager import DevicesManager
from .devices.signal_editor import SignalEditor
from .devices.usage import DeviceUsage
from .devices.view import DeviceView
from .engine.behaviours import Live
from .engine.clock import Clock
from .engine.tick import Tick
from .groups.manager import GroupManager
from .history.manager import HistoryManager
from .outputs.adapter import OutputAdapterFactory
from .outputs.mqtt.client import MqttClient
from .outputs.mqtt.devices import MqttDevices
from .outputs.mqtt.labels import MqttLabeler
from .outputs.z2m.devices import Z2mDevices
from .platforms.factory import EntityFactory
from .removal.orphans import OrphanScanner
from .removal.planner import RemovalPlanner
from .removal.runner import RemovalRunner
from .replay.library import CsvLibrary
from .scenarios.manager import ScenarioManager
from .scheduler.manager import ScheduleManager
from .scheduler.runner import ActionRunner
from .store.store import TdcStore
from .templates.registry import TemplateRegistry
from .transfer.exporter import TransferExporter


@dataclass
class TdcData:
    """Everything a loaded config entry needs; created once in `async_setup_entry`."""

    entry: ConfigEntry
    store: TdcStore
    tick: Tick
    manager: DevicesManager
    action_runner: ActionRunner
    schedules: ScheduleManager
    scenarios: ScenarioManager
    removal_planner: RemovalPlanner
    removal_runner: RemovalRunner
    template_registry: TemplateRegistry
    entity_factory: EntityFactory
    outputs: OutputAdapterFactory
    orphans: OrphanScanner
    labeler: MqttLabeler
    mqtt: MqttClient
    mqtt_devices: MqttDevices
    z2m_devices: Z2mDevices
    groups: GroupManager
    history: HistoryManager
    clock: Clock
    signal_editor: SignalEditor
    usage: DeviceUsage
    device_view: DeviceView
    csv: CsvLibrary
    transfer: TransferExporter
    error_factory: ErrorFactory = field(default_factory=ErrorFactory)
    response_factory: ResponseFactory = field(default_factory=ResponseFactory)
    live: Live = field(default_factory=dict)


def get_data(hass: HomeAssistant) -> TdcData:
    """Return the runtime data or raise TDC-CFG-002 if the integration is not loaded."""
    data = hass.data.get(DOMAIN)
    if not isinstance(data, TdcData):
        raise ConfigError
    return data
