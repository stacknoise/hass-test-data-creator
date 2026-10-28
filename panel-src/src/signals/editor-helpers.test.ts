import { describe, expect, it } from 'vitest';
import {
  editableSensors,
  fieldsFor,
  isDiscrete,
  textFieldsFor,
  textOf,
  withField,
  withShape,
  withSignal,
  withText,
} from './editor-helpers';

const ENTITIES = JSON.stringify([
  { key: 'switch', platform: 'switch', name: 'Switch' },
  { key: 'level', platform: 'sensor', name: 'Level', signal: { shape: 'sine', min: 0, max: 100 } },
]);

describe('curve editor helpers', () => {
  it('shows the parameters that the shape uses', () => {
    expect(fieldsFor('sine')).toEqual(['period_s', 'phase', 'noise']);
    expect(fieldsFor('counter')).toEqual(['rate_per_hour']);
    expect(fieldsFor('noise')).toEqual(['interval_s', 'noise']);
    expect(fieldsFor('constant')).toEqual(['noise']);
    expect(fieldsFor('unknown')).toEqual([]);
  });

  it('sets and removes a field', () => {
    const signal = { shape: 'sine', min: 0, max: 10 };
    expect(withField(signal, 'max', '25')).toEqual({ shape: 'sine', min: 0, max: 25 });
    expect(withField(signal, 'max', '')).toEqual({ shape: 'sine', min: 0 });
    expect(withField(signal, 'max', 'abc')).toEqual({ shape: 'sine', min: 0 });
  });

  it('drops parameters the new shape ignores', () => {
    const signal = { shape: 'sine', min: 1, max: 9, period_s: 600, phase: 0.5, noise: 0.1 };
    expect(withShape(signal, 'counter')).toEqual({ shape: 'counter', min: 1, max: 9 });
    expect(withShape(signal, 'saw')).toEqual({ ...signal, shape: 'saw' });
  });

  it('finds the sensors with a signal and writes a changed signal back', () => {
    const sensors = editableSensors(ENTITIES);
    expect(sensors).toEqual([
      { index: 1, name: 'Level', signal: { shape: 'sine', min: 0, max: 100 } },
    ]);
    const changed = JSON.parse(withSignal(ENTITIES, 1, { shape: 'saw', min: 5, max: 6 }));
    expect(changed[1].signal).toEqual({ shape: 'saw', min: 5, max: 6 });
    expect(changed[0]).toEqual({ key: 'switch', platform: 'switch', name: 'Switch' });
  });

  it('leaves invalid text and unknown positions alone', () => {
    expect(editableSensors('{ nope')).toEqual([]);
    expect(withSignal('{ nope', 0, { shape: 'sine' })).toBe('{ nope');
    expect(withSignal(ENTITIES, 7, { shape: 'sine' })).toBe(ENTITIES);
  });

  it('edits the states of discrete shapes as text', () => {
    expect(isDiscrete('enum')).toBe(true);
    expect(isDiscrete('sine')).toBe(false);
    expect(textFieldsFor('state_machine')).toEqual(['states']);

    const enumSignal = withText({ shape: 'enum' }, 'values', ' a, b ,, c');
    expect(enumSignal.values).toEqual(['a', 'b', 'c']);
    expect(withText(enumSignal, 'weights', '1, x, 3').weights).toEqual([1, 3]);
    expect(textOf(enumSignal, 'values')).toBe('a, b, c');

    const machine = withText(
      { shape: 'state_machine' },
      'states',
      'idle:600, bad, wash:0, spin: 30',
    );
    expect(machine.states).toEqual([
      { value: 'idle', duration_s: 600 },
      { value: 'spin', duration_s: 30 },
    ]);
    expect(textOf(machine, 'states')).toBe('idle:600, spin:30');
  });

  it('gives a new discrete shape valid defaults and drops the range', () => {
    const signal = withShape({ shape: 'sine', min: 0, max: 10, period_s: 60, noise: 0.1 }, 'enum');
    expect(signal).toEqual({ shape: 'enum', values: ['on', 'off'], interval_s: 600 });
    const machine = withShape(signal, 'state_machine');
    expect(machine.states?.length).toBe(2);
    expect(machine.values).toBeUndefined();
    expect(withShape(machine, 'sine')).toEqual({ shape: 'sine' });
  });

  it('keeps the file of a replay and drops it for other shapes', () => {
    const replay = withShape({ shape: 'sine', min: 0, max: 100 }, 'csv');
    const chosen = { ...replay, file: 'load.csv', step_s: 30 };

    expect(fieldsFor('csv')).toEqual(['step_s', 'phase']);
    expect(withShape(chosen, 'csv').file).toBe('load.csv');
    expect(withShape(chosen, 'sine').file).toBeUndefined();
  });
});
