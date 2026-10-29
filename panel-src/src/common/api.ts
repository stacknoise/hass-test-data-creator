import type {
  CreateRequest,
  DevicePage,
  Hass,
  Info,
  PlannedRun,
  RemovalPlan,
  RemovalResult,
  GroupInfo,
  HistoryResult,
  RemovalTarget,
  SignalDef,
  ScenarioInfo,
  ScenarioStep,
  ScheduleInfo,
  ScheduleRequest,
  TemplateInfo,
} from './types';

import { MAX_PAGE_SIZE } from './constants';

const PREFIX = 'hass_test_data_creator';

/** Typed access to the `hass_test_data_creator/*` WebSocket commands. */
export class TdcApi {
  /** Create the client for one `hass` connection. */
  constructor(private readonly hass: Hass) {}

  /** Return version, limits and capabilities. */
  info(): Promise<Info> {
    return this.call('info');
  }

  /** Return all templates. */
  templates(): Promise<TemplateInfo[]> {
    return this.call('templates/list');
  }

  /** Return one page of devices. */
  devices(offset: number, limit: number): Promise<DevicePage> {
    return this.call('devices/list', { offset, limit });
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
    return { total, devices };
  }

  /** Create the devices of a job. */
  create(request: CreateRequest): Promise<{ run_id: string; devices: number }> {
    return this.call('devices/create', { ...request });
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

  /** Return what a removal of the target would delete. */
  removalPlan(target: RemovalTarget, targetId?: string): Promise<RemovalPlan> {
    return this.call('removal/plan', { target, target_id: targetId });
  }

  /** Remove the target. */
  removalRun(target: RemovalTarget, targetId?: string): Promise<RemovalResult> {
    return this.call('removal/run', { target, target_id: targetId });
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
