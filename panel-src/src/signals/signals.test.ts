import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { hash01, specOf, valueAt } from './signals';

interface Vectors {
  hashes: { seed: number; n: number; value: number }[];
  values: { spec: Record<string, number | string>; t: number; value: number }[];
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

  it('valueAt returns the same values', () => {
    for (const item of vectors.values) {
      const { seed = 0, origin = 0, ...def } = item.spec as Record<string, number>;
      const spec = specOf(def as unknown as Parameters<typeof specOf>[0], seed, origin);
      expect(valueAt(spec, item.t)).toBeCloseTo(item.value, 6);
    }
  });
});
