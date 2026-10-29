import type { DeviceInfo } from '../common/types';
import { isDiscrete } from '../signals/editor-helpers';
import { PLATFORM_SENSOR } from '../common/constants';

/** The fewest days of history that can be imported. */
export const MIN_DAYS = 1;
/** The most days of history that can be imported; it matches the backend limit. */
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

/** Return the sensors that every chosen device has (or every device, if none is chosen). */
export function sensorEntities(devices: DeviceInfo[], deviceIds: string[]): Sensor[] {
  const chosen = deviceIds.length
    ? devices.filter((device) => deviceIds.includes(device.id))
    : devices;
  const perDevice = chosen.map((device) => {
    const sensors = new Map<string, Sensor>();
    for (const entity of device.entities) {
      const shape = entity.signal?.shape;
      if (
        entity.platform === PLATFORM_SENSOR &&
        entity.state_class &&
        shape &&
        !isDiscrete(shape)
      ) {
        sensors.set(entity.key, { key: entity.key, name: entity.name });
      }
    }
    return sensors;
  });
  const [first, ...others] = perDevice;
  if (!first) return [];
  return [...first.values()].filter((sensor) => others.every((sensors) => sensors.has(sensor.key)));
}
