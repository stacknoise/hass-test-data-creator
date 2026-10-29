import type { TextKey } from '../common/i18n';
import type { EntityDef } from '../common/types';
import { DEFAULT_MAX } from '../signals/signals';

const PLATFORMS_WITH_SIGNAL = ['sensor', 'climate'];
const PLATFORM_EVENT = 'event';
const KEY_PATTERN = /^[a-z0-9]+(_[a-z0-9]+)*$/;

/** Return `name` as a key for the backend: lower case words joined by underscores. */
export function keyOf(name: string): string {
  return name
    .replace(/ß/g, 'ss')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/** Return whether entities of `platform` need a curve. */
export function hasSignal(platform: string): boolean {
  return PLATFORMS_WITH_SIGNAL.includes(platform);
}

/** Return `entity` moved to `platform`: it gets the parts the platform needs and loses the others. */
export function withPlatform(entity: EntityDef, platform: string): EntityDef {
  const { signal, unit, event_types: eventTypes, ...rest } = entity;
  const next: EntityDef = { ...rest, platform };
  if (hasSignal(platform)) {
    next.signal = signal ?? { shape: 'sine', min: 0, max: DEFAULT_MAX };
    if (platform === 'sensor' && unit) next.unit = unit;
  }
  if (platform === PLATFORM_EVENT) next.event_types = eventTypes ?? ['press'];
  return next;
}

/** Return a new entity of `platform`. */
export function newEntity(platform: string): EntityDef {
  return withPlatform({ key: '', platform, name: '' }, platform);
}

/** Return the text key of the first problem with `entity`, or an empty string when it is usable. */
export function entityProblem(entity: EntityDef, otherKeys: string[]): TextKey | '' {
  if (!entity.name.trim()) return 'entNameEmpty';
  if (!KEY_PATTERN.test(entity.key)) return 'entKeyInvalid';
  if (otherKeys.includes(entity.key)) return 'entKeyTaken';
  if (entity.platform === PLATFORM_EVENT && !entity.event_types?.length) return 'entEventTypes';
  return '';
}

/** Return `list` with the item at `index` replaced, or with `item` added when `index` is -1. */
export function withItem<T>(list: T[], index: number, item: T): T[] {
  return index < 0 ? [...list, item] : list.map((old, i) => (i === index ? item : old));
}

/** Return `list` without the item at `index`. */
export function withoutItem<T>(list: T[], index: number): T[] {
  return list.filter((_, i) => i !== index);
}
