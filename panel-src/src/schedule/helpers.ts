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

/** The inputs that say what runs where: the target and the action (by name).
 * The entity is empty, so the action runs on every entity that can do it; a stored one is kept. */
export interface WorkForm {
  kind: TargetKind;
  targetIds: string[];
  action: string;
  entity: string;
}

/** Return the distinct action names of all platforms, in the order that they are first listed. */
export function actionNames(actions: Record<string, string[]>): string[] {
  return [...new Set(Object.values(actions).flat())];
}

/** Return a form for all devices with the first action. */
export function defaultWork(actions: Record<string, string[]>): WorkForm {
  return { kind: 'all', targetIds: [], action: actionNames(actions)[0] ?? '', entity: '' };
}

/**
 * Return the platforms that each chosen device has, or undefined while nothing is chosen yet.
 *
 * A template gives one set, a device or a device set one set per device, and "all devices" one set
 * per device that exists; with no device at all nothing limits the actions.
 */
export function platformSetsOfTarget(
  kind: TargetKind,
  ids: string[],
  devices: DeviceInfo[],
  templates: TemplateInfo[],
): Set<string>[] | undefined {
  const of = (entities: { platform: string }[]): Set<string> =>
    new Set(entities.map((entity) => entity.platform));
  if (kind === 'all') return devices.length ? devices.map((d) => of(d.entities)) : undefined;
  if (ids.length === 0) return undefined;
  if (kind === 'template') {
    const tpl = templates.find((t) => t.id === ids[0]);
    return tpl ? [of(tpl.entities)] : undefined;
  }
  const chosen =
    kind === 'device'
      ? devices.filter((d) => ids.includes(d.id) || ids.includes(d.name))
      : devices.filter((d) => d.run_id === ids[0]);
  return chosen.length ? chosen.map((d) => of(d.entities)) : undefined;
}

/**
 * Return the actions that every chosen device can do (the smallest common denominator).
 *
 * A device can do an action if one of its entities can. If the common set cannot be found (no target
 * is chosen yet, the target is gone, or there is no device), nothing is offered.
 */
export function availableActions(
  actions: Record<string, string[]>,
  sets: Set<string>[] | undefined,
): string[] {
  const all = actionNames(actions);
  if (!sets) return [];
  const doable = (platforms: Set<string>): Set<string> =>
    new Set(
      Object.entries(actions)
        .filter(([platform]) => platforms.has(platform))
        .flatMap(([, names]) => names),
    );
  const per = sets.map(doable);
  return all.filter((action) => per.every((names) => names.has(action)));
}

/** Return the target, entity and action that the form describes; an empty entity means all that fit. */
export function resolveWork(work: WorkForm): {
  target: ScheduleTarget;
  entity: string;
  action: string;
} {
  return {
    target: buildTarget(work.kind, work.targetIds),
    entity: work.entity,
    action: work.action,
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

/** Return the work form of an existing schedule or step. */
export function workOf(schedule: Pick<ScheduleInfo, 'target' | 'entity' | 'action'>): WorkForm {
  const { kind, ids } = describeTarget(schedule.target);
  return { kind, targetIds: ids, action: schedule.action, entity: schedule.entity };
}
