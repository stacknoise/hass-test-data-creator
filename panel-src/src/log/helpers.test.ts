import { describe, expect, it } from 'vitest';
import type { LogEntry } from '../common/types';
import {
  LOG_ROW_HEIGHT,
  appendEntries,
  atBottom,
  csvField,
  deltaText,
  logFileName,
  toCsv,
  toJson,
  valueText,
  visibleRange,
} from './helpers';

/** Return an entry for tests; `fields` replace the defaults. */
function entry(seq: number, fields: Partial<LogEntry> = {}): LogEntry {
  return {
    seq,
    at: 1_700_000_000 + seq,
    device_id: 'd1',
    device: 'Plug 01',
    key: 'power',
    name: 'Power',
    template: 'plug_metering',
    area: 'Kitchen',
    run_id: 'r1',
    output: 'native',
    platform: 'sensor',
    device_class: 'power',
    unit: 'W',
    old: '10',
    new: '12.5',
    delta: 2.5,
    cause: 'signal',
    ...fields,
  };
}

describe('appendEntries', () => {
  it('adds at the end and keeps the newest ones', () => {
    const all = appendEntries([entry(1), entry(2)], [entry(3), entry(4)], 3);
    expect(all.map((e) => e.seq)).toEqual([2, 3, 4]);
  });

  it('returns the same list when nothing came', () => {
    const current = [entry(1)];
    expect(appendEntries(current, [], 5)).toBe(current);
  });
});

describe('visibleRange', () => {
  it('draws the rows in view and a few more', () => {
    const range = visibleRange(1000, 10 * LOG_ROW_HEIGHT, 5 * LOG_ROW_HEIGHT, LOG_ROW_HEIGHT, 2);
    expect(range).toEqual({ start: 8, end: 17 });
  });

  it('stays inside the list', () => {
    expect(visibleRange(5, 0, 1000)).toEqual({ start: 0, end: 5 });
    expect(visibleRange(0, 0, 1000)).toEqual({ start: 0, end: 0 });
    expect(visibleRange(100, 1_000_000, 100).end).toBe(100);
  });
});

describe('atBottom', () => {
  it('is true within a few pixels of the end', () => {
    expect(atBottom(900, 100, 1000)).toBe(true);
    expect(atBottom(898, 100, 1000)).toBe(true);
    expect(atBottom(800, 100, 1000)).toBe(false);
  });
});

describe('texts', () => {
  it('shows a change with a sign and rounds it', () => {
    expect(deltaText(2.5)).toBe('+2.5');
    expect(deltaText(-0.12345)).toBe('-0.123');
    expect(deltaText(0)).toBe('');
    expect(deltaText(null)).toBe('');
  });

  it('puts the unit after numbers only', () => {
    expect(valueText('12.5', 'W')).toBe('12.5 W');
    expect(valueText('on', 'W')).toBe('on');
    expect(valueText('unavailable', 'W')).toBe('unavailable');
    expect(valueText(null, 'W')).toBe('–');
    expect(valueText('3', '')).toBe('3');
  });
});

describe('files', () => {
  it('quotes the fields that need it', () => {
    expect(csvField('plain')).toBe('plain');
    expect(csvField('a,b')).toBe('"a,b"');
    expect(csvField('say "hi"')).toBe('"say ""hi"""');
    expect(csvField(null)).toBe('');
    expect(csvField(1.5)).toBe('1.5');
  });

  it('writes a header and one line per entry with the time in UTC', () => {
    const lines = toCsv([entry(1, { device: 'Plug, 1', old: null, delta: null })]).split('\n');
    expect(lines[0].startsWith('seq,at,device,entity,key,old,new,unit,delta,cause')).toBe(true);
    expect(lines[1]).toBe(
      '1,2023-11-14T22:13:21.000Z,"Plug, 1",Power,power,,12.5,W,,signal,plug_metering,Kitchen,sensor',
    );
    expect(lines[2]).toBe('');
  });

  it('writes JSON that reads back', () => {
    const entries = [entry(1), entry(2)];
    expect(JSON.parse(toJson(entries))).toEqual(entries);
  });

  it('names the file by date and time', () => {
    const now = new Date('2026-11-02T06:45:09.000Z');
    expect(logFileName(now, 'csv')).toBe('tdc-log-2026-11-02-064509.csv');
    expect(logFileName(now, 'json')).toBe('tdc-log-2026-11-02-064509.json');
  });
});
