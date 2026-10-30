import { describe, expect, it } from 'vitest';
import { emptyValues, type FilterField } from './filter-state';
import { filterItems, optionsOf, type ListRule } from './list-filter';

interface Item {
  name: string;
  kinds: string[];
  on: boolean;
}

const FIELDS: FilterField[] = [
  { key: 'kinds', kind: 'multi', label: 'Kinds' },
  { key: 'one', kind: 'choice', label: 'One' },
  { key: 'on', kind: 'switch', label: 'On' },
];

const RULE: ListRule<Item> = {
  texts: (item) => [item.name, ...item.kinds],
  values: (item, key) => {
    if (key === 'on') return item.on;
    return key === 'one' ? item.kinds.slice(0, 1) : item.kinds;
  },
};

const ITEMS: Item[] = [
  { name: 'Morning Light', kinds: ['a', 'b'], on: true },
  { name: 'Evening', kinds: ['b'], on: false },
  { name: 'Night', kinds: ['c'], on: true },
];

/** Return the names that pass a filter made of the empty state plus `changes`. */
function names(changes: Record<string, string | boolean | string[]>): string[] {
  return filterItems(ITEMS, FIELDS, { ...emptyValues(FIELDS), ...changes }, RULE).map(
    (item) => item.name,
  );
}

describe('filterItems', () => {
  it('keeps everything for the empty filter', () => {
    expect(names({})).toEqual(['Morning Light', 'Evening', 'Night']);
  });

  it.each([
    ['light', ['Morning Light']],
    ['  EVENING ', ['Evening']],
    ['b', ['Morning Light', 'Evening']],
    ['nothing', []],
  ])('searches the texts for %j', (query, expected) => {
    expect(names({ query })).toEqual(expected);
  });

  it('treats several values of a field as OR', () => {
    expect(names({ kinds: ['a', 'c'] })).toEqual(['Morning Light', 'Night']);
  });

  it('treats different fields as AND', () => {
    expect(names({ kinds: ['b'], on: true })).toEqual(['Morning Light']);
    expect(names({ query: 'night', kinds: ['b'] })).toEqual([]);
  });

  it('reads a choice as one value', () => {
    expect(names({ one: 'b' })).toEqual(['Evening']);
  });

  it('needs the flag only while the switch is on', () => {
    expect(names({ on: true })).toEqual(['Morning Light', 'Night']);
    expect(names({ on: false })).toHaveLength(3);
  });

  it('does not fail for an item whose values are not a list', () => {
    const rule: ListRule<Item> = { texts: () => [], values: () => true };
    const result = filterItems(ITEMS, FIELDS, { ...emptyValues(FIELDS), kinds: ['a'] }, rule);
    expect(result).toEqual([]);
  });
});

describe('optionsOf', () => {
  it('lists each value once, sorted by its label', () => {
    const options = optionsOf(
      ITEMS,
      (item) => item.kinds,
      (value) => value.toUpperCase(),
      'en',
    );
    expect(options).toEqual([
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B' },
      { value: 'c', label: 'C' },
    ]);
  });
});
