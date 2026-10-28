import { css, html, nothing, type TemplateResult } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { describeError } from '../common/api';
import { TdcElement, containerHost } from '../common/base';
import { TdcPollingElement } from '../common/polling';
import type { TextKey } from '../common/i18n';
import { workLabel } from '../common/labels';
import { targetName } from '../common/targets';
import type {
  DeviceInfo,
  PlannedRun,
  ScenarioInfo,
  ScheduleInfo,
  ScheduleRequest,
} from '../common/types';
import { describeTarget, formatWhen, summarizeTrigger, type TargetKind } from './helpers';
import '../common/dialog';
import './schedule-form';
import type { ScheduleForm } from './schedule-form';

const PREVIEW_HOURS = 24;
const PREVIEW_ROWS = 50;
const DEVICE_LIMIT = 500;

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
      details.section summary {
        margin: 24px 0 12px;
        font-size: 1.17em;
        font-weight: 500;
        cursor: pointer;
      }
      h3.list-title {
        margin-top: 40px;
      }
    `,
  ];

  @state() private schedules: ScheduleInfo[] = [];
  @state() private runs: PlannedRun[] = [];
  @state() private scenarios: ScenarioInfo[] = [];
  @state() private devices: DeviceInfo[] = [];
  @state() private previewOpen = false;

  @query('tdc-schedule-form#new') private newForm?: ScheduleForm;

  /** Nothing to prepare: the forms start themselves when the actions are known. */
  protected optionsLoaded(): void {
    this.error = '';
  }

  /** Reload the schedules and the planned runs. */
  protected async refresh(): Promise<void> {
    try {
      let page;
      [this.schedules, this.runs, this.scenarios, page] = await Promise.all([
        this.api.schedules(),
        this.api.schedulePreview(PREVIEW_HOURS),
        this.api.scenarios(),
        this.api.devices(0, DEVICE_LIMIT),
      ]);
      this.devices = page.devices;
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
      this.creating = false;
    });
  }

  /** Save the changes of a schedule and close its form. */
  private async save(item: ScheduleInfo, request: ScheduleRequest): Promise<void> {
    await this.run(async () => {
      await this.api.updateSchedule(item.id, request);
      this.toggle(item.id);
    });
  }

  /** Switch a schedule on or off; the box follows at once and is reset if the backend refuses. */
  private async setEnabled(item: ScheduleInfo, enabled: boolean): Promise<void> {
    this.schedules = this.schedules.map((s) => (s.id === item.id ? { ...s, enabled } : s));
    await this.run(() => this.api.enableSchedule(item.id, enabled));
    if (this.error) await this.refresh();
  }

  /** Return the name of a scenario, or its id if it is gone. */
  private scenarioName(id: string): string {
    return this.scenarios.find((s) => s.id === id)?.name ?? id;
  }

  /** Return the text of a target: its kind, and the name of what it aims at. */
  private targetText(kind: TargetKind, ids: string[]): string {
    const label = this.tr(`schTarget_${kind}` as TextKey);
    if (kind === 'all') return label;
    const name = ids
      .map((id) =>
        targetName(kind, id, this.devices, this.templates, this.hass?.language, (count) =>
          this.tr('planDevices', { count }),
        ),
      )
      .join(', ');
    return `${label}: ${name}`;
  }

  /** Render the button that opens the popup with the form for a new object. */
  private renderNew(): TemplateResult {
    return this.newPopup(
      this.tr('schNew'),
      html`<tdc-schedule-form
        id="new"
        .hass=${this.hass}
        .info=${this.info}
        .templates=${this.templates}
        .scenarios=${this.scenarios}
        submitLabel=${this.tr('schAdd')}
        ?busy=${this.busy}
        @tdc-submit=${(e: CustomEvent<ScheduleRequest>) => void this.add(e.detail)}
      ></tdc-schedule-form>`,
    );
  }

  /** Render the table row of one schedule and, if open, its form. */
  private renderRow(item: ScheduleInfo): TemplateResult {
    const { kind, ids } = describeTarget(item.target);
    const lang = this.hass?.language;
    const open = this.expanded.has(item.id);
    return html`<tr class="schedule card" @click=${() => this.toggle(item.id)}>
        <td class="name">${open ? '▾' : '▸'} ${item.name}</td>
        <td data-label=${this.tr('schTarget')}>
          ${item.scenario ? '–' : this.targetText(kind, ids)}
        </td>
        <td data-label=${this.tr('schAction')}>
          ${
            item.scenario
              ? this.tr('schScenario', { id: this.scenarioName(item.scenario) })
              : workLabel(lang, item.entity, item.action)
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
              void this.setEnabled(item, (e.target as HTMLInputElement).checked)}
          />
        </td>
        <td data-label=${this.tr('colActions')}>
          ${this.removeButton(() => this.api.removeSchedule(item.id))}
        </td>
      </tr>
      ${
        open
          ? this.editRow(
              6,
              item.id,
              html`<tdc-schedule-form
                .hass=${this.hass}
                .info=${this.info}
                .templates=${this.templates}
                .scenarios=${this.scenarios}
                .schedule=${item}
                submitLabel=${this.tr('schSave')}
                ?busy=${this.busy}
                @tdc-submit=${(e: CustomEvent<ScheduleRequest>) => void this.save(item, e.detail)}
              ></tdc-schedule-form>`,
            )
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

  /** Return the number of planned runs as text. */
  private actionCount(): string {
    const count = this.runs.length;
    return this.tr(count === 1 ? 'schActionOne' : 'schActions', { count });
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
      ${this.renderNew()}
      <details
        class="section"
        ?open=${this.previewOpen}
        @toggle=${(e: Event) => (this.previewOpen = (e.target as HTMLDetailsElement).open)}
      >
        <summary>
          ${this.tr('schPreview', { hours: PREVIEW_HOURS })} · ${this.actionCount()}
        </summary>
        ${this.renderPreview()}
      </details>
      <h3 class="list-title">${this.tr('schList')}</h3>
      ${this.renderList()}
      <p class="error">${this.error}</p>
    `;
  }
}
