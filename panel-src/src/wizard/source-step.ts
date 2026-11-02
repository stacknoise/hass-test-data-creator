import { css, html, nothing, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { describeError } from '../common/api';
import { TdcElement } from '../common/base';
import type { TextKey } from '../common/i18n';
import type {
  EntityDef,
  SourceDerived,
  SourceDevice,
  SourceEntityInfo,
  SourcePreview,
} from '../common/types';
import {
  NO_DEVIATION,
  deviationRequest,
  includedMapping,
  previewKey,
  sourceChoice,
  toggled,
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
  static override styles = [
    TdcElement.styles,
    css`
      table {
        margin-bottom: 16px;
      }
      ul.found {
        max-height: 260px;
        overflow-y: auto;
        margin: 0 0 12px;
      }
    `,
  ];

  @property() seed = '';

  @state() private query = '';
  @state() private found: SourceDevice[] = [];
  @state() private device?: SourceDevice;
  @state() private derived?: SourceDerived;
  @state() private infos: SourceEntityInfo[] = [];
  @state() private included: ReadonlySet<string> = new Set();
  @state() private form: DeviationForm = NO_DEVIATION;
  @state() private preview?: SourcePreview;
  @state() private error = '';

  private timer?: number;

  /** Stop a search that is still waiting. */
  override disconnectedCallback(): void {
    window.clearTimeout(this.timer);
    super.disconnectedCallback();
  }

  /** Tell the wizard the source and the entities as they stand now. */
  private report(): void {
    const choice = this.derived
      ? sourceChoice(this.device?.id ?? '', this.derived, this.included, this.form)
      : null;
    this.dispatchEvent(new CustomEvent('tdc-source-change', { detail: choice }));
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

  /** Take a device as the source and read the entities that its copies get. */
  private async choose(device: SourceDevice): Promise<void> {
    try {
      const [derived, infos] = await Promise.all([
        this.api.sourcesDerive(device.id),
        this.api.sourcesInspect(device.id),
      ]);
      this.device = device;
      this.derived = derived;
      this.infos = infos;
      this.included = new Set(derived.entities.map((entity) => entity.key));
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
    this.derived = undefined;
    this.included = new Set();
    this.preview = undefined;
    this.report();
  }

  /** Take an entity of the copy in or out. */
  private include(key: string, on: boolean): void {
    this.included = toggled(this.included, key, on);
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
    const key = this.previewKey();
    if (!key || !this.derived) return;
    try {
      this.preview = await this.api.sourcesPreview(
        this.derived.mapping[key],
        key,
        deviationRequest(this.form),
        { seed: this.seed, template: CUSTOM },
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
          : html`<ul class="found">
              ${this.found.map(
                (device) =>
                  html`<li>
                    <button
                      ?disabled=${device.usable === 0}
                      @click=${() => void this.choose(device)}
                    >
                      ${device.name}
                    </button>
                    <small
                      >${
                        device.usable === 0
                          ? this.tr('sourceUnusable')
                          : [device.manufacturer, device.model].filter(Boolean).join(' ')
                      }</small
                    >
                  </li>`,
              )}
            </ul>`
      }`;
  }

  /** Return the key of the sensor whose values the preview shows, or an empty text. */
  private previewKey(): string {
    return this.derived
      ? previewKey(this.derived.entities, includedMapping(this.derived.mapping, this.included))
      : '';
  }

  /** Render one entity of the copy: the box to take it in, its name and the entity it follows. */
  private renderRow(entity: EntityDef, derived: SourceDerived): TemplateResult {
    const followed = derived.mapping[entity.key];
    const info = this.infos.find((item) => item.entity_id === followed);
    return html`<tr>
      <td>
        <input
          type="checkbox"
          .checked=${this.included.has(entity.key)}
          @change=${(e: Event) => this.include(entity.key, (e.target as HTMLInputElement).checked)}
        />
      </td>
      <td>${entity.name}</td>
      <td><small>${followed}</small></td>
      <td>${info ? `${info.state ?? '–'} ${info.unit ?? ''}` : ''}</td>
    </tr>`;
  }

  /** Render the entities of the copy; each can be left out. */
  private renderMapping(derived: SourceDerived): TemplateResult {
    return html`<table>
      <thead>
        <tr>
          <th></th>
          <th>${this.tr('detEntity')}</th>
          <th>${this.tr('sourceColSource')}</th>
          <th>${this.tr('sourceColValue')}</th>
        </tr>
      </thead>
      <tbody>
        ${derived.entities.map((entity) => this.renderRow(entity, derived))}
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
        <button ?disabled=${!this.previewKey()} @click=${() => void this.runPreview()}>
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
        this.device && this.derived
          ? html`<p>
                ${this.tr('sourceChosen', { name: this.device.name })}
                <button @click=${() => this.change()}>${this.tr('sourceChange')}</button>
              </p>
              ${this.renderMapping(this.derived)} ${this.renderDeviation()}`
          : this.renderSearch()
      }
      <span class="error">${this.error}</span>
    </fieldset>`;
  }
}
