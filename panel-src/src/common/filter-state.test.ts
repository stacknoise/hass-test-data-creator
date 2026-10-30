import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  activeCount,
  chipsOf,
  emptyValues,
  readFilter,
  resetValues,
  sanitized,
  withoutChip,
  writeFilter,
  type FilterField,
} from './filter-state';

const FIELDS: FilterField[] = [
  { key: 'templates', kind: 'multi', label: 'Template', options: [{ value: 'a', label: 'Alpha' }] },
  { key: 'state', kind: 'choice', label: 'State' },
  { key: 'custom', kind: 'switch', label: 'Own' },
];

describe('filter state', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('starts empty and without restriction', () => {
    const values = emptyValues(FIELDS);
    expect(values).toEqual({
      query: '',
      sort: '',
      descending: false,
      templates: [],
      state: '',
      custom: false,
    });
    expect(activeCount(FIELDS, values)).toBe(0);
  });

  it('makes a chip per chosen value and per switch, with the label of the option', () => {
    const values = { ...emptyValues(FIELDS), templates: ['a', 'z'], custom: true, query: ' x ' };
    expect(chipsOf(FIELDS, values).map((c) => c.label)).toEqual([
      'Template: Alpha',
      'Template: z',
      'Own',
    ]);
    expect(activeCount(FIELDS, values)).toBe(4);
  });

  it('removes one chip and keeps the rest', () => {
    const values = { ...emptyValues(FIELDS), templates: ['a', 'z'], custom: true };
    const [first, , third] = chipsOf(FIELDS, values);
    const next = withoutChip(FIELDS, withoutChip(FIELDS, values, first!), third!);
    expect(next.templates).toEqual(['z']);
    expect(next.custom).toBe(false);
  });

  it('resets the restrictions but keeps the sort', () => {
    const values = { ...emptyValues(FIELDS), query: 'x', sort: 'name', descending: true };
    expect(resetValues(FIELDS, values)).toEqual({
      ...emptyValues(FIELDS),
      sort: 'name',
      descending: true,
    });
  });

  it('cleans stored values to the shape of the fields', () => {
    const stored = { query: 5, templates: ['a', 3], state: 'used', custom: 'yes', other: 1 };
    expect(sanitized(FIELDS, stored)).toEqual({ ...emptyValues(FIELDS), state: 'used' });
    expect(sanitized(FIELDS, null)).toEqual(emptyValues(FIELDS));
  });

  it('keeps the filter per tab in the session', () => {
    const store = new Map<string, string>();
    vi.stubGlobal('sessionStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => store.set(k, v),
    });
    writeFilter('devices', { ...emptyValues(FIELDS), query: 'plug' });
    expect(store.has('tdc.filter.devices')).toBe(true);
    expect(readFilter('devices', FIELDS).query).toBe('plug');
    expect(readFilter('schedules', FIELDS).query).toBe('');
  });

  it('works without storage and with broken text', () => {
    vi.stubGlobal('sessionStorage', {
      getItem: () => '{broken',
      setItem: () => {
        throw new Error('blocked');
      },
    });
    expect(readFilter('devices', FIELDS)).toEqual(emptyValues(FIELDS));
    expect(() => writeFilter('devices', emptyValues(FIELDS))).not.toThrow();
  });
});
