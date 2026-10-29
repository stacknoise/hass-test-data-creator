import type { DeviceInfo, DeviceUsage } from '../common/types';
import { TAB_GROUPS } from '../common/constants';

/** An action that needs one number, with the name of its parameter and the allowed range. */
export interface ValueAction {
  param: string;
  min: number;
  max: number;
  start: number;
}

/** The actions of the backend that take a number (see `scheduler/actions.py`). */
export const VALUE_ACTIONS: Record<string, ValueAction> = {
  set_brightness: { param: 'brightness', min: 0, max: 255, start: 128 },
  set_position: { param: 'position', min: 0, max: 100, start: 50 },
  set_temperature: { param: 'temperature', min: 5, max: 30, start: 21 },
};

/** The prefix of the action names that start a fault. */
export const FAULT_PREFIX = 'fault_';
/** The duration that a fault gets when the user enters none. */
export const DEFAULT_FAULT_SECONDS = 60;

/** The actions of one entity, sorted by how the detail view shows them. */
export interface EntityActions {
  plain: string[];
  withValue: string[];
  faults: string[];
}

/** Split the actions of a platform into plain buttons, actions with a number and fault kinds. */
export function actionsFor(actions: Record<string, string[]>, platform: string): EntityActions {
  const names = actions[platform] ?? [];
  return {
    plain: names.filter((n) => !n.startsWith(FAULT_PREFIX) && !(n in VALUE_ACTIONS)),
    withValue: names.filter((n) => n in VALUE_ACTIONS),
    faults: names
      .filter((n) => n.startsWith(FAULT_PREFIX))
      .map((n) => n.slice(FAULT_PREFIX.length)),
  };
}

/** Return the parameters of a number action from the text, or undefined if it is out of range. */
export function valueParams(action: string, text: string): Record<string, number> | undefined {
  const spec = VALUE_ACTIONS[action];
  const value = Number(text);
  if (!spec || text.trim() === '' || Number.isNaN(value)) return undefined;
  if (value < spec.min || value > spec.max) return undefined;
  return { [spec.param]: value };
}

/** Return the parameters that start a fault for `seconds`, or undefined if that is not positive. */
export function faultParams(text: string): Record<string, number> | undefined {
  const seconds = Number(text);
  return text.trim() !== '' && seconds > 0 ? { duration_s: seconds } : undefined;
}

/** Return the names of the areas to offer: those of Home Assistant and those of the devices. */
export function knownAreas(
  areas: Record<string, { name: string }> | undefined,
  devices: DeviceInfo[],
): string[] {
  const names = [
    ...Object.values(areas ?? {}).map((a) => a.name),
    ...devices.flatMap((d) => (d.area ? [d.area] : [])),
  ];
  return [...new Set(names)].sort((a, b) => a.localeCompare(b));
}

/** The kinds of user of a device, in the order that they are listed. */
export const USAGE_KINDS = ['schedules', 'scenarios', TAB_GROUPS] as const;

/** One user of a device: its kind and its name. */
export interface UsageEntry {
  kind: (typeof USAGE_KINDS)[number];
  name: string;
}

/** Return the users of a device as a flat list: schedules first, then scenarios, then groups. */
export function usageEntries(used: DeviceUsage | undefined): UsageEntry[] {
  return USAGE_KINDS.flatMap((kind) =>
    (used?.[kind] ?? []).map((item) => ({ kind, name: item.name })),
  );
}
