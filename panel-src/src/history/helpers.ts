export const MIN_DAYS = 1;
export const MAX_DAYS = 365;

/** Returns `days` as a whole number inside the allowed range; anything else becomes the minimum. */
export function clampDays(days: number): number {
  return Math.min(MAX_DAYS, Math.max(MIN_DAYS, Math.round(days) || MIN_DAYS));
}
