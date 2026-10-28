"""Runtime data: the factories and managers of one loaded config entry (concept 2)."""

from __future__ import annotations

from dataclasses import dataclass, field

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from ..areas.assigner import AreaAssigner
from ..audit.factory import AuditEntryFactory
from ..audit.log import AuditLog
from ..const import (
    CONF_MQTT_BASE_TOPIC,
    CONF_TICK_SECONDS,
    CONF_TIME_LAPSE,
    CONF_Z2M_BASE_TOPIC,
    CONF_Z2M_CONFIRM_DEFAULT,
    DEFAULT_MQTT_BASE_TOPIC,
    DEFAULT_TICK_SECONDS,
    DEFAULT_TIME_LAPSE,
    DEFAULT_Z2M_BASE_TOPIC,
    DOMAIN,
)
from ..devices.manager import DevicesManager
from ..engine.behaviour_factory import BehaviourFactory
from ..engine.behaviours import Live
from ..engine.clock import Clock
from ..engine.signal_factory import SignalFactory
from ..engine.tick import Tick
from ..faults.factory import FaultFactory
from ..groups.manager import GroupManager
from ..history.factory import SeriesFactory
from ..history.manager import HistoryManager
from ..history.recorder import StatisticsClient
from ..outputs.adapter import OutputAdapterFactory
from ..outputs.mqtt.client import MqttClient
from ..outputs.mqtt.devices import MqttDevices
from ..outputs.mqtt.profiles import MqttProfileFactory
from ..outputs.mqtt.runtime import RuntimeParts
from ..outputs.z2m.devices import Z2mDevices, Z2mSettings
from ..outputs.z2m.payloads import Z2mPayloadFactory
from ..outputs.z2m.profiles import Z2mProfileFactory
from ..platforms.factory import EntityFactory
from ..platforms.scheduler import HassScheduler
from ..removal.planner import RemovalPlanner
from ..removal.runner import Forgetters, RemovalRunner
from ..scenarios.manager import ScenarioManager
from ..scheduler.actions import ActionFactory
from ..scheduler.manager import ScheduleManager
from ..scheduler.planner import SchedulePlanner
from ..scheduler.runner import ActionRunner
from ..scheduler.triggers import TriggerFactory
from ..store.store import TdcStore
from ..templates.device_factory import DeviceFactory
from ..templates.factory import TemplateFactory
from ..templates.registry import TemplateRegistry
from .error_factory import ErrorFactory
from .errors import ConfigError
from .response_factory import ResponseFactory


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
    mqtt: MqttClient
    mqtt_devices: MqttDevices
    z2m_devices: Z2mDevices
    groups: GroupManager
    history: HistoryManager
    clock: Clock
    error_factory: ErrorFactory = field(default_factory=ErrorFactory)
    response_factory: ResponseFactory = field(default_factory=ResponseFactory)
    live: Live = field(default_factory=dict)


def build_data(hass: HomeAssistant, entry: ConfigEntry) -> TdcData:
    """Create the factories and managers of `entry` and wire them together."""
    store = TdcStore(hass)
    live: Live = {}
    audit, audit_factory = AuditLog(), AuditEntryFactory()
    template_factory = TemplateFactory()
    registry = TemplateRegistry(template_factory)
    mqtt = MqttClient(hass, store)
    signals = SignalFactory()
    clock = Clock(entry.options.get(CONF_TIME_LAPSE, DEFAULT_TIME_LAPSE))
    behaviours = BehaviourFactory(signals, HassScheduler(hass, clock))
    parts = RuntimeParts(hass, mqtt, behaviours, live, audit, audit_factory)
    mqtt_devices = MqttDevices(
        parts,
        MqttProfileFactory(),
        entry.options.get(CONF_MQTT_BASE_TOPIC, DEFAULT_MQTT_BASE_TOPIC),
    )
    z2m_devices = Z2mDevices(
        parts,
        Z2mProfileFactory(),
        Z2mPayloadFactory(),
        registry,
        Z2mSettings(
            entry.options.get(CONF_Z2M_BASE_TOPIC, DEFAULT_Z2M_BASE_TOPIC),
            entry.options.get(CONF_Z2M_CONFIRM_DEFAULT, False),
        ),
    )
    groups = GroupManager(store, mqtt, z2m_devices)
    outputs = OutputAdapterFactory(hass, entry, mqtt, mqtt_devices, z2m_devices, groups)
    areas = AreaAssigner(hass, store)
    seconds = entry.data.get(CONF_TICK_SECONDS, DEFAULT_TICK_SECONDS)
    actions = ActionFactory(FaultFactory())
    action_runner = ActionRunner(store, live, actions, audit, audit_factory)
    scenarios = ScenarioManager(hass, store, actions, action_runner, audit, audit_factory)
    triggers = TriggerFactory()
    schedules = ScheduleManager(
        hass,
        store,
        triggers,
        SchedulePlanner(triggers),
        action_runner,
        scenarios,
        audit,
        audit_factory,
    )
    history = HistoryManager(
        hass, store, StatisticsClient(hass), SeriesFactory(signals), audit, audit_factory
    )
    return TdcData(
        entry=entry,
        store=store,
        tick=Tick(
            hass, seconds, lambda took, every: audit.record(audit_factory.tick_slow(took, every))
        ),
        manager=DevicesManager(
            store,
            registry,
            template_factory,
            DeviceFactory(),
            outputs,
            areas,
            audit,
            audit_factory,
        ),
        action_runner=action_runner,
        schedules=schedules,
        scenarios=scenarios,
        removal_planner=RemovalPlanner(hass, entry, store),
        removal_runner=RemovalRunner(
            hass,
            store,
            outputs,
            areas,
            Forgetters(schedules, scenarios, history),
            audit,
            audit_factory,
        ),
        template_registry=registry,
        entity_factory=EntityFactory(behaviours, live),
        mqtt=mqtt,
        mqtt_devices=mqtt_devices,
        z2m_devices=z2m_devices,
        groups=groups,
        history=history,
        clock=clock,
        live=live,
    )


def get_data(hass: HomeAssistant) -> TdcData:
    """Return the runtime data or raise TDC-CFG-002 if the integration is not loaded."""
    data = hass.data.get(DOMAIN)
    if not isinstance(data, TdcData):
        raise ConfigError
    return data
