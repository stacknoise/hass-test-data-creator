import { beforeEach, describe, expect, it } from 'vitest';
import { TdcApi, clearApiCache, describeError } from './api';
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

  it('sends the history import with only the fields that are set', async () => {
    const sent: Record<string, unknown>[] = [];
    const hass = {
      language: 'en',
      callWS: async (message: Record<string, unknown>) => {
        sent.push(message);
        return { series: 1, rows: 24, skipped: 0 };
      },
    } as unknown as Hass;
    await new TdcApi(hass).importHistory(3, 'Plug 01');
    expect(sent[0]).toEqual({
      type: 'hass_test_data_creator/history/import',
      days: 3,
      device: 'Plug 01',
    });
  });

  it('reads devices in pages of at most 500 and stops at the total', async () => {
    const sent: { offset: number; limit: number }[] = [];
    const hass = {
      language: 'en',
      callWS: async (message: { offset: number; limit: number }) => {
        sent.push({ offset: message.offset, limit: message.limit });
        const size = Math.max(0, Math.min(message.limit, 1200 - message.offset));
        return { total: 1200, devices: Array.from({ length: size }, () => ({})) };
      },
    } as unknown as Hass;
    const api = new TdcApi(hass);
    expect((await api.devicesUpTo(600)).devices).toHaveLength(600);
    expect(sent).toEqual([
      { offset: 0, limit: 500 },
      { offset: 500, limit: 100 },
    ]);
    sent.length = 0;
    expect((await api.devicesUpTo(Infinity)).devices).toHaveLength(1200);
    expect(sent.every((item) => item.limit <= 500)).toBe(true);
  });

  it('reads the device names and one full device with their own commands', async () => {
    const sent: Record<string, unknown>[] = [];
    const hass = {
      language: 'en',
      callWS: async (message: Record<string, unknown>) => {
        sent.push(message);
        return message.type === 'hass_test_data_creator/devices/names'
          ? { devices: [{ id: 'a' }] }
          : {};
      },
    } as unknown as Hass;
    const api = new TdcApi(hass);
    expect(await api.deviceNames()).toEqual([{ id: 'a' }]);
    await api.device('a');
    expect(sent[1]).toEqual({ type: 'hass_test_data_creator/devices/get', device: 'a' });
  });
});

describe('shared answers', () => {
  beforeEach(() => clearApiCache());

  it('asks for info and templates once however many tabs ask', async () => {
    const sent: string[] = [];
    const hass = {
      language: 'en',
      callWS: async (message: Record<string, unknown>) => {
        sent.push(message.type as string);
        return [];
      },
    } as unknown as Hass;
    await Promise.all([new TdcApi(hass).info(), new TdcApi(hass).info()]);
    await new TdcApi(hass).templates();
    await new TdcApi(hass).templates();
    expect(sent).toEqual(['hass_test_data_creator/info', 'hass_test_data_creator/templates/list']);
  });

  it('does not keep a failed answer', async () => {
    let calls = 0;
    const hass = {
      language: 'en',
      callWS: async () => {
        calls += 1;
        if (calls === 1) throw new Error('down');
        return {};
      },
    } as unknown as Hass;
    await expect(new TdcApi(hass).info()).rejects.toThrow('down');
    await expect(new TdcApi(hass).info()).resolves.toEqual({});
  });
});
