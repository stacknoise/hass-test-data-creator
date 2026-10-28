import { describe, expect, it } from 'vitest';
import type { DeviceInfo } from '../common/types';
import { actionsFor, faultParams, knownAreas, valueParams } from './helpers';

const ACTIONS = {
  light: ['turn_on', 'turn_off', 'toggle', 'set_brightness', 'fault_unavailable', 'fault_late'],
  sensor: ['fault_spike'],
};

describe('actionsFor', () => {
  it('splits plain actions, number actions and fault kinds', () => {
    expect(actionsFor(ACTIONS, 'light')).toEqual({
      plain: ['turn_on', 'turn_off', 'toggle'],
      withValue: ['set_brightness'],
      faults: ['unavailable', 'late'],
    });
  });

  it('knows nothing about other platforms', () => {
    expect(actionsFor(ACTIONS, 'cover')).toEqual({ plain: [], withValue: [], faults: [] });
  });
});

describe('valueParams', () => {
  it('names the parameter of the action', () => {
    expect(valueParams('set_position', '40')).toEqual({ position: 40 });
  });

  it('refuses text, empty and out of range input', () => {
    expect(valueParams('set_position', '101')).toBeUndefined();
    expect(valueParams('set_temperature', '4.9')).toBeUndefined();
    expect(valueParams('set_brightness', '')).toBeUndefined();
    expect(valueParams('set_brightness', 'x')).toBeUndefined();
    expect(valueParams('toggle', '1')).toBeUndefined();
  });
});

describe('faultParams', () => {
  it('takes a positive number of seconds', () => {
    expect(faultParams('90')).toEqual({ duration_s: 90 });
    expect(faultParams('0')).toBeUndefined();
    expect(faultParams('')).toBeUndefined();
  });
});

describe('knownAreas', () => {
  it('joins the areas of Home Assistant and of the devices without doubles', () => {
    const devices = [{ area: 'Kitchen' }, { area: null }, { area: 'Attic' }] as DeviceInfo[];
    expect(knownAreas({ a: { name: 'Kitchen' }, b: { name: 'Cellar' } }, devices)).toEqual([
      'Attic',
      'Cellar',
      'Kitchen',
    ]);
    expect(knownAreas(undefined, [])).toEqual([]);
  });
});
