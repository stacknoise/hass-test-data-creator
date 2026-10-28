import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { SignalDef } from '../common/types';
import { hash01, optionsOf, specOf, valueAt } from './signals';

interface Vectors {
  hashes: { seed: number; n: number; value: number }[];
  values: { spec: Record<string, unknown>; t: number; value: number | string }[];
}

const vectors: Vectors = JSON.parse(
  readFileSync(new URL('../../../tests/vectors/signals.json', import.meta.url), 'utf-8'),
);

describe('signals match the backend (shared vectors)', () => {
  it('hash01 returns the same numbers', () => {
    for (const item of vectors.hashes) {
      expect(hash01(item.seed, item.n)).toBe(item.value);
    }
  });

  it('valueAt returns the same values and states', () => {
    for (const item of vectors.values) {
      const { seed = 0, origin = 0, ...def } = item.spec as { seed?: number; origin?: number };
      const value = valueAt(specOf(def as unknown as SignalDef, seed, origin), item.t);
      if (typeof item.value === 'string') {
        expect(value).toBe(item.value);
      } else {
        expect(value).toBeCloseTo(item.value, 6);
      }
    }
  });

  it('lists the distinct states of a discrete signal', () => {
    const states = [
      { value: 'idle', duration_s: 10 },
      { value: 'wash', duration_s: 10 },
      { value: 'idle', duration_s: 10 },
    ];
    expect(optionsOf(specOf({ shape: 'state_machine', states }))).toEqual(['idle', 'wash']);
    expect(optionsOf(specOf({ shape: 'enum', values: ['a', 'b', 'a'] }))).toEqual(['a', 'b']);
  });
});
