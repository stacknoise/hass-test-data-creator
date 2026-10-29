import { describe, expect, it } from 'vitest';
import { parseAreas, rangeLabel, stateRate } from './helpers';

describe('wizard helpers', () => {
  it('parses a list of areas', () => {
    expect(parseAreas(' Living room, Kitchen ,,')).toEqual(['Living room', 'Kitchen']);
    expect(parseAreas('')).toEqual([]);
  });

  it('estimates the state rate', () => {
    expect(stateRate(100, 10)).toBe(10);
    expect(stateRate(5, 0)).toBe(5);
  });

  it('describes the range of a signal', () => {
    expect(rangeLabel({ shape: 'sine', min: 5, max: 30 }, '°C')).toBe('5 – 30 °C');
    expect(rangeLabel({ shape: 'sine' })).toBe('0 – 100');
    expect(rangeLabel({ shape: 'enum', values: ['on', 'off'] })).toBe('on · off');
  });
});
