/** The number of samples that a live curve keeps. */
export const LIVE_MAX_SAMPLES = 120;
/** The time between two reads of a device while its live view is on. */
export const LIVE_INTERVAL_MS = 1000;

/** One value read from an entity at a point in time. */
export interface LiveSample {
  at: number;
  value: number;
}

/** Return the number in a state text, or undefined if the state is not a finite number. */
export function numericState(state: string | null): number | undefined {
  if (state == null || state.trim() === '') return undefined;
  const value = Number(state);
  return Number.isFinite(value) ? value : undefined;
}

/** Return the samples with a new one at the end, cut to the newest `max`. */
export function pushSample(
  samples: LiveSample[],
  sample: LiveSample,
  max = LIVE_MAX_SAMPLES,
): LiveSample[] {
  return [...samples, sample].slice(-max);
}

/** Return the SVG point list of the samples, scaled into a box; empty below two samples. */
export function livePoints(
  samples: LiveSample[],
  width: number,
  height: number,
  padding = 4,
): string {
  if (samples.length < 2) return '';
  const first = samples[0].at;
  const time = samples[samples.length - 1].at - first || 1;
  const values = samples.map((s) => s.value);
  const low = Math.min(...values);
  const span = Math.max(...values) - low || 1;
  return samples
    .map((s) => {
      const x = ((s.at - first) / time) * width;
      const y = height - padding - ((s.value - low) / span) * (height - 2 * padding);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}
