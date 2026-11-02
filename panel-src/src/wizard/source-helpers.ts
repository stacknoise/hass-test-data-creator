import type {
  EntityDef,
  SourceDeviation,
  SourceEntityInfo,
  SourceProposal,
  SourceRequest,
} from '../common/types';

/** The platforms whose entities can follow an entity of a source. */
export const FOLLOWABLE = ['sensor', 'binary_sensor', 'switch', 'light'];

/** The settings of the deviation as the form holds them: percent for the shares. */
export interface DeviationForm {
  offset: number;
  scalePercent: number;
  noisePercent: number;
  lagSeconds: number;
  dropoutPercent: number;
  decimals: number | null;
}

/** The form without any deviation. */
export const NO_DEVIATION: DeviationForm = {
  offset: 0,
  scalePercent: 0,
  noisePercent: 0,
  lagSeconds: 0,
  dropoutPercent: 0,
  decimals: null,
};

/** Return the entities of a template that can follow a source. */
export function followable(entities: EntityDef[]): EntityDef[] {
  return entities.filter((entity) => FOLLOWABLE.includes(entity.platform));
}

/** Return the request fields of the form: shares as fractions, switched-off parts left out. */
export function deviationRequest(form: DeviationForm): SourceDeviation {
  const request: SourceDeviation = {
    offset: form.offset,
    scale: form.scalePercent / 100,
    noise: form.noisePercent / 100,
    lag_s: form.lagSeconds,
    dropout: form.dropoutPercent / 100,
    ...(form.decimals === null ? {} : { decimals: form.decimals }),
  };
  return Object.fromEntries(
    Object.entries(request).filter(([key, value]) => key === 'decimals' || value !== 0),
  ) as SourceDeviation;
}

/** Return the source entities that an entity of the copy can follow: the same platform and class. */
export function candidates(target: EntityDef, entities: SourceEntityInfo[]): SourceEntityInfo[] {
  return entities.filter(
    (item) =>
      item.platform === target.platform &&
      (item.device_class ?? null) === (target.device_class ?? null),
  );
}

/** Return the mapping that the proposal found: entity key to source entity. */
export function mappingFromProposal(
  proposal: SourceProposal[] | undefined,
): Record<string, string> {
  return Object.fromEntries(
    (proposal ?? []).flatMap((item) => (item.entity_id ? [[item.key, item.entity_id]] : [])),
  );
}

/** Return `mapping` with `key` set to `entityId`, or removed for an empty id. */
export function withMapping(
  mapping: Record<string, string>,
  key: string,
  entityId: string,
): Record<string, string> {
  const rest = Object.fromEntries(Object.entries(mapping).filter(([name]) => name !== key));
  return entityId ? { ...rest, [key]: entityId } : rest;
}

/** Return the source of a job, or nothing while no device is chosen or nothing is mapped. */
export function sourceRequest(
  deviceId: string,
  mapping: Record<string, string>,
  form: DeviationForm,
): SourceRequest | null {
  if (!deviceId || Object.keys(mapping).length === 0) return null;
  return { device_id: deviceId, mapping, deviation: deviationRequest(form) };
}

/** Return the first mapped sensor of the copy, whose values the preview shows. */
export function previewKey(entities: EntityDef[], mapping: Record<string, string>): string {
  return followable(entities).find((e) => e.platform === 'sensor' && mapping[e.key])?.key ?? '';
}
