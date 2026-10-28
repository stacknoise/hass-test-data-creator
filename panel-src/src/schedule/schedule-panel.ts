import { css, html, nothing, type TemplateResult } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { describeError } from '../common/api';
import { TdcElement, containerHost } from '../common/base';
import { TdcPollingElement } from '../common/polling';
import type { TextKey } from '../common/i18n';
import { actionLabel, labelOf } from '../common/labels';
import type { PlannedRun, ScenarioInfo, ScheduleInfo, ScheduleRequest } from '../common/types';
import { describeTarget, formatWhen, summarizeTrigger } from './helpers';
import './schedule-form';
import type { ScheduleForm } from './schedule-form';

const PREVIEW_HOURS = 24;
const PREVIEW_ROWS = 50;

/** Creates schedules, previews their next runs, and lists, changes, switches and removes them. */
@customElement('tdc-schedule-panel')
export class SchedulePanel extends TdcPollingElement {
  static override styles = [
    TdcElement.styles,
    containerHost,
    css`
      tr.schedule {
        cursor: pointer;
      }
      tr.schedule:hover {
        background: var(--secondary-background-color);
      }
    `,
  ];

  @state() private schedules: ScheduleInfo[] = [];
  @state() private runs: PlannedRun[] = [];
  @state() private scenarios: ScenarioInfo[] = [];
  @state() private expanded = new Set<string>();

  @query('tdc-schedule-form#new') private newForm?: ScheduleForm;

  /** Nothing to prepare: the forms start themselves when the actions are known. */
  protected optionsLoaded(): void {
    this.error = '';
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

  /** Create the schedule that the new form describes. */
  private async add(request: ScheduleRequest): Promise<void> {
    await this.run(async () => {
      await this.api.addSchedule(request);
      this.newForm?.reset();
    });
  }

  /** Save the changes of a schedule and close its form. */
  private async save(item: ScheduleInfo, request: ScheduleRequest): Promise<void> {
    await this.run(async () => {
      await this.api.updateSchedule(item.id, request);
      this.toggle(item.id);
    });
  }

  /** Open or close the form of a schedule. */
  private toggle(id: string): void {
    const next = new Set(this.expanded);
    if (!next.delete(id)) next.add(id);
    this.expanded = next;
  }

  /** Return the name of a scenario, or its id if it is gone. */
  private scenarioName(id: string): string {
    return this.scenarios.find((s) => s.id === id)?.name ?? id;
  }

  /** Render the form for a new schedule. */
  private renderForm(): TemplateResult {
    return html`
      <h3>${this.tr('schNew')}</h3>
      <tdc-schedule-form
        id="new"
        .hass=${this.hass}
        .info=${this.info}
        .templates=${this.templates}
        .scenarios=${this.scenarios}
        submitLabel=${this.tr('schAdd')}
        ?busy=${this.busy}
        @tdc-submit=${(e: CustomEvent<ScheduleRequest>) => void this.add(e.detail)}
      ></tdc-schedule-form>
    `;
  }

  /** Render the table row of one schedule and, if open, its form. */
  private renderRow(item: ScheduleInfo): TemplateResult {
    const { kind, id } = describeTarget(item.target);
    const lang = this.hass?.language;
    const open = this.expanded.has(item.id);
    return html`<tr class="schedule card" @click=${() => this.toggle(item.id)}>
        <td class="name">${open ? '▾' : '▸'} ${item.name}</td>
        <td data-label=${this.tr('schTarget')}>
          ${item.scenario ? '–' : `${this.tr(`schTarget_${kind}` as TextKey)}${id ? ` ${id}` : ''}`}
        </td>
        <td data-label=${this.tr('schAction')}>
          ${
            item.scenario
              ? this.tr('schScenario', { id: this.scenarioName(item.scenario) })
              : `${labelOf(lang, 'entity', item.entity)}: ${actionLabel(lang, item.action)}`
          }
        </td>
        <td data-label=${this.tr('schTrigger')}>
          ${this.tr(`schTrigger_${item.trigger.type}` as TextKey)}<br /><small
            >${summarizeTrigger(item.trigger)}</small
          >
        </td>
        <td data-label=${this.tr('schEnabled')}>
          <input
            type="checkbox"
            style="width: auto; min-height: 0"
            title=${this.tr('schEnabled')}
            .checked=${item.enabled}
            ?disabled=${this.busy}
            @click=${(e: Event) => e.stopPropagation()}
            @change=${(e: Event) =>
              void this.run(() =>
                this.api.enableSchedule(item.id, (e.target as HTMLInputElement).checked),
              )}
          />
        </td>
        <td data-label=${this.tr('colActions')}>
          <button
            ?disabled=${this.busy}
            @click=${(e: Event) => {
              e.stopPropagation();
              void this.run(() => this.api.removeSchedule(item.id));
            }}
          >
            ${this.tr('remove')}
          </button>
        </td>
      </tr>
      ${
        open
          ? html`<tr>
              <td colspan="6">
                <tdc-schedule-form
                  .hass=${this.hass}
                  .info=${this.info}
                  .templates=${this.templates}
                  .scenarios=${this.scenarios}
                  .schedule=${item}
                  submitLabel=${this.tr('schSave')}
                  ?busy=${this.busy}
                  @tdc-submit=${(e: CustomEvent<ScheduleRequest>) => void this.save(item, e.detail)}
                  @tdc-cancel=${() => this.toggle(item.id)}
                ></tdc-schedule-form>
              </td>
            </tr>`
          : nothing
      }`;
  }

  /** Render the list of the schedules. */
  private renderList(): TemplateResult {
    if (this.schedules.length === 0) return html`<p>${this.tr('schNone')}</p>`;
    return html`<table class="cards">
      <tr>
        <th>${this.tr('schName')}</th>
        <th>${this.tr('schTarget')}</th>
        <th>${this.tr('schAction')}</th>
        <th>${this.tr('schTrigger')}</th>
        <th>${this.tr('schEnabled')}</th>
        <th>${this.tr('colActions')}</th>
      </tr>
      ${repeat(
        this.schedules,
        (item) => item.id,
        (item) => this.renderRow(item),
      )}
    </table>`;
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

  /** Render the element: the new form, the preview, then the list. */
  override render(): TemplateResult {
    return html`
      ${this.renderForm()}
      <h3>${this.tr('schPreview', { hours: PREVIEW_HOURS })}</h3>
      ${this.renderPreview()}
      <h3>${this.tr('schList')}</h3>
      ${this.renderList()}
      <p class="error">${this.error}</p>
    `;
  }
}
