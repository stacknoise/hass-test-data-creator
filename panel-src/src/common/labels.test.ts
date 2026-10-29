import { describe, expect, it } from 'vitest';
import {
  actionLabel,
  collatorOf,
  entityName,
  labelIds,
  labelOf,
  sortedByLabel,
  stateLabel,
  type LabelKind,
} from './labels';

const KINDS: LabelKind[] = ['shape', 'action', 'fault', 'platform', 'template', 'entity', 'state'];

describe('label tables', () => {
  it('have the same ids in both languages', () => {
    for (const kind of KINDS) {
      expect(labelIds('de', kind).sort()).toEqual(labelIds('en', kind).sort());
    }
  });

  it('translate and fall back to the id', () => {
    expect(labelOf('de', 'shape', 'sine')).toBe('Sinus');
    expect(labelOf('en', 'shape', 'sine')).toBe('Sine');
    expect(labelOf('de-AT', 'platform', 'cover')).toBe('Rollo');
    expect(labelOf('de', 'template', 'my_own')).toBe('my_own');
  });
});

describe('action labels', () => {
  it('translate actions and faults', () => {
    expect(actionLabel('de', 'toggle')).toBe('Umschalten');
    expect(actionLabel('de', 'fault_dropout')).toBe('Störung: Aussetzer');
    expect(actionLabel('en', 'fault_dropout')).toBe('Fault: Dropout');
  });
});

describe('entity names and states', () => {
  it('translate only the English default name of a known entity', () => {
    expect(entityName('de', 'power', 'Power')).toBe('Leistung');
    expect(entityName('de', 'power', 'Wohnzimmer Leistung')).toBe('Wohnzimmer Leistung');
    expect(entityName('de', 'custom', 'Custom')).toBe('Custom');
  });

  it('translate common states and keep the others', () => {
    expect(stateLabel('de', 'on')).toBe('an');
    expect(stateLabel('de', 'wash')).toBe('wash');
    expect(stateLabel('de', null)).toBe('–');
  });
});

describe('sortedByLabel', () => {
  it('sorts by the shown text in the rules of the language, without changing the input', () => {
    const shapes = ['sine', 'saw', 'noise', 'counter'];
    expect(sortedByLabel('de', shapes, (s) => labelOf('de', 'shape', s))).toEqual([
      'noise',
      'saw',
      'sine',
      'counter',
    ]);
    expect(shapes).toEqual(['sine', 'saw', 'noise', 'counter']);
  });

  it('puts umlauts next to their base letter and numbers in order', () => {
    expect(sortedByLabel('de', ['Zett', 'Äpfel', 'Bett'], (s) => s)).toEqual([
      'Äpfel',
      'Bett',
      'Zett',
    ]);
    expect(sortedByLabel('en', ['Plug 10', 'Plug 2'], (s) => s)).toEqual(['Plug 2', 'Plug 10']);
  });
});

describe('collatorOf', () => {
  it('creates one collator per language', () => {
    expect(collatorOf('de')).toBe(collatorOf('de-AT'));
    expect(collatorOf('en')).not.toBe(collatorOf('de'));
  });
});
