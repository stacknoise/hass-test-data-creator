import type { SignalDef } from '../common/types';

const MASK = (1n << 64n) - 1n;
const GOLDEN = 0x9e3779b97f4a7c15n;
const MIX_A = 0xbf58476d1ce4e5b9n;
const MIX_B = 0x94d049bb133111ebn;
const SECONDS_PER_HOUR = 3600;

/** All parameters of one signal, with the defaults of the backend. */
export interface SignalSpec {
  shape: string;
  min: number;
  max: number;
  period_s: number;
  interval_s: number;
  noise: number;
  decimals: number;
  phase: number;
  rate_per_hour: number;
  seed: number;
  origin: number;
}

/** Return the spec for a template signal; `seed` and `origin` are set per entity. */
export function specOf(def: SignalDef, seed = 0, origin = 0): SignalSpec {
  return {
    shape: def.shape,
    min: def.min ?? 0,
    max: def.max ?? 100,
    period_s: def.period_s ?? 3600,
    interval_s: def.interval_s ?? 10,
    noise: def.noise ?? 0,
    decimals: def.decimals ?? 1,
    phase: def.phase ?? 0,
    rate_per_hour: def.rate_per_hour ?? 0,
    seed,
    origin,
  };
}

/** Return a deterministic number in [0, 1) for two integers (SplitMix64, as in the backend). */
export function hash01(seed: number, n: number): number {
  let x = (BigInt(seed) * GOLDEN + (BigInt(n) & MASK) * MIX_A + MIX_B) & MASK;
  x = ((x ^ (x >> 30n)) * MIX_A) & MASK;
  x = ((x ^ (x >> 27n)) * MIX_B) & MASK;
  x ^= x >> 31n;
  return Number(x >> 11n) / 2 ** 53;
}

/** Return the position inside one period in [0, 1) including the phase. */
function cycle(spec: SignalSpec, t: number): number {
  const x = t / spec.period_s + spec.phase;
  return x - Math.floor(x);
}

const SHAPES: Record<string, (spec: SignalSpec, t: number) => number> = {
  constant: () => 0.5,
  sine: (spec, t) => 0.5 + 0.5 * Math.sin(2 * Math.PI * cycle(spec, t)),
  saw: (spec, t) => cycle(spec, t),
  square: (spec, t) => (cycle(spec, t) < 0.5 ? 1 : 0),
  triangle: (spec, t) => 1 - Math.abs(2 * cycle(spec, t) - 1),
  noise: (spec, t) => hash01(spec.seed, Math.floor(t / spec.interval_s)),
  random_walk: (spec, t) => {
    const x = t / spec.period_s + spec.phase;
    const index = Math.floor(x);
    const fraction = x - index;
    const smooth = fraction * fraction * (3 - 2 * fraction);
    const low = hash01(spec.seed, index);
    const high = hash01(spec.seed, index + 1);
    return low + (high - low) * smooth;
  },
};

/** Round to `decimals` places. */
function round(value: number, decimals: number): number {
  return Number(value.toFixed(decimals));
}

/** Return the value of the signal at signal time `t` in seconds, scaled to min..max. */
export function valueAt(spec: SignalSpec, t: number): number {
  if (spec.shape === 'counter') {
    const elapsed = Math.max(0, t - spec.origin);
    return round(spec.min + (spec.rate_per_hour * elapsed) / SECONDS_PER_HOUR, spec.decimals);
  }
  let base = (SHAPES[spec.shape] ?? SHAPES.constant)(spec, t);
  if (spec.noise) {
    base += (hash01(spec.seed + 1, Math.floor(t)) - 0.5) * 2 * spec.noise;
  }
  base = Math.min(1, Math.max(0, base));
  return round(spec.min + base * (spec.max - spec.min), spec.decimals);
}
