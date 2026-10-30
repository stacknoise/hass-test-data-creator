import { describe, expect, it } from 'vitest';
import { shortcutOf, type KeyContext } from './shortcuts';

const BASE: KeyContext = {
  key: '',
  modified: false,
  typing: false,
  inSearch: false,
  dialogOpen: false,
};

describe('shortcutOf', () => {
  it.each<[string, Partial<KeyContext>, string | undefined]>([
    ['slash on the page', { key: '/' }, 'search'],
    ['slash while typing', { key: '/', typing: true }, undefined],
    ['slash with ctrl', { key: '/', modified: true }, undefined],
    ['slash in a dialog', { key: '/', dialogOpen: true }, undefined],
    ['escape on the page', { key: 'Escape' }, 'reset'],
    ['escape in the search field', { key: 'Escape', typing: true, inSearch: true }, 'reset'],
    ['escape in another field', { key: 'Escape', typing: true }, undefined],
    ['escape in a dialog', { key: 'Escape', dialogOpen: true }, undefined],
    ['another key', { key: 'a' }, undefined],
  ])('%s', (_name, context, expected) => {
    expect(shortcutOf({ ...BASE, ...context })).toBe(expected);
  });
});
