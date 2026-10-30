import { html, type TemplateResult } from 'lit';
import '../common/multi-select';
import type { Hass } from '../common/types';

/** Render the field that picks an existing area or adds a new one; `change` gets the name or ''. */
export function areaPicker(
  hass: Hass,
  areas: string[],
  value: string,
  labels: { field: string; none: string },
  change: (area: string) => void,
): TemplateResult {
  return html`<tdc-multi-select
    .hass=${hass}
    .items=${areas.map((name) => ({ value: name, label: name }))}
    .selected=${value ? [value] : []}
    single
    allowAdd
    empty=${labels.none}
    aria-label=${labels.field}
    @tdc-select-change=${(e: CustomEvent<string[]>) => change(e.detail[0] ?? '')}
  ></tdc-multi-select>`;
}
