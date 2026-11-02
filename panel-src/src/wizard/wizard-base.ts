import { html, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import { describeError } from '../common/api';
import { TdcElement } from '../common/base';
import type { CreateRequest, EntityDef, Info, TemplateInfo } from '../common/types';
import { DEFAULT_VALUES, type CommonValues } from './common-fields';
import './common-fields';
import { stateRate } from './helpers';
import { PLATFORM_SENSOR } from '../common/constants';

const DEFAULT_TICK_S = 10;
const RATE_WARNING = 50;

/** What the wizards that create devices have in common: the data, the request and the estimate. */
export abstract class WizardBase extends TdcElement {
  @state() protected info?: Info;
  @state() protected templates: TemplateInfo[] = [];
  @state() protected values: CommonValues = DEFAULT_VALUES;
  @state() protected busy = false;
  @state() protected message = '';
  @state() protected error = '';

  /** Load the data when the element is added to the page. */
  override async connectedCallback(): Promise<void> {
    super.connectedCallback();
    try {
      [this.info, this.templates] = await Promise.all([this.api.info(), this.api.templates()]);
    } catch (err) {
      this.error = describeError(err);
    }
  }

  /** Return the entity definitions of the chosen template. */
  protected entities(): EntityDef[] {
    return this.templates.find((t) => t.id === this.values.template)?.entities ?? [];
  }

  /** Take over the values of the common fields. */
  protected take(values: CommonValues): void {
    this.values = values;
  }

  /** Return the request for the common values; `extra` adds the fields of the wizard. */
  protected request(extra: Partial<CreateRequest>): CreateRequest {
    const v = this.values;
    return {
      template: v.template,
      count: v.count,
      name_pattern: v.pattern,
      areas: v.areas,
      area_mode: v.mode,
      output: v.output,
      ...(v.seed ? { seed: v.seed } : {}),
      ...extra,
    };
  }

  /** Create the devices of the request, and tell the list when they exist. */
  protected async submit(request: CreateRequest): Promise<void> {
    this.busy = true;
    this.message = '';
    this.error = '';
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
  protected renderEstimate(): TemplateResult {
    const entities = this.entities();
    const sensors =
      entities.filter((e) => e.platform === PLATFORM_SENSOR).length * this.values.count;
    const rate = stateRate(sensors, this.info?.tick_seconds ?? DEFAULT_TICK_S);
    return html`<p>
      <small>${this.tr('estimate', { entities: entities.length * this.values.count, rate })}</small>
      ${rate > RATE_WARNING ? html`<br /><span class="warning">${this.tr('rateWarning')}</span>` : ''}
    </p>`;
  }

  /** Render the button that creates the devices, with the message and the error. */
  protected renderSubmit(disabled: boolean, submit: () => void): TemplateResult {
    return html`<p class="row">
      <button class="primary" ?disabled=${this.busy || disabled} @click=${submit}>
        ${this.busy ? this.tr('creating') : this.tr('create')}
      </button>
      <span>${this.message}</span>
      <span class="error">${this.error}</span>
    </p>`;
  }
}
