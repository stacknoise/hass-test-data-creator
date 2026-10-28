import { html, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { TdcElement } from '../common/base';
import type { Info, ScenarioInfo, ScenarioStep, TemplateInfo } from '../common/types';
import { type WorkForm } from '../schedule/helpers';
import '../schedule/work-picker';
import { buildSteps, defaultStep, stepFormOf, type StepForm } from './helpers';

/** What the form hands to the parent: the name and the steps of the scenario. */
export interface ScenarioRequest {
  name: string;
  steps: ScenarioStep[];
}

/** The form of a scenario: empty for a new one, filled from `scenario` to change it. */
@customElement('tdc-scenario-form')
export class ScenarioForm extends TdcElement {
  @property({ attribute: false }) info?: Info;
  @property({ attribute: false }) templates: TemplateInfo[] = [];
  @property({ attribute: false }) scenario?: ScenarioInfo;
  @property() submitLabel = '';
  @property({ type: Boolean }) busy = false;

  @state() private name = '';
  @state() private steps: StepForm[] = [];
  @state() private error = '';

  private loadedId?: string;

  /** Fill the form from the scenario once, and start a new one with a single step. */
  protected override willUpdate(changed: PropertyValues): void {
    const actions = this.info?.actions;
    if (this.scenario && actions && this.loadedId !== this.scenario.id) {
      this.loadedId = this.scenario.id;
      this.name = this.scenario.name;
      this.steps = this.scenario.steps.map(stepFormOf);
    } else if (!this.scenario && actions && this.steps.length === 0) {
      this.steps = [defaultStep(actions)];
    }
    super.willUpdate(changed);
  }

  /** Clear the form, so that the next scenario starts fresh. */
  reset(): void {
    this.name = '';
    this.error = '';
    this.steps = [defaultStep(this.info?.actions ?? {})];
  }

  /** Change one field of a step of the form. */
  private setStep(index: number, patch: Partial<StepForm>): void {
    this.steps = this.steps.map((step, i) => (i === index ? { ...step, ...patch } : step));
  }

  /** Whether the name is given and every step has the target that it needs. */
  private complete(): boolean {
    return (
      Boolean(this.name.trim()) &&
      this.steps.length > 0 &&
      this.steps.every(
        (s) => s.work.action && (s.work.kind === 'all' || s.work.targetIds.length > 0),
      )
    );
  }

  /** Tell the parent to save the scenario, unless the parameters of a step are no JSON. */
  private submit(): void {
    const steps = buildSteps(this.steps);
    if (!steps) {
      this.error = this.tr('scnBadParams');
      return;
    }
    this.error = '';
    this.dispatchEvent(
      new CustomEvent<ScenarioRequest>('tdc-submit', { detail: { name: this.name, steps } }),
    );
  }

  /** Render the inputs of one step. */
  private renderStep(step: StepForm, index: number): TemplateResult {
    return html`<fieldset>
      <legend>${this.tr('scnStep', { number: index + 1 })}</legend>
      <div class="fields bottom">
        <label
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
      </div>
      <tdc-work-picker
        .hass=${this.hass}
        .work=${step.work}
        .actions=${this.info?.actions ?? {}}
        .templates=${this.templates}
        @tdc-work-change=${(e: CustomEvent<WorkForm>) => this.setStep(index, { work: e.detail })}
      ></tdc-work-picker>
      <div class="end">
        <button
          ?disabled=${this.steps.length < 2}
          @click=${() => (this.steps = this.steps.filter((_, i) => i !== index))}
        >
          ${this.tr('scnRemoveStep')}
        </button>
      </div>
    </fieldset>`;
  }

  /** Render the element. */
  override render(): TemplateResult {
    return html`
      <div class="fields">
        ${this.textField(this.tr('schName'), this.name, (v) => (this.name = v))}
      </div>
      ${this.steps.map((step, index) => this.renderStep(step, index))}
      ${this.submitRow({
        enabled: this.complete(),
        busy: this.busy,
        label: this.submitLabel,
        editing: !!this.scenario,
        submit: () => this.submit(),
        extra: html`<button
          @click=${() => (this.steps = [...this.steps, defaultStep(this.info?.actions ?? {})])}
        >
          ${this.tr('scnAddStep')}
        </button>`,
      })}
      <p class="error">${this.error}</p>
    `;
  }
}
