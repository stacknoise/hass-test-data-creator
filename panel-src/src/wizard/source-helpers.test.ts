import { describe, expect, it } from 'vitest';
import type { EntityDef, SourceEntityInfo } from '../common/types';
import {
  NO_DEVIATION,
  candidates,
  deviationRequest,
  followable,
  mappingFromProposal,
  previewKey,
  sourceRequest,
  withMapping,
} from './source-helpers';

const temperature: EntityDef = {
  key: 'temperature',
  platform: 'sensor',
  name: 'Temperature',
  device_class: 'temperature',
} as EntityDef;
const event: EntityDef = { key: 'press', platform: 'event', name: 'Press' } as EntityDef;

describe('source helpers', () => {
  it('turns the form into fractions and leaves out what is switched off', () => {
    expect(deviationRequest(NO_DEVIATION)).toEqual({});
    expect(
      deviationRequest({ ...NO_DEVIATION, offset: 0.5, scalePercent: 2, decimals: 1 }),
    ).toEqual({ offset: 0.5, scale: 0.02, decimals: 1 });
  });

  it('keeps zero decimals because they round to whole numbers', () => {
    expect(deviationRequest({ ...NO_DEVIATION, decimals: 0 })).toEqual({ decimals: 0 });
  });

  it('offers only entities that can follow, and only source entities of the same kind', () => {
    expect(followable([temperature, event])).toEqual([temperature]);
    const source = [
      { entity_id: 'sensor.a', platform: 'sensor', device_class: 'temperature' },
      { entity_id: 'sensor.b', platform: 'sensor', device_class: 'humidity' },
      { entity_id: 'switch.c', platform: 'switch', device_class: null },
    ] as SourceEntityInfo[];
    expect(candidates(temperature, source).map((e) => e.entity_id)).toEqual(['sensor.a']);
  });

  it('takes the proposal where it found an entity and keeps the mapping editable', () => {
    const mapping = mappingFromProposal([
      { key: 'temperature', entity_id: 'sensor.a', reason: null, candidates: [] },
      { key: 'humidity', entity_id: null, reason: 'none', candidates: [] },
    ]);
    expect(mapping).toEqual({ temperature: 'sensor.a' });
    expect(withMapping(mapping, 'humidity', 'sensor.h')).toEqual({
      temperature: 'sensor.a',
      humidity: 'sensor.h',
    });
    expect(withMapping(mapping, 'temperature', '')).toEqual({});
  });

  it('builds a source only with a device and at least one mapped entity', () => {
    expect(sourceRequest('', { a: 'b' }, NO_DEVIATION)).toBeNull();
    expect(sourceRequest('dev', {}, NO_DEVIATION)).toBeNull();
    expect(sourceRequest('dev', { a: 'b' }, NO_DEVIATION)).toEqual({
      device_id: 'dev',
      mapping: { a: 'b' },
      deviation: {},
    });
  });

  it('previews the first mapped sensor', () => {
    expect(previewKey([temperature, event], {})).toBe('');
    expect(previewKey([temperature, event], { temperature: 'sensor.a' })).toBe('temperature');
  });
});
