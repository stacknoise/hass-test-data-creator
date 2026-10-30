import type { FilterField, FilterValue, FilterValues } from '../common/filter-state';
import type { SelectItem } from '../common/multi-select';
import type {
  DeviceFilterRequest,
  DeviceInfo,
  DeviceUsage,
  EntityState,
  FacetEntry,
  SignalDef,
} from '../common/types';
import { PLATFORM_SENSOR, TAB_GROUPS } from '../common/constants';

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

/** Return the offset of the last page of `total` items in pages of `size`. */
export function lastPageOffset(total: number, size: number): number {
  return total <= 0 ? 0 : Math.floor((total - 1) / size) * size;
}

/** The fields of the device filter by key and kind; the labels and options come with the facets. */
export const DEVICE_FIELDS: FilterField[] = [
  { key: 'templates', kind: 'multi', label: '' },
  { key: 'areas', kind: 'multi', label: '' },
  { key: 'outputs', kind: 'multi', label: '' },
  { key: 'platforms', kind: 'multi', label: '' },
  { key: 'runs', kind: 'multi', label: '' },
  { key: 'state', kind: 'choice', label: '' },
  { key: 'custom', kind: 'switch', label: '' },
];

/** The tab under which the filter of the device list is kept in the session. */
export const DEVICE_FILTER_TAB = 'devices';

/** Return the request fields for the filter state of the bar; empty restrictions are left out. */
export function deviceRequest(values: FilterValues): DeviceFilterRequest {
  const list = (key: string): string[] | undefined => {
    const value = values[key];
    return Array.isArray(value) && value.length ? value : undefined;
  };
  const text = (key: string): string | undefined => {
    const value = values[key];
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
  };
  const request: DeviceFilterRequest = {
    query: text('query'),
    templates: list('templates'),
    areas: list('areas'),
    outputs: list('outputs'),
    platforms: list('platforms'),
    runs: list('runs'),
    custom: values.custom === true ? true : undefined,
    state: text('state'),
    sort: text('sort'),
    descending: values.descending === true ? true : undefined,
  };
  return Object.fromEntries(
    Object.entries(request).filter(([, value]) => value !== undefined),
  ) as DeviceFilterRequest;
}

/** Return the options of a filter group: the values with their counts, plus the chosen ones. */
export function facetItems(
  entries: FacetEntry[] | undefined,
  chosen: FilterValue | undefined,
  label: (entry: FacetEntry) => string,
): SelectItem[] {
  const items = (entries ?? []).map((entry) => ({
    value: entry.value,
    label: `${label(entry)} (${entry.count})`,
  }));
  const missing = (Array.isArray(chosen) ? chosen : chosen ? [String(chosen)] : [])
    .filter((value) => !items.some((item) => item.value === value))
    .map((value) => ({ value, label: label({ value, count: 0 }) }));
  return [...items, ...missing];
}

/** Return the first sensor of a device that has a curve; the row draws this one. */
export function curveEntity(device: DeviceInfo): EntityState | undefined {
  return device.entities.find((e) => e.platform === PLATFORM_SENSOR && e.shape);
}

/** Return the ids of the devices whose row curve is not loaded yet. */
export function missingCurves(devices: DeviceInfo[], loaded: Record<string, SignalDef>): string[] {
  return devices.filter((d) => curveEntity(d) && !(d.id in loaded)).map((d) => d.id);
}
