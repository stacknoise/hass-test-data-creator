import { describe, expect, it } from 'vitest';
import { formatCreated, resolveTargetId, runsOf, targetName, targetOptions } from './targets';
import type { DeviceInfo, TemplateInfo } from './types';

const device = (id: string, name: string, run: string, created: number): DeviceInfo =>
  ({
    id,
    name,
    run_id: run,
    created_at: created,
    template: 'plug_metering',
    model: 'Plug (metering)',
  }) as DeviceInfo;

const DEVICES = [
  device('d2', 'Plug 02', 'r1', 1_800_000_100),
  device('d1', 'Plug 01', 'r1', 1_800_000_000),
  device('d3', 'Lamp 01', 'r2', 1_800_100_000),
];
const TEMPLATES = [
  { id: 'plug_metering', name: 'Plug with metering' },
  { id: 'my_own', name: 'Zebra' },
] as TemplateInfo[];
const COUNT = (n: number): string => `${n} devices`;

describe('runsOf', () => {
  it('groups the devices by creation with the first time and the count', () => {
    const runs = runsOf(DEVICES);
    expect(runs.map((r) => [r.id, r.count, r.created])).toEqual([
      ['r1', 2, 1_800_000_000],
      ['r2', 1, 1_800_100_000],
    ]);
  });
});

describe('formatCreated', () => {
  it('writes a local date and time that sorts by time', () => {
    const early = formatCreated(1_800_000_000);
    expect(early).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
    expect(early < formatCreated(1_800_100_000)).toBe(true);
  });
});

describe('targetOptions', () => {
  it('lists devices by name, sorted', () => {
    expect(targetOptions('device', DEVICES, TEMPLATES, 'en', COUNT)).toEqual([
      { value: 'd3', label: 'Lamp 01' },
      { value: 'd1', label: 'Plug 01' },
      { value: 'd2', label: 'Plug 02' },
    ]);
  });

  it('translates bundled templates and keeps the name of the others', () => {
    expect(targetOptions('template', [], TEMPLATES, 'de', COUNT)).toEqual([
      { value: 'plug_metering', label: 'Steckdose mit Messung' },
      { value: 'my_own', label: 'Zebra' },
    ]);
  });

  it('describes a creation by time, template and count', () => {
    const [first] = targetOptions('run', DEVICES, TEMPLATES, 'de', COUNT);
    expect(first.value).toBe('r1');
    expect(first.label).toContain('Steckdose mit Messung · 2 devices');
  });
});

describe('targetName and resolveTargetId', () => {
  it('shows names, and the id of what is gone', () => {
    expect(targetName('device', 'd1', DEVICES, TEMPLATES, 'en', COUNT)).toBe('Plug 01');
    expect(targetName('device', 'Plug 02', DEVICES, TEMPLATES, 'en', COUNT)).toBe('Plug 02');
    expect(targetName('device', 'gone', DEVICES, TEMPLATES, 'en', COUNT)).toBe('gone');
    expect(targetName('template', 'my_own', DEVICES, TEMPLATES, 'en', COUNT)).toBe('Zebra');
  });

  it('turns a device name into its id', () => {
    expect(resolveTargetId('device', 'Plug 01', DEVICES)).toBe('d1');
    expect(resolveTargetId('device', 'gone', DEVICES)).toBe('gone');
    expect(resolveTargetId('template', 'my_own', DEVICES)).toBe('my_own');
  });
});
