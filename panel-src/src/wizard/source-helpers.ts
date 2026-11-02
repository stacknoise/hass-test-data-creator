import type { EntityDef, SourceDerived, SourceDeviation, SourceRequest } from '../common/types';

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

/** Return `mapping` without the entities whose key is not in `included`. */
export function includedMapping(
  mapping: Record<string, string>,
  included: ReadonlySet<string>,
): Record<string, string> {
  return Object.fromEntries(Object.entries(mapping).filter(([key]) => included.has(key)));
}

/** Return `included` with `key` added or removed. */
export function toggled(included: ReadonlySet<string>, key: string, on: boolean): Set<string> {
  const next = new Set(included);
  if (on) next.add(key);
  else next.delete(key);
  return next;
}

/** What the source step hands to the wizard: the source and the entities of the copy. */
export interface SourceChoice {
  source: SourceRequest;
  entities: EntityDef[];
}

/** Return the choice for the entities that are taken in, or nothing while there are none. */
export function sourceChoice(
  deviceId: string,
  derived: SourceDerived,
  included: ReadonlySet<string>,
  form: DeviationForm,
): SourceChoice | null {
  const mapping = includedMapping(derived.mapping, included);
  if (!deviceId || Object.keys(mapping).length === 0) return null;
  return {
    source: { device_id: deviceId, mapping, deviation: deviationRequest(form) },
    entities: derived.entities.filter((entity) => included.has(entity.key)),
  };
}

/** Return the key of the first mapped sensor of the copy, whose values the preview shows. */
export function previewKey(entities: EntityDef[], mapping: Record<string, string>): string {
  return entities.find((e) => e.platform === 'sensor' && mapping[e.key])?.key ?? '';
}
