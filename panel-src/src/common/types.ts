/** The part of Home Assistant's `hass` object that the panel uses. */
export interface Hass {
  language: string;
  states?: Record<string, { attributes?: { unit_of_measurement?: unknown } }>;
  areas?: Record<string, { name: string }>;
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
  file?: string;
  step_s?: number;
  values?: string[];
  weights?: number[];
  states?: { value: string; duration_s: number }[];
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
  limits: {
    max_devices: number;
    max_batch: number;
    max_entities_per_device: number;
    max_transfer_bytes: number;
  };
  outputs: string[];
  shapes: string[];
  platforms: string[];
  actions: Record<string, string[]>;
  tick_seconds: number;
  time_lapse: number;
  csv_files: string[];
  mqtt: boolean;
  device_count: number;
}

/** The current state of one entity of a device. */
export interface EntityState {
  key: string;
  name: string;
  /** The kind of curve of a sensor; the curve itself comes with `devices/get`. */
  shape?: string | null;
  signal?: SignalDef | null;
  platform: string;
  entity_id: string | null;
  state: string | null;
  unit: string | null;
  state_class?: string | null;
  fault: string | null;
}

/** What a picker needs of an entity: no state, no curve. */
export interface PickerEntity {
  key: string;
  name: string;
  platform: string;
  state_class?: string | null;
  shape?: string | null;
}

/** What pickers and run lists need of a generated device (`devices/names`). */
export interface DeviceName {
  id: string;
  name: string;
  template: string;
  model: string;
  output: string;
  run_id: string;
  created_at: number;
  entities: PickerEntity[];
}

/** A generated device as listed by the backend. */
export interface DeviceInfo extends DeviceName {
  area: string | null;
  entities: EntityState[];
  used_by: DeviceUsage;
}

/** The schedules, scenarios and groups that name a device. */
export interface DeviceUsage {
  schedules: { id: string; name: string }[];
  scenarios: { id: string; name: string }[];
  groups: { id: string; name: string }[];
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
  output?: string;
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
  schedules: string[];
  scenarios: string[];
  groups: string[];
  topics: string[];
  statistics: string[];
  in_use: { device: string; usage: DeviceUsage }[];
}

/** What a statistics import wrote. */
export interface HistoryResult {
  series: number;
  rows: number;
  skipped: number;
}

/** What a removal deleted. */
export interface RemovalResult {
  devices: number;
  orphans: number;
  areas: string[];
}

/** The kinds of removal target. */
export type RemovalTarget = 'all' | 'run' | 'device';

/** What a schedule runs on: exactly one of the keys is set. */
export type ScheduleTarget =
  { device: string | string[] } | { template: string } | { run: string } | { all: true };

/** The trigger of a schedule, as the backend validates it. */
export type Trigger =
  | { type: 'times'; times: string[]; weekdays?: number[] }
  | { type: 'interval'; every_s: number; start: string; end: string }
  | { type: 'once'; at: string }
  | { type: 'random_window'; count: number; start: string; end: string }
  | { type: 'poisson'; per_day: number };

/** The trigger types the panel can create. */
export type TriggerType = Trigger['type'];

/** A schedule as listed by the backend. */
export interface ScheduleInfo {
  id: string;
  name: string;
  target: ScheduleTarget | Record<string, never>;
  entity: string;
  action: string;
  scenario: string | null;
  trigger: Trigger;
  seed: string;
  created_at: number;
  params: Record<string, unknown>;
  enabled: boolean;
}

/** The inputs of a new schedule. */
export interface ScheduleRequest {
  name: string;
  target?: ScheduleTarget;
  entity?: string;
  action?: string;
  scenario?: string;
  trigger: Trigger;
  seed?: string;
  params?: Record<string, unknown>;
  enabled?: boolean;
}

/** One planned run of a schedule. */
export interface PlannedRun {
  when: string;
  schedule_id: string;
  name: string;
}

/** One step of a scenario: an action that runs `after_s` seconds after the step before. */
export interface ScenarioStep {
  after_s: number;
  target: ScheduleTarget;
  entity: string;
  action: string;
  params: Record<string, unknown>;
}

/** A scenario as listed by the backend. */
export interface ScenarioInfo {
  id: string;
  name: string;
  steps: ScenarioStep[];
  created_at: number;
}

/** A group of Zigbee2MQTT devices as listed by the backend. */
export interface GroupInfo {
  id: string;
  name: string;
  number: number;
  members: string[];
  created_at: number;
}

/** The categories of a transfer file. */
export type TransferCategory = 'devices' | 'templates' | 'schedules' | 'scenarios' | 'groups';

/** One page of the entries of a category, as `transfer/export` returns it. */
export interface TransferPage {
  format_version: number;
  integration_version: string;
  category: TransferCategory;
  total: number;
  items: object[];
}

/** A transfer file: the version data and one list per exported category. */
export type TransferFile = {
  format_version: number;
  integration_version: string;
  exported_at: string;
} & Partial<Record<TransferCategory, object[]>>;

/** How an import treats an item that already exists. */
export type ImportMode = 'add' | 'sync' | 'replace';

/** One batch of entries of one category for `transfer/plan` and `transfer/run`. */
export interface ImportBatch {
  category: TransferCategory;
  mode: ImportMode;
  items: object[];
  /** Names the file has, so that a reference to an entry that is not created yet is accepted. */
  known: Partial<Record<'devices' | 'templates' | 'scenarios', string[]>>;
  /** The categories that are replaced in the same import. */
  replacing: TransferCategory[];
  /** Whether this is the first batch of the category; a replace counts the removal once. */
  first: boolean;
  file_name: string;
  /** `purge` removes the items of the category and ignores `items`. */
  phase?: 'import' | 'purge';
}

/** What an import of a category would do, or did. */
export interface ImportPlan {
  category: TransferCategory;
  mode: ImportMode;
  create: number;
  update: number;
  skip: number;
  conflict: number;
  delete: number;
  problems: { name: string; code: string; reason: string }[];
}
