import { describe, expect, it } from 'vitest';
import type { EntityDef, SourceDerived } from '../common/types';
import {
  NO_DEVIATION,
  deviationRequest,
  includedMapping,
  previewKey,
  sourceChoice,
  toggled,
} from './source-helpers';

const temperature = { key: 'temperature', platform: 'sensor', name: 'Temperature' } as EntityDef;
const plug = { key: 'plug', platform: 'switch', name: 'Plug' } as EntityDef;
const derived: SourceDerived = {
  name: 'Boiler',
  entities: [temperature, plug],
  mapping: { temperature: 'sensor.temp', plug: 'switch.plug' },
};

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

  it('takes entities in and out', () => {
    const all = new Set(['temperature', 'plug']);
    const without = toggled(all, 'plug', false);
    expect([...without]).toEqual(['temperature']);
    expect(toggled(without, 'plug', true).has('plug')).toBe(true);
    expect(includedMapping(derived.mapping, without)).toEqual({ temperature: 'sensor.temp' });
  });

  it('builds the choice only with a device and at least one entity taken in', () => {
    const all = new Set(['temperature', 'plug']);
    expect(sourceChoice('', derived, all, NO_DEVIATION)).toBeNull();
    expect(sourceChoice('dev', derived, new Set(), NO_DEVIATION)).toBeNull();
    expect(sourceChoice('dev', derived, new Set(['plug']), NO_DEVIATION)).toEqual({
      source: { device_id: 'dev', mapping: { plug: 'switch.plug' }, deviation: {} },
      entities: [plug],
    });
  });

  it('previews the first mapped sensor', () => {
    expect(previewKey([temperature, plug], {})).toBe('');
    expect(previewKey([temperature, plug], { temperature: 'sensor.a' })).toBe('temperature');
  });
});
