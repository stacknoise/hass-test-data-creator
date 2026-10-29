import type {
  DeviceName,
  ScheduleInfo,
  ScheduleTarget,
  TemplateInfo,
  Trigger,
  TriggerType,
} from '../common/types';
import {
  KIND_ALL,
  KIND_DEVICE,
  KIND_RUN,
  KIND_TEMPLATE,
  LIST_SEPARATOR,
  TRIGGER_INTERVAL,
  TRIGGER_ONCE,
  TRIGGER_POISSON,
  TRIGGER_RANDOM_WINDOW,
  TRIGGER_TIMES,
} from '../common/constants';

const DEFAULT_EVERY_S = 60;
const DEFAULT_COUNT = 3;
const DEFAULT_PER_DAY = 24;
// Length of `2026-10-28T17:30`, an ISO time up to the minute.
const MINUTE_LENGTH = 16;

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
    type: TRIGGER_TIMES,
    times: '08:00, 18:30',
    weekdays: [],
    everyS: DEFAULT_EVERY_S,
    start: '00:00',
    end: '24:00',
    at: '',
    count: DEFAULT_COUNT,
    perDay: DEFAULT_PER_DAY,
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
    case TRIGGER_TIMES:
      return form.weekdays.length
        ? {
            type: TRIGGER_TIMES,
            times: parseTimes(form.times),
            weekdays: [...form.weekdays].sort(),
          }
        : { type: TRIGGER_TIMES, times: parseTimes(form.times) };
    case TRIGGER_INTERVAL:
      return { type: TRIGGER_INTERVAL, every_s: form.everyS, start: form.start, end: form.end };
    case TRIGGER_ONCE:
      return { type: TRIGGER_ONCE, at: form.at };
    case TRIGGER_RANDOM_WINDOW:
      return { type: TRIGGER_RANDOM_WINDOW, count: form.count, start: form.start, end: form.end };
    case TRIGGER_POISSON:
      return { type: TRIGGER_POISSON, per_day: form.perDay };
  }
}

/** Return the target for a kind and its ids; devices may be several, the others take the first id. */
export function buildTarget(kind: TargetKind, ids: string[]): ScheduleTarget {
  switch (kind) {
    case KIND_ALL:
      return { all: true };
    case KIND_TEMPLATE:
      return { template: ids[0] ?? '' };
    case KIND_DEVICE:
      return { device: ids.length === 1 ? ids[0] : ids };
    case KIND_RUN:
      return { run: ids[0] ?? '' };
  }
}

/** Return the kind and the ids of a target, for the list and the form. */
export function describeTarget(target: ScheduleTarget | Record<string, never>): {
  kind: TargetKind;
  ids: string[];
} {
  if (KIND_TEMPLATE in target) return { kind: KIND_TEMPLATE, ids: [target.template] };
  if (KIND_DEVICE in target) {
    return {
      kind: KIND_DEVICE,
      ids: typeof target.device === 'string' ? [target.device] : target.device,
    };
  }
  if (KIND_RUN in target) return { kind: KIND_RUN, ids: [target.run] };
  return { kind: KIND_ALL, ids: [] };
}

/** Return a short text for a trigger, for the list. */
export function summarizeTrigger(trigger: Trigger): string {
  switch (trigger.type) {
    case TRIGGER_TIMES:
      return trigger.times.join(LIST_SEPARATOR);
    case TRIGGER_INTERVAL:
      return `${trigger.every_s} s (${trigger.start}–${trigger.end})`;
    case TRIGGER_ONCE:
      return trigger.at.replace('T', ' ');
    case TRIGGER_RANDOM_WINDOW:
      return `${trigger.count}× ${trigger.start}–${trigger.end}`;
    case TRIGGER_POISSON:
      return `Ø ${trigger.per_day}/d`;
  }
}

/** Return a planned run time as local date and time without seconds. */
export function formatWhen(iso: string): string {
  return iso.slice(0, MINUTE_LENGTH).replace('T', ' ');
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
  return { kind: KIND_ALL, targetIds: [], action: actionNames(actions)[0] ?? '', entity: '' };
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
  devices: DeviceName[],
  templates: TemplateInfo[],
): Set<string>[] | undefined {
  const of = (entities: { platform: string }[]): Set<string> =>
    new Set(entities.map((entity) => entity.platform));
  if (kind === KIND_ALL) return devices.length ? devices.map((d) => of(d.entities)) : undefined;
  if (ids.length === 0) return undefined;
  if (kind === KIND_TEMPLATE) {
    const tpl = templates.find((t) => t.id === ids[0]);
    return tpl ? [of(tpl.entities)] : undefined;
  }
  const chosen =
    kind === KIND_DEVICE
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

/** An entity that an action can run on: its key and the name it has. */
export interface EntityChoice {
  key: string;
  name: string;
}

/**
 * Return the entities of a single device or a template that can do the action.
 *
 * Only one device or one template has one set of entities; for several devices, a device set or all
 * devices there is nothing to choose from, and the list is empty.
 */
export function entityChoices(
  kind: TargetKind,
  ids: string[],
  devices: DeviceName[],
  templates: TemplateInfo[],
  actions: Record<string, string[]>,
  action: string,
): EntityChoice[] {
  const entities =
    ids.length !== 1
      ? []
      : kind === KIND_TEMPLATE
        ? (templates.find((t) => t.id === ids[0])?.entities ?? [])
        : kind === KIND_DEVICE
          ? (devices.find((d) => d.id === ids[0] || d.name === ids[0])?.entities ?? [])
          : [];
  const platforms = new Set(
    Object.entries(actions)
      .filter(([, names]) => names.includes(action))
      .map(([platform]) => platform),
  );
  return entities
    .filter((entity) => platforms.has(entity.platform))
    .map(({ key, name }) => ({ key, name }));
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
    case TRIGGER_TIMES:
      return {
        ...base,
        times: trigger.times.join(LIST_SEPARATOR),
        weekdays: trigger.weekdays ?? [],
      };
    case TRIGGER_INTERVAL:
      return { ...base, everyS: trigger.every_s, start: trigger.start, end: trigger.end };
    case TRIGGER_ONCE:
      return { ...base, at: trigger.at };
    case TRIGGER_RANDOM_WINDOW:
      return { ...base, count: trigger.count, start: trigger.start, end: trigger.end };
    case TRIGGER_POISSON:
      return { ...base, perDay: trigger.per_day };
  }
}

/** Return the work form of an existing schedule or step. */
export function workOf(schedule: Pick<ScheduleInfo, 'target' | 'entity' | 'action'>): WorkForm {
  const { kind, ids } = describeTarget(schedule.target);
  return { kind, targetIds: ids, action: schedule.action, entity: schedule.entity };
}
