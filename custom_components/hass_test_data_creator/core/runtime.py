"""Runtime data: the factories and managers of one loaded config entry (concept 2)."""

from __future__ import annotations

from dataclasses import dataclass, field

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from ..areas.assigner import AreaAssigner
from ..audit.factory import AuditEntryFactory
from ..audit.log import AuditLog
from ..const import CONF_TICK_SECONDS, DEFAULT_TICK_SECONDS, DOMAIN
from ..devices.manager import DevicesManager
from ..engine.signal_factory import SignalFactory
from ..engine.tick import Tick
from ..faults.factory import FaultFactory
from ..outputs.adapter import OutputAdapterFactory
from ..platforms.entities import Live
from ..platforms.factory import EntityFactory
from ..removal.planner import RemovalPlanner
from ..removal.runner import RemovalRunner
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
    removal_planner: RemovalPlanner
    removal_runner: RemovalRunner
    template_registry: TemplateRegistry
    entity_factory: EntityFactory
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
    outputs = OutputAdapterFactory(hass, entry)
    areas = AreaAssigner(hass, store)
    seconds = entry.data.get(CONF_TICK_SECONDS, DEFAULT_TICK_SECONDS)
    actions = ActionFactory(FaultFactory())
    action_runner = ActionRunner(store, live, actions, audit, audit_factory)
    triggers = TriggerFactory()
    schedules = ScheduleManager(
        hass,
        store,
        triggers,
        SchedulePlanner(triggers),
        actions,
        action_runner,
        audit,
        audit_factory,
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
        removal_planner=RemovalPlanner(hass, entry, store),
        removal_runner=RemovalRunner(hass, store, outputs, areas, schedules, audit, audit_factory),
        template_registry=registry,
        entity_factory=EntityFactory(SignalFactory(), live),
        live=live,
    )


def get_data(hass: HomeAssistant) -> TdcData:
    """Return the runtime data or raise TDC-CFG-002 if the integration is not loaded."""
    data = hass.data.get(DOMAIN)
    if not isinstance(data, TdcData):
        raise ConfigError
    return data
