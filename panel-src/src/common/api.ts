import type {
  BulkRemovalPlan,
  BulkTarget,
  CreateRequest,
  DeviceFilterRequest,
  DeviceInfo,
  DeviceName,
  DevicePage,
  EntityDef,
  Hass,
  Info,
  PlannedRun,
  RemovalPlan,
  RemovalResult,
  GroupInfo,
  ImportBatch,
  ImportPlan,
  HistoryResult,
  RemovalTarget,
  SignalDef,
  ScenarioInfo,
  ScenarioStep,
  ScheduleInfo,
  ScheduleRequest,
  TemplateInfo,
  TransferCategory,
  TransferPage,
} from './types';

import { MAX_PAGE_SIZE } from './constants';

const PREFIX = 'hass_test_data_creator';

/** How long the answer of `info` is shared by the tabs. */
const INFO_TTL_MS = 30_000;
/** How long the list of templates is shared; templates only change with a restart. */
const TEMPLATES_TTL_MS = 300_000;

const cache = new Map<string, { at: number; value: Promise<unknown> }>();

/** Return the answer of `load`, shared by all callers until `ttl` has passed; a failure is not kept. */
function cached<T>(key: string, ttl: number, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttl) return hit.value as Promise<T>;
  const value = load();
  cache.set(key, { at: Date.now(), value });
  value.catch(() => cache.delete(key));
  return value;
}

/** Forget the shared answers, for example after the options of the integration changed. */
export function clearApiCache(): void {
  cache.clear();
}

/** Typed access to the `hass_test_data_creator/*` WebSocket commands. */
export class TdcApi {
  /** Create the client for one `hass` connection. */
  constructor(private readonly hass: Hass) {}

  /** Return version, limits and capabilities; shared by all tabs for `INFO_TTL_MS`. */
  info(): Promise<Info> {
    return cached('info', INFO_TTL_MS, () => this.call<Info>('info'));
  }

  /** Return all templates; shared by all tabs for `TEMPLATES_TTL_MS`. */
  templates(): Promise<TemplateInfo[]> {
    return cached('templates', TEMPLATES_TTL_MS, () => this.call<TemplateInfo[]>('templates/list'));
  }

  /** Save an own template (new, or replacing the one with the same id) and forget the shared list. */
  async saveTemplate(id: string, name: string, entities: EntityDef[]): Promise<TemplateInfo> {
    const saved = await this.call<TemplateInfo>('templates/save', {
      template_id: id,
      name,
      entities,
    });
    cache.delete('templates');
    return saved;
  }

  /** Delete an own template and forget the shared list. */
  async deleteTemplate(id: string): Promise<void> {
    await this.call('templates/delete', { template_id: id });
    cache.delete('templates');
  }

  /** Return one device in full, with the curve of each entity. */
  device(device: string): Promise<DeviceInfo> {
    return this.call('devices/get', { device });
  }

  /** Return id, name, template, model, output, run and creation time of every device. */
  async deviceNames(): Promise<DeviceName[]> {
    return (await this.call<{ devices: DeviceName[] }>('devices/names')).devices;
  }

  /** Return one page of the devices that pass `filter`; `facets` also asks for the filter options. */
  devices(
    offset: number,
    limit: number,
    filter: DeviceFilterRequest = {},
    facets = false,
  ): Promise<DevicePage> {
    return this.call('devices/list', { offset, limit, ...filter, ...(facets ? { facets } : {}) });
  }

  /** Return the first `count` devices (all if fewer exist), fetched in pages the server accepts. */
  async devicesUpTo(count: number): Promise<DevicePage> {
    const devices: DevicePage['devices'] = [];
    let total = 0;
    while (devices.length < count) {
      const page = await this.devices(
        devices.length,
        Math.min(MAX_PAGE_SIZE, count - devices.length),
      );
      total = page.total;
      devices.push(...page.devices);
      if (page.devices.length === 0 || devices.length >= total) break;
    }
    return { total, matched: total, devices };
  }

