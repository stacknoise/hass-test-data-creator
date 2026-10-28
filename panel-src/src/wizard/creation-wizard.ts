import { html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { describeError } from '../common/api';
import { TdcElement } from '../common/base';
import type { CreateRequest, EntityDef, Info, SignalDef, TemplateInfo } from '../common/types';
import { editableSensors, withSignal } from '../signals/editor-helpers';
import '../signals/curve-editor';
import '../signals/signal-preview';
import { parseAreas, stateRate } from './helpers';

const CUSTOM = 'custom';
const RATE_WARNING = 50;
const SAMPLE_ENTITIES = JSON.stringify(
  [
    {
      key: 'level',
      platform: 'sensor',
      name: 'Level',
      unit: '%',
      signal: { shape: 'sine', min: 0, max: 100 },
    },
  ],
  null,
  2,
);

/** The wizard that creates many devices from a template or from custom entities. */
@customElement('tdc-creation-wizard')
export class CreationWizard extends TdcElement {
  @state() private info?: Info;
  @state() private templates: TemplateInfo[] = [];
  @state() private template = '';
  @state() private count = 10;
  @state() private pattern = '{template} {nn}';
  @state() private areas = '';
  @state() private mode: 'even' | 'random' = 'even';
  @state() private seed = '';
  @state() private output = 'native';
  @state() private custom = SAMPLE_ENTITIES;
  @state() private editIndex = -1;
  @state() private busy = false;
  @state() private message = '';
  @state() private error = '';

  /** Load the data when the element is added to the page. */
  override async connectedCallback(): Promise<void> {
    super.connectedCallback();
    try {
      [this.info, this.templates] = await Promise.all([this.api.info(), this.api.templates()]);
      this.template = this.templates[0]?.id ?? CUSTOM;
    } catch (err) {
      this.error = describeError(err);
    }
  }

  /** Return the entity definitions of the selected template, or the parsed custom ones. */
  private entities(): EntityDef[] {
    if (this.template === CUSTOM) {
      try {
        return JSON.parse(this.custom) as EntityDef[];
      } catch {
        return [];
      }
    }
    return this.templates.find((t) => t.id === this.template)?.entities ?? [];
  }

  /** Write a signal changed in the curve editor back into the JSON of the custom entities. */
  private changeSignal(index: number, event: CustomEvent<SignalDef>): void {
    this.custom = withSignal(this.custom, index, event.detail);
  }

  /** Render the curve editor for one sensor of the custom entities. */
  private renderEditor(): TemplateResult {
    const sensors = editableSensors(this.custom);
    const current = sensors.find((s) => s.index === this.editIndex) ?? sensors[0];
    if (!current) return html``;
    return html`<h3>${this.tr('edSensor')}</h3>
      <p>
        <select
          @change=${(e: Event) => (this.editIndex = Number((e.target as HTMLSelectElement).value))}
        >
          ${sensors.map(
            (s) =>
              html`<option value=${s.index} ?selected=${s.index === current.index}>
                ${s.name}
              </option>`,
          )}
        </select>
      </p>
      <tdc-curve-editor
        .hass=${this.hass}
        .signal=${current.signal}
        .shapes=${this.info?.shapes ?? []}
        @tdc-signal-change=${(e: CustomEvent<SignalDef>) => this.changeSignal(current.index, e)}
      ></tdc-curve-editor>`;
  }

  /** Create the devices with the inputs of the form. */
  private async submit(): Promise<void> {
    this.busy = true;
    this.message = '';
    this.error = '';
    const request: CreateRequest = {
      template: this.template,
      count: this.count,
      name_pattern: this.pattern,
      areas: parseAreas(this.areas),
      area_mode: this.mode,
      output: this.output,
      ...(this.seed ? { seed: this.seed } : {}),
      ...(this.template === CUSTOM
        ? { entities: this.entities() as unknown as Record<string, unknown>[] }
        : {}),
    };
    try {
      const run = await this.api.create(request);
      this.message = this.tr('created', { count: run.devices });
    } catch (err) {
      this.error = describeError(err);
    }
    this.busy = false;
  }

  /** Render the estimate of the load and a warning for a high rate. */
  private renderEstimate(): TemplateResult {
    const entities = this.entities();
    const sensors = entities.filter((e) => e.platform === 'sensor').length * this.count;
    const rate = stateRate(sensors, this.info?.tick_seconds ?? 10);
    return html`<p>
      <small>${this.tr('estimate', { entities: entities.length * this.count, rate })}</small>
      ${rate > RATE_WARNING ? html`<br /><span class="warning">${this.tr('rateWarning')}</span>` : ''}
    </p>`;
  }

  /** Render the element. */
  override render(): TemplateResult {
    const sensor = this.entities().find((e) => e.platform === 'sensor' && e.signal);
    return html`
      <div class="row">
        <label style="flex: 1 1 220px"
          >${this.tr('template')}
          <select @change=${(e: Event) => (this.template = (e.target as HTMLSelectElement).value)}>
            ${this.templates.map(
              (t) =>
                html`<option value=${t.id} ?selected=${t.id === this.template}>${t.name}</option>`,
            )}
            <option value=${CUSTOM} ?selected=${this.template === CUSTOM}>
              ${this.tr('customTemplate')}
            </option>
          </select>
        </label>
        <label style="flex: 0 0 100px"
          >${this.tr('count')}
          <input
            type="number"
            min="1"
            .value=${String(this.count)}
            @input=${(e: Event) => (this.count = Number((e.target as HTMLInputElement).value))}
          />
        </label>
      </div>
      <p class="row">
        <label style="flex: 1 1 220px"
          >${this.tr('namePattern')}
          <input
            .value=${this.pattern}
            @input=${(e: Event) => (this.pattern = (e.target as HTMLInputElement).value)}
          />
          <small>${this.tr('namePatternHint')}</small>
        </label>
        <label style="flex: 1 1 220px"
          >${this.tr('areas')}
          <input
            .value=${this.areas}
            @input=${(e: Event) => (this.areas = (e.target as HTMLInputElement).value)}
          />
          <small>${this.tr('areasHint')}</small>
        </label>
        <label style="flex: 0 0 160px"
          >${this.tr('areaMode')}
          <select
            @change=${(e: Event) =>
              (this.mode = (e.target as HTMLSelectElement).value as 'even' | 'random')}
          >
            <option value="even">${this.tr('modeEven')}</option>
            <option value="random">${this.tr('modeRandom')}</option>
          </select>
        </label>
        ${this.select(
          this.tr('colOutput'),
          this.info?.outputs ?? ['native'],
          this.output,
          (output) => this.tr(output === 'mqtt' ? 'outputMqtt' : 'outputNative'),
          (output) => (this.output = output),
        )}
        <label style="flex: 0 0 160px"
          >${this.tr('seed')}
          <input
            .value=${this.seed}
            @input=${(e: Event) => (this.seed = (e.target as HTMLInputElement).value)}
          />
          <small>${this.tr('seedHint')}</small>
        </label>
      </p>
      ${
        this.template === CUSTOM
          ? html`<label
              >${this.tr('customEntities')}
              <textarea
                rows="8"
                .value=${this.custom}
                @input=${(e: Event) => (this.custom = (e.target as HTMLTextAreaElement).value)}
              ></textarea>
            </label>`
          : ''
      }
      ${this.template === CUSTOM ? this.renderEditor() : ''}
      ${
        sensor?.signal && this.template !== CUSTOM
          ? html`<p>
              <small>${this.tr('preview')}</small>
              <tdc-signal-preview
                .signal=${sensor.signal}
                unit=${sensor.unit ?? ''}
              ></tdc-signal-preview>
            </p>`
          : ''
      }
      ${this.renderEstimate()}
      <p class="row">
        <button
          class="primary"
          ?disabled=${this.busy || !this.template}
          @click=${() => void this.submit()}
        >
          ${this.busy ? this.tr('creating') : this.tr('create')}
        </button>
        <span>${this.message}</span>
        <span class="error">${this.error}</span>
      </p>
    `;
  }
}
