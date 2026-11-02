// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import type { Hass } from '../common/types';
import { SourceBanner } from './source-banner';

/** Return a `hass` whose backend reports one removed source and records every request. */
function fakeHass(sent: Record<string, unknown>[]): Hass {
  return {
    language: 'en',
    callWS: async (message: Record<string, unknown>) => {
      sent.push(message);
      if (message.type === 'hass_test_data_creator/sources/removed') {
        return {
          sources:
            sent.length > 1
              ? []
              : [{ id: 's1', name: 'Real plug', devices: [{ id: 'a', name: 'Copy' }] }],
        };
      }
      return {};
    },
  } as unknown as Hass;
}

/** Wait until the element and its requests have settled. */
async function settle(element: SourceBanner): Promise<void> {
  for (let i = 0; i < 5; i++) {
    await Promise.resolve();
    await element.updateComplete;
  }
}

describe('tdc-source-banner', () => {
  it('shows nothing without removed sources', async () => {
    const element = new SourceBanner();
    element.hass = { language: 'en', callWS: async () => ({ sources: [] }) } as unknown as Hass;
    document.body.append(element);
    await settle(element);
    expect(element.shadowRoot?.textContent?.trim()).toBe('');
    element.remove();
  });

  it('asks about the copies and sends the answer', async () => {
    const sent: Record<string, unknown>[] = [];
    const element = new SourceBanner();
    element.hass = fakeHass(sent);
    document.body.append(element);
    await settle(element);
    expect(element.shadowRoot?.textContent).toContain('Real plug');
    const button = element.shadowRoot?.querySelector('button.primary, button') as HTMLButtonElement;
    button.click();
    await settle(element);
    expect(
      sent.some((m) => m.type === 'hass_test_data_creator/devices/confirm_source_removed'),
    ).toBe(true);
    element.remove();
  });
});
