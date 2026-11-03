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

  it('sends the log commands', async () => {
    const sent: Record<string, unknown>[] = [];
    const hass = {
      language: 'en',
      callWS: async (message: Record<string, unknown>) => {
        sent.push(message);
        return {};
      },
    } as unknown as Hass;
    const api = new TdcApi(hass);
    await api.logGet(7, 500);
    await api.logStop();
    await api.logClear();
    expect(sent).toEqual([
      { type: 'hass_test_data_creator/log/get', since: 7, limit: 500 },
      { type: 'hass_test_data_creator/log/set', capture: false },
      { type: 'hass_test_data_creator/log/clear' },
    ]);
  });

  it('sends the leftover topic commands', async () => {
    const sent: Record<string, unknown>[] = [];
    const hass = {
      language: 'en',
      callWS: async (message: Record<string, unknown>) => {
        sent.push(message);
        return { topics: [], cleared: [] };
      },
    } as unknown as Hass;
    const api = new TdcApi(hass);
    await api.orphanTopics();
    await api.clearOrphanTopics(['tdc/a']);
    expect(sent).toEqual([
      { type: 'hass_test_data_creator/removal/orphan_topics' },
      { type: 'hass_test_data_creator/removal/orphan_topics_clear', topics: ['tdc/a'] },
    ]);
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

  it('sends the seed of one sensor, or a random one for all', async () => {
    const sent: Record<string, unknown>[] = [];
    const hass = {
      language: 'en',
      callWS: async (message: Record<string, unknown>) => {
        sent.push(message);
        return { changed: 1 };
      },
    } as unknown as Hass;
    const api = new TdcApi(hass);
    await api.setSeed(['d1'], 7, 'temperature');
    await api.setSeed(['d1', 'd2'], 'random');
    expect(sent[0]).toEqual({
      type: 'hass_test_data_creator/devices/set_seed',
      devices: ['d1'],
      seed: 7,
      entity: 'temperature',
    });
    expect(sent[1]).toEqual({
      type: 'hass_test_data_creator/devices/set_seed',
      devices: ['d1', 'd2'],
      seed: 'random',
    });
  });
});
