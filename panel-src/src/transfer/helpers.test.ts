import { describe, expect, it } from 'vitest';
import type { ImportPlan, TransferPage } from '../common/types';
import {
  buildTransferFile,
  exportFileName,
  knownNames,
  needsConfirmation,
  offeredCategories,
  parseTransferFile,
  splitBatches,
  sumPlans,
} from './helpers';

const page = (category: TransferPage['category'], items: object[]): TransferPage => ({
  format_version: 1,
  integration_version: '1.1.0',
  category,
  total: items.length,
  items,
});

describe('offeredCategories', () => {
  it('offers groups only with MQTT', () => {
    expect(offeredCategories(false)).toEqual(['devices', 'templates', 'schedules', 'scenarios']);
    expect(offeredCategories(true)).toContain('groups');
  });
});

describe('exportFileName', () => {
  it('names the file after the local date and time', () => {
    expect(exportFileName(new Date(2026, 9, 30, 7, 5))).toBe('tdc-export-20261030-0705.json');
  });
});

describe('buildTransferFile', () => {
  it('joins the pages of a category and leaves out the others', () => {
    const file = buildTransferFile(
      { devices: [page('devices', [{ name: 'A' }]), page('devices', [{ name: 'B' }])] },
      '2026-10-30T07:00:00Z',
    );
    expect(file.format_version).toBe(1);
    expect(file.integration_version).toBe('1.1.0');
    expect(file.devices).toEqual([{ name: 'A' }, { name: 'B' }]);
    expect('schedules' in file).toBe(false);
  });

  it('writes an empty chosen category as an empty list', () => {
    const file = buildTransferFile({ scenarios: [page('scenarios', [])] }, 'x');
    expect(file.scenarios).toEqual([]);
  });
});

describe('parseTransferFile', () => {
  const file = (extra: object = {}): string =>
    JSON.stringify({
      format_version: 1,
      integration_version: '1.1.0',
      exported_at: 'x',
      devices: [{ name: 'A' }],
      ...extra,
    });

  it('reads a good file', () => {
    expect('file' in parseTransferFile(file(), 1000)).toBe(true);
  });

  it('refuses text that is not a file of ours', () => {
    expect(parseTransferFile('nope', 1000)).toEqual({ error: 'trfBadFile' });
    expect(parseTransferFile('[]', 1000)).toEqual({ error: 'trfBadFile' });
    expect(parseTransferFile('{"format_version":1}', 1000)).toEqual({ error: 'trfBadFile' });
  });

  it('refuses a file that is too large or newer', () => {
    expect(parseTransferFile(file(), 5)).toMatchObject({ error: 'trfTooBig' });
    expect(parseTransferFile(file({ format_version: 2 }), 1000)).toEqual({ error: 'trfNewer' });
  });

  it('refuses two entries of one name in a category', () => {
    const result = parseTransferFile(file({ devices: [{ name: 'A' }, { name: 'A' }] }), 1000);
    expect(result).toEqual({ error: 'trfDuplicate', values: { category: 'devices', name: 'A' } });
  });
});

describe('knownNames', () => {
  it('lists the names of the chosen categories only', () => {
    const file = {
      format_version: 1,
      integration_version: '',
      exported_at: '',
      devices: [{ name: 'Lamp' }],
      templates: [{ id: 'mine' }],
    };
    expect(knownNames(file, ['devices'])).toEqual({
      devices: ['Lamp'],
      templates: [],
      scenarios: [],
    });
  });
});

describe('splitBatches', () => {
  it('splits by count and by size and keeps the order', () => {
    const items = [{ a: 1 }, { a: 2 }, { a: 3 }];
    expect(splitBatches(items, 2, 1000)).toEqual([[{ a: 1 }, { a: 2 }], [{ a: 3 }]]);
    expect(splitBatches(items, 10, 10)).toEqual([[{ a: 1 }], [{ a: 2 }], [{ a: 3 }]]);
    expect(splitBatches([], 2, 10)).toEqual([]);
  });
});

describe('sumPlans', () => {
  const plan = (create: number, update = 0, delete_ = 0): ImportPlan => ({
    category: 'devices',
    mode: 'sync',
    create,
    update,
    skip: 1,
    conflict: 0,
    delete: delete_,
    problems: [{ name: 'x', code: 'c', reason: 'r' }],
  });

  it('adds counts and joins problems', () => {
    const total = sumPlans([plan(1), plan(2, 3)]);
    expect([total.create, total.update, total.skip, total.problems.length]).toEqual([3, 3, 2, 2]);
  });

  it('asks for confirmation only when something is changed or removed', () => {
    expect(needsConfirmation([plan(5)])).toBe(false);
    expect(needsConfirmation([plan(5, 1)])).toBe(true);
    expect(needsConfirmation([plan(0, 0, 2)])).toBe(true);
  });
});
