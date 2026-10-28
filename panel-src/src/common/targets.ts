import { sortedByLabel, templateLabel } from './labels';
import type { DeviceInfo, TemplateInfo } from './types';

/** The kinds of target that need an id: one device, a template, or one creation (a run). */
export type TargetKind = 'template' | 'device' | 'run';

/** One entry of a target select. */
export interface TargetOption {
  value: string;
  label: string;
}

/** The devices that one creation job made. */
export interface Run {
  id: string;
  created: number;
  count: number;
  template: string;
  model: string;
}

/** Return the creations that the devices come from, each with its first creation time and count. */
export function runsOf(devices: DeviceInfo[]): Run[] {
  const runs = new Map<string, Run>();
  for (const device of devices) {
    const run = runs.get(device.run_id);
    if (run) {
      run.count += 1;
      run.created = Math.min(run.created, device.created_at);
    } else {
      runs.set(device.run_id, {
        id: device.run_id,
        created: device.created_at,
        count: 1,
        template: device.template,
        model: device.model,
      });
    }
  }
  return [...runs.values()];
}

/** Return seconds since 1970 as local `YYYY-MM-DD HH:mm`, so that texts sort by time. */
export function formatCreated(seconds: number): string {
  const date = new Date(seconds * 1000);
  const two = (n: number): string => String(n).padStart(2, '0');
  const day = `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())}`;
  return `${day} ${two(date.getHours())}:${two(date.getMinutes())}`;
}

/** Return the text of a creation: when, with which template, and how many devices. */
export function runLabel(
  run: Run,
  lang: string | undefined,
  countText: (count: number) => string,
): string {
  return `${formatCreated(run.created)} · ${templateLabel(lang, run.template, run.model)} · ${countText(run.count)}`;
}

/** Return the options of a target select, sorted by their text. */
export function targetOptions(
  kind: TargetKind,
  devices: DeviceInfo[],
  templates: TemplateInfo[],
  lang: string | undefined,
  countText: (count: number) => string,
): TargetOption[] {
  const options: TargetOption[] =
    kind === 'device'
      ? devices.map((d) => ({ value: d.id, label: d.name }))
      : kind === 'template'
        ? templates.map((t) => ({ value: t.id, label: templateLabel(lang, t.id, t.name) }))
        : runsOf(devices).map((r) => ({ value: r.id, label: runLabel(r, lang, countText) }));
  return sortedByLabel(lang, options, (option) => option.label);
}

/** Return the text of a target for a list; an id that no longer exists is shown as it is. */
export function targetName(
  kind: TargetKind,
  id: string,
  devices: DeviceInfo[],
  templates: TemplateInfo[],
  lang: string | undefined,
  countText: (count: number) => string,
): string {
  if (kind === 'device') return devices.find((d) => d.id === id || d.name === id)?.name ?? id;
  const found = targetOptions(kind, devices, templates, lang, countText).find(
    (option) => option.value === id,
  );
  return found?.label ?? id;
}

/** Return the id that a stored value stands for: devices may be stored by name. */
export function resolveTargetId(kind: TargetKind, value: string, devices: DeviceInfo[]): string {
  if (kind !== 'device') return value;
  return devices.find((d) => d.id === value || d.name === value)?.id ?? value;
}
