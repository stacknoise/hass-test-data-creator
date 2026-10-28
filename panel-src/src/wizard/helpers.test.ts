import { describe, expect, it } from 'vitest';
import { parseAreas, stateRate } from './helpers';

describe('wizard helpers', () => {
  it('parses a list of areas', () => {
    expect(parseAreas(' Living room, Kitchen ,,')).toEqual(['Living room', 'Kitchen']);
    expect(parseAreas('')).toEqual([]);
  });

  it('estimates the state rate', () => {
    expect(stateRate(100, 10)).toBe(10);
    expect(stateRate(5, 0)).toBe(5);
  });
});
