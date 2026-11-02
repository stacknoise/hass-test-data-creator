// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { EntityDef, Hass, SourceRequest } from '../common/types';
import './source-step';
import type { SourceStep } from './source-step';

const entities = [
  { key: 'temperature', platform: 'sensor', name: 'Temperature', device_class: 'temperature' },
] as EntityDef[];

describe('SourceStep', () => {
  let step: SourceStep;
  let sent: Record<string, unknown>[];
  let reported: (SourceRequest | null)[];

  beforeEach(async () => {
    vi.useFakeTimers();
    sent = [];
    reported = [];
    step = document.createElement('tdc-source-step') as SourceStep;
    step.hass = {
      language: 'en',
      callWS: async (message: Record<string, unknown>) => {
        sent.push(message);
        switch (message.type) {
          case 'hass_test_data_creator/sources/list':
            return {
              devices: [
                { id: 'd1', name: 'Boiler', manufacturer: 'Acme', model: 'B1', entities: 1 },
              ],
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
            return {};
        }
      },
    } as unknown as Hass;
    step.entities = entities;
    step.template = 'climate_sensor';
    step.addEventListener('tdc-source-change', (e) =>
      reported.push((e as CustomEvent<SourceRequest | null>).detail),
    );
    document.body.append(step);
    await step.updateComplete;
  });

  afterEach(() => {
    step.remove();
    vi.useRealTimers();
  });

  /** Tick the timers and let the component render. */
  async function settle(): Promise<void> {
    await vi.advanceTimersByTimeAsync(0);
    await step.updateComplete;
  }

  it('offers the devices at once and reports nothing before one is chosen', async () => {
    await settle();
    expect(step.shadowRoot!.querySelectorAll('li button')).toHaveLength(1);
    expect(step.shadowRoot!.querySelector('table')).toBeNull();
    expect(reported).toEqual([]);
  });

  it('searches, takes the proposal and reports the source', async () => {
    await settle();
    step.shadowRoot!.querySelector<HTMLButtonElement>('li button')!.click();
    await settle();

    expect(
      sent.some(
        (m) =>
          m.type === 'hass_test_data_creator/sources/inspect' && m.template === 'climate_sensor',
      ),
    ).toBe(true);
    expect(reported.at(-1)).toEqual({
      device_id: 'd1',
      mapping: { temperature: 'sensor.temp' },
      deviation: {},
    });
  });

  it('sends the deviation as fractions', async () => {
    await settle();
    step.shadowRoot!.querySelector<HTMLButtonElement>('li button')!.click();
    await settle();
    const scale = step.shadowRoot!.querySelectorAll<HTMLInputElement>('input[type=number]')[1];
    scale.value = '2';
    scale.dispatchEvent(new Event('input'));
    await settle();

    expect(reported.at(-1)?.deviation).toEqual({ scale: 0.02 });
  });
});
