// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { clearApiCache } from '../common/api';
import type { DeviceInfo, Hass } from '../common/types';
import { DeviceList, PAGE_SIZE } from './device-list';

const TOTAL = 120;

/** Return a generated device with the given number. */
function device(n: number): DeviceInfo {
  return {
    id: `id${n}`,
    name: `Plug ${String(n).padStart(3, '0')}`,
    template: 'plug_metering',
    model: 'Plug',
    output: 'native',
    run_id: 'run',
    created_at: 0,
    area: null,
    entities: [],
    used_by: { schedules: [], scenarios: [], groups: [] },
  };
}

/** A `hass` object whose backend holds `TOTAL` devices and records every request. */
function fakeHass(sent: Record<string, unknown>[], total = TOTAL): Hass {
  return {
    language: 'en',
    areas: {},
    callWS: async (message: Record<string, unknown>) => {
      sent.push(message);
      if (message.type === 'hass_test_data_creator/devices/list') {
        const offset = message.offset as number;
        const limit = message.limit as number;
        const count = Math.max(0, Math.min(limit, total - offset));
        return { total, devices: Array.from({ length: count }, (_, i) => device(offset + i + 1)) };
      }
      return { actions: {}, shapes: [] };
    },
  } as unknown as Hass;
}

/** Wait until the element and the requests it started have settled. */
async function settle(element: DeviceList): Promise<void> {
  for (let i = 0; i < 5; i++) {
    await Promise.resolve();
    await element.updateComplete;
  }
}

/** Return the names in the rows of the table. */
function rowNames(element: DeviceList): string[] {
  return [...(element.shadowRoot?.querySelectorAll('tr.device td.name') ?? [])].map((cell) =>
    (cell.textContent ?? '').replace(/[▸▾]/u, '').trim(),
  );
}

/** Click the button with `text` in the paging row. */
function clickButton(element: DeviceList, text: RegExp): void {
  const button = [...(element.shadowRoot?.querySelectorAll('button') ?? [])].find((b) =>
    text.test(b.textContent ?? ''),
  );
  button?.click();
}

describe('DeviceList', () => {
  let element: DeviceList;
  let sent: Record<string, unknown>[];

  beforeEach(async () => {
    clearApiCache();
    sent = [];
    element = new DeviceList();
    element.hass = fakeHass(sent);
    document.body.append(element);
    await settle(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('asks for one page and shows only its devices', () => {
    const lists = sent.filter((m) => m.type === 'hass_test_data_creator/devices/list');
    expect(lists[0]).toMatchObject({ offset: 0, limit: PAGE_SIZE });
    expect(rowNames(element)).toHaveLength(PAGE_SIZE);
    expect(element.shadowRoot?.textContent).toContain(`1–${PAGE_SIZE} of ${TOTAL} devices`);
  });

  it('goes to the next and back to the previous page', async () => {
    clickButton(element, /Next/u);
    await settle(element);
    expect(rowNames(element)[0]).toBe(`Plug ${String(PAGE_SIZE + 1).padStart(3, '0')}`);

    clickButton(element, /Previous/u);
    await settle(element);
    expect(rowNames(element)[0]).toBe('Plug 001');
  });

  it('steps back to the last page when the page it shows is gone', async () => {
    clickButton(element, /Next/u);
    clickButton(element, /Next/u);
    await settle(element);
    expect(rowNames(element)).toHaveLength(TOTAL - 2 * PAGE_SIZE);

    element.hass = fakeHass(sent, PAGE_SIZE + 10);
    await element.refresh();
    await settle(element);
    expect(rowNames(element)).toHaveLength(10);
  });

  it('loads the options once for all tabs', async () => {
    const other = new DeviceList();
    other.hass = fakeHass(sent);
    document.body.append(other);
    await settle(other);
    other.remove();
    expect(sent.filter((m) => m.type === 'hass_test_data_creator/info')).toHaveLength(1);
  });
});
