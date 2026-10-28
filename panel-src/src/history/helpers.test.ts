import { describe, expect, it } from 'vitest';
import type { DeviceInfo } from '../common/types';
import { clampDays, sensorEntities } from './helpers';

describe('clampDays', () => {
  it('keeps whole days in range', () => {
    expect(clampDays(7)).toBe(7);
  });

  it('rounds, limits and replaces invalid input', () => {
    expect(clampDays(2.6)).toBe(3);
    expect(clampDays(0)).toBe(1);
    expect(clampDays(1000)).toBe(365);
    expect(clampDays(Number.NaN)).toBe(1);
  });
});

describe('sensorEntities', () => {
  const entity = (
    key: string,
    platform: string,
    shape?: string,
    stateClass = 'measurement',
  ): unknown => ({
    key,
    name: key,
    platform,
    state_class: stateClass,
    signal: shape ? { shape } : null,
  });
  const devices = [
    { id: 'a', entities: [entity('power', 'sensor', 'sine'), entity('state', 'switch')] },
    {
      id: 'b',
      entities: [
        entity('power', 'sensor', 'sine'),
        entity('mode', 'sensor', 'enum'),
        entity('temp', 'sensor', 'noise'),
      ],
    },
  ] as unknown as DeviceInfo[];

  it('takes the sensors with a number curve of the chosen device', () => {
    expect(sensorEntities(devices, ['a']).map((s) => s.key)).toEqual(['power']);
    expect(sensorEntities(devices, ['b']).map((s) => s.key)).toEqual(['power', 'temp']);
  });

  it('joins the sensors of several devices without doubles', () => {
    expect(sensorEntities(devices, ['a', 'b']).map((s) => s.key)).toEqual(['power', 'temp']);
  });

  it('joins the sensors of all devices when none is chosen', () => {
    expect(sensorEntities(devices, []).map((s) => s.key)).toEqual(['power', 'temp']);
  });

  it('skips sensors without a state class, because no statistics can be written for them', () => {
    const plain = [
      {
        id: 'c',
        entities: [entity('plain', 'sensor', 'sine', ''), entity('power', 'sensor', 'sine')],
      },
    ] as unknown as DeviceInfo[];
    expect(sensorEntities(plain, []).map((s) => s.key)).toEqual(['power']);
  });

  it('knows no sensor of a device that is gone', () => {
    expect(sensorEntities(devices, ['gone'])).toEqual([]);
  });
});
