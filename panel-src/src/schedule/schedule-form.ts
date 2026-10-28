import { html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { TdcElement } from '../common/base';
import type { TextKey } from '../common/i18n';
import type {
  Info,
  ScenarioInfo,
  ScheduleInfo,
  ScheduleRequest,
  TemplateInfo,
  TriggerType,
} from '../common/types';
import './work-picker';
import {
  buildTrigger,
  defaultTriggerForm,
  defaultWork,
  resolveWork,
  triggerFormOf,
  workOf,
  type TriggerForm,
  type WorkForm,
} from './helpers';

const TRIGGER_TYPES: TriggerType[] = ['times', 'interval', 'once', 'random_window', 'poisson'];
const WEEKDAYS = [
  'weekdayMon',
  'weekdayTue',
  'weekdayWed',
  'weekdayThu',
  'weekdayFri',
  'weekdaySat',
  'weekdaySun',
] as const;

/** The form of a schedule: empty for a new one, filled from `schedule` to change it. */
@customElement('tdc-schedule-form')
export class ScheduleForm extends TdcElement {
  @property({ attribute: false }) info?: Info;
  @property({ attribute: false }) templates: TemplateInfo[] = [];
  @property({ attribute: false }) scenarios: ScenarioInfo[] = [];
  @property({ attribute: false }) schedule?: ScheduleInfo;
  @property() submitLabel = '';
  @property({ type: Boolean }) busy = false;

  @state() private name = '';
  @state() private scenarioId = '';
  @state() private work: WorkForm = defaultWork({});
  @state() private seed = '';
  @state() private form: TriggerForm = defaultTriggerForm();

  private loadedId?: string;
  private started = false;

  /** Fill the form from the schedule once, and start a new one with the first action. */
  protected override willUpdate(changed: PropertyValues): void {
    const actions = this.info?.actions;
    if (this.schedule && actions && this.loadedId !== this.schedule.id) {
      this.loadedId = this.schedule.id;
      this.name = this.schedule.name;
      this.scenarioId = this.schedule.scenario ?? '';
      this.work = workOf(this.schedule);
      this.form = triggerFormOf(this.schedule.trigger);
    } else if (!this.schedule && actions && !this.started) {
      this.started = true;
      this.work = defaultWork(actions);
    }
    super.willUpdate(changed);
  }

  /** Clear the name, so that the next schedule starts fresh. */
  reset(): void {
    this.name = '';
  }

  /** Return the name of a scenario, or its id if it is gone. */
  private scenarioName(id: string): string {
    return this.scenarios.find((s) => s.id === id)?.name ?? id;
  }

  /** Change one field of the trigger form. */
  private setForm(patch: Partial<TriggerForm>): void {
    this.form = { ...this.form, ...patch };
  }

  /** Return the request that the form describes. */
  private request(): ScheduleRequest {
    const work = this.scenarioId ? { scenario: this.scenarioId } : resolveWork(this.work);
    const keepParams = this.schedule && 'action' in work && work.action === this.schedule.action;
    return {
      name: this.name,
      ...work,
      trigger: buildTrigger(this.form),
      seed: this.seed || undefined,
      ...(this.schedule
        ? { params: keepParams ? this.schedule.params : {}, enabled: this.schedule.enabled }
        : {}),
    };
  }

  /** Whether the action, and the target if it needs one, are chosen. */
  private complete(): boolean {
    return (
      Boolean(this.work.action) && (this.work.kind === 'all' || this.work.targetIds.length > 0)
    );
  }

  /** Tell the parent to save what the form describes. */
  private submit(): void {
    this.dispatchEvent(new CustomEvent('tdc-submit', { detail: this.request() }));
  }

  /** Render a text or number input bound to a field of the trigger form. */
  private field(
    label: string,
    key: 'times' | 'start' | 'end' | 'at' | 'everyS' | 'count' | 'perDay',
    type = 'text',
  ): TemplateResult {
    const numeric = type === 'number';
    return html`<label style="flex: 1 1 140px"
      >${label}
      <input
        type=${type}
        .value=${String(this.form[key])}
        @input=${(e: Event) => {
          const value = (e.target as HTMLInputElement).value;
          this.setForm({ [key]: numeric ? Number(value) : value });
        }}
      />
    </label>`;
  }

  /** Render the check boxes of the weekdays. */
  private renderWeekdays(): TemplateResult {
    return html`<div class="row wide">
      ${WEEKDAYS.map(
        (key, day) =>
          html`<label style="flex-direction: row; align-items: center">
            <input
              type="checkbox"
              style="width: auto; min-height: 0"
              .checked=${this.form.weekdays.includes(day)}
              @change=${(e: Event) =>
                this.setForm({
                  weekdays: (e.target as HTMLInputElement).checked
                    ? [...this.form.weekdays, day]
                    : this.form.weekdays.filter((d) => d !== day),
                })}
            />${this.tr(key)}
          </label>`,
      )}
    </div>`;
  }

  /** Render the inputs that belong to the selected trigger type. */
  private renderTriggerFields(): TemplateResult {
    switch (this.form.type) {
      case 'times':
        return html`${this.field(this.tr('schTimes'), 'times')} ${this.renderWeekdays()}`;
      case 'interval':
        return html`${this.field(this.tr('schEveryS'), 'everyS', 'number')}
        ${this.field(this.tr('schFrom'), 'start')} ${this.field(this.tr('schTo'), 'end')}`;
      case 'once':
        return this.field(this.tr('schAt'), 'at', 'datetime-local');
      case 'random_window':
        return html`${this.field(this.tr('schCount'), 'count', 'number')}
        ${this.field(this.tr('schFrom'), 'start')} ${this.field(this.tr('schTo'), 'end')}`;
      case 'poisson':
        return this.field(this.tr('schPerDay'), 'perDay', 'number');
    }
  }

  /** Render the element. */
  override render(): TemplateResult {
    return html`
      <div class="fields">
        ${this.textField(this.tr('schName'), this.name, (v) => (this.name = v))}
      </div>
      <div class="fields">
        ${this.select(
          this.tr('schTrigger'),
          TRIGGER_TYPES,
          this.form.type,
          (type) => this.tr(`schTrigger_${type}` as TextKey),
          (type) => this.setForm({ type: type as TriggerType }),
        )}
        ${this.select(
          this.tr('schRuns'),
          ['', ...this.scenarios.map((s) => s.id)],
          this.scenarioId,
          (id) =>
            id ? this.tr('schScenario', { id: this.scenarioName(id) }) : this.tr('schRunsAction'),
          (id) => (this.scenarioId = id),
        )}
      </div>
      ${
        this.scenarioId
          ? nothing
          : html`<tdc-work-picker
              .hass=${this.hass}
              .work=${this.work}
              .actions=${this.info?.actions ?? {}}
              .templates=${this.templates}
              @tdc-work-change=${(e: CustomEvent<WorkForm>) => (this.work = e.detail)}
            ></tdc-work-picker>`
      }
      <div class="fields">
        ${this.renderTriggerFields()}
        ${this.textField(this.tr('seed'), this.seed, (v) => (this.seed = v), {
          flex: '1 1 140px',
          placeholder: this.tr(this.schedule ? 'schSeedKeep' : 'seedHint'),
        })}
      </div>
      <p class="row">
        <button
          class="primary"
          ?disabled=${this.busy || !this.name.trim() || !(this.scenarioId || this.complete())}
          @click=${() => this.submit()}
        >
          ${this.submitLabel}
        </button>
        ${
          this.schedule
            ? html`<button
                ?disabled=${this.busy}
                @click=${() => this.dispatchEvent(new CustomEvent('tdc-cancel'))}
              >
                ${this.tr('detCancel')}
              </button>`
            : nothing
        }
      </p>
    `;
  }
}
