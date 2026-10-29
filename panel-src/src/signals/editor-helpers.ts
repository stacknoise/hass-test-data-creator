import type { SignalDef } from '../common/types';
import {
  FIELD_INTERVAL_S,
  FIELD_NOISE,
  FIELD_PHASE,
  FIELD_SHAPE,
  LIST_SEPARATOR,
  SHAPE_ENUM,
  SHAPE_STATE_MACHINE,
} from '../common/constants';

/** The numeric parameters of a signal that the editor can show, besides min, max and decimals. */
export type SignalField =
  'period_s' | 'interval_s' | 'phase' | 'rate_per_hour' | 'noise' | 'step_s';

/** The shape that replays a file of the backend. */
export const CSV_SHAPE = 'csv';

/** The parameters that are lists and are edited as one line of text. */
export type TextField = 'values' | 'weights' | 'states';

/** The shapes whose value is a state name instead of a number. */
export const DISCRETE_SHAPES = [SHAPE_ENUM, SHAPE_STATE_MACHINE];

const PERIODIC = ['sine', 'saw', 'square', 'triangle', 'random_walk', 'discharge'];
const NO_PARAMETERS = ['constant', 'household_load', 'pv_day'];
const DEFAULT_HOLD_S = 600;
const DAY_SECONDS = 86400;
const PERIODS_SHOWN = 24;

/** Return whether the value of `shape` is a state name. */
export function isDiscrete(shape: string): boolean {
  return DISCRETE_SHAPES.includes(shape);
}

/** Return the parameters that change the curve of `shape`, in the order the editor shows them. */
export function fieldsFor(shape: string): SignalField[] {
  if (shape === 'counter') return ['rate_per_hour'];
  if (shape === CSV_SHAPE) return ['step_s', FIELD_PHASE];
  if (shape === FIELD_NOISE) return [FIELD_INTERVAL_S, FIELD_NOISE];
  if (shape === 'steps') return ['period_s', FIELD_INTERVAL_S, FIELD_PHASE, FIELD_NOISE];
  if (shape === SHAPE_ENUM) return [FIELD_INTERVAL_S];
  if (shape === SHAPE_STATE_MACHINE) return [FIELD_PHASE];
  if (PERIODIC.includes(shape)) return ['period_s', FIELD_PHASE, FIELD_NOISE];
  if (NO_PARAMETERS.includes(shape)) return [FIELD_NOISE];
  return [];
}

/** Return the seconds a preview covers: a day, or fewer for a short period so the curve stays resolved. */
export function previewSeconds(def: SignalDef): number {
  const period = def.period_s;
  if (!fieldsFor(def.shape).includes('period_s') || !period || period <= 0) return DAY_SECONDS;
  return Math.min(DAY_SECONDS, period * PERIODS_SHOWN);
}

/** Return `seconds` as a short label such as `30 s`, `12 min` or `6 h`. */
export function spanLabel(seconds: number): string {
  if (seconds < 120) return `${Number(seconds.toFixed(1))} s`;
  if (seconds < 2 * 3600) return `${Number((seconds / 60).toFixed(1))} min`;
  return `${Number((seconds / 3600).toFixed(1))} h`;
}

/** Return the list parameters that `shape` takes. */
export function textFieldsFor(shape: string): TextField[] {
  if (shape === SHAPE_ENUM) return ['values', 'weights'];
  if (shape === SHAPE_STATE_MACHINE) return ['states'];
  return [];
}

/** Return `signal` with the field set; an empty or non-numeric text removes the field. */
export function withField(
  signal: SignalDef,
  field: SignalField | 'min' | 'max' | 'decimals',
  text: string,
): SignalDef {
  const next: SignalDef = { ...signal };
  const value = Number(text);
  if (text.trim() === '' || Number.isNaN(value)) {
    delete next[field];
  } else {
    next[field] = value;
  }
  return next;
}

/** Return a comma separated text split into trimmed, non-empty items. */
function items(text: string): string[] {
  return text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

/** Return the text of a list parameter: `a, b`, `1, 2` or `idle:600, wash:1800`. */
export function textOf(signal: SignalDef, field: TextField): string {
  if (field === 'states') {
    return (signal.states ?? []).map((s) => `${s.value}:${s.duration_s}`).join(LIST_SEPARATOR);
  }
  return (signal[field] ?? []).join(LIST_SEPARATOR);
}

/** Return `signal` with a list parameter set from its text; items that do not fit are dropped. */
export function withText(signal: SignalDef, field: TextField, text: string): SignalDef {
  const next: SignalDef = { ...signal };
  if (field === 'values') {
    next.values = items(text);
  } else if (field === 'weights') {
    next.weights = items(text)
      .map(Number)
      .filter((n) => !Number.isNaN(n));
  } else {
    next.states = items(text).flatMap((item) => {
      const [value, duration] = item.split(':').map((part) => part.trim());
      const seconds = Number(duration);
      return value && seconds > 0 ? [{ value, duration_s: seconds }] : [];
    });
  }
  return next;
}

/** Return the parameters that a new discrete shape needs, so that it is valid at once. */
function defaultsFor(shape: string): Partial<SignalDef> {
  if (shape === SHAPE_ENUM) return { values: ['on', 'off'], interval_s: DEFAULT_HOLD_S };
  if (shape === SHAPE_STATE_MACHINE) {
    return {
      states: [
        { value: 'idle', duration_s: DEFAULT_HOLD_S },
        { value: 'active', duration_s: DEFAULT_HOLD_S },
      ],
    };
  }
  return {};
}

/** Return `signal` with another shape; parameters that the new shape ignores are dropped. */
export function withShape(signal: SignalDef, shape: string): SignalDef {
  const keep = new Set<string>([FIELD_SHAPE, ...fieldsFor(shape), ...textFieldsFor(shape)]);
  if (shape === CSV_SHAPE) keep.add('file');
  if (!isDiscrete(shape)) ['min', 'max', 'decimals'].forEach((key) => keep.add(key));
  const merged = { ...defaultsFor(shape), ...signal, shape };
  const next = Object.fromEntries(Object.entries(merged).filter(([k]) => keep.has(k)));
  return next as unknown as SignalDef;
}
