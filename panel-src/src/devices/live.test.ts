import { describe, expect, it } from 'vitest';
import { livePoints, numericState, pushSample } from './live';

describe('numericState', () => {
  it.each([
    ['21.5', 21.5],
    ['-3', -3],
    ['on', undefined],
    ['', undefined],
    [null, undefined],
    ['unavailable', undefined],
  ])('reads %s', (text, expected) => {
    expect(numericState(text)).toBe(expected);
  });
});

describe('pushSample', () => {
  it('keeps the newest samples', () => {
    let samples = [] as { at: number; value: number }[];
    for (let i = 0; i < 5; i++) samples = pushSample(samples, { at: i, value: i }, 3);
    expect(samples.map((s) => s.value)).toEqual([2, 3, 4]);
  });
});

describe('livePoints', () => {
  it('is empty below two samples', () => {
    expect(livePoints([{ at: 0, value: 1 }], 100, 40)).toBe('');
  });
  it('scales the lowest value to the bottom and the highest to the top', () => {
    const points = livePoints(
      [
        { at: 0, value: 0 },
        { at: 10, value: 10 },
      ],
      100,
      40,
      0,
    );
    expect(points).toBe('0.0,40.0 100.0,0.0');
  });
  it('draws a flat line for equal values', () => {
    expect(
      livePoints(
        [
          { at: 0, value: 5 },
          { at: 1, value: 5 },
        ],
        10,
        10,
        0,
      ),
    ).toBe('0.0,10.0 10.0,10.0');
  });
});
