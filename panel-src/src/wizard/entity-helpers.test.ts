import { describe, expect, it } from 'vitest';
import {
  entityProblem,
  keyOf,
  newEntity,
  withItem,
  withoutItem,
  withPlatform,
} from './entity-helpers';

describe('entity helpers', () => {
  it('derives a key from a name', () => {
    expect(keyOf('Außen Temperatur 2')).toBe('aussen_temperatur_2');
    expect(keyOf('  Café  ')).toBe('cafe');
    expect(keyOf('---')).toBe('');
  });

  it('gives a new entity the parts its platform needs', () => {
    expect(newEntity('sensor').signal?.shape).toBe('sine');
    expect(newEntity('event').event_types).toEqual(['press']);
    expect(newEntity('switch')).toEqual({ key: '', platform: 'switch', name: '' });
  });

  it('drops what the new platform does not use', () => {
    const sensor = { ...newEntity('sensor'), name: 'A', key: 'a', unit: '%' };
    const moved = withPlatform(sensor, 'switch');
    expect(moved.signal).toBeUndefined();
    expect(moved.unit).toBeUndefined();
    expect(withPlatform(moved, 'sensor').signal).toBeDefined();
  });

  it('names the first problem of an entity', () => {
    const ok = { ...newEntity('switch'), name: 'Relay', key: 'relay' };
    expect(entityProblem(ok, [])).toBe('');
    expect(entityProblem({ ...ok, name: ' ' }, [])).toBe('entNameEmpty');
    expect(entityProblem({ ...ok, key: 'Bad Key' }, [])).toBe('entKeyInvalid');
    expect(entityProblem(ok, ['relay'])).toBe('entKeyTaken');
    expect(entityProblem({ ...newEntity('event'), name: 'E', key: 'e', event_types: [] }, [])).toBe(
      'entEventTypes',
    );
  });

  it('adds, replaces and removes list items', () => {
    expect(withItem([1, 2], -1, 3)).toEqual([1, 2, 3]);
    expect(withItem([1, 2], 0, 9)).toEqual([9, 2]);
    expect(withoutItem([1, 2, 3], 1)).toEqual([1, 3]);
  });
});
