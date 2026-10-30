import { describe, expect, it } from 'vitest';
import { emptyValues } from '../common/filter-state';
import { filterItems } from '../common/list-filter';
import type { GroupInfo } from '../common/types';
import { GROUP_FIELDS, groupRule } from './helpers';

describe('group filter', () => {
  const groups: GroupInfo[] = [
    { id: 'a', name: 'Kitchen', number: 11, members: ['d1'], created_at: 0 },
    { id: 'b', name: 'Hall', number: 12, members: ['d2'], created_at: 0 },
  ];
  const rule = groupRule((item) => (item.id === 'a' ? 'Lamp' : 'Fan'));
  const find = (query: string): string[] =>
    filterItems(groups, GROUP_FIELDS, { ...emptyValues(GROUP_FIELDS), query }, rule).map(
      (g) => g.name,
    );

  it.each([
    ['kitch', ['Kitchen']],
    ['12', ['Hall']],
    ['FAN', ['Hall']],
    ['', ['Kitchen', 'Hall']],
  ])('searches name, number and members for %j', (query, expected) => {
    expect(find(query)).toEqual(expected);
  });
});
