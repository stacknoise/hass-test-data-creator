// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Hass, LogEntry, LogReply } from '../common/types';
import { LogPanel } from './log-panel';

/** Return an entry for tests. */
function entry(seq: number, fields: Partial<LogEntry> = {}): LogEntry {
  return {
    seq,
    at: 1_700_000_000 + seq,
    device_id: 'd1',
    device: 'Plug 01',
    key: 'power',
    name: 'Power',
    template: 'plug_metering',
    area: '',
    run_id: 'r1',
    output: 'native',
    platform: 'sensor',
    device_class: 'power',
    unit: 'W',
    old: '10',
    new: '12.5',
    delta: 2.5,
    cause: 'signal',
    ...fields,
  };
}

/** Return a reply of `log/get` with the given entries. */
function reply(entries: LogEntry[], extra: Partial<LogReply> = {}): LogReply {
  return {
    entries,
    capture: true,
    last_seq: entries.length ? entries[entries.length - 1].seq : 0,
    size: entries.length,
    capacity: 5000,
    discarded: 0,
    dropped: 0,
    ...extra,
  };
}

describe('LogPanel', () => {
  let panel: LogPanel;
  let sent: Record<string, unknown>[];
  let answers: LogReply[];

  beforeEach(async () => {
    vi.useFakeTimers();
    sent = [];
    answers = [reply([entry(1), entry(2, { new: 'unavailable', old: '12.5', delta: null })])];
    panel = new LogPanel();
    panel.hass = {
      language: 'en',
      callWS: async (message: Record<string, unknown>) => {
        sent.push(message);
        if (message.type === 'hass_test_data_creator/log/get') {
          return answers.shift() ?? reply([], { last_seq: 2 });
        }
        if (message.type === 'hass_test_data_creator/devices/names') return { devices: [] };
        return { capture: false, last_seq: 2, size: 0, capacity: 5000, discarded: 0 };
      },
    } as unknown as Hass;
    document.body.append(panel);
    await vi.advanceTimersByTimeAsync(0);
    await panel.updateComplete;
  });

  afterEach(() => {
    panel.remove();
    vi.useRealTimers();
  });

  it('sends the filter and reads again from the start when it changes', async () => {
    sent.length = 0;
    answers = [reply([entry(3)])];
    const bar = panel.shadowRoot!.querySelector('tdc-filter-bar')!;
    bar.dispatchEvent(
      new CustomEvent('tdc-filter-change', { detail: { query: '', causes: ['fault'] } }),
    );
    await vi.advanceTimersByTimeAsync(0);
    await panel.updateComplete;
    const gets = sent.filter((m) => m.type === 'hass_test_data_creator/log/get');
    expect(gets[0]).toMatchObject({ since: 0, filter: { causes: ['fault'] } });
    expect(panel.shadowRoot!.querySelectorAll('.row')).toHaveLength(1);
  });

  it('shows the entries it read, with the unavailable value marked', () => {
    const text = panel.shadowRoot!.textContent ?? '';
    expect(text).toContain('Plug 01');
    expect(text).toContain('2 entries');
    expect(panel.shadowRoot!.querySelectorAll('.row')).toHaveLength(2);
    expect(panel.shadowRoot!.querySelector('.unavailable')).not.toBeNull();
  });

  it('asks only for what is new on the next read', async () => {
    await vi.advanceTimersByTimeAsync(1000);
    const gets = sent.filter((m) => m.type === 'hass_test_data_creator/log/get');
    expect(gets[0]).toMatchObject({ since: 0, limit: 500 });
    expect(gets[1]).toMatchObject({ since: 2 });
  });

  it('freezes the view while paused and counts what came meanwhile', async () => {
    const buttons = panel.shadowRoot!.querySelectorAll<HTMLButtonElement>('.bar button');
    buttons[0].click();
    answers = [reply([entry(3)], { last_seq: 3 })];
    await vi.advanceTimersByTimeAsync(1000);
    await panel.updateComplete;
    const text = panel.shadowRoot!.textContent ?? '';
    expect(text).toContain('2 entries');
    expect(text).toContain('1 new');
  });

  it('stops the recording when the tab closes', async () => {
    panel.remove();
    await vi.advanceTimersByTimeAsync(0);
    expect(
      sent.some((m) => m.type === 'hass_test_data_creator/log/set' && m.capture === false),
    ).toBe(true);
  });
});
