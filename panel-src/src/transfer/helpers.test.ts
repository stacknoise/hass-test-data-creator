import { describe, expect, it } from 'vitest';
import type { TransferPage } from '../common/types';
import { buildTransferFile, exportFileName, offeredCategories } from './helpers';

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
