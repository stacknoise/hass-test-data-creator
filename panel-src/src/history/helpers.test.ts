import { describe, expect, it } from 'vitest';
import { clampDays } from './helpers';

describe('clampDays', () => {
  it('keeps whole days in range', () => {
    expect(clampDays(7)).toBe(7);
  });

  it('rounds, limits and replaces invalid input', () => {
    expect(clampDays(2.6)).toBe(3);
    expect(clampDays(0)).toBe(1);
    expect(clampDays(1000)).toBe(365);
    expect(clampDays(Number.NaN)).toBe(1);
  });
});
