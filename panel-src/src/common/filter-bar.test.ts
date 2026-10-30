// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FILTER_DEBOUNCE_MS, FilterBar } from './filter-bar';
import { emptyValues, type FilterField, type FilterValues } from './filter-state';
import type { Hass } from './types';

const FIELDS: FilterField[] = [{ key: 'custom', kind: 'switch', label: 'Own' }];

describe('FilterBar', () => {
  let bar: FilterBar;
  let changes: FilterValues[];

  beforeEach(async () => {
    vi.useFakeTimers();
    changes = [];
    bar = new FilterBar();
    bar.hass = { language: 'en' } as unknown as Hass;
    bar.fields = FIELDS;
    bar.values = emptyValues(FIELDS);
    bar.matched = 12;
    bar.total = 80;
    bar.addEventListener('tdc-filter-change', (e) => changes.push((e as CustomEvent).detail));
    document.body.append(bar);
    await bar.updateComplete;
  });

  afterEach(() => {
    bar.remove();
    vi.useRealTimers();
  });

  /** Type `text` into the search field. */
  function type(text: string): void {
    const input = bar.shadowRoot!.querySelector('input[type=search]') as HTMLInputElement;
    input.value = text;
    input.dispatchEvent(new Event('input'));
  }

  it('shows the counter', () => {
    expect(bar.shadowRoot!.textContent).toContain('12 of 80');
  });

  it('reports typing once, after the debounce time', () => {
    type('p');
    type('pl');
    vi.advanceTimersByTime(FILTER_DEBOUNCE_MS - 1);
    expect(changes).toHaveLength(0);
    vi.advanceTimersByTime(1);
    expect(changes).toHaveLength(1);
    expect(changes[0]!.query).toBe('pl');
  });

  it('reports a switch at once and resets with the button', async () => {
    const box = bar.shadowRoot!.querySelector('input[type=checkbox]') as HTMLInputElement;
    box.checked = true;
    box.dispatchEvent(new Event('change'));
    expect(changes.at(-1)!.custom).toBe(true);
    await bar.updateComplete;
    const reset = [...bar.shadowRoot!.querySelectorAll('button')].find((b) =>
      /Reset/u.test(b.textContent ?? ''),
    );
    reset!.click();
    expect(changes.at(-1)).toEqual(emptyValues(FIELDS));
  });
});
