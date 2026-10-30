import type { SelectItem } from './multi-select';

/** One value of a filter: text, a switch or a list of chosen values. */
export type FilterValue = string | boolean | string[];
/** The state of a filter bar by field key; `query`, `sort` and `descending` are always present. */
export type FilterValues = Record<string, FilterValue>;

/** The kinds of control that a filter field has. */
export type FieldKind = 'multi' | 'choice' | 'switch';

/** One control of a filter bar; `options` are ignored for a switch. */
export interface FilterField {
  key: string;
  label: string;
  kind: FieldKind;
  options?: SelectItem[];
}

/** One removable chip of an active filter. */
export interface FilterChip {
  key: string;
  value: string;
  label: string;
}

export const KEY_QUERY = 'query';
export const KEY_SORT = 'sort';
export const KEY_DESCENDING = 'descending';
/** The fields that the bar always has and that "reset" keeps (the sort) or clears (the query). */
const SORT_KEYS = [KEY_SORT, KEY_DESCENDING];
const STORAGE_PREFIX = 'tdc.filter.';

/** Return the value of a field that restricts nothing. */
function emptyValue(kind: FieldKind): FilterValue {
  if (kind === 'multi') return [];
  return kind === 'switch' ? false : '';
}

/** Return the state of a bar without any restriction and with the default sort. */
export function emptyValues(fields: FilterField[]): FilterValues {
  return {
    [KEY_QUERY]: '',
    [KEY_SORT]: '',
    [KEY_DESCENDING]: false,
    ...Object.fromEntries(fields.map((f) => [f.key, emptyValue(f.kind)])),
  };
}

/** Return `values` without any restriction; the chosen sort stays. */
export function resetValues(fields: FilterField[], values: FilterValues): FilterValues {
  const empty = emptyValues(fields);
  return { ...empty, ...Object.fromEntries(SORT_KEYS.map((k) => [k, values[k] ?? empty[k]])) };
}

/** Return the chips of the active restrictions: one per chosen value, one per switch. */
export function chipsOf(fields: FilterField[], values: FilterValues): FilterChip[] {
  return fields.flatMap((field) => {
    const value = values[field.key];
    const labelOf = (v: string): string => field.options?.find((o) => o.value === v)?.label ?? v;
    if (field.kind === 'switch')
      return value === true ? [{ key: field.key, value: '', label: field.label }] : [];
    const chosen = Array.isArray(value) ? value : value ? [String(value)] : [];
    return chosen.map((v) => ({
      key: field.key,
      value: v,
      label: `${field.label}: ${labelOf(v)}`,
    }));
  });
}

/** Return the number of restrictions that are active, the query counted as one. */
export function activeCount(fields: FilterField[], values: FilterValues): number {
  const query = String(values[KEY_QUERY] ?? '').trim() ? 1 : 0;
  return query + chipsOf(fields, values).length;
}

/** Return `values` without the restriction of one chip. */
export function withoutChip(
  fields: FilterField[],
  values: FilterValues,
  chip: FilterChip,
): FilterValues {
  const field = fields.find((f) => f.key === chip.key);
  if (!field) return values;
  const current = values[chip.key];
  const next = Array.isArray(current)
    ? current.filter((v) => v !== chip.value)
    : emptyValue(field.kind);
  return { ...values, [chip.key]: next };
}

/** Return `stored` cleaned to the shape of `fields`; anything unusable falls back to empty. */
export function sanitized(fields: FilterField[], stored: unknown): FilterValues {
  const empty = emptyValues(fields);
  if (typeof stored !== 'object' || stored === null) return empty;
  const source = stored as Record<string, unknown>;
  const result: FilterValues = { ...empty };
  for (const [key, fallback] of Object.entries(empty)) {
    const value = source[key];
    if (
      Array.isArray(fallback) &&
      Array.isArray(value) &&
      value.every((v) => typeof v === 'string')
    ) {
      result[key] = value as string[];
    } else if (typeof fallback === 'string' && typeof value === 'string') {
      result[key] = value;
    } else if (typeof fallback === 'boolean' && typeof value === 'boolean') {
      result[key] = value;
    }
  }
  return result;
}

/** Return the filter kept for `tab` in the session, or an empty one; storage may be unavailable. */
export function readFilter(tab: string, fields: FilterField[]): FilterValues {
  try {
    const text = sessionStorage.getItem(`${STORAGE_PREFIX}${tab}`);
    return sanitized(fields, text ? JSON.parse(text) : null);
  } catch {
    return emptyValues(fields);
  }
}

/** Keep the filter of `tab` for the session; nothing happens if storage is unavailable. */
export function writeFilter(tab: string, values: FilterValues): void {
  try {
    sessionStorage.setItem(`${STORAGE_PREFIX}${tab}`, JSON.stringify(values));
  } catch {
    // The filter then simply starts empty next time.
  }
}