  /** Create the devices of a job. */
  create(request: CreateRequest): Promise<{ run_id: string; devices: number }> {
    return this.call('devices/create', { ...request });
  }

  /** Create `count` copies of a device; `name_pattern` may use `{template}` for the source name and `{n}`. */
  duplicate(
    device: string,
    count: number,
    name_pattern: string,
  ): Promise<{ run_id: string; devices: number }> {
    return this.call('devices/duplicate', { device, count, name_pattern });
  }

  /** Run an action on one entity of a device. */
  fire(
    device: string,
    entity: string,
    action: string,
    params?: Record<string, unknown>,
  ): Promise<Record<string, never>> {
    return this.call('devices/fire', { device, entity, action, params });
  }

  /** Put a device into an area (created if new), or into none if `area` is null. */
  updateDevice(device: string, area: string | null): Promise<{ id: string; area: string | null }> {
    return this.call('devices/update', { device, area });
  }

  /** Give a sensor of a device another curve. */
  setSignal(device: string, entity: string, signal: SignalDef): Promise<{ entity: string }> {
    return this.call('devices/signal', { device, entity, signal });
  }

  /** Return what removing the devices of `target` would delete. */
  bulkRemovePlan(target: BulkTarget): Promise<BulkRemovalPlan> {
    return this.call('devices/bulk_remove', { ...target, plan_only: true });
  }

  /** Remove the devices of `target`. */
  bulkRemove(target: BulkTarget): Promise<RemovalResult> {
    return this.call('devices/bulk_remove', { ...target });
  }

  /** Put the devices of `target` into an area, or into none if `area` is null. */
  bulkArea(target: BulkTarget, area: string | null): Promise<{ devices: number }> {
    return this.call('devices/bulk_area', { ...target, area });
  }

  /** Put the devices of `target` into the group `groupId`, or into a new group called `name`. */
  bulkGroup(
    target: BulkTarget,
    group: { group_id: string } | { name: string },
  ): Promise<GroupInfo> {
    return this.call('devices/bulk_group', { ...target, ...group });
  }

  /** Run an action on the devices of `target`; return how many ran and how many failed. */
  bulkAction(
    target: BulkTarget,
    action: string,
    params: Record<string, unknown>,
  ): Promise<{ devices: number; failed: number }> {
    return this.call('devices/bulk_action', { ...target, action, params });
  }

  /** Return what a removal of the target would delete. */
  removalPlan(target: RemovalTarget, targetId?: string): Promise<RemovalPlan> {
    return this.call('removal/plan', { target, target_id: targetId });
  }

  /** Remove the target. */
  removalRun(target: RemovalTarget, targetId?: string): Promise<RemovalResult> {
    return this.call('removal/run', { target, target_id: targetId });
  }

  /** Return the retained broker topics of generated devices that the store does not know. */
  orphanTopics(): Promise<{ topics: string[] }> {
    return this.call('removal/orphan_topics');
  }

  /** Delete those of the topics that a new scan still reports; return the deleted ones. */
  clearOrphanTopics(topics: string[]): Promise<{ cleared: string[] }> {
    return this.call('removal/orphan_topics_clear', { topics });
  }

  /** Return all schedules. */
  schedules(): Promise<ScheduleInfo[]> {
    return this.call('schedules/list');
  }

  /** Add a schedule. */
  addSchedule(request: ScheduleRequest): Promise<ScheduleInfo> {
    return this.call('schedules/add', { ...request });
  }

  /** Change a schedule; what the request leaves out stays. */
  updateSchedule(scheduleId: string, request: ScheduleRequest): Promise<ScheduleInfo> {
    return this.call('schedules/update', { schedule_id: scheduleId, ...request });
  }

  /** Delete a schedule. */
  removeSchedule(scheduleId: string): Promise<Record<string, never>> {
    return this.call('schedules/remove', { schedule_id: scheduleId });
  }

