import { describe, expect, it } from 'vitest';
import { TdcApi, describeError } from './api';
import type { Hass } from './types';

describe('describeError', () => {
  it('shows the TDC code before the message', () => {
    expect(describeError({ code: 'TDC-GEN-002', message: 'Too many' })).toBe(
      'TDC-GEN-002: Too many',
    );
  });

  it('falls back to the text of other errors', () => {
    expect(describeError('boom')).toBe('boom');
  });
});

describe('TdcApi', () => {
  it('prefixes commands and drops undefined fields', async () => {
    const sent: Record<string, unknown>[] = [];
    const hass = {
      language: 'en',
      callWS: async (message: Record<string, unknown>) => {
        sent.push(message);
        return {};
      },
    } as unknown as Hass;
    await new TdcApi(hass).removalPlan('all');
    expect(sent[0]).toEqual({ type: 'hass_test_data_creator/removal/plan', target: 'all' });
  });
});
