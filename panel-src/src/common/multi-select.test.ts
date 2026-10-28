import { describe, expect, it } from 'vitest';
import { toggled } from './multi-select';

describe('toggled', () => {
  it('adds a name once and trims it', () => {
    expect(toggled(['Kitchen'], '  Bath ', true)).toEqual(['Kitchen', 'Bath']);
    expect(toggled(['Kitchen'], 'Kitchen', true)).toEqual(['Kitchen']);
  });

  it('removes a name', () => {
    expect(toggled(['Kitchen', 'Bath'], 'Kitchen', false)).toEqual(['Bath']);
  });

  it('ignores a blank name', () => {
    const selected = ['Kitchen'];
    expect(toggled(selected, '   ', true)).toBe(selected);
  });
});
