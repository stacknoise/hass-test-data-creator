import { describe, expect, it } from 'vitest';
import type { TemplateInfo } from '../common/types';
import { actionKeys, entityKeysFor, resolveWork } from '../schedule/helpers';
import { buildSteps, defaultStep, parseParams } from './helpers';

const ACTIONS = { switch: ['toggle', 'turn_on'], light: ['set_brightness'] };
const TEMPLATES: TemplateInfo[] = [
  {
    id: 'plug',
    name: 'Plug',
    model: 'Plug',
    bundled: true,
    entities: [{ key: 'state', platform: 'switch', name: 'Switch' }],
  },
  {
    id: 'light',
    name: 'Light',
    model: 'Light',
    bundled: true,
    entities: [{ key: 'light', platform: 'light', name: 'Light' }],
  },
];

describe('scenario helpers', () => {
  it('lists actions and the entities they work on', () => {
    expect(actionKeys(ACTIONS)).toEqual([
      'switch/toggle',
      'switch/turn_on',
      'light/set_brightness',
    ]);
    expect(entityKeysFor(TEMPLATES, 'light/set_brightness')).toEqual(['light']);
    expect(entityKeysFor(TEMPLATES, 'cover/open')).toEqual([]);
  });

  it('resolves the work of a form', () => {
    const work = {
      kind: 'template' as const,
      targetId: 'plug',
      actionKey: 'switch/toggle',
      entity: '',
    };
    expect(resolveWork(work, TEMPLATES)).toEqual({
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
    const first = defaultStep(ACTIONS);
    const second = {
      ...first,
      afterS: 30,
      work: { ...first.work, actionKey: 'light/set_brightness' },
      params: '{"brightness": 128}',
    };
    expect(buildSteps([first, second], TEMPLATES)).toEqual([
      { after_s: 0, target: { all: true }, entity: 'state', action: 'toggle', params: {} },
      {
        after_s: 30,
        target: { all: true },
        entity: 'light',
        action: 'set_brightness',
        params: { brightness: 128 },
      },
    ]);
    expect(buildSteps([{ ...first, params: '{ nope' }], TEMPLATES)).toBeUndefined();
  });
});
