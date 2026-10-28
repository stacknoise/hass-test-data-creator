/** The part of Home Assistant's `hass` object that the panel uses. */
export interface Hass {
  language: string;
  callWS<T>(message: Record<string, unknown>): Promise<T>;
}

/** The signal block of a sensor entity, as in the templates. */
export interface SignalDef {
  shape: string;
  min?: number;
  max?: number;
  period_s?: number;
  interval_s?: number;
  noise?: number;
  decimals?: number;
  phase?: number;
  rate_per_hour?: number;
}

/** One entity of a template. */
export interface EntityDef {
  key: string;
  platform: string;
  name: string;
  device_class?: string | null;
  unit?: string | null;
  signal?: SignalDef | null;
  event_types?: string[] | null;
}

/** A device template. */
export interface TemplateInfo {
  id: string;
  name: string;
  model: string;
  bundled: boolean;
  entities: EntityDef[];
}

/** Version, limits and capabilities reported by the backend. */
export interface Info {
  version: string;
  api_version: number;
  features: string[];
  limits: { max_devices: number; max_batch: number; max_entities_per_device: number };
  outputs: string[];
  shapes: string[];
  platforms: string[];
  actions: Record<string, string[]>;
  tick_seconds: number;
  device_count: number;
}

/** The current state of one entity of a device. */
export interface EntityState {
  key: string;
  name: string;
  platform: string;
  entity_id: string | null;
  state: string | null;
  unit: string | null;
}

/** A generated device as listed by the backend. */
export interface DeviceInfo {
  id: string;
  name: string;
  template: string;
  model: string;
  area: string | null;
  output: string;
  run_id: string;
  created_at: number;
  entities: EntityState[];
}

/** One page of devices. */
export interface DevicePage {
  total: number;
  devices: DeviceInfo[];
}

/** The inputs of a creation job. */
export interface CreateRequest {
  template: string;
  count: number;
  name_pattern: string;
  areas: string[];
  area_mode: 'even' | 'random';
  seed?: string;
  label?: string;
  entities?: Record<string, unknown>[];
}

/** What a removal would delete. */
export interface RemovalPlan {
  target: string;
  devices: { id: string; name: string }[];
  orphans: { id: string; name: string }[];
  runs: string[];
  areas: string[];
}

/** What a removal deleted. */
export interface RemovalResult {
  devices: number;
  orphans: number;
  areas: string[];
}

/** The kinds of removal target. */
export type RemovalTarget = 'all' | 'run' | 'device';
