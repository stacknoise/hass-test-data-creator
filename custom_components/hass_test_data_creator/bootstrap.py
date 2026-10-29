"""Builds the runtime data of a config entry: creates the factories and managers and wires them together (concept 2)."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .areas.assigner import AreaAssigner
from .audit.factory import AuditEntryFactory
from .audit.log import AuditLog
from .const import (
    CONF_MQTT_BASE_TOPIC,
    CONF_TICK_SECONDS,
    CONF_TIME_LAPSE,
    CONF_Z2M_BASE_TOPIC,
    CONF_Z2M_CONFIRM_DEFAULT,
    DEFAULT_MQTT_BASE_TOPIC,
    DEFAULT_TICK_SECONDS,
    DEFAULT_TIME_LAPSE,
    DEFAULT_Z2M_BASE_TOPIC,
)
from .data import TdcData
from .devices.manager import DevicesManager
from .devices.signal_editor import SignalEditor
from .devices.usage import DeviceUsage
from .devices.view import DeviceView
from .engine.behaviour_factory import BehaviourFactory
from .engine.behaviours import Live
from .engine.clock import Clock
from .engine.signal_factory import SignalFactory
from .engine.tick import Tick
from .faults.factory import FaultFactory
from .groups.manager import GroupManager
from .history.factory import SeriesFactory
from .history.manager import HistoryManager
from .history.recorder import StatisticsClient
from .outputs.adapter import OutputAdapterFactory
from .outputs.mqtt.client import MqttClient
from .outputs.mqtt.devices import MqttDevices
from .outputs.mqtt.profiles import MqttProfileFactory
from .outputs.mqtt.runtime import RuntimeParts
from .outputs.z2m.devices import Z2mDevices, Z2mSettings
from .outputs.z2m.payloads import Z2mPayloadFactory
from .outputs.z2m.profiles import Z2mProfileFactory
from .platforms.factory import EntityFactory
from .platforms.scheduler import HassScheduler
from .removal.planner import RemovalPlanner
from .removal.runner import Forgetters, RemovalRunner
from .replay.library import CsvLibrary
from .scenarios.manager import ScenarioManager
from .scheduler.actions import ActionFactory
from .scheduler.manager import ScheduleManager
from .scheduler.planner import SchedulePlanner
from .scheduler.runner import ActionRunner
from .scheduler.triggers import TriggerFactory
from .store.store import TdcStore
from .templates.device_factory import DeviceFactory
from .templates.factory import TemplateFactory
from .templates.registry import TemplateRegistry


def build_data(hass: HomeAssistant, entry: ConfigEntry) -> TdcData:
    """Create the factories and managers of `entry` and wire them together."""
    store = TdcStore(hass)
    live: Live = {}
    audit, audit_factory = AuditLog(), AuditEntryFactory()
    template_factory = TemplateFactory()
    registry = TemplateRegistry(template_factory)
    mqtt = MqttClient(hass, store)
    csv = CsvLibrary(hass)
    signals = SignalFactory(csv)
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
        store,
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
    usage = DeviceUsage(store)
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
        removal_planner=RemovalPlanner(hass, entry, store, usage),
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
        outputs=outputs,
        mqtt=mqtt,
        mqtt_devices=mqtt_devices,
        z2m_devices=z2m_devices,
        groups=groups,
        history=history,
        clock=clock,
        usage=usage,
        device_view=DeviceView(hass, store, usage, live),
        signal_editor=SignalEditor(store, live, behaviours, template_factory, audit, audit_factory),
        csv=csv,
        live=live,
    )
