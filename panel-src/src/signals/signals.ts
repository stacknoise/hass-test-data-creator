import type { SignalDef } from '../common/types';
import { SHAPE_ENUM } from '../common/constants';

const MASK = (1n << 64n) - 1n;
const GOLDEN = 0x9e3779b97f4a7c15n;
const MIX_A = 0xbf58476d1ce4e5b9n;
const MIX_B = 0x94d049bb133111ebn;
const SECONDS_PER_HOUR = 3600;
/** The defaults of the backend that a missing field gets. */
export const DEFAULT_MAX = 100;
const DEFAULT_PERIOD_S = 3600;
const DEFAULT_INTERVAL_S = 10;
const HALF = 0.5;
const SMOOTHSTEP_LINEAR = 3;
const PV_BELL_EXPONENT = 1.5;
// The shifts of the SplitMix64 mixer and the bits of the mantissa of a double.
const MIX_SHIFT_FIRST = 30n;
const MIX_SHIFT_SECOND = 27n;
const MIX_SHIFT_LAST = 31n;
const UNIT_SHIFT = 11n;
const UNIT_BITS = 53;
const SECONDS_PER_DAY = 86400;
const HOURS_PER_DAY = 24;
const LOAD_BASE = 0.12;
const LOAD_PEAKS = [
  [7.5, 1.2, 0.3],
  [12.5, 1.0, 0.25],
  [19.0, 2.2, 0.55],
] as const;
const LOAD_VARIATION = 0.12;
const LOAD_VARIATION_PERIOD_S = 600;
const SUNRISE_HOUR = 6;
const SUNSET_HOUR = 20;
const CLOUD_PERIOD_S = 900;
const CLOUD_DEPTH = 0.3;
const MIN_STEPS = 2;
const DISCHARGE_EXPONENT = 3;

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
  values: string[];
  weights: number[];
  states: [string, number][];
  seed: number;
  origin: number;
}

/** Return the spec for a template signal; `seed` and `origin` are set per entity. */
export function specOf(def: SignalDef, seed = 0, origin = 0): SignalSpec {
  return {
    shape: def.shape,
    min: def.min ?? 0,
    max: def.max ?? DEFAULT_MAX,
    period_s: def.period_s ?? DEFAULT_PERIOD_S,
    interval_s: def.interval_s ?? DEFAULT_INTERVAL_S,
    noise: def.noise ?? 0,
    decimals: def.decimals ?? 1,
    phase: def.phase ?? 0,
    rate_per_hour: def.rate_per_hour ?? 0,
    values: def.values ?? [],
    weights: def.weights ?? [],
    states: (def.states ?? []).map((s) => [s.value, s.duration_s]),
    seed,
    origin,
  };
}

/** Return a deterministic number in [0, 1) for two integers (SplitMix64, as in the backend). */
export function hash01(seed: number, n: number): number {
  let x = (BigInt(seed) * GOLDEN + (BigInt(n) & MASK) * MIX_A + MIX_B) & MASK;
  x = ((x ^ (x >> MIX_SHIFT_FIRST)) * MIX_A) & MASK;
  x = ((x ^ (x >> MIX_SHIFT_SECOND)) * MIX_B) & MASK;
  x ^= x >> MIX_SHIFT_LAST;
  return Number(x >> UNIT_SHIFT) / 2 ** UNIT_BITS;
}

/** Return the position inside one period in [0, 1) including the phase. */
function cycle(spec: SignalSpec, t: number): number {
  const x = t / spec.period_s + spec.phase;
  return x - Math.floor(x);
}

/** Return random points one unit apart, joined by a smooth curve. */
function smoothNoise(seed: number, x: number): number {
  const index = Math.floor(x);
  const fraction = x - index;
  const smooth = fraction * fraction * (SMOOTHSTEP_LINEAR - 2 * fraction);
  const low = hash01(seed, index);
  const high = hash01(seed, index + 1);
  return low + (high - low) * smooth;
}

/** Return the local hour of the day in [0, 24) for signal time `t`. */
function hourOfDay(t: number): number {
  return (((t % SECONDS_PER_DAY) + SECONDS_PER_DAY) % SECONDS_PER_DAY) / SECONDS_PER_HOUR;
}

/** Return a bell curve around `centre` hours that wraps around midnight. */
function peak(hour: number, centre: number, width: number): number {
  const raw = Math.abs(hour - centre);
  const distance = Math.min(raw, HOURS_PER_DAY - raw);
  return Math.exp(-HALF * (distance / width) ** 2);
}

