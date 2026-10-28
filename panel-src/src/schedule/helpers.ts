import type { ScheduleTarget, Trigger, TriggerType } from '../common/types';

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

/** Return the target for a kind and an id; the id is ignored for "all". */
export function buildTarget(kind: TargetKind, id: string): ScheduleTarget {
  switch (kind) {
    case 'all':
      return { all: true };
    case 'template':
      return { template: id };
    case 'device':
      return { device: id };
    case 'run':
      return { run: id };
  }
}

/** Return the kind and id of a target, for the list. */
export function describeTarget(target: ScheduleTarget | Record<string, never>): {
  kind: TargetKind;
  id: string;
} {
  if ('template' in target) return { kind: 'template', id: target.template };
  if ('device' in target) return { kind: 'device', id: target.device };
  if ('run' in target) return { kind: 'run', id: target.run };
  return { kind: 'all', id: '' };
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
