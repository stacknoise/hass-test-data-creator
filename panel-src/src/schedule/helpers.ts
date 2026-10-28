import type {
  DeviceInfo,
  ScheduleInfo,
  ScheduleTarget,
  TemplateInfo,
  Trigger,
  TriggerType,
} from '../common/types';

/** The raw inputs of the trigger part of the schedule form. */
export interface TriggerForm {
  type: TriggerType;
  times: string;
  weekdays: number[];
  everyS: number;
  start: string;
  end: string;
  at: string;
  count: number;
  perDay: number;
}

/** The kinds of target the form offers. */
export type TargetKind = 'all' | 'template' | 'device' | 'run';

/** Return the form values of a new trigger. */
export function defaultTriggerForm(): TriggerForm {
  return {
    type: 'times',
    times: '08:00, 18:30',
    weekdays: [],
    everyS: 60,
    start: '00:00',
    end: '24:00',
    at: '',
    count: 3,
    perDay: 24,
  };
}

/** Return the clock times of a comma separated text, without empty items. */
export function parseTimes(text: string): string[] {
  return text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

/** Return the trigger that the form describes. */
export function buildTrigger(form: TriggerForm): Trigger {
  switch (form.type) {
    case 'times':
      return form.weekdays.length
        ? { type: 'times', times: parseTimes(form.times), weekdays: [...form.weekdays].sort() }
        : { type: 'times', times: parseTimes(form.times) };
    case 'interval':
      return { type: 'interval', every_s: form.everyS, start: form.start, end: form.end };
    case 'once':
      return { type: 'once', at: form.at };
    case 'random_window':
      return { type: 'random_window', count: form.count, start: form.start, end: form.end };
    case 'poisson':
      return { type: 'poisson', per_day: form.perDay };
  }
}

/** Return the target for a kind and its ids; devices may be several, the others take the first id. */
export function buildTarget(kind: TargetKind, ids: string[]): ScheduleTarget {
  switch (kind) {
    case 'all':
      return { all: true };
    case 'template':
      return { template: ids[0] ?? '' };
    case 'device':
      return { device: ids.length === 1 ? ids[0] : ids };
    case 'run':
      return { run: ids[0] ?? '' };
  }
}

/** Return the kind and the ids of a target, for the list and the form. */
export function describeTarget(target: ScheduleTarget | Record<string, never>): {
  kind: TargetKind;
  ids: string[];
} {
  if ('template' in target) return { kind: 'template', ids: [target.template] };
  if ('device' in target) {
    return {
      kind: 'device',
      ids: typeof target.device === 'string' ? [target.device] : target.device,
    };
  }
  if ('run' in target) return { kind: 'run', ids: [target.run] };
  return { kind: 'all', ids: [] };
}

/** Return a short text for a trigger, for the list. */
export function summarizeTrigger(trigger: Trigger): string {
  switch (trigger.type) {
    case 'times':
      return trigger.times.join(', ');
    case 'interval':
      return `${trigger.every_s} s (${trigger.start}–${trigger.end})`;
    case 'once':
      return trigger.at.replace('T', ' ');
    case 'random_window':
      return `${trigger.count}× ${trigger.start}–${trigger.end}`;
    case 'poisson':
      return `Ø ${trigger.per_day}/d`;
  }
}

/** Return a planned run time as local date and time without seconds. */
export function formatWhen(iso: string): string {
  return iso.slice(0, 16).replace('T', ' ');
}

/** The inputs that say what runs where: the target, the action and the entity. */
export interface WorkForm {
  kind: TargetKind;
  targetIds: string[];
  actionKey: string;
  entity: string;
}

/** An entity that a target has: its platform and its key. */
export interface EntityRef {
  platform: string;
  key: string;
}

/** Return the actions as `platform/action` for a select. */
export function actionKeys(actions: Record<string, string[]>): string[] {
  return Object.entries(actions).flatMap(([platform, names]) =>
    names.map((name) => `${platform}/${name}`),
  );
}

/** Return a form for all devices with the first action. */
export function defaultWork(actions: Record<string, string[]>): WorkForm {
  return { kind: 'all', targetIds: [], actionKey: actionKeys(actions)[0] ?? '', entity: '' };
}

/** Return `refs` without doubles. */
function unique(refs: EntityRef[]): EntityRef[] {
  const seen = new Map(refs.map((ref) => [`${ref.platform}/${ref.key}`, ref]));
  return [...seen.values()].map(({ platform, key }) => ({ platform, key }));
}

/** Return every entity that the templates define; what could exist at all. */
export function allEntities(templates: TemplateInfo[]): EntityRef[] {
  return unique(templates.flatMap((tpl) => tpl.entities));
}

/**
 * Return the entities that the chosen target has, or undefined while nothing is chosen yet.
 *
 * A template is taken from the templates, everything else from the devices that exist; with no
 * device at all, "all devices" falls back to what the templates would create.
 */
export function entitiesOfTarget(
  kind: TargetKind,
  ids: string[],
  devices: DeviceInfo[],
  templates: TemplateInfo[],
): EntityRef[] | undefined {
  if (kind === 'all') {
    return devices.length ? unique(devices.flatMap((d) => d.entities)) : allEntities(templates);
  }
  if (ids.length === 0) return undefined;
  if (kind === 'template') {
    const tpl = templates.find((t) => t.id === ids[0]);
    return tpl ? unique(tpl.entities) : undefined;
  }
  const chosen =
    kind === 'device'
      ? devices.filter((d) => ids.includes(d.id) || ids.includes(d.name))
      : devices.filter((d) => d.run_id === ids[0]);
  return chosen.length ? unique(chosen.flatMap((d) => d.entities)) : undefined;
}

/** Return the actions that fit the entities; all of them while no target is chosen. */
export function availableActionKeys(
  actions: Record<string, string[]>,
  refs: EntityRef[] | undefined,
): string[] {
  const platforms = refs ? new Set(refs.map((ref) => ref.platform)) : undefined;
  return actionKeys(actions).filter((key) => !platforms || platforms.has(key.split('/')[0]));
}

/** Return the keys of the entities that the action `actionKey` works on. */
export function entityKeysFor(refs: EntityRef[], actionKey: string): string[] {
  const platform = actionKey.split('/')[0];
  return [...new Set(refs.filter((ref) => ref.platform === platform).map((ref) => ref.key))];
}

/** Return the target, entity and action that the form describes. */
export function resolveWork(work: WorkForm): {
  target: ScheduleTarget;
  entity: string;
  action: string;
} {
  return {
    target: buildTarget(work.kind, work.targetIds),
    entity: work.entity,
    action: work.actionKey.split('/')[1] ?? '',
  };
}

/** Return the form values of an existing trigger; fields that its type lacks keep their defaults. */
export function triggerFormOf(trigger: Trigger): TriggerForm {
  const base = { ...defaultTriggerForm(), type: trigger.type };
  switch (trigger.type) {
    case 'times':
      return { ...base, times: trigger.times.join(', '), weekdays: trigger.weekdays ?? [] };
    case 'interval':
      return { ...base, everyS: trigger.every_s, start: trigger.start, end: trigger.end };
    case 'once':
      return { ...base, at: trigger.at };
    case 'random_window':
      return { ...base, count: trigger.count, start: trigger.start, end: trigger.end };
    case 'poisson':
      return { ...base, perDay: trigger.per_day };
  }
}

/** Return the work form of an existing schedule: the platform is the one whose entity has that key. */
export function workOf(
  schedule: Pick<ScheduleInfo, 'target' | 'entity' | 'action'>,
  actions: Record<string, string[]>,
  templates: TemplateInfo[],
): WorkForm {
  const { kind, ids } = describeTarget(schedule.target);
  const platforms = Object.entries(actions)
    .filter(([, names]) => names.includes(schedule.action))
    .map(([platform]) => platform);
  const platform =
    platforms.find((p) =>
      templates.some((tpl) =>
        tpl.entities.some((e) => e.platform === p && e.key === schedule.entity),
      ),
    ) ?? platforms[0];
  return {
    kind,
    targetIds: ids,
    actionKey: platform ? `${platform}/${schedule.action}` : '',
    entity: schedule.entity,
  };
}
