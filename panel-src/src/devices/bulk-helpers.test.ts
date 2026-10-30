import { describe, expect, it } from 'vitest';
import {
  CONFIRM_ABOVE,
  MAX_SELECTED,
  NO_SELECTION,
  actionChoices,
  bulkParams,
  bulkTarget,
  canSelectAll,
  needsConfirmBox,
  pageState,
  selectionCount,
  toggleOne,
  togglePage,
} from './bulk-helpers';

const PAGE = ['a', 'b', 'c'];

describe('selection', () => {
  it('toggles one id and the whole page', () => {
    let selection = toggleOne(NO_SELECTION, 'a');
    expect(pageState(selection, PAGE)).toBe('some');
    selection = togglePage(selection, PAGE);
    expect(pageState(selection, PAGE)).toBe('all');
    selection = togglePage(selection, PAGE);
    expect(selection.ids.size).toBe(0);
    expect(pageState(selection, PAGE)).toBe('none');
  });

  it('never holds more ids than one request carries', () => {
    const ids = Array.from({ length: MAX_SELECTED }, (_, i) => `x${i}`);
    const full = togglePage(NO_SELECTION, ids);
    expect(full.ids.size).toBe(MAX_SELECTED);
    expect(toggleOne(full, 'more').ids.size).toBe(MAX_SELECTED);
    expect(togglePage(full, ['p', 'q']).ids.size).toBe(MAX_SELECTED);
  });

  it('counts the matches when all are selected', () => {
    expect(selectionCount(NO_SELECTION, 40)).toBe(0);
    expect(selectionCount(toggleOne(NO_SELECTION, 'a'), 40)).toBe(1);
    expect(selectionCount({ ids: new Set(), all: true }, 40)).toBe(40);
  });

  it('offers all matches only for a full page with more matches', () => {
    const page = togglePage(NO_SELECTION, PAGE);
    expect(canSelectAll(page, PAGE, 3)).toBe(false);
    expect(canSelectAll(page, PAGE, 9)).toBe(true);
    expect(canSelectAll({ ...page, all: true }, PAGE, 9)).toBe(false);
    expect(canSelectAll(toggleOne(NO_SELECTION, 'a'), PAGE, 9)).toBe(false);
  });
});

describe('target', () => {
  it('sends the ids, or the filter without its sort order', () => {
    expect(bulkTarget(toggleOne(NO_SELECTION, 'a'), { query: 'x' })).toEqual({ ids: ['a'] });
    const target = bulkTarget(
      { ids: new Set(), all: true },
      { query: 'x', sort: 'name', descending: true },
    );
    expect(JSON.parse(JSON.stringify(target))).toEqual({ filter: { query: 'x' } });
  });
});

describe('confirmation and actions', () => {
  it('asks for the checkbox above 100 devices', () => {
    expect(needsConfirmBox(CONFIRM_ABOVE)).toBe(false);
    expect(needsConfirmBox(CONFIRM_ABOVE + 1)).toBe(true);
  });

  it('lists each action once and checks its input', () => {
    expect(actionChoices({ switch: ['toggle', 'turn_on'], light: ['toggle'] }).sort()).toEqual([
      'toggle',
      'turn_on',
    ]);
    expect(bulkParams('toggle', '')).toEqual({});
    expect(bulkParams('set_brightness', '100')).toEqual({ brightness: 100 });
    expect(bulkParams('set_brightness', '999')).toBeUndefined();
    expect(bulkParams('fault_unavailable', '30')).toEqual({ duration_s: 30 });
    expect(bulkParams('fault_unavailable', '0')).toBeUndefined();
  });
});
