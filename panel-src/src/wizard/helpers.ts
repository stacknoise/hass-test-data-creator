import { DEFAULT_MAX, optionsOf, specOf } from '../signals/signals';
import { SHAPE_ENUM, SHAPE_STATE_MACHINE } from '../common/constants';
import type { SignalDef } from '../common/types';

// Rounds to one decimal.
const ROUNDING = 10;

/** Parse a comma separated list of area names. */
export function parseAreas(text: string): string[] {
  return text
    .split(',')
    .map((name) => name.trim())
    .filter((name) => name.length > 0);
}

/** Return the estimated state changes per second for `sensors` sensors at `tick` seconds. */
export function stateRate(sensors: number, tick: number): number {
  return Math.round((sensors / Math.max(1, tick)) * ROUNDING) / ROUNDING;
}

/** Return the value range of a signal with its unit, or the list of its states for a discrete one. */
export function rangeLabel(signal: SignalDef, unit?: string | null): string {
  if (signal.shape === SHAPE_ENUM || signal.shape === SHAPE_STATE_MACHINE) {
    return optionsOf(specOf(signal)).join(' · ');
  }
  return `${signal.min ?? 0} – ${signal.max ?? DEFAULT_MAX}${unit ? ` ${unit}` : ''}`;
}
