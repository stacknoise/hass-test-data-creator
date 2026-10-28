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
