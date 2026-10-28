import { html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { describeError } from '../common/api';
import { TdcElement } from '../common/base';
import type { Info, ScenarioInfo, TemplateInfo } from '../common/types';
import { describeTarget, type WorkForm } from '../schedule/helpers';
import '../schedule/work-picker';
import { buildSteps, defaultStep, type StepForm } from './helpers';

const REFRESH_MS = 10_000;

/** Lists, creates, starts and removes scenarios: named lists of timed steps. */
@customElement('tdc-scenario-panel')
export class ScenarioPanel extends TdcElement {
  @state() private scenarios: ScenarioInfo[] = [];
  @state() private info?: Info;
  @state() private templates: TemplateInfo[] = [];
  @state() private name = '';
  @state() private steps: StepForm[] = [];
  @state() private message = '';
  @state() private error = '';
  @state() private busy = false;

  private timer?: number;

  /** Load the data when the element is added to the page. */
  override connectedCallback(): void {
    super.connectedCallback();
    void this.loadOptions();
    void this.refresh();
    this.timer = window.setInterval(() => void this.refresh(), REFRESH_MS);
  }

  /** Stop the refresh timer when the element is removed. */
  override disconnectedCallback(): void {
    window.clearInterval(this.timer);
    super.disconnectedCallback();
  }

  /** Load the actions and the templates that the form offers and start with one step. */
  private async loadOptions(): Promise<void> {
    try {
      [this.info, this.templates] = await Promise.all([this.api.info(), this.api.templates()]);
      this.steps = [defaultStep(this.info.actions)];
    } catch (err) {
      this.error = describeError(err);
    }
  }

  /** Reload the scenarios. */
  private async refresh(): Promise<void> {
    try {
      this.scenarios = await this.api.scenarios();
    } catch (err) {
      this.error = describeError(err);
    }
  }

  /** Run a call, then reload; show an error as text. */
  private async run(call: () => Promise<string | void>): Promise<void> {
    this.busy = true;
    this.message = '';
    this.error = '';
    try {
      this.message = (await call()) ?? '';
      await this.refresh();
    } catch (err) {
      this.error = describeError(err);
    }
    this.busy = false;
  }

  /** Create the scenario that the form describes. */
  private async add(): Promise<void> {
    const steps = buildSteps(this.steps, this.templates);
    if (!steps) {
      this.error = this.tr('scnBadParams');
      return;
    }
    await this.run(async () => {
      await this.api.addScenario(this.name, steps);
      this.name = '';
      this.steps = [defaultStep(this.info?.actions ?? {})];
    });
  }

  /** Start a scenario and report how many steps it has. */
  private async start(item: ScenarioInfo): Promise<void> {
    await this.run(async () => {
      const { steps } = await this.api.runScenario(item.id);
      return this.tr('scnStarted', { count: steps });
    });
  }

  /** Change one field of a step of the form. */
  private setStep(index: number, patch: Partial<StepForm>): void {
    this.steps = this.steps.map((step, i) => (i === index ? { ...step, ...patch } : step));
  }

  /** Render the inputs of one step of the form. */
  private renderStep(step: StepForm, index: number): TemplateResult {
    return html`<fieldset>
      <legend>${this.tr('scnStep', { number: index + 1 })}</legend>
      <div class="row">
        <label style="flex: 1 1 180px"
          >${this.tr('scnAfter')}
          <input
            type="number"
            min="0"
            .value=${String(step.afterS)}
            @input=${(e: Event) =>
              this.setStep(index, { afterS: Number((e.target as HTMLInputElement).value) })}
          />
        </label>
        ${this.textField(
          this.tr('scnParams'),
          step.params,
          (v) => this.setStep(index, { params: v }),
          { placeholder: this.tr('scnParamsHint') },
        )}
        <button
          ?disabled=${this.steps.length < 2}
          @click=${() => (this.steps = this.steps.filter((_, i) => i !== index))}
        >
          ${this.tr('remove')}
        </button>
      </div>
      <tdc-work-picker
        .hass=${this.hass}
        .work=${step.work}
        .actions=${this.info?.actions ?? {}}
        .templates=${this.templates}
        @tdc-work-change=${(e: CustomEvent<WorkForm>) => this.setStep(index, { work: e.detail })}
      ></tdc-work-picker>
    </fieldset>`;
  }

  /** Render the form for a new scenario. */
  private renderForm(): TemplateResult {
    return html`
      <h3>${this.tr('scnNew')}</h3>
      <div class="row">
        ${this.textField(this.tr('schName'), this.name, (v) => (this.name = v))}
      </div>
      ${this.steps.map((step, index) => this.renderStep(step, index))}
      <p class="row">
        <button
          @click=${() => (this.steps = [...this.steps, defaultStep(this.info?.actions ?? {})])}
        >
          ${this.tr('scnAddStep')}
        </button>
        <button
          class="primary"
          ?disabled=${this.busy || !this.name.trim() || this.steps.length === 0}
          @click=${() => void this.add()}
        >
          ${this.tr('scnCreate')}
        </button>
      </p>
    `;
  }

  /** Render the table row of one scenario. */
  private renderRow(item: ScenarioInfo): TemplateResult {
    const first = item.steps[0];
    const { kind } = first ? describeTarget(first.target) : { kind: 'all' as const };
    return html`<tr>
      <td>${item.name}</td>
      <td>
        ${this.tr('scnStepCount', { count: item.steps.length })}<br /><small
          >${first ? `${first.entity}: ${first.action} · ${this.tr(`schTarget_${kind}`)}` : ''}</small
        >
      </td>
      <td>
        <button class="primary" ?disabled=${this.busy} @click=${() => void this.start(item)}>
          ${this.tr('scnRun')}
        </button>
        <button
          ?disabled=${this.busy}
          @click=${() => void this.run(() => this.api.removeScenario(item.id).then(() => undefined))}
        >
          ${this.tr('remove')}
        </button>
      </td>
    </tr>`;
  }

  /** Render the element. */
  override render(): TemplateResult {
    return html`
      ${
        this.scenarios.length === 0
          ? html`<p>${this.tr('scnNone')}</p>`
          : html`<table>
              <tr>
                <th>${this.tr('schName')}</th>
                <th>${this.tr('scnSteps')}</th>
                <th>${this.tr('colActions')}</th>
              </tr>
              ${this.scenarios.map((item) => this.renderRow(item))}
            </table>`
      }
      ${this.renderForm()}
      <p>${this.message}<span class="error">${this.error}</span></p>
    `;
  }
}