const SHAPES: Record<string, (spec: SignalSpec, t: number) => number> = {
  constant: () => HALF,
  sine: (spec, t) => HALF + HALF * Math.sin(2 * Math.PI * cycle(spec, t)),
  saw: (spec, t) => cycle(spec, t),
  square: (spec, t) => (cycle(spec, t) < HALF ? 1 : 0),
  triangle: (spec, t) => 1 - Math.abs(2 * cycle(spec, t) - 1),
  noise: (spec, t) => hash01(spec.seed, Math.floor(t / spec.interval_s)),
  random_walk: (spec, t) => smoothNoise(spec.seed, t / spec.period_s + spec.phase),
  household_load: (spec, t) => {
    const hour = hourOfDay(t);
    const level = LOAD_PEAKS.reduce(
      (sum, [c, w, weight]) => sum + weight * peak(hour, c, w),
      LOAD_BASE,
    );
    return level + LOAD_VARIATION * (smoothNoise(spec.seed, t / LOAD_VARIATION_PERIOD_S) - HALF);
  },
  pv_day: (spec, t) => {
    const x = (hourOfDay(t) - SUNRISE_HOUR) / (SUNSET_HOUR - SUNRISE_HOUR);
    if (!(x > 0 && x < 1)) return 0;
    const clouds = 1 - CLOUD_DEPTH * smoothNoise(spec.seed, t / CLOUD_PERIOD_S);
    return Math.sin(Math.PI * x) ** PV_BELL_EXPONENT * clouds;
  },
  steps: (spec, t) => {
    const count = Math.max(MIN_STEPS, Math.round(spec.period_s / spec.interval_s));
    return Math.min(1, Math.floor(cycle(spec, t) * count) / (count - 1));
  },
  discharge: (spec, t) => 1 - cycle(spec, t) ** DISCHARGE_EXPONENT,
};

/** Return a value drawn by weight; a new draw every `interval_s` seconds. */
function enumAt(spec: SignalSpec, t: number): string {
  const weights = spec.weights.length ? spec.weights : spec.values.map(() => 1);
  const total = weights.reduce((sum, w) => sum + w, 0);
  const pick = hash01(spec.seed, Math.floor(t / spec.interval_s)) * total;
  let reached = 0;
  for (const [index, value] of spec.values.entries()) {
    reached += weights[index];
    if (pick < reached) return value;
  }
  return spec.values[spec.values.length - 1];
}

/** Return the state of a cycle of states with durations; `phase` shifts the start. */
function stateMachineAt(spec: SignalSpec, t: number): string {
  const total = spec.states.reduce((sum, [, duration]) => sum + duration, 0);
  const position = (((t + spec.phase * total) % total) + total) % total;
  let reached = 0;
  for (const [value, duration] of spec.states) {
    reached += duration;
    if (position < reached) return value;
  }
  return spec.states[spec.states.length - 1][0];
}

const DISCRETE: Record<string, (spec: SignalSpec, t: number) => string> = {
  enum: enumAt,
  state_machine: stateMachineAt,
};

/** Return the distinct states of a discrete signal in the order they are defined. */
export function optionsOf(spec: SignalSpec): string[] {
  const names = spec.shape === SHAPE_ENUM ? spec.values : spec.states.map(([name]) => name);
  return [...new Set(names)];
}

/** Round to `decimals` places. */
function round(value: number, decimals: number): number {
  return Number(value.toFixed(decimals));
}

/** Return the value of the signal at signal time `t` in seconds, scaled to min..max. */
export function valueAt(spec: SignalSpec, t: number): number | string {
  if (spec.shape in DISCRETE) return DISCRETE[spec.shape](spec, t);
  if (spec.shape === 'counter') {
    const elapsed = Math.max(0, t - spec.origin);
    return round(spec.min + (spec.rate_per_hour * elapsed) / SECONDS_PER_HOUR, spec.decimals);
  }
  let base = (SHAPES[spec.shape] ?? SHAPES.constant)(spec, t);
  if (spec.noise) {
    base += (hash01(spec.seed + 1, Math.floor(t)) - HALF) * 2 * spec.noise;
  }
  base = Math.min(1, Math.max(0, base));
  return round(spec.min + base * (spec.max - spec.min), spec.decimals);
}
