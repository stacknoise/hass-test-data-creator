import { describe, expect, it } from 'vitest';
import { emptyValues } from '../common/filter-state';
import { filterItems } from '../common/list-filter';
import type { DeviceInfo, ScheduleInfo, Trigger } from '../common/types';
import {
  buildTarget,
  availableActions,
  buildTrigger,
  defaultTriggerForm,
  describeTarget,
  entityChoices,
  platformSetsOfTarget,
  SCHEDULE_FIELDS,
  scheduleRule,
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
  ): { key: string; platform: string; name: string } => ({ key, platform, name: key });
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
  const platforms = (sets: Set<string>[] | undefined): string[][] | undefined =>
    sets?.map((set) => [...set]);

  it('gives the platforms of every chosen device, by id or name', () => {
    expect(platformSetsOfTarget('device', ['p1', 'L1'], devices, templates)).toHaveLength(2);
    expect(platforms(platformSetsOfTarget('device', ['p1'], devices, templates))).toEqual([
      ['switch'],
    ]);
  });

  it('gives the platforms of a template, of a device set, and of all devices', () => {
    expect(platforms(platformSetsOfTarget('template', ['lamp'], devices, templates))).toEqual([
      ['light'],
    ]);
    expect(platformSetsOfTarget('run', ['r1'], devices, templates)).toHaveLength(2);
    expect(platformSetsOfTarget('all', [], devices, templates)).toHaveLength(3);
  });

  it('limits nothing while no target is chosen, there is no device, or the target is gone', () => {
    expect(platformSetsOfTarget('device', [], devices, templates)).toBeUndefined();
    expect(platformSetsOfTarget('device', ['gone'], devices, templates)).toBeUndefined();
    expect(platformSetsOfTarget('template', ['gone'], devices, templates)).toBeUndefined();
    expect(platformSetsOfTarget('all', [], [], templates)).toBeUndefined();
  });

  it('offers only what every chosen device can do', () => {
    const plugs = platformSetsOfTarget('device', ['p1', 'p2'], devices, templates);
    expect(availableActions(actions, plugs)).toEqual(['toggle', 'turn_on']);
    const plugAndLamp = platformSetsOfTarget('device', ['p1', 'l1'], devices, templates);
    expect(availableActions(actions, plugAndLamp)).toEqual(['toggle']);
    const lamp = platformSetsOfTarget('device', ['l1'], devices, templates);
    expect(availableActions(actions, lamp)).toEqual(['toggle', 'set_brightness']);
  });

  it('offers nothing that all devices share when they share no action', () => {
    const mixed = [device('c1', 'r3', entity('cover', 'cover')), devices[0]];
    expect(availableActions(actions, platformSetsOfTarget('all', [], mixed, templates))).toEqual(
      [],
    );
  });

  it('offers nothing while the common set cannot be found', () => {
    expect(availableActions(actions, undefined)).toEqual([]);
  });

  it('offers the entities of a single device or template that can do the action', () => {
    const rich = [
      device('c1', 'r1', entity('a', 'sensor'), entity('b', 'sensor'), entity('s', 'switch')),
    ];
    const withFaults = { ...actions, sensor: ['fault_dropout'] };
    expect(entityChoices('device', ['c1'], rich, templates, withFaults, 'fault_dropout')).toEqual([
      { key: 'a', name: 'a' },
      { key: 'b', name: 'b' },
    ]);
    expect(entityChoices('device', ['C1'], rich, templates, withFaults, 'toggle')).toEqual([
      { key: 's', name: 's' },
    ]);
    expect(entityChoices('template', ['plug'], rich, templates, withFaults, 'toggle')).toEqual([
      { key: 'state', name: 'state' },
    ]);
  });

  it('offers no entity for several devices, a device set or all devices', () => {
    expect(entityChoices('device', ['p1', 'p2'], devices, templates, actions, 'toggle')).toEqual(
      [],
    );
    expect(entityChoices('run', ['r1'], devices, templates, actions, 'toggle')).toEqual([]);
    expect(entityChoices('all', [], devices, templates, actions, 'toggle')).toEqual([]);
  });
});

describe('schedule filter', () => {
  const base = {
    id: 's',
    entity: '',
    seed: '',
    created_at: 0,
    params: {},
    scenario: null,
  };
  const plain: ScheduleInfo = {
    ...base,
    name: 'Porch',
    target: { template: 'plug' },
    action: 'toggle',
    trigger: { type: 'times', times: ['08:00'] },
    enabled: true,
  };
  const fromScenario: ScheduleInfo = {
    ...plain,
    name: 'Night run',
    target: {},
    action: '',
    scenario: 'x',
    trigger: { type: 'poisson', per_day: 4 },
    enabled: false,
  };
  const rule = scheduleRule(
    (item) => (item.scenario ? '' : 'Template: plug'),
    (item) => item.action,
  );

  it('reads trigger, action, target kind and state of a schedule', () => {
    expect(['triggers', 'actions', 'targets', 'enabled'].map((k) => rule.values(plain, k))).toEqual(
      [['times'], ['toggle'], ['template'], ['on']],
    );
    expect(['actions', 'targets', 'enabled'].map((k) => rule.values(fromScenario, k))).toEqual([
      ['scenario'],
      ['all'],
      ['off'],
    ]);
  });

  it('searches name, target, action and trigger', () => {
    expect(rule.texts(plain)).toEqual(['Porch', 'Template: plug', 'toggle', '08:00']);
  });

  it('filters a list by trigger type and by state', () => {
    const items = [plain, fromScenario];
    const empty = emptyValues(SCHEDULE_FIELDS);
    const by = (changes: Record<string, string | string[]>): string[] =>
      filterItems(items, SCHEDULE_FIELDS, { ...empty, ...changes }, rule).map((i) => i.name);
    expect(by({ triggers: ['poisson'] })).toEqual(['Night run']);
    expect(by({ enabled: 'on' })).toEqual(['Porch']);
    expect(by({ actions: ['scenario', 'toggle'] })).toEqual(['Porch', 'Night run']);
  });
});
