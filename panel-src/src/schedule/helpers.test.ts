import { describe, expect, it } from 'vitest';
import type { Trigger } from '../common/types';
import {
  buildTarget,
  buildTrigger,
  defaultTriggerForm,
  describeTarget,
  formatWhen,
  parseTimes,
  summarizeTrigger,
  triggerFormOf,
  workOf,
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

describe('editing an existing schedule', () => {
  const actions = {
    switch: ['toggle', 'turn_on'],
    light: ['toggle', 'set_brightness'],
  };
  const entity = (
    key: string,
    platform: string,
  ): { key: string; platform: string; name: string } => ({
    key,
    platform,
    name: key,
  });
  const templates = [
    { id: 'lamp', name: 'Lamp', model: 'x', bundled: true, entities: [entity('light', 'light')] },
    { id: 'plug', name: 'Plug', model: 'x', bundled: true, entities: [entity('state', 'switch')] },
  ];

  it('turns every trigger back into the form values', () => {
    expect(
      triggerFormOf({ type: 'times', times: ['07:00', '19:30'], weekdays: [1, 3] }),
    ).toMatchObject({ type: 'times', times: '07:00, 19:30', weekdays: [1, 3] });
    expect(
      triggerFormOf({ type: 'interval', every_s: 90, start: '08:00', end: '20:00' }),
    ).toMatchObject({ everyS: 90, start: '08:00' });
    expect(triggerFormOf({ type: 'once', at: '2026-11-02T18:30' }).at).toBe('2026-11-02T18:30');
    expect(
      triggerFormOf({ type: 'random_window', count: 4, start: '18:00', end: '23:00' }).count,
    ).toBe(4);
    expect(triggerFormOf({ type: 'poisson', per_day: 12 }).perDay).toBe(12);
  });

  it('rebuilds the same trigger from its form', () => {
    const trigger: Trigger = { type: 'times', times: ['07:00'], weekdays: [0, 2] };
    expect(buildTrigger(triggerFormOf(trigger))).toEqual(trigger);
  });

  it('finds the platform of an action by the entity that it works on', () => {
    const work = workOf(
      { target: { device: 'Lamp 01' }, entity: 'light', action: 'toggle' },
      actions,
      templates,
    );
    expect(work).toEqual({
      kind: 'device',
      targetId: 'Lamp 01',
      actionKey: 'light/toggle',
      entity: 'light',
    });
    const plug = workOf(
      { target: { all: true }, entity: 'state', action: 'toggle' },
      actions,
      templates,
    );
    expect(plug.actionKey).toBe('switch/toggle');
  });

  it('falls back to the first platform, and to nothing for an unknown action', () => {
    const other = workOf(
      { target: { all: true }, entity: 'other', action: 'toggle' },
      actions,
      templates,
    );
    expect(other.actionKey).toBe('switch/toggle');
    const gone = workOf({ target: { all: true }, entity: 'x', action: 'gone' }, actions, templates);
    expect(gone.actionKey).toBe('');
  });
});
