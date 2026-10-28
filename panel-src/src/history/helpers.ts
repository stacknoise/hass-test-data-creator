import type { DeviceInfo } from '../common/types';
import { isDiscrete } from '../signals/editor-helpers';

export const MIN_DAYS = 1;
export const MAX_DAYS = 365;

/** Returns `days` as a whole number inside the allowed range; anything else becomes the minimum. */
export function clampDays(days: number): number {
  return Math.min(MAX_DAYS, Math.max(MIN_DAYS, Math.round(days) || MIN_DAYS));
}

/** A sensor that statistics can be written for: its key and the name it has. */
export interface Sensor {
  key: string;
  name: string;
}

/** Return the sensors with a number curve and a state class (statistics need one) of the chosen devices, or of all devices if none is chosen. */
export function sensorEntities(devices: DeviceInfo[], deviceIds: string[]): Sensor[] {
  const chosen = deviceIds.length
    ? devices.filter((device) => deviceIds.includes(device.id))
    : devices;
  const found = new Map<string, Sensor>();
  for (const device of chosen) {
    for (const entity of device.entities) {
      const shape = entity.signal?.shape;
      const fits =
        entity.platform === 'sensor' && entity.state_class && shape && !isDiscrete(shape);
      if (fits && !found.has(entity.key)) {
        found.set(entity.key, { key: entity.key, name: entity.name });
      }
    }
  }
  return [...found.values()];
}
