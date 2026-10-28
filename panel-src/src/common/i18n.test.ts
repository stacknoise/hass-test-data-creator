import { describe, expect, it } from 'vitest';
import { keysOf, languageOf, t } from './i18n';

describe('i18n', () => {
  it('has the same keys in German and English', () => {
    expect(keysOf('de')).toEqual(keysOf('en'));
  });

  it('picks German only for de codes', () => {
    expect(languageOf('de')).toBe('de');
    expect(languageOf('de-AT')).toBe('de');
    expect(languageOf('fr')).toBe('en');
    expect(languageOf(undefined)).toBe('en');
  });

  it('fills fields and keeps unknown ones', () => {
    expect(t('en', 'devicesOf', { shown: 3, total: 9 })).toBe('3 of 9 devices');
    expect(t('en', 'namePatternHint')).toContain('{nn}');
  });
});
