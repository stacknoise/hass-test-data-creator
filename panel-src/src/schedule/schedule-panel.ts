import { html, nothing, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { describeError } from '../common/api';
import { TdcElement } from '../common/base';
import type { TextKey } from '../common/i18n';
import type { Info, PlannedRun, ScheduleInfo, TemplateInfo, TriggerType } from '../common/types';
import {
  buildTarget,
  buildTrigger,
  defaultTriggerForm,
  describeTarget,
  formatWhen,
  summarizeTrigger,
  type TargetKind,
  type TriggerForm,
} from './helpers';

const REFRESH_MS = 10_000;
const PREVIEW_HOURS = 24;
const PREVIEW_ROWS = 50;
const TRIGGER_TYPES: TriggerType[] = ['times', 'interval', 'once', 'random_window', 'poisson'];
const TARGET_KINDS: TargetKind[] = ['all', 'template', 'device', 'run'];
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
export class SchedulePanel extends TdcElement {
  @state() private schedules: ScheduleInfo[] = [];
  @state() private runs: PlannedRun[] = [];
  @state() private info?: Info;
  @state() private templates: TemplateInfo[] = [];
  @state() private error = '';
  @state() private busy = false;
  @state() private name = '';
  @state() private kind: TargetKind = 'all';
  @state() private targetId = '';
  @state() private entity = '';
  @state() private actionKey = '';
  @state() private seed = '';
  @state() private form: TriggerForm = defaultTriggerForm();

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

  /** Load the actions and the templates that the form offers. */
  private async loadOptions(): Promise<void> {
    try {
      [this.info, this.templates] = await Promise.all([this.api.info(), this.api.templates()]);
      this.actionKey ||= this.actionKeys()[0] ?? '';
    } catch (err) {
      this.error = describeError(err);
    }
  }

  /** Reload the schedules and the planned runs. */
  private async refresh(): Promise<void> {
    try {
      [this.schedules, this.runs] = await Promise.all([
        this.api.schedules(),
        this.api.schedulePreview(PREVIEW_HOURS),
      ]);
      this.error = '';
    } catch (err) {
      this.error = describeError(err);
    }
  }

  /** Return the actions as `platform/action`, for the select. */
  private actionKeys(): string[] {
    return Object.entries(this.info?.actions ?? {}).flatMap(([platform, names]) =>
      names.map((name) => `${platform}/${name}`),
    );
  }

  /** Return the keys of the template entities that the selected action works on. */
  private entityKeys(): string[] {
    const platform = this.actionKey.split('/')[0];
    const keys = this.templates.flatMap((tpl) =>
      tpl.entities.filter((e) => e.platform === platform).map((e) => e.key),
    );
    return [...new Set(keys)];
  }

  /** Run a call, then reload; show an error as text. */
  private async run(call: () => Promise<unknown>): Promise<void> {
    this.busy = true;
    try {
      await call();
      await this.refresh();
    } catch (err) {
      this.error = describeError(err);
    }
    this.busy = false;
  }

  /** Create the schedule that the form describes. */
  private async add(): Promise<void> {
    const [, action] = this.actionKey.split('/');
    const entity = this.entity || this.entityKeys()[0] || '';
    await this.run(async () => {
      await this.api.addSchedule({
        name: this.name,
        target: buildTarget(this.kind, this.targetId),
        entity,
        action,
        trigger: buildTrigger(this.form),
        seed: this.seed || undefined,
      });
      this.name = '';
    });
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

  /** Render a select with the given values; `text` returns the label of a value. */
  private select(
    label: string,
    values: string[],
    current: string,
    text: (value: string) => string,
    change: (value: string) => void,
  ): TemplateResult {
    return html`<label style="flex: 1 1 180px"
      >${label}
      <select @change=${(e: Event) => change((e.target as HTMLSelectElement).value)}>
        ${values.map(
          (value) =>
            html`<option value=${value} ?selected=${value === current}>${text(value)}</option>`,
        )}
      </select>
    </label>`;
  }

  /** Render the form for a new schedule. */
  private renderForm(): TemplateResult {
    const entities = this.entityKeys();
    return html`
      <h3>${this.tr('schNew')}</h3>
      <div class="row">
        <label style="flex: 1 1 200px"
          >${this.tr('schName')}
          <input
            .value=${this.name}
            @input=${(e: Event) => (this.name = (e.target as HTMLInputElement).value)}
          />
        </label>
        ${this.select(
          this.tr('schTarget'),
          TARGET_KINDS,
          this.kind,
          (kind) => this.tr(`schTarget_${kind}` as TextKey),
          (kind) => (this.kind = kind as TargetKind),
        )}
        ${
          this.kind === 'all'
            ? nothing
            : html`<label style="flex: 1 1 200px"
                >${this.tr('targetId')}
                <input
                  .value=${this.targetId}
                  @input=${(e: Event) => (this.targetId = (e.target as HTMLInputElement).value)}
                />
              </label>`
        }
      </div>
      <div class="row">
        ${this.select(
          this.tr('schAction'),
          this.actionKeys(),
          this.actionKey,
          (key) => key,
          (key) => {
            this.actionKey = key;
            this.entity = '';
          },
        )}
        ${this.select(
          this.tr('schEntity'),
          entities,
          this.entity || entities[0] || '',
          (key) => key,
          (key) => (this.entity = key),
        )}
        ${this.select(
          this.tr('schTrigger'),
          TRIGGER_TYPES,
          this.form.type,
          (type) => this.tr(`schTrigger_${type}` as TextKey),
          (type) => this.setForm({ type: type as TriggerType }),
        )}
      </div>
      <div class="row">
        ${this.renderTriggerFields()}
        <label style="flex: 1 1 140px"
          >${this.tr('seed')}
          <input
            .value=${this.seed}
            placeholder=${this.tr('seedHint')}
            @input=${(e: Event) => (this.seed = (e.target as HTMLInputElement).value)}
          />
        </label>
      </div>
      <p>
        <button
          class="primary"
          ?disabled=${this.busy || !this.name.trim() || !this.actionKey}
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
      <td>${this.tr(`schTarget_${kind}` as TextKey)}${id ? ` ${id}` : ''}</td>
      <td>${item.entity}: ${item.action}</td>
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
