import { html, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { TdcElement } from '../common/base';
import type { TextKey } from '../common/i18n';
import { OUTPUT_LABELS, sortedByLabel, templateLabel } from '../common/labels';
import type { Info, TemplateInfo } from '../common/types';
import '../common/multi-select';
import { knownAreas } from '../devices/helpers';
import { KIND_TEMPLATE } from '../common/constants';

/** The id of the entry "custom device" in the choice of the template. */
export const CUSTOM = 'custom';
const MODES = ['even', 'random'] as const;
const MODE_LABELS: Record<(typeof MODES)[number], TextKey> = {
  even: 'modeEven',
  random: 'modeRandom',
};

/** What the common fields of the two wizards hold. */
export interface CommonValues {
  template: string;
  count: number;
  pattern: string;
  areas: string[];
  mode: 'even' | 'random';
  output: string;
  seed: string;
}

/** The values before anything is chosen. */
export const DEFAULT_VALUES: CommonValues = {
  template: '',
  count: 10,
  pattern: '{template} {nn}',
  areas: [],
  mode: 'even',
  output: 'native',
  seed: '',
};

/** The fields that "create devices" and "follow a device" share, laid out on one grid. */
@customElement('tdc-device-fields')
export class DeviceFields extends TdcElement {
  @property({ attribute: false }) templates: TemplateInfo[] = [];
  @property({ attribute: false }) info?: Info;
  @property({ type: Boolean }) allowCustom = false;
  @property({ attribute: 'seed-hint' }) seedHint: TextKey = 'seedHint';

  @state() private values: CommonValues = DEFAULT_VALUES;

  /** Choose the first template as soon as the list is there, and tell the wizard. */
  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('templates') && !this.values.template && this.templates.length) {
      this.set({ template: this.templates[0].id });
    }
  }

  /** Change some values and report all of them to the wizard. */
  private set(change: Partial<CommonValues>): void {
    this.values = { ...this.values, ...change };
    this.dispatchEvent(new CustomEvent('tdc-fields-change', { detail: this.values }));
  }

  /** Return the built-in and the own templates, sorted by label. */
  private templateOptions(own: boolean): { id: string; label: string }[] {
    const lang = this.hass?.language;
    return sortedByLabel(
      lang,
      this.templates
        .filter((t) => !t.bundled === own)
        .map((t) => ({ id: t.id, label: templateLabel(lang, t.id, t.name) })),
      (option) => option.label,
    );
  }

  /** Render one entry of the template choice; the custom device is bold and marked. */
  private option(id: string, label: string): TemplateResult {
    const custom = id === CUSTOM;
    return html`<option
      value=${id}
      ?selected=${id === this.values.template}
      style=${custom ? 'font-weight: bold' : ''}
    >
      ${custom ? '✚ ' : ''}${label}
    </option>`;
  }

  /** Render the choice of the template. */
  private renderTemplate(): TemplateResult {
    const own = this.templateOptions(true);
    return html`<label
      >${this.tr(KIND_TEMPLATE)}
      <select
        @change=${(e: Event) => this.set({ template: (e.target as HTMLSelectElement).value })}
      >
        ${this.templateOptions(false).map((o) => this.option(o.id, o.label))}
        ${
          own.length
            ? html`<optgroup label=${this.tr('ownTemplates')}>
                ${own.map((o) => this.option(o.id, o.label))}
              </optgroup>`
            : ''
        }
        ${
          this.allowCustom
            ? html`<hr />
                ${this.option(CUSTOM, this.tr('customTemplate'))}`
            : ''
        }
      </select>
    </label>`;
  }

  /** Render the element. */
  override render(): TemplateResult {
    const v = this.values;
    return html`<div class="fields">
      ${this.renderTemplate()}
      <label
        >${this.tr('count')}
        <input
          type="number"
          min="1"
          .value=${String(v.count)}
          @input=${(e: Event) => this.set({ count: Number((e.target as HTMLInputElement).value) })}
        />
      </label>
      <label
        >${this.tr('namePattern')}
        <input
          .value=${v.pattern}
          @input=${(e: Event) => this.set({ pattern: (e.target as HTMLInputElement).value })}
        />
        <small>${this.tr('namePatternHint')}</small>
      </label>
      <label
        >${this.tr('areas')}
        <tdc-multi-select
          .hass=${this.hass}
          .items=${knownAreas(this.hass?.areas, []).map((name) => ({ value: name, label: name }))}
          allowAdd
          .selected=${v.areas}
          @tdc-select-change=${(e: CustomEvent<string[]>) => this.set({ areas: e.detail })}
        ></tdc-multi-select>
        <small>${this.tr('areasHint')}</small>
      </label>
      <label
        >${this.tr('areaMode')}
        <select
          @change=${(e: Event) =>
            this.set({ mode: (e.target as HTMLSelectElement).value as CommonValues['mode'] })}
        >
          ${sortedByLabel(this.hass?.language, MODES, (m) => this.tr(MODE_LABELS[m])).map(
            (m) =>
              html`<option value=${m} ?selected=${m === v.mode}>
                ${this.tr(MODE_LABELS[m])}
              </option>`,
          )}
        </select>
      </label>
      ${this.select(
        this.tr('colOutput'),
        this.info?.outputs ?? ['native'],
        v.output,
        (output) => this.tr(OUTPUT_LABELS[output] ?? 'outputNative'),
        (output) => this.set({ output }),
      )}
      <label
        >${this.tr('seed')}
        <input
          .value=${v.seed}
          @input=${(e: Event) => this.set({ seed: (e.target as HTMLInputElement).value })}
        />
        <small>${this.tr(this.seedHint)}</small>
      </label>
    </div>`;
  }
}