  /** Switch a schedule on or off. */
  enableSchedule(scheduleId: string, enabled: boolean): Promise<ScheduleInfo> {
    return this.call('schedules/enable', { schedule_id: scheduleId, enabled });
  }

  /** Return the planned runs of the next hours. */
  schedulePreview(hours: number): Promise<PlannedRun[]> {
    return this.call('schedules/preview', { hours });
  }

  /** Return all scenarios. */
  scenarios(): Promise<ScenarioInfo[]> {
    return this.call('scenarios/list');
  }

  /** Add a scenario. */
  addScenario(name: string, steps: ScenarioStep[]): Promise<ScenarioInfo> {
    return this.call('scenarios/add', { name, steps });
  }

  /** Change a scenario: its name and steps are replaced. */
  updateScenario(scenarioId: string, name: string, steps: ScenarioStep[]): Promise<ScenarioInfo> {
    return this.call('scenarios/update', { scenario_id: scenarioId, name, steps });
  }

  /** Delete a scenario. */
  removeScenario(scenarioId: string): Promise<Record<string, never>> {
    return this.call('scenarios/remove', { scenario_id: scenarioId });
  }

  /** Start a scenario and return the number of its steps. */
  runScenario(scenarioId: string): Promise<{ steps: number }> {
    return this.call('scenarios/run', { scenario_id: scenarioId });
  }

  /** Return all groups. */
  groups(): Promise<GroupInfo[]> {
    return this.call('groups/list');
  }

  /** Add a group of Zigbee2MQTT devices given by name or id. */
  addGroup(name: string, members: string[]): Promise<GroupInfo> {
    return this.call('groups/add', { name, members });
  }

  /** Rename a group and replace its members (device ids). */
  updateGroup(groupId: string, name: string, members: string[]): Promise<GroupInfo> {
    return this.call('groups/update', { group_id: groupId, name, members });
  }

  /** Delete a group. */
  removeGroup(groupId: string): Promise<Record<string, never>> {
    return this.call('groups/remove', { group_id: groupId });
  }

  /** Write hourly statistics for the past days; `device` (id or name) and `entity` (key) narrow it. */
  importHistory(days: number, device?: string | string[], entity?: string): Promise<HistoryResult> {
    return this.call('history/import', { days, device, entity });
  }

  /** Return `limit` entries of a category from `offset`; a `limit` of 0 only counts them. */
  transferExport(category: TransferCategory, offset: number, limit: number): Promise<TransferPage> {
    return this.call('transfer/export', { category, offset, limit });
  }

  /** Return what importing a batch would do; nothing is changed. */
  transferPlan(batch: ImportBatch): Promise<ImportPlan> {
    return this.call('transfer/plan', { ...batch });
  }

  /** Import a batch, or with the phase `purge` remove the items of its category first. */
  transferRun(batch: ImportBatch): Promise<ImportPlan> {
    return this.call('transfer/run', { ...batch });
  }

  /** Return all entries of a category, read page by page within the batch limit of the backend. */
  async transferExportAll(category: TransferCategory): Promise<TransferPage[]> {
    const pages = [await this.transferExport(category, 0, MAX_PAGE_SIZE)];
    let read = pages[0].items.length;
    while (read < pages[0].total && pages[pages.length - 1].items.length > 0) {
      const next = await this.transferExport(category, read, MAX_PAGE_SIZE);
      pages.push(next);
      read += next.items.length;
    }
    return pages;
  }

  /** Send a command with its defined fields to the backend. */
  private call<T>(command: string, fields: Record<string, unknown> = {}): Promise<T> {
    const defined = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));
    return this.hass.callWS<T>({ type: `${PREFIX}/${command}`, ...defined });
  }
}

/** Return an error as text with its TDC code, for example "TDC-GEN-002: Too many devices". */
export function describeError(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const { code, message } = error as { code?: string; message: string };
    return code ? `${code}: ${message}` : message;
  }
  return String(error);
}
