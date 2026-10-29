import { html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { describeError } from '../common/api';
import { TdcElement } from '../common/base';
import type { TextKey } from '../common/i18n';
import { OUTPUT_LABELS, sortedByLabel, templateLabel } from '../common/labels';
import type { CreateRequest, EntityDef, Info, TemplateInfo } from '../common/types';
import { keyOf } from './entity-helpers';
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
  @state() private templateName = '';
  @state() private editingId = '';
  @state() private confirmDelete = false;
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

  /** Reload the templates and select `id` when it exists. */
  private async reloadTemplates(id: string): Promise<void> {
    this.templates = await this.api.templates();
    this.template = this.templates.some((t) => t.id === id)
      ? id
      : (this.templates[0]?.id ?? CUSTOM);
  }

  /** Return the selected template when it is one of the user's own. */
  private ownTemplate(): TemplateInfo | undefined {
    const template = this.templates.find((t) => t.id === this.template);
    return template && !template.bundled ? template : undefined;
  }

  /** Load the selected own template into the custom device so that it can be changed. */
  private editTemplate(): void {
    const own = this.ownTemplate();
    if (!own) return;
    this.custom = structuredClone(own.entities);
    this.templateName = own.name;
    this.editingId = own.id;
    this.confirmDelete = false;
    this.template = CUSTOM;
  }

  /** Run `action`, show `done` as the message and the error otherwise. */
  private async attempt(action: () => Promise<string>): Promise<void> {
    this.busy = true;
    this.message = '';
    this.error = '';
    try {
      this.message = await action();
    } catch (err) {
      this.error = describeError(err);
    }
    this.busy = false;
  }

  /** Delete the selected own template. */
  private deleteTemplate(): Promise<void> {
    const own = this.ownTemplate();
    if (!own) return Promise.resolve();
    return this.attempt(async () => {
      await this.api.deleteTemplate(own.id);
      this.confirmDelete = false;
      await this.reloadTemplates('');
      return this.tr('tplDeleted', { name: own.name });
    });
  }

  /** Save the custom device as an own template; editing a template keeps its id. */
  private saveTemplate(): Promise<void> {
    const name = this.templateName.trim();
    const id = this.editingId || keyOf(name);
    return this.attempt(async () => {
      await this.api.saveTemplate(id, name, this.custom);
      await this.reloadTemplates(id);
      this.editingId = '';
      return this.tr('tplSaved', { name });
    });
  }

  /** Render the buttons to change or delete the selected own template, with the question before a delete. */
  private renderOwnActions(): TemplateResult {
    const own = this.ownTemplate();
    if (!own) return html``;
    if (this.confirmDelete) {
      return html`<p class="warning row">
        ${this.tr('tplDeleteAsk', { name: own.name })}
        <button ?disabled=${this.busy} @click=${() => void this.deleteTemplate()}>
          ${this.tr('tplDeleteConfirm')}
        </button>
        <button @click=${() => (this.confirmDelete = false)}>${this.tr('detCancel')}</button>
      </p>`;
    }
    return html`<p class="row">
      <button @click=${() => this.editTemplate()}>${this.tr('tplEdit')}</button>
      <button @click=${() => (this.confirmDelete = true)}>${this.tr('tplDelete')}</button>
    </p>`;
  }

  /** Render the name and the save button that turn the custom device into an own template. */
  private renderSaveTemplate(): TemplateResult {
    const name = this.templateName.trim();
    const id = this.editingId || keyOf(name);
    const exists = !this.editingId && this.templates.some((t) => t.id === id && !t.bundled);
    const editing = this.templates.find((t) => t.id === this.editingId);
    return html`<div class="row form" style="align-items: flex-end">
        <label style="flex: 1 1 220px"
          >${this.tr('tplName')}
          <input
            .value=${this.templateName}
            @input=${(e: Event) => (this.templateName = (e.target as HTMLInputElement).value)}
          />
        </label>
        <button
          ?disabled=${this.busy || !id || this.custom.length === 0}
          @click=${() => void this.saveTemplate()}
        >
          ${this.editingId ? this.tr('tplSaveChanges') : this.tr('tplSave')}
        </button>
      </div>
      ${editing ? html`<small>${this.tr('tplEditing', { name: editing.name })}</small>` : ''}
      ${exists ? html`<small class="warning">${this.tr('tplExists')}</small>` : ''}`;
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

  /** Take over the template `id` at once when the list is empty, otherwise ask first. */
  private chooseBase(id: string): void {
    this.pendingBase = id;
    if (this.custom.length === 0) this.applyBase();
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
            @change=${(e: Event) => this.chooseBase((e.target as HTMLSelectElement).value)}
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

  /** Return the built-in and the own templates and the custom device as `{id, label}`, sorted by label; the custom device is shown last. */
  private templateOptions(): {
    bundled: { id: string; label: string }[];
    own: { id: string; label: string }[];
    custom: { id: string; label: string };
  } {
    const lang = this.hass?.language;
    const options = (own: boolean) =>
      sortedByLabel(
        lang,
        this.templates
          .filter((t) => !t.bundled === own)
          .map((t) => ({ id: t.id, label: templateLabel(lang, t.id, t.name) })),
        (option) => option.label,
      );
    return {
      bundled: options(false),
      own: options(true),
      custom: { id: CUSTOM, label: this.tr('customTemplate') },
    };
  }

  /** Render one entry of the template choice; the custom device is bold and marked. */
  private option(option: { id: string; label: string }): TemplateResult {
    const custom = option.id === CUSTOM;
    return html`<option
      value=${option.id}
      ?selected=${option.id === this.template}
      style=${custom ? 'font-weight: bold' : ''}
    >
      ${custom ? '✚ ' : ''}${option.label}
    </option>`;
  }

  /** Select a template; leaving the custom device ends the editing of an own template. */
  private choose(id: string): void {
    this.template = id;
    this.confirmDelete = false;
    if (id !== CUSTOM) this.editingId = '';
  }

  /** Render the element. */
  override render(): TemplateResult {
    const options = this.templateOptions();
    return html`
      <div class="row form">
        <label style="flex: 1 1 220px"
          >${this.tr(KIND_TEMPLATE)}
          <select @change=${(e: Event) => this.choose((e.target as HTMLSelectElement).value)}>
            ${options.bundled.map((option) => this.option(option))}
            ${
              options.own.length
                ? html`<optgroup label=${this.tr('ownTemplates')}>
                    ${options.own.map((option) => this.option(option))}
                  </optgroup>`
                : ''
            }
            <hr />
            ${this.option(options.custom)}
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
          ? html`<div style="display: grid; gap: 20px">
              ${this.renderBase()}${this.renderSaveTemplate()}<tdc-entity-editor
                .hass=${this.hass}
                .entities=${this.custom}
                .shapes=${this.info?.shapes ?? []}
                .platforms=${this.info?.platforms ?? []}
                @tdc-entities-change=${(e: CustomEvent<EntityDef[]>) => (this.custom = e.detail)}
              ></tdc-entity-editor>
            </div>`
          : ''
      }
      ${this.template === CUSTOM ? '' : this.renderOwnActions()}
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
