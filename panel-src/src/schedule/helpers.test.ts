import { describe, expect, it } from 'vitest';
import type { DeviceInfo, Trigger } from '../common/types';
import {
  buildTarget,
  allEntities,
  availableActions,
  buildTrigger,
  defaultTriggerForm,
  describeTarget,
  entitiesOfTarget,
  entityKeysFor,
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
      expect(describeTarget(buildTarget(kind, ['x']))).toEqual({ kind, ids: ['x'] });
    }
    expect(buildTarget('all', ['ignored'])).toEqual({ all: true });
    expect(describeTarget({ all: true })).toEqual({ kind: 'all', ids: [] });
  });

  it('aims at several devices with a list, and at one with a text', () => {
    expect(buildTarget('device', ['a', 'b'])).toEqual({ device: ['a', 'b'] });
    expect(buildTarget('device', ['a'])).toEqual({ device: 'a' });
    expect(describeTarget({ device: ['a', 'b'] })).toEqual({ kind: 'device', ids: ['a', 'b'] });
  });

  it('summarizes triggers and times', () => {
    expect(summarizeTrigger({ type: 'poisson', per_day: 5 })).toBe('Ø 5/d');
    expect(summarizeTrigger({ type: 'once', at: '2026-11-02T18:30' })).toBe('2026-11-02 18:30');
    expect(formatWhen('2026-11-02T18:30:12+01:00')).toBe('2026-11-02 18:30');
  });
});

describe('editing an existing schedule', () => {
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

  it('keeps the target, the action and the entity of a stored schedule', () => {
    const work = workOf({ target: { device: ['a', 'b'] }, entity: 'light', action: 'toggle' });
    expect(work).toEqual({
      kind: 'device',
      targetIds: ['a', 'b'],
      action: 'toggle',
      entity: 'light',
    });
    expect(workOf({ target: { all: true }, entity: 'state', action: 'turn_on' }).kind).toBe('all');
  });
});

describe('what fits a target', () => {
  const actions = {
    switch: ['toggle', 'turn_on'],
    light: ['toggle', 'set_brightness'],
    cover: ['open'],
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
  const device = (id: string, run: string, ...entities: ReturnType<typeof entity>[]): DeviceInfo =>
    ({ id, name: id.toUpperCase(), run_id: run, entities }) as unknown as DeviceInfo;
  const devices = [
    device('p1', 'r1', entity('state', 'switch')),
    device('p2', 'r1', entity('state', 'switch')),
    device('l1', 'r2', entity('light', 'light')),
  ];

  it('takes the entities of the chosen devices, by id or name', () => {
    expect(entitiesOfTarget('device', ['p1', 'P2'], devices, templates)).toEqual([
      { platform: 'switch', key: 'state' },
    ]);
    expect(entitiesOfTarget('device', ['p1', 'l1'], devices, templates)).toHaveLength(2);
  });

  it('takes the entities of a template, of a creation, and of all devices', () => {
    expect(entitiesOfTarget('template', ['lamp'], devices, templates)).toEqual([
      { platform: 'light', key: 'light' },
    ]);
    expect(entitiesOfTarget('run', ['r2'], devices, templates)).toEqual([
      { platform: 'light', key: 'light' },
    ]);
    expect(entitiesOfTarget('all', [], devices, templates)).toHaveLength(2);
    expect(entitiesOfTarget('all', [], [], templates)).toEqual(allEntities(templates));
  });

  it('knows nothing while no target is chosen, or the target is gone', () => {
    expect(entitiesOfTarget('device', [], devices, templates)).toBeUndefined();
    expect(entitiesOfTarget('device', ['gone'], devices, templates)).toBeUndefined();
    expect(entitiesOfTarget('template', ['gone'], devices, templates)).toBeUndefined();
  });

  it('offers each action once, and only those of the platforms that the target has', () => {
    const plugs = entitiesOfTarget('device', ['p1'], devices, templates);
    expect(availableActions(actions, plugs)).toEqual(['toggle', 'turn_on']);
    const both = entitiesOfTarget('device', ['p1', 'l1'], devices, templates);
    expect(availableActions(actions, both)).toEqual(['toggle', 'turn_on', 'set_brightness']);
    expect(availableActions(actions, undefined)).toEqual([
      'toggle',
      'turn_on',
      'set_brightness',
      'open',
    ]);
  });

  it('finds the entities that can do the chosen action', () => {
    const both = entitiesOfTarget('device', ['p1', 'l1'], devices, templates) ?? [];
    expect(entityKeysFor(both, actions, 'toggle')).toEqual(['state', 'light']);
    expect(entityKeysFor(both, actions, 'set_brightness')).toEqual(['light']);
    expect(entityKeysFor(both, actions, 'open')).toEqual([]);
  });
});
