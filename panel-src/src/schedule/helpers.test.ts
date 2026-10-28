import { describe, expect, it } from 'vitest';
import {
  buildTarget,
  buildTrigger,
  defaultTriggerForm,
  describeTarget,
  formatWhen,
  parseTimes,
  summarizeTrigger,
} from './helpers';

describe('schedule helpers', () => {
  it('parses clock times', () => {
    expect(parseTimes(' 08:00, 18:30 ,,')).toEqual(['08:00', '18:30']);
  });

  it('builds a times trigger with and without weekdays', () => {
    const form = defaultTriggerForm();
    expect(buildTrigger(form)).toEqual({ type: 'times', times: ['08:00', '18:30'] });
    expect(buildTrigger({ ...form, weekdays: [4, 0] })).toEqual({
      type: 'times',
      times: ['08:00', '18:30'],
      weekdays: [0, 4],
    });
  });

  it('builds the other triggers', () => {
    const form = defaultTriggerForm();
    expect(buildTrigger({ ...form, type: 'interval' })).toEqual({
      type: 'interval',
      every_s: 60,
      start: '00:00',
      end: '24:00',
    });
    expect(buildTrigger({ ...form, type: 'once', at: '2026-11-02T18:30' })).toEqual({
      type: 'once',
      at: '2026-11-02T18:30',
    });
    expect(buildTrigger({ ...form, type: 'random_window' })).toMatchObject({ count: 3 });
    expect(buildTrigger({ ...form, type: 'poisson' })).toEqual({ type: 'poisson', per_day: 24 });
  });

  it('round-trips targets', () => {
    for (const kind of ['template', 'device', 'run'] as const) {
      expect(describeTarget(buildTarget(kind, 'x'))).toEqual({ kind, id: 'x' });
    }
    expect(buildTarget('all', 'ignored')).toEqual({ all: true });
    expect(describeTarget({ all: true })).toEqual({ kind: 'all', id: '' });
  });

  it('summarizes triggers and times', () => {
    expect(summarizeTrigger({ type: 'poisson', per_day: 5 })).toBe('Ø 5/d');
    expect(summarizeTrigger({ type: 'once', at: '2026-11-02T18:30' })).toBe('2026-11-02 18:30');
    expect(formatWhen('2026-11-02T18:30:12+01:00')).toBe('2026-11-02 18:30');
  });
});
