import { describe, expect, it } from 'vitest';
import { actionNames, resolveWork } from '../schedule/helpers';
import type { DeviceName, ScenarioInfo } from '../common/types';
import {
  buildSteps,
  defaultStep,
  parseParams,
  scenarioRule,
  stepDevices,
  stepFormOf,
  stepTemplates,
} from './helpers';

const ACTIONS = { switch: ['toggle', 'turn_on'], light: ['set_brightness'] };
describe('scenario helpers', () => {
  it('lists each action name once', () => {
    expect(actionNames(ACTIONS)).toEqual(['toggle', 'turn_on', 'set_brightness']);
  });

  it('resolves the work of a form', () => {
    const work = {
      kind: 'template' as const,
      targetIds: ['plug'],
      action: 'toggle',
      entity: 'state',
    };
    expect(resolveWork(work)).toEqual({
      target: { template: 'plug' },
      entity: 'state',
      action: 'toggle',
    });
  });

  it('parses parameters', () => {
    expect(parseParams('')).toEqual({});
    expect(parseParams('{"brightness": 10}')).toEqual({ brightness: 10 });
    expect(parseParams('[1]')).toBeUndefined();
    expect(parseParams('{ nope')).toBeUndefined();
  });

  it('builds steps and refuses invalid parameters', () => {
    const base = defaultStep(ACTIONS);
    const first = { ...base, work: { ...base.work, entity: 'state' } };
    const second = {
      ...first,
      afterS: 30,
      work: { ...first.work, action: 'set_brightness', entity: 'light' },
      params: '{"brightness": 128}',
    };
    expect(buildSteps([first, second])).toEqual([
      { after_s: 0, target: { all: true }, entity: 'state', action: 'toggle', params: {} },
      {
        after_s: 30,
        target: { all: true },
        entity: 'light',
        action: 'set_brightness',
        params: { brightness: 128 },
      },
    ]);
    expect(buildSteps([{ ...first, params: '{ nope' }])).toBeUndefined();
  });
});

describe('editing a step', () => {
  it('turns a stored step back into its form and builds the same step again', () => {
    const step = {
      after_s: 30,
      target: { device: ['d1', 'd2'] },
      entity: 'light',
      action: 'set_brightness',
      params: { brightness: 128 },
    };
    const form = stepFormOf(step);
    expect(form).toEqual({
      afterS: 30,
      work: {
        kind: 'device',
        targetIds: ['d1', 'd2'],
        action: 'set_brightness',
        entity: 'light',
      },
      params: '{"brightness":128}',
    });
    expect(buildSteps([form])).toEqual([step]);
  });

  it('shows no parameters as an empty text', () => {
    const step = {
      after_s: 0,
      target: { all: true as const },
      entity: 'state',
      action: 'toggle',
      params: {},
    };
    expect(stepFormOf(step).params).toBe('');
  });
});

describe('scenario filter', () => {
  const step = (
    target: ScenarioInfo['steps'][number]['target'],
  ): ScenarioInfo['steps'][number] => ({
    after_s: 0,
    target,
    entity: '',
    action: 'toggle',
    params: {},
  });
  const scenario: ScenarioInfo = {
    id: 's',
    name: 'Evening',
    created_at: 0,
    steps: [
      step({ device: 'Lamp' }),
      step({ device: ['d2', 'd1'] }),
      step({ template: 'plug' }),
      step({ template: 'plug' }),
      step({ all: true }),
    ],
  };
  const devices = [
    { id: 'd1', name: 'Lamp' },
    { id: 'd2', name: 'Fan' },
  ] as DeviceName[];

  it('lists the devices of the steps once, with names turned into ids', () => {
    expect(stepDevices(scenario, devices)).toEqual(['d1', 'd2']);
  });

  it('lists the templates of the steps once', () => {
    expect(stepTemplates(scenario)).toEqual(['plug']);
  });

  it('gives the values per field key', () => {
    const rule = scenarioRule(devices, (item) => [item.name]);
    expect(rule.values(scenario, 'devices')).toEqual(['d1', 'd2']);
    expect(rule.values(scenario, 'templates')).toEqual(['plug']);
    expect(rule.texts(scenario)).toEqual(['Evening']);
  });
});
