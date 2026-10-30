"""The import rules of each category: check an entry, find what exists, create, update, purge (concept 16.5)."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
import voluptuous as vol

from ..const import (
    CONF_SEED,
    CUSTOM_TEMPLATE_ID,
    DEFAULT_SEED,
    MAX_AREA_NAME,
    MAX_DEVICES,
    MAX_ENTITIES_BYTES,
    MAX_ENTITIES_PER_DEVICE,
    MAX_GROUPS,
    MAX_SCENARIOS,
    MAX_SCHEDULES,
    MAX_USER_TEMPLATES,
    OUTPUT_NATIVE,
    OUTPUTS,
)
from ..core.errors import ErrorCode, GenerationError, OutputError, RemovalError, TdcError
from ..core.keys import (
    KEY_AREA,
    KEY_ENTITIES,
    KEY_GROUPS,
    KEY_ID,
    KEY_MODEL,
    KEY_NAME,
    KEY_OUTPUT,
    KEY_SCENARIO,
    KEY_SCENARIOS,
    KEY_SCHEDULES,
    KEY_SIGNAL,
    KEY_STEPS,
    KEY_TARGET,
    KEY_TEMPLATE,
)
from ..core.limits import SHORT_TEXT, json_size
from ..devices.manager import CreationJob, DevicesManager
from ..devices.signal_editor import SignalEditor
from ..devices.usage import DeviceUsage
from ..groups.manager import GroupManager
from ..groups.schema import GROUP_FIELDS
from ..outputs.mqtt.client import MqttClient
from ..removal.planner import RemovalPlanner
from ..removal.runner import RemovalRunner
from ..scenarios.schema import SCENARIO_FIELDS
from ..scheduler.manager import ScheduleManager
from ..scheduler.schema import SCHEDULE_FIELDS
from ..store.store import TdcStore
from ..templates.factory import TemplateFactory
from ..templates.registry import TemplateRegistry
from ..templates.schema import SIGNAL_SCHEMA
from .references import References
from .schema import KEY_OVERRIDES

Failure = tuple[str, TdcError]
_NAME = vol.All(str, vol.Length(min=1, max=64))
DEVICE_ITEM = vol.Schema(
    {
        vol.Required(KEY_NAME): vol.All(_NAME, vol.Match(r"^[^{}]+$")),
        vol.Required(KEY_TEMPLATE): SHORT_TEXT,
        vol.Optional(KEY_MODEL): SHORT_TEXT,
        vol.Optional(KEY_AREA): vol.Any(None, vol.All(str, vol.Length(max=MAX_AREA_NAME))),
        vol.Optional(KEY_OUTPUT, default=OUTPUT_NATIVE): vol.In(OUTPUTS),
        vol.Optional("seed"): int,
        vol.Optional(KEY_OVERRIDES, default=dict): {SHORT_TEXT: dict},
        vol.Optional(KEY_ENTITIES): vol.All(
            [dict], vol.Length(max=MAX_ENTITIES_PER_DEVICE), json_size(MAX_ENTITIES_BYTES)
        ),
    },
    extra=vol.REMOVE_EXTRA,
)


def checked(schema: vol.Schema, item: dict[str, Any], name: str) -> dict[str, Any]:
    """Return `item` as `schema` reads it, or raise TDC-GEN-010 naming the entry."""
    try:
        return dict(schema(item))
    except vol.Invalid as error:
        raise GenerationError(ErrorCode.GEN_TRANSFER_INVALID, name=name) from error


class CategoryHandler:
    """The import rules of one category; a subclass fills in what differs."""

    category = ""
    key_field = KEY_NAME
    limit_code: ErrorCode | None = None

    def name_of(self, item: dict[str, Any]) -> str:
        """Return the name an entry is matched by; raise TDC-GEN-010 if it has none."""
        name = item.get(self.key_field)
        if not isinstance(name, str) or not name:
            raise GenerationError(ErrorCode.GEN_TRANSFER_INVALID, name=str(name))
        return name

    def prepare(self, item: dict[str, Any], refs: References) -> dict[str, Any]:
        """Check an entry and return it in the form that `create` and `update` read."""
        raise NotImplementedError

    def existing(self) -> dict[str, list[Any]]:
        """Return the existing items by name."""
        raise NotImplementedError

    def conflict(self, existing: Any, data: dict[str, Any]) -> bool:
        """Whether `existing` cannot be changed to `data` in place."""
        return False

    def unchanged(self, existing: Any, data: dict[str, Any]) -> bool:
        """Whether `existing` already equals `data`."""
        return False

    def capacity(self) -> int | None:
        """Return how many more items may be created, or None if there is no limit."""
        return None

    def count(self) -> int:
        """Return how many items a replace removes."""
        return sum(len(found) for found in self.existing().values())

    def purge_problem(self, replacing: set[str]) -> TdcError | None:
        """Return the error that stops a replace of the category, or None."""
        return None

    async def async_purge(self) -> int:
        """Remove all generated items of the category and return their number."""
        raise NotImplementedError

    async def async_create(self, data: dict[str, Any]) -> None:
        """Create one item."""
        raise NotImplementedError

    async def async_update(self, existing: Any, data: dict[str, Any]) -> None:
        """Change one existing item to `data`."""
        raise NotImplementedError

    async def async_create_many(self, items: list[dict[str, Any]], label: str) -> list[Failure]:
        """Create the items one by one and return the ones that failed."""
        failures: list[Failure] = []
        for data in items:
            try:
                await self.async_create(data)
            except TdcError as error:
                failures.append((data[self.key_field], error))
        return failures


class TemplatesHandler(CategoryHandler):
    """Own templates, matched by id."""

    category = "templates"
    key_field = KEY_ID
    limit_code = ErrorCode.TPL_LIMIT

    def __init__(
        self, hass: HomeAssistant, registry: TemplateRegistry, factory: TemplateFactory
    ) -> None:
        """Keep the Home Assistant instance, the registry and the template factory."""
        self._hass = hass
        self._registry = registry
        self._factory = factory

    def prepare(self, item: dict[str, Any], refs: References) -> dict[str, Any]:
        """Check the entry as a template file and that it may be saved."""
        template = self._factory.template(item, bundled=False)
        self._registry.check_changeable(template.id)
        return template.to_file()

    def existing(self) -> dict[str, list[Any]]:
        """Return the own templates by id."""
        return {item.id: [item] for item in self._registry.all() if not item.bundled}

    def capacity(self) -> int:
        """Return how many own templates fit."""
        return MAX_USER_TEMPLATES - len(self.existing())

    async def async_purge(self) -> int:
        """Delete every own template."""
        ids = list(self.existing())
        for template_id in ids:
            await self._registry.async_delete(self._hass, template_id)
        return len(ids)

    async def async_create(self, data: dict[str, Any]) -> None:
        """Save the template."""
        await self._registry.async_save(self._hass, data)

    async def async_update(self, existing: Any, data: dict[str, Any]) -> None:
        """Replace the template of the same id."""
        await self._registry.async_save(self._hass, data)


class DevicesHandler(CategoryHandler):
    """Generated devices, matched by name; one import makes one run."""

    category = "devices"
    limit_code = ErrorCode.GEN_LIMIT

    def __init__(
        self,
        store: TdcStore,
        manager: DevicesManager,
        signals: SignalEditor,
        factory: TemplateFactory,
        registry: TemplateRegistry,
        mqtt: MqttClient,
        removal: tuple[RemovalPlanner, RemovalRunner],
        usage: DeviceUsage,
    ) -> None:
        """Keep the store, the managers, the template factory and registry, MQTT and the removal."""
        self._store = store
        self._registry = registry
        self._manager = manager
        self._signals = signals
        self._factory = factory
        self._mqtt = mqtt
        self._planner, self._runner = removal
        self._usage = usage

    def prepare(self, item: dict[str, Any], refs: References) -> dict[str, Any]:
        """Check the entry: schema, template, output, curves of the overrides."""
        data = checked(DEVICE_ITEM, item, self.name_of(item))
        if data[KEY_OUTPUT] != OUTPUT_NATIVE and not self._mqtt.available():
            raise OutputError(ErrorCode.OUT_MQTT_UNAVAILABLE)
        if KEY_ENTITIES in data:
            self._factory.custom(data[KEY_ENTITIES])
        else:
            refs.template(data[KEY_TEMPLATE])
            known = next((t for t in self._registry.all() if t.id == data[KEY_TEMPLATE]), None)
            if known is not None:
                self._factory.with_overrides(known, data[KEY_OVERRIDES])
        data["signals"] = {
            key: checked(SIGNAL_SCHEMA, override[KEY_SIGNAL], data[KEY_NAME])
            for key, override in data[KEY_OVERRIDES].items()
            if KEY_SIGNAL in override
        }
        return data

    def existing(self) -> dict[str, list[Any]]:
        """Return the devices by name."""
        found: dict[str, list[Any]] = {}
        for device in self._store.devices():
            found.setdefault(device.name, []).append(device)
        return found

    def conflict(self, existing: Any, data: dict[str, Any]) -> bool:
        """The output, template, entities, seed and entity fields other than curves cannot change in place."""
        if existing.output != data[KEY_OUTPUT]:
            return True
        if data.get("seed", existing.seed) != existing.seed or self._fields_differ(existing, data):
            return True
        if KEY_ENTITIES in data:
            return [item.key for item in existing.entities] != [
                item.get("key") for item in data[KEY_ENTITIES]
            ]
        return existing.template != data[KEY_TEMPLATE]

    def _fields_differ(self, existing: Any, data: dict[str, Any]) -> bool:
        """Whether an override changes a field of an entity other than its curve."""
        fields = {item.key: item.to_dict() for item in existing.entities}
        return any(
            fields.get(key, {}).get(field) != value
            for key, override in data[KEY_OVERRIDES].items()
            for field, value in override.items()
            if field != KEY_SIGNAL
        )

    def unchanged(self, existing: Any, data: dict[str, Any]) -> bool:
        """Whether the area and the curves already are the ones of the entry."""
        curves = {item.key: item.signal for item in existing.entities}
        return existing.area == (data.get(KEY_AREA) or None) and all(
            curves.get(key) == signal for key, signal in data["signals"].items()
        )

    def capacity(self) -> int:
        """Return how many devices fit."""
        return MAX_DEVICES - self._store.device_count()

    def purge_problem(self, replacing: set[str]) -> TdcError | None:
        """Return TDC-REM-002 if a user of the devices stays that is not replaced as well."""
        index = self._usage.index()
        kept = {KEY_SCHEDULES, KEY_SCENARIOS, KEY_GROUPS} - replacing
        for device in self._store.devices():
            usage = index.of(device)
            names = [user[KEY_NAME] for kind in kept for user in usage[kind]]
            if names:
                return RemovalError(
                    ErrorCode.REM_IN_USE, usage=f"{device.name}: {', '.join(names)}"
                )
        return None

    async def async_purge(self) -> int:
        """Remove all devices with the removal of concept 10."""
        plan = self._planner.plan_devices(self._store.devices())
        await self._runner.async_run(plan)
        return len(plan.devices)

    def _job(self, data: dict[str, Any]) -> CreationJob:
        """Return the job that creates the one device of an entry."""
        entities = data.get(KEY_ENTITIES)
        return CreationJob(
            template=CUSTOM_TEMPLATE_ID if entities else data[KEY_TEMPLATE],
            count=1,
            name_pattern=data[KEY_NAME],
            seed=f"import {data[KEY_NAME]}",
            overrides={} if entities else data[KEY_OVERRIDES],
            device_seed=data.get("seed"),
            areas=[data[KEY_AREA]] if data.get(KEY_AREA) else [],
            output=data[KEY_OUTPUT],
            entities=entities,
        )

    async def async_create_many(self, items: list[dict[str, Any]], label: str) -> list[Failure]:
        """Create all devices into one run; their seeds and changed fields come with the jobs."""
        await self._manager.async_create_many([self._job(data) for data in items], label)
        return []

    async def async_update(self, existing: Any, data: dict[str, Any]) -> None:
        """Change the area and the curves."""
        area = data.get(KEY_AREA) or None
        if existing.area != area:
            await self._manager.async_set_area(existing.id, area)
        curves = {item.key: item.signal for item in existing.entities}
        for key, signal in data["signals"].items():
            if curves.get(key) != signal:
                await self._signals.async_set(existing.id, key, signal)


class NamedStoreHandler(CategoryHandler):
    """Schedules and scenarios: matched by name, purged by the manager that forgets them."""

    def __init__(self, store: TdcStore, manager: Any) -> None:
        """Keep the store and the manager that adds, changes and forgets the items."""
        self._store = store
        self._manager = manager

    def _items(self) -> list[Any]:
        """Return the stored items of the category."""
        raise NotImplementedError

    def existing(self) -> dict[str, list[Any]]:
        """Return the items by name."""
        found: dict[str, list[Any]] = {}
        for item in self._items():
            found.setdefault(item.name, []).append(item)
        return found

    async def async_purge(self) -> int:
        """Forget all items and save."""
        ids = [item.id for item in self._items()]
        self._manager.forget(ids)
        await self._store.async_save()
        return len(ids)

    async def async_update(self, existing: Any, data: dict[str, Any]) -> None:
        """Replace the item with the entry."""
        await self._manager.async_update(existing.id, data)


class ScenariosHandler(NamedStoreHandler):
    """Scenarios; the target of each step is checked and a run is given by id."""

    category = "scenarios"
    limit_code = ErrorCode.GEN_SCENARIO_LIMIT

    def _items(self) -> list[Any]:
        """Return the stored scenarios."""
        return self._store.scenarios()

    def prepare(self, item: dict[str, Any], refs: References) -> dict[str, Any]:
        """Check the entry and its targets."""
        data = checked(vol.Schema(SCENARIO_FIELDS), item, self.name_of(item))
        data[KEY_STEPS] = [
            {**step, KEY_TARGET: refs.target(step[KEY_TARGET])} for step in data[KEY_STEPS]
        ]
        return data

    def capacity(self) -> int:
        """Return how many scenarios fit."""
        return MAX_SCENARIOS - self._store.scenario_count()

    async def async_create(self, data: dict[str, Any]) -> None:
        """Add the scenario."""
        await self._manager.async_add(data)


class SchedulesHandler(NamedStoreHandler):
    """Schedules; a scenario is given by id and the target is checked."""

    category = "schedules"
    limit_code = ErrorCode.GEN_SCHEDULE_LIMIT

    def __init__(self, store: TdcStore, manager: ScheduleManager, seed: str = DEFAULT_SEED) -> None:
        """Keep the store, the manager and the seed of entries without one."""
        super().__init__(store, manager)
        self._seed = seed

    def _items(self) -> list[Any]:
        """Return the stored schedules."""
        return self._store.schedules()

    def prepare(self, item: dict[str, Any], refs: References) -> dict[str, Any]:
        """Check the entry, its target or its scenario."""
        data = checked(vol.Schema(SCHEDULE_FIELDS), item, self.name_of(item))
        if data.get(KEY_SCENARIO) is not None:
            data[KEY_SCENARIO] = refs.scenario_id(data[KEY_SCENARIO])
        elif KEY_TARGET in data:
            data[KEY_TARGET] = refs.target(data[KEY_TARGET])
        return data

    def capacity(self) -> int:
        """Return how many schedules fit."""
        return MAX_SCHEDULES - self._store.schedule_count()

    async def async_create(self, data: dict[str, Any]) -> None:
        """Add the schedule."""
        await self._manager.async_add(data, data.get(CONF_SEED, self._seed))


class GroupsHandler(NamedStoreHandler):
    """Zigbee2MQTT groups; they need MQTT and members that exist."""

    category = "groups"
    limit_code = ErrorCode.GEN_GROUP_LIMIT

    def __init__(self, store: TdcStore, manager: GroupManager, mqtt: MqttClient) -> None:
        """Keep the store, the manager and the MQTT client."""
        super().__init__(store, manager)
        self._mqtt = mqtt

    def _items(self) -> list[Any]:
        """Return the stored groups."""
        return self._store.groups()

    def prepare(self, item: dict[str, Any], refs: References) -> dict[str, Any]:
        """Check the entry, MQTT and the members."""
        data = checked(vol.Schema(GROUP_FIELDS), item, self.name_of(item))
        if not self._mqtt.available():
            raise OutputError(ErrorCode.OUT_MQTT_UNAVAILABLE)
        for member in data["members"]:
            refs.device(member)
        return data

    def capacity(self) -> int:
        """Return how many groups fit."""
        return MAX_GROUPS - self._store.group_count()

    async def async_purge(self) -> int:
        """Remove all groups with their retained topics."""
        groups = self._store.groups()
        for group in groups:
            await self._manager.async_remove(group.id)
        return len(groups)

    async def async_create(self, data: dict[str, Any]) -> None:
        """Add the group."""
        await self._manager.async_add(data[KEY_NAME], data["members"])

    async def async_update(self, existing: Any, data: dict[str, Any]) -> None:
        """Change the members of the group."""
        await self._manager.async_update(existing.id, data[KEY_NAME], data["members"])
