import { html, nothing, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { describeError } from '../common/api';
import { TdcElement } from '../common/base';
import type { TextKey } from '../common/i18n';
import type { EntityDef, SourceDevice, SourceEntityInfo, SourcePreview } from '../common/types';
import {
  NO_DEVIATION,
  candidates,
  deviationRequest,
  followable,
  mappingFromProposal,
  previewKey,
  sourceRequest,
  withMapping,
  type DeviationForm,
} from './source-helpers';

/** How long the search waits after the last key before it asks the backend. */
const SEARCH_DELAY_MS = 300;
const CUSTOM = 'custom';

/** The number fields of the deviation: the form key, its label and the step of the input. */
const FIELDS: { key: keyof DeviationForm; label: TextKey; step: string }[] = [
  { key: 'offset', label: 'sourceOffset', step: '0.1' },
  { key: 'scalePercent', label: 'sourceScale', step: '0.5' },
  { key: 'noisePercent', label: 'sourceNoise', step: '0.5' },
  { key: 'lagSeconds', label: 'sourceLag', step: '1' },
  { key: 'dropoutPercent', label: 'sourceDropout', step: '1' },
];

/** The optional step of the creation wizard: follow a real device and deviate by the seed. */
@customElement('tdc-source-step')
export class SourceStep extends TdcElement {
  @property({ attribute: false }) entities: EntityDef[] = [];
  @property() template = '';
  @property() seed = '';

  @state() private query = '';
  @state() private found: SourceDevice[] = [];
  @state() private device?: SourceDevice;
  @state() private sourceEntities: SourceEntityInfo[] = [];
  @state() private mapping: Record<string, string> = {};
  @state() private form: DeviationForm = NO_DEVIATION;
  @state() private preview?: SourcePreview;
  @state() private error = '';

  private timer?: number;

  /** Stop a search that is still waiting. */
  override disconnectedCallback(): void {
    window.clearTimeout(this.timer);
    super.disconnectedCallback();
  }

  /** Read the mapping proposal again when the template changes under a chosen device. */
  protected override updated(changed: Map<string, unknown>): void {
    if (changed.has('template') && this.device && changed.get('template') !== undefined) {
      void this.choose(this.device);
    }
  }

  /** Tell the wizard the source as it stands now. */
  private report(): void {
    const request = sourceRequest(this.device?.id ?? '', this.mapping, this.form);
    this.dispatchEvent(new CustomEvent('tdc-source-change', { detail: request }));
  }

  /** Offer the devices to choose from when the step is added to the page. */
  override connectedCallback(): void {
    super.connectedCallback();
    void this.search();
  }

  /** Ask the backend for the devices that match the query. */
  private async search(): Promise<void> {
    try {
      this.found = await this.api.sourcesList(this.query.trim());
      this.error = '';
    } catch (err) {
      this.error = describeError(err);
    }
  }

  /** Search after a pause in typing. */
  private typing(value: string): void {
    this.query = value;
    window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => void this.search(), SEARCH_DELAY_MS);
  }

  /** Take a device as the source and read its entities and the mapping proposal. */
  private async choose(device: SourceDevice): Promise<void> {
    try {
      const template = this.template && this.template !== CUSTOM ? this.template : undefined;
      const reply = await this.api.sourcesInspect(device.id, template);
      this.device = device;
      this.sourceEntities = reply.entities;
      this.mapping = mappingFromProposal(reply.proposal);
      this.preview = undefined;
      this.error = '';
    } catch (err) {
      this.error = describeError(err);
    }
    this.report();
  }

  /** Go back to the search. */
  private change(): void {
    this.device = undefined;
    this.mapping = {};
    this.preview = undefined;
    this.report();
  }

  /** Map an entity of the copy to a source entity, or none. */
  private map(key: string, entityId: string): void {
    this.mapping = withMapping(this.mapping, key, entityId);
    this.preview = undefined;
    this.report();
  }

  /** Change one number of the deviation. */
  private setNumber(key: keyof DeviationForm, value: string): void {
    this.form = { ...this.form, [key]: Number(value) || 0 };
    this.preview = undefined;
    this.report();
  }

  /** Change the decimals; an empty field keeps the full precision. */
  private setDecimals(value: string): void {
    this.form = { ...this.form, decimals: value === '' ? null : Number(value) };
    this.preview = undefined;
    this.report();
  }

  /** Show what five copies would show now, without creating anything. */
  private async runPreview(): Promise<void> {
    const key = previewKey(this.entities, this.mapping);
    if (!key) return;
    try {
      this.preview = await this.api.sourcesPreview(
        this.mapping[key],
        key,
        deviationRequest(this.form),
        { seed: this.seed, template: this.template },
      );
      this.error = '';
    } catch (err) {
      this.error = describeError(err);
    }
  }

  /** Render the search: a field and the devices that were found. */
  private renderSearch(): TemplateResult {
    return html`<div class="fields">
        ${this.textField(this.tr('sourceSearch'), this.query, (v) => this.typing(v))}
      </div>
      ${
        this.found.length === 0
          ? html`<p><small>${this.tr('sourceNoMatch')}</small></p>`
          : html`<ul>
              ${this.found.map(
                (device) =>
                  html`<li>
                    <button @click=${() => void this.choose(device)}>${device.name}</button>
                    <small>${[device.manufacturer, device.model].filter(Boolean).join(' ')}</small>
                  </li>`,
              )}
            </ul>`
      }`;
  }

  /** Render the select of one row of the mapping. */
  private renderRow(entity: EntityDef): TemplateResult {
    const options = candidates(entity, this.sourceEntities);
    const chosen = this.sourceEntities.find((e) => e.entity_id === this.mapping[entity.key]);
    return html`<tr>
      <td>${entity.name}</td>
      <td>
        <select
          @change=${(e: Event) => this.map(entity.key, (e.target as HTMLSelectElement).value)}
        >
          <option value="">${this.tr('sourceNone')}</option>
          ${options.map(
            (o) =>
              html`<option value=${o.entity_id} ?selected=${o.entity_id === chosen?.entity_id}>
                ${o.name}
              </option>`,
          )}
        </select>
      </td>
      <td>${chosen ? `${chosen.state ?? '–'} ${chosen.unit ?? ''}` : ''}</td>
    </tr>`;
  }

  /** Render the mapping table. */
  private renderMapping(): TemplateResult {
    return html`<table>
      <thead>
        <tr>
          <th>${this.tr('detEntity')}</th>
          <th>${this.tr('sourceColSource')}</th>
          <th>${this.tr('sourceColValue')}</th>
        </tr>
      </thead>
      <tbody>
        ${followable(this.entities).map((entity) => this.renderRow(entity))}
      </tbody>
    </table>`;
  }

  /** Render the fields of the deviation and the preview. */
  private renderDeviation(): TemplateResult {
    return html`<div class="fields">
        ${FIELDS.map(
          (field) =>
            html`<label
              >${this.tr(field.label)}
              <input
                type="number"
                min="0"
                step=${field.step}
                .value=${String(this.form[field.key] ?? 0)}
                @input=${(e: Event) => this.setNumber(field.key, (e.target as HTMLInputElement).value)}
              />
            </label>`,
        )}
        <label
          >${this.tr('sourceDecimals')}
          <input
            type="number"
            min="0"
            max="6"
            .value=${this.form.decimals === null ? '' : String(this.form.decimals)}
            @input=${(e: Event) => this.setDecimals((e.target as HTMLInputElement).value)}
          />
        </label>
      </div>
      <p class="row">
        <button
          ?disabled=${!previewKey(this.entities, this.mapping)}
          @click=${() => void this.runPreview()}
        >
          ${this.tr('sourcePreview')}
        </button>
        ${
          this.preview
            ? html`<small
                >${this.tr('sourceNow', {
                  value: this.preview.source,
                  unit: this.preview.unit ?? '',
                })}:
                ${this.preview.copies.map((c) => c.value).join(' · ')}</small
              >`
            : nothing
        }
      </p>`;
  }

  /** Render the element. */
  override render(): TemplateResult {
    return html`<fieldset>
      <legend>${this.tr('colSource')}</legend>
      ${
        this.device
          ? html`<p>
                ${this.tr('sourceChosen', { name: this.device.name })}
                <button @click=${() => this.change()}>${this.tr('sourceChange')}</button>
              </p>
              ${this.renderMapping()} ${this.renderDeviation()}`
          : this.renderSearch()
      }
      <span class="error">${this.error}</span>
    </fieldset>`;
  }
}
