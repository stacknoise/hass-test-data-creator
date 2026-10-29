import { html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { describeError } from '../common/api';
import { TdcElement } from '../common/base';
import type { TextKey } from '../common/i18n';
import { OUTPUT_LABELS, sortedByLabel, templateLabel } from '../common/labels';
import type { CreateRequest, EntityDef, Info, TemplateInfo } from '../common/types';
import './entity-editor';
import './entity-list';
import '../common/multi-select';
import { knownAreas } from '../devices/helpers';
import { stateRate } from './helpers';
import { KIND_TEMPLATE, PLATFORM_SENSOR } from '../common/constants';

const DEFAULT_COUNT = 10;
const DEFAULT_TICK_S = 10;

const CUSTOM = 'custom';
const RATE_WARNING = 50;
const MODES = ['even', 'random'] as const;
const MODE_LABELS: Record<(typeof MODES)[number], TextKey> = {
  even: 'modeEven',
  random: 'modeRandom',
};
/** The wizard that creates many devices from a template or from custom entities. */
@customElement('tdc-creation-wizard')
export class CreationWizard extends TdcElement {
  @state() private info?: Info;
  @state() private templates: TemplateInfo[] = [];
  @state() private template = '';
  @state() private count = DEFAULT_COUNT;
  @state() private pattern = '{template} {nn}';
  @state() private areas: string[] = [];
  @state() private mode: 'even' | 'random' = 'even';
  @state() private seed = '';
  @state() private output = 'native';
  @state() private custom: EntityDef[] = [];
  @state() private pendingBase = '';
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

  /** Return the entity definitions of the selected template or of the custom device. */
  private entities(): EntityDef[] {
    if (this.template === CUSTOM) return this.custom;
    return this.templates.find((t) => t.id === this.template)?.entities ?? [];
  }

  /** Take over the entities of the template `pendingBase` and drop the custom ones. */
  private applyBase(): void {
    const base = this.templates.find((t) => t.id === this.pendingBase);
    if (base) this.custom = structuredClone(base.entities);
    this.pendingBase = '';
  }

  /** Render the choice of a template as the start of the custom device, with the warning. */
  private renderBase(): TemplateResult {
    const lang = this.hass?.language;
    const base = this.templates.find((t) => t.id === this.pendingBase);
    return html`<div class="row form">
        <label style="flex: 1 1 220px"
          >${this.tr('baseTemplate')}
          <select
            .value=${this.pendingBase}
            @change=${(e: Event) => (this.pendingBase = (e.target as HTMLSelectElement).value)}
          >
            <option value="">${this.tr('baseNone')}</option>
            ${sortedByLabel(lang, this.templates, (t) => templateLabel(lang, t.id, t.name)).map(
              (t) =>
                html`<option value=${t.id} ?selected=${t.id === this.pendingBase}>
                  ${templateLabel(lang, t.id, t.name)}
                </option>`,
            )}
          </select>
        </label>
      </div>
      ${
        base
          ? html`<p class="warning">
              ${this.tr('baseReplace', {
                old: this.custom.length,
                count: base.entities.length,
                name: templateLabel(lang, base.id, base.name),
              })}
              <button class="primary" @click=${() => this.applyBase()}>
                ${this.tr('baseApply')}
              </button>
              <button @click=${() => (this.pendingBase = '')}>${this.tr('detCancel')}</button>
            </p>`
          : ''
      }`;
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
      areas: this.areas,
      area_mode: this.mode,
      output: this.output,
      ...(this.seed ? { seed: this.seed } : {}),
      ...(this.template === CUSTOM
        ? { entities: this.custom as unknown as Record<string, unknown>[] }
        : {}),
    };
    try {
      const run = await this.api.create(request);
      this.message = this.tr('created', { count: run.devices });
      this.dispatchEvent(new CustomEvent('tdc-created'));
    } catch (err) {
      this.error = describeError(err);
    }
    this.busy = false;
  }

  /** Render the estimate of the load and a warning for a high rate. */
  private renderEstimate(): TemplateResult {
    const entities = this.entities();
    const sensors = entities.filter((e) => e.platform === PLATFORM_SENSOR).length * this.count;
    const rate = stateRate(sensors, this.info?.tick_seconds ?? DEFAULT_TICK_S);
    return html`<p>
      <small>${this.tr('estimate', { entities: entities.length * this.count, rate })}</small>
      ${rate > RATE_WARNING ? html`<br /><span class="warning">${this.tr('rateWarning')}</span>` : ''}
    </p>`;
  }

  /** Return the templates and the custom device as `{id, label}`, sorted by label, with the custom device always last. */
  private templateOptions(): { id: string; label: string }[] {
    const lang = this.hass?.language;
    const options = this.templates.map((t) => ({
      id: t.id,
      label: templateLabel(lang, t.id, t.name),
    }));
    return [
      ...sortedByLabel(lang, options, (option) => option.label),
      { id: CUSTOM, label: this.tr('customTemplate') },
    ];
  }

  /** Render the element. */
  override render(): TemplateResult {
    return html`
      <div class="row form">
        <label style="flex: 1 1 220px"
          >${this.tr(KIND_TEMPLATE)}
          <select @change=${(e: Event) => (this.template = (e.target as HTMLSelectElement).value)}>
            ${this.templateOptions().map(
              (option) =>
                html`${option.id === CUSTOM ? html`<hr />` : ''}
                  <option
                    value=${option.id}
                    ?selected=${option.id === this.template}
                    style=${option.id === CUSTOM ? 'font-weight: bold' : ''}
                  >
                    ${option.id === CUSTOM ? '✚ ' : ''}${option.label}
                  </option>`,
            )}
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
      <p class="row form">
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
          <tdc-multi-select
            .hass=${this.hass}
            .items=${knownAreas(this.hass?.areas, []).map((name) => ({ value: name, label: name }))}
            allowAdd
            .selected=${this.areas}
            @tdc-select-change=${(e: CustomEvent<string[]>) => (this.areas = e.detail)}
          ></tdc-multi-select>
          <small>${this.tr('areasHint')}</small>
        </label>
        <label style="flex: 0 0 160px"
          >${this.tr('areaMode')}
          <select
            @change=${(e: Event) =>
              (this.mode = (e.target as HTMLSelectElement).value as 'even' | 'random')}
          >
            ${sortedByLabel(this.hass?.language, MODES, (mode) => this.tr(MODE_LABELS[mode])).map(
              (mode) =>
                html`<option value=${mode} ?selected=${mode === this.mode}>
                  ${this.tr(MODE_LABELS[mode])}
                </option>`,
            )}
          </select>
        </label>
        ${this.select(
          this.tr('colOutput'),
          this.info?.outputs ?? ['native'],
          this.output,
          (output) => this.tr(OUTPUT_LABELS[output] ?? 'outputNative'),
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
          ? html`${this.renderBase()}<tdc-entity-editor
                .hass=${this.hass}
                .entities=${this.custom}
                .shapes=${this.info?.shapes ?? []}
                .platforms=${this.info?.platforms ?? []}
                @tdc-entities-change=${(e: CustomEvent<EntityDef[]>) => (this.custom = e.detail)}
              ></tdc-entity-editor>`
          : ''
      }
      ${
        this.template !== CUSTOM
          ? html`<p>
              <small>${this.tr('entityList')}</small>
              <tdc-entity-list .hass=${this.hass} .entities=${this.entities()}></tdc-entity-list>
            </p>`
          : ''
      }
      ${this.renderEstimate()}
      <p class="row">
        <button
          class="primary"
          ?disabled=${this.busy || !this.template || this.entities().length === 0}
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
