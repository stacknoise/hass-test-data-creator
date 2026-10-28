import { html, nothing, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { describeError } from '../common/api';
import { TdcPollingElement } from '../common/polling';
import type { TextKey } from '../common/i18n';
import { actionLabel, labelOf } from '../common/labels';
import type { Info, PlannedRun, ScenarioInfo, ScheduleInfo, TriggerType } from '../common/types';
import './work-picker';
import {
  buildTrigger,
  defaultTriggerForm,
  defaultWork,
  describeTarget,
  formatWhen,
  resolveWork,
  summarizeTrigger,
  type TriggerForm,
  type WorkForm,
} from './helpers';

const PREVIEW_HOURS = 24;
const PREVIEW_ROWS = 50;
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

/** Lists, creates, switches and removes schedules and previews their next runs. */
@customElement('tdc-schedule-panel')
export class SchedulePanel extends TdcPollingElement {
  @state() private schedules: ScheduleInfo[] = [];
  @state() private runs: PlannedRun[] = [];
  @state() private scenarios: ScenarioInfo[] = [];
  @state() private scenarioId = '';
  @state() private name = '';
  @state() private work: WorkForm = defaultWork({});
  @state() private seed = '';
  @state() private form: TriggerForm = defaultTriggerForm();

  /** Start the form with the first action. */
  protected optionsLoaded(info: Info): void {
    this.work = defaultWork(info.actions);
  }

  /** Reload the schedules and the planned runs. */
  protected async refresh(): Promise<void> {
    try {
      [this.schedules, this.runs, this.scenarios] = await Promise.all([
        this.api.schedules(),
        this.api.schedulePreview(PREVIEW_HOURS),
        this.api.scenarios(),
      ]);
      this.error = '';
    } catch (err) {
      this.error = describeError(err);
    }
  }

  /** Create the schedule that the form describes. */
  private async add(): Promise<void> {
    await this.run(async () => {
      await this.api.addSchedule({
        name: this.name,
        ...(this.scenarioId
          ? { scenario: this.scenarioId }
          : resolveWork(this.work, this.templates)),
        trigger: buildTrigger(this.form),
        seed: this.seed || undefined,
      });
      this.name = '';
    });
  }

  /** Return the name of a scenario, or its id if it is gone. */
  private scenarioName(id: string): string {
    return this.scenarios.find((s) => s.id === id)?.name ?? id;
  }

  /** Change one field of the trigger form. */
  private setForm(patch: Partial<TriggerForm>): void {
    this.form = { ...this.form, ...patch };
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

  /** Render the inputs that belong to the selected trigger type. */
  private renderTriggerFields(): TemplateResult {
    switch (this.form.type) {
      case 'times':
        return html`${this.field(this.tr('schTimes'), 'times')}
          <div class="row">
            ${WEEKDAYS.map(
              (key, day) =>
                html`<label style="flex-direction: row; align-items: center">
                  <input
                    type="checkbox"
                    style="width: auto"
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

  /** Render the form for a new schedule. */
  private renderForm(): TemplateResult {
    return html`
      <h3>${this.tr('schNew')}</h3>
      <div class="row">
        ${this.textField(this.tr('schName'), this.name, (v) => (this.name = v))}
        ${this.select(
          this.tr('schTrigger'),
          TRIGGER_TYPES,
          this.form.type,
          (type) => this.tr(`schTrigger_${type}` as TextKey),
          (type) => this.setForm({ type: type as TriggerType }),
        )}
      </div>
      <div class="row">
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
      <div class="row">
        ${this.renderTriggerFields()}
        ${this.textField(this.tr('seed'), this.seed, (v) => (this.seed = v), {
          flex: '1 1 140px',
          placeholder: this.tr('seedHint'),
        })}
      </div>
      <p>
        <button
          class="primary"
          ?disabled=${this.busy || !this.name.trim() || !(this.scenarioId || this.work.actionKey)}
          @click=${() => void this.add()}
        >
          ${this.tr('schAdd')}
        </button>
      </p>
    `;
  }

  /** Render the table row of one schedule. */
  private renderRow(item: ScheduleInfo): TemplateResult {
    const { kind, id } = describeTarget(item.target);
    return html`<tr>
      <td>${item.name}</td>
      <td>
        ${item.scenario ? '–' : `${this.tr(`schTarget_${kind}` as TextKey)}${id ? ` ${id}` : ''}`}
      </td>
      <td>
        ${item.scenario ? this.tr('schScenario', { id: this.scenarioName(item.scenario) }) : `${labelOf(this.hass?.language, 'entity', item.entity)}: ${actionLabel(this.hass?.language, item.action)}`}
      </td>
      <td>
        ${this.tr(`schTrigger_${item.trigger.type}` as TextKey)}<br /><small
          >${summarizeTrigger(item.trigger)}</small
        >
      </td>
      <td>
        <input
          type="checkbox"
          style="width: auto"
          title=${this.tr('schEnabled')}
          .checked=${item.enabled}
          ?disabled=${this.busy}
          @change=${(e: Event) =>
            void this.run(() =>
              this.api.enableSchedule(item.id, (e.target as HTMLInputElement).checked),
            )}
        />
      </td>
      <td>
        <button
          ?disabled=${this.busy}
          @click=${() => void this.run(() => this.api.removeSchedule(item.id))}
        >
          ${this.tr('remove')}
        </button>
      </td>
    </tr>`;
  }

  /** Render the planned runs of the next hours. */
  private renderPreview(): TemplateResult {
    if (this.runs.length === 0) return html`<p><small>${this.tr('schNoRuns')}</small></p>`;
    return html`<table>
        <tr>
          <th>${this.tr('schWhen')}</th>
          <th>${this.tr('schName')}</th>
        </tr>
        ${this.runs.slice(0, PREVIEW_ROWS).map(
          (run) =>
            html`<tr>
              <td>${formatWhen(run.when)}</td>
              <td>${run.name}</td>
            </tr>`,
        )}
      </table>
      ${
        this.runs.length > PREVIEW_ROWS
          ? html`<p>
              <small>${this.tr('schMoreRuns', { count: this.runs.length - PREVIEW_ROWS })}</small>
            </p>`
          : nothing
      }`;
  }

  /** Render the element. */
  override render(): TemplateResult {
    return html`
      ${
        this.schedules.length === 0
          ? html`<p>${this.tr('schNone')}</p>`
          : html`<table>
              <tr>
                <th>${this.tr('schName')}</th>
                <th>${this.tr('schTarget')}</th>
                <th>${this.tr('schAction')}</th>
                <th>${this.tr('schTrigger')}</th>
                <th>${this.tr('schEnabled')}</th>
                <th>${this.tr('colActions')}</th>
              </tr>
              ${this.schedules.map((item) => this.renderRow(item))}
            </table>`
      }
      ${this.renderForm()}
      <h3>${this.tr('schPreview', { hours: PREVIEW_HOURS })}</h3>
      ${this.renderPreview()}
      <p class="error">${this.error}</p>
    `;
  }
}
