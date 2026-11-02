// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';
import type { Hass } from '../common/types';
import './follow-wizard';
import type { FollowWizard } from './follow-wizard';

/** Return a `hass` whose backend knows one template and one real device, and records requests. */
function fakeHass(sent: Record<string, unknown>[]): Hass {
  return {
    language: 'en',
    areas: {},
    callWS: async (message: Record<string, unknown>) => {
      sent.push(message);
      switch (message.type) {
        case 'hass_test_data_creator/info':
          return { outputs: ['native'], shapes: [], platforms: [], tick_seconds: 10 };
        case 'hass_test_data_creator/templates/list':
          return [
            {
              id: 'climate_sensor',
              name: 'Climate',
              bundled: true,
              entities: [
                {
                  key: 'temperature',
                  platform: 'sensor',
                  name: 'Temperature',
                  device_class: 'temperature',
                },
              ],
            },
          ];
        case 'hass_test_data_creator/sources/list':
          return {
            devices: [
              { id: 'd1', name: 'Boiler', manufacturer: '', model: '', entities: 1, usable: 1 },
            ],
          };
        case 'hass_test_data_creator/sources/derive':
          return {
            name: 'Boiler',
            entities: [
              {
                key: 'temperature',
                platform: 'sensor',
                name: 'Temperature',
                device_class: 'temperature',
              },
            ],
            mapping: { temperature: 'sensor.temp' },
          };
        case 'hass_test_data_creator/sources/inspect':
          return {
            entities: [
              {
                entity_id: 'sensor.temp',
                name: 'Temp',
                platform: 'sensor',
                device_class: 'temperature',
                unit: '°C',
                state: '20',
              },
            ],
            proposal: [
              { key: 'temperature', entity_id: 'sensor.temp', reason: null, candidates: [] },
            ],
          };
        default:
          return { devices: 1 };
      }
    },
  } as unknown as Hass;
}

describe('FollowWizard', () => {
  let wizard: FollowWizard;
  afterEach(() => wizard.remove());

  /** Let the wizard and the elements below it load and render. */
  async function settle(): Promise<void> {
    for (let i = 0; i < 8; i++) {
      await Promise.resolve();
      await wizard.updateComplete;
    }
  }

  it('creates only once a source is chosen and sends it with the common fields', async () => {
    const sent: Record<string, unknown>[] = [];
    wizard = document.createElement('tdc-follow-wizard') as FollowWizard;
    wizard.hass = fakeHass(sent);
    document.body.append(wizard);
    await settle();

    const create = wizard.shadowRoot!.querySelector<HTMLButtonElement>('button.primary')!;
    expect(create.disabled).toBe(true);
    wizard
      .shadowRoot!.querySelector('tdc-source-step')!
      .shadowRoot!.querySelector<HTMLButtonElement>('li button')!
      .click();
    await settle();
    expect(create.disabled).toBe(false);
    create.click();
    await settle();

    const request = sent.find((m) => m.type === 'hass_test_data_creator/devices/create')!;
    expect(request.template).toBe('custom');
    expect((request.entities as { key: string }[]).map((e) => e.key)).toEqual(['temperature']);
    expect(request.count).toBe(10);
    expect((request.source as { device_id: string }).device_id).toBe('d1');
  });
});
