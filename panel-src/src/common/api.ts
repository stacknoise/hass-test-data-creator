import type {
  CreateRequest,
  DevicePage,
  Hass,
  Info,
  PlannedRun,
  RemovalPlan,
  RemovalResult,
  RemovalTarget,
  ScheduleInfo,
  ScheduleRequest,
  TemplateInfo,
} from './types';

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

  /** Create the devices of a job. */
  create(request: CreateRequest): Promise<{ run_id: string; devices: number }> {
    return this.call('devices/create', { ...request });
  }

  /** Run an action on one entity of a device. */
  fire(device: string, entity: string, action: string): Promise<Record<string, never>> {
    return this.call('devices/fire', { device, entity, action });
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
