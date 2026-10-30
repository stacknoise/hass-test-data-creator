import { describe, expect, it } from 'vitest';
import type { DeviceInfo } from '../common/types';
import { emptyValues } from '../common/filter-state';
import {
  DEVICE_FIELDS,
  actionsFor,
  deviceRequest,
  facetItems,
  faultParams,
  knownAreas,
  lastPageOffset,
  usageEntries,
  valueParams,
} from './helpers';

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

describe('usageEntries', () => {
  it('lists schedules first, then scenarios, then groups', () => {
    const used = {
      schedules: [{ id: 's', name: 'Evening' }],
      scenarios: [{ id: 'c', name: 'Leaving' }],
      groups: [{ id: 'g', name: 'Lights' }],
    };
    expect(usageEntries(used)).toEqual([
      { kind: 'schedules', name: 'Evening' },
      { kind: 'scenarios', name: 'Leaving' },
      { kind: 'groups', name: 'Lights' },
    ]);
  });

  it('is empty for a device that nothing uses, or one without the information', () => {
    expect(usageEntries({ schedules: [], scenarios: [], groups: [] })).toEqual([]);
    expect(usageEntries(undefined)).toEqual([]);
  });
});

describe('lastPageOffset', () => {
  it('gives the offset of the last page', () => {
    expect(lastPageOffset(0, 50)).toBe(0);
    expect(lastPageOffset(50, 50)).toBe(0);
    expect(lastPageOffset(51, 50)).toBe(50);
    expect(lastPageOffset(120, 50)).toBe(100);
  });
});

describe('device filter request', () => {
  it('leaves out everything that restricts nothing', () => {
    expect(deviceRequest(emptyValues(DEVICE_FIELDS))).toEqual({});
  });

  it('converts the state of the bar', () => {
    const values = {
      ...emptyValues(DEVICE_FIELDS),
      query: '  plug ',
      areas: ['', 'Hall'],
      custom: true,
      state: 'fault',
      sort: 'name',
      descending: true,
    };
    expect(deviceRequest(values)).toEqual({
      query: 'plug',
      areas: ['', 'Hall'],
      custom: true,
      state: 'fault',
      sort: 'name',
      descending: true,
    });
  });

  it('offers the values with their counts and keeps chosen values that no longer exist', () => {
    const items = facetItems([{ value: 'a', count: 3 }], ['a', 'gone'], (e) =>
      e.value.toUpperCase(),
    );
    expect(items).toEqual([
      { value: 'a', label: 'A (3)' },
      { value: 'gone', label: 'GONE' },
    ]);
    expect(facetItems(undefined, undefined, (e) => e.value)).toEqual([]);
  });
});
