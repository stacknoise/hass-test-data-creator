import type { SignalDef } from '../common/types';

/** The numeric parameters of a signal that the editor can show, besides min, max and decimals. */
export type SignalField = 'period_s' | 'interval_s' | 'phase' | 'rate_per_hour' | 'noise';

const PERIODIC = ['sine', 'saw', 'square', 'triangle', 'random_walk', 'discharge'];
const NO_PARAMETERS = ['constant', 'household_load', 'pv_day'];

/** Return the parameters that change the curve of `shape`, in the order the editor shows them. */
export function fieldsFor(shape: string): SignalField[] {
  if (shape === 'counter') return ['rate_per_hour'];
  if (shape === 'noise') return ['interval_s', 'noise'];
  if (shape === 'steps') return ['period_s', 'interval_s', 'phase', 'noise'];
  if (PERIODIC.includes(shape)) return ['period_s', 'phase', 'noise'];
  if (NO_PARAMETERS.includes(shape)) return ['noise'];
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

/** Return `signal` with another shape; parameters that the new shape ignores are dropped. */
export function withShape(signal: SignalDef, shape: string): SignalDef {
  const keep = new Set<string>(['shape', 'min', 'max', 'decimals', ...fieldsFor(shape)]);
  const next = Object.fromEntries(
    Object.entries({ ...signal, shape }).filter(([k]) => keep.has(k)),
  );
  return next as unknown as SignalDef;
}

/** The sensors of a custom entity list that have a signal: their position and name. */
export interface EditableSensor {
  index: number;
  name: string;
  signal: SignalDef;
}

/** Parse the JSON text of custom entities; an invalid text gives an empty list. */
function parseEntities(json: string): Record<string, unknown>[] {
  try {
    const parsed: unknown = JSON.parse(json);
    return Array.isArray(parsed) ? (parsed as Record<string, unknown>[]) : [];
  } catch {
    return [];
  }
}

/** Return the sensors with a signal in the JSON text of custom entities. */
export function editableSensors(json: string): EditableSensor[] {
  return parseEntities(json).flatMap((entity, index) =>
    entity.platform === 'sensor' && entity.signal
      ? [
          {
            index,
            name: String(entity.name ?? entity.key ?? index),
            signal: entity.signal as SignalDef,
          },
        ]
      : [],
  );
}

/** Return the JSON text with the signal of the entity at `index` replaced; invalid text stays as it is. */
export function withSignal(json: string, index: number, signal: SignalDef): string {
  const entities = parseEntities(json);
  if (!entities[index]) return json;
  entities[index] = { ...entities[index], signal };
  return JSON.stringify(entities, null, 2);
}
