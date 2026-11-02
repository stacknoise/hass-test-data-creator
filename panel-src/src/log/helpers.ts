import type { LogEntry } from '../common/types';

/** The height of one row of the log list in pixels; the list draws only the rows in view. */
export const LOG_ROW_HEIGHT = 28;
/** The rows drawn above and below the view, so that fast scrolling shows no gaps. */
export const LOG_OVERSCAN = 8;
/** The entries that one `log/get` call asks for. */
export const LOG_PAGE = 500;
/** The calls in a row that fetch a backlog before the next regular poll. */
export const LOG_MAX_CATCH_UP = 10;
/** The distance from the end of the list in pixels that still counts as "at the bottom". */
export const LOG_BOTTOM_SLACK = 4;

/** Return `current` with `incoming` added at the end, cut to the newest `max`. */
export function appendEntries(current: LogEntry[], incoming: LogEntry[], max: number): LogEntry[] {
  if (incoming.length === 0) return current;
  const all = current.concat(incoming);
  return all.length > max ? all.slice(all.length - max) : all;
}

/** Return the first and one past the last row to draw for a list scrolled to `scrollTop`. */
export function visibleRange(
  total: number,
  scrollTop: number,
  viewHeight: number,
  rowHeight = LOG_ROW_HEIGHT,
  overscan = LOG_OVERSCAN,
): { start: number; end: number } {
  const first = Math.floor(scrollTop / rowHeight);
  const count = Math.ceil(viewHeight / rowHeight);
  return {
    start: Math.max(0, Math.min(total, first - overscan)),
    end: Math.max(0, Math.min(total, first + count + overscan)),
  };
}

/** Whether a list scrolled to `scrollTop` shows its end. */
export function atBottom(scrollTop: number, viewHeight: number, scrollHeight: number): boolean {
  return scrollTop + viewHeight >= scrollHeight - LOG_BOTTOM_SLACK;
}

/** Return the time of day with milliseconds, in the time zone of the browser. */
export function formatTime(at: number): string {
  const date = new Date(at * 1000);
  const part = (value: number, width = 2): string => String(value).padStart(width, '0');
  return `${part(date.getHours())}:${part(date.getMinutes())}:${part(date.getSeconds())}.${part(date.getMilliseconds(), 3)}`;
}

/** Return the change of a number with a sign and at most three decimals, or an empty text. */
export function deltaText(delta: number | null): string {
  if (delta === null || delta === 0) return '';
  const rounded = Number(delta.toFixed(3));
  return `${rounded > 0 ? '+' : ''}${rounded}`;
}

/** Return the value with its unit, for example "12.5 W"; a text state has no unit. */
export function valueText(value: string | null, unit: string): string {
  if (value === null) return '–';
  return unit && value !== '' && !Number.isNaN(Number(value)) ? `${value} ${unit}` : value;
}

/** The columns of the file, in order. */
const CSV_COLUMNS = [
  'seq',
  'at',
  'device',
  'entity',
  'key',
  'old',
  'new',
  'unit',
  'delta',
  'cause',
  'template',
  'area',
  'platform',
] as const;

/** Return one field of a CSV line; a field with a comma, quote or line break is put in quotes. */
export function csvField(value: string | number | null): string {
  const text = value === null ? '' : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/** Return the entries as CSV text with a header line; the time is ISO 8601 in UTC. */
export function toCsv(entries: LogEntry[]): string {
  const lines = entries.map((entry) =>
    [
      entry.seq,
      new Date(entry.at * 1000).toISOString(),
      entry.device,
      entry.name,
      entry.key,
      entry.old,
      entry.new,
      entry.unit,
      entry.delta,
      entry.cause,
      entry.template,
      entry.area,
      entry.platform,
    ]
      .map(csvField)
      .join(','),
  );
  return [CSV_COLUMNS.join(','), ...lines].join('\n') + '\n';
}

/** Return the entries as JSON text. */
export function toJson(entries: LogEntry[]): string {
  return JSON.stringify(entries, null, 2);
}

/** Return the name of a log file, for example "tdc-log-2026-11-02-064500.csv". */
export function logFileName(now: Date, extension: 'csv' | 'json'): string {
  const iso = now.toISOString();
  return `tdc-log-${iso.slice(0, 10)}-${iso.slice(11, 19).replaceAll(':', '')}.${extension}`;
}
