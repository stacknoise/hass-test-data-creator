import { html, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { TdcElement } from '../common/base';
import type { TextKey } from '../common/i18n';
import { labelOf, sortedByLabel } from '../common/labels';
import type { SignalDef } from '../common/types';
import {
  CSV_SHAPE,
  fieldsFor,
  isDiscrete,
  textFieldsFor,
  textOf,
  withField,
  withShape,
  withText,
  type SignalField,
  type TextField,
} from './editor-helpers';
import './signal-preview';
import { FIELD_SHAPE } from '../common/constants';

const FIELD_LABELS: Record<SignalField | 'min' | 'max' | 'decimals', TextKey> = {
  min: 'edMin',
  max: 'edMax',
  decimals: 'edDecimals',
  period_s: 'edPeriod',
  interval_s: 'edInterval',
  phase: 'edPhase',
  rate_per_hour: 'edRate',
  step_s: 'edStep',
  noise: 'edNoise',
};
const TEXT_LABELS: Record<TextField, TextKey> = {
  values: 'edValues',
  weights: 'edWeights',
  states: 'edStates',
};

/** Edits the signal block of a sensor: the shape and its parameters, with a live preview. */
@customElement('tdc-curve-editor')
export class CurveEditor extends TdcElement {
  @property({ attribute: false }) signal!: SignalDef;
  @property({ attribute: false }) shapes: string[] = [];
  @property() unit = '';

  @state() private files: string[] = [];

  /** Ask the backend which replay files there are. */
  override connectedCallback(): void {
    super.connectedCallback();
    void this.api
      .info()
      .then((info) => (this.files = info.csv_files ?? []))
      .catch(() => undefined);
  }

  /** Tell the parent about the changed signal. */
  private emit(signal: SignalDef): void {
    this.dispatchEvent(new CustomEvent('tdc-signal-change', { detail: signal }));
  }

  /** Render the number input of one parameter. */
  private numberField(field: SignalField | 'min' | 'max' | 'decimals'): TemplateResult {
    return html`<label style="flex: 1 1 120px"
      >${this.tr(FIELD_LABELS[field])}
      <input
        type="number"
        step="any"
        .value=${this.signal[field] === undefined ? '' : String(this.signal[field])}
        @input=${(e: Event) =>
          this.emit(withField(this.signal, field, (e.target as HTMLInputElement).value))}
      />
    </label>`;
  }

  /** Render the one-line text input of a list parameter. */
  private listField(field: TextField): TemplateResult {
    return this.textField(
      this.tr(TEXT_LABELS[field]),
      textOf(this.signal, field),
      (text) => this.emit(withText(this.signal, field, text)),
      { flex: '1 1 240px' },
    );
  }

  /** Take another shape; a replay starts with the first file there is. */
  private changeShape(shape: string): void {
    const next = withShape(this.signal, shape);
    this.emit(
      shape === CSV_SHAPE && !next.file && this.files[0] ? { ...next, file: this.files[0] } : next,
    );
  }

  /** Render the select of the replay file. */
  private renderFile(): TemplateResult {
    const names = this.files.includes(this.signal.file ?? '')
      ? this.files
      : [...(this.signal.file ? [this.signal.file] : []), ...this.files];
    return html`<label style="flex: 1 1 240px"
      >${this.tr('edFile')}
      <select
        ?disabled=${names.length === 0}
        @change=${(e: Event) =>
          this.emit({ ...this.signal, file: (e.target as HTMLSelectElement).value })}
      >
        ${names.length === 0 ? html`<option>${this.tr('edNoFile')}</option>` : ''}
        ${names.map(
          (name) =>
            html`<option value=${name} ?selected=${name === this.signal.file}>${name}</option>`,
        )}
      </select>
      <small>${this.tr('edFileHint')}</small>
    </label>`;
  }

  /** Render the element. */
  override render(): TemplateResult {
    return html`
      <div class="row form">
        <label style="flex: 1 1 180px"
          >${this.tr('edShape')}
          <select @change=${(e: Event) => this.changeShape((e.target as HTMLSelectElement).value)}>
            ${sortedByLabel(this.hass?.language, this.shapes, (s) =>
              labelOf(this.hass?.language, FIELD_SHAPE, s),
            ).map(
              (shape) =>
                html`<option value=${shape} ?selected=${shape === this.signal.shape}>
                  ${labelOf(this.hass?.language, FIELD_SHAPE, shape)}
                </option>`,
            )}
          </select>
        </label>
        ${
          isDiscrete(this.signal.shape)
            ? ''
            : html`${this.numberField('min')} ${this.numberField('max')}
              ${this.numberField('decimals')}`
        }
      </div>
      <div class="row form">
        ${this.signal.shape === CSV_SHAPE ? this.renderFile() : ''}
        ${fieldsFor(this.signal.shape).map((field) => this.numberField(field))}
        ${textFieldsFor(this.signal.shape).map((field) => this.listField(field))}
      </div>
      ${
        this.signal.shape === CSV_SHAPE
          ? html`<small>${this.tr('edCsvPreview')}</small>`
          : html`<tdc-signal-preview .signal=${this.signal} unit=${this.unit}></tdc-signal-preview>`
      }
    `;
  }
}
