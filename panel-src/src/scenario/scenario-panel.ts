import { css, html, nothing, type TemplateResult } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import '../common/dialog';
import { describeError } from '../common/api';
import { workLabel } from '../common/labels';
import { TdcElement, containerHost } from '../common/base';
import { TdcPollingElement } from '../common/polling';
import type { DeviceName, ScenarioInfo } from '../common/types';
import { optionsOf } from '../common/list-filter';
import { targetName } from '../common/targets';
import type { FilterField } from '../common/filter-state';
import { describeTarget } from '../schedule/helpers';
import {
  SCENARIO_FIELDS,
  SCENARIO_FILTER_TAB,
  scenarioRule,
  stepDevices,
  stepTemplates,
} from './helpers';
import './scenario-form';
import type { ScenarioForm, ScenarioRequest } from './scenario-form';
import { KIND_ALL, KIND_DEVICE, KIND_TEMPLATE } from '../common/constants';

const COLUMN_COUNT = 3;

/** Creates, lists, changes, starts and removes scenarios: named lists of timed steps. */
@customElement('tdc-scenario-panel')
export class ScenarioPanel extends TdcPollingElement {
  static override styles = [
    TdcElement.styles,
    containerHost,
    css`
      tr.scenario {
        cursor: pointer;
      }
      tr.scenario:hover {
        background: var(--secondary-background-color);
      }
    `,
  ];

  @state() private scenarios: ScenarioInfo[] = [];
  @state() private devices: DeviceName[] = [];

  @query('tdc-scenario-form#new') private newForm?: ScenarioForm;

  /** Take over the filter that the session kept. */
  constructor() {
    super();
    this.restoreFilter(SCENARIO_FILTER_TAB, SCENARIO_FIELDS);
  }

  /** Nothing to prepare: the forms start themselves when the actions are known. */
  protected optionsLoaded(): void {
    this.error = '';
  }

  /** Reload the scenarios. */
  protected async refresh(): Promise<void> {
    try {
      [this.scenarios, this.devices] = await Promise.all([
        this.api.scenarios(),
        this.api.deviceNames(),
      ]);
    } catch (err) {
      this.error = describeError(err);
    }
  }

  /** Create the scenario that the new form describes and close the popup. */
  private async add(request: ScenarioRequest): Promise<void> {
    await this.run(async () => {
      await this.api.addScenario(request.name, request.steps);
      this.newForm?.reset();
      this.creating = false;
    });
  }

  /** Save the changes of a scenario and close its form. */
  private async save(item: ScenarioInfo, request: ScenarioRequest): Promise<void> {
    await this.run(async () => {
      await this.api.updateScenario(item.id, request.name, request.steps);
      this.toggle(item.id);
    });
  }

  /** Start a scenario and report how many steps it has. */
  private async start(item: ScenarioInfo): Promise<void> {
    await this.run(async () => {
      const { steps } = await this.api.runScenario(item.id);
      return this.tr('scnStarted', { count: steps });
    });
  }

  /** Return the name of a device or template that a step aims at. */
  private targetLabel(kind: typeof KIND_DEVICE | typeof KIND_TEMPLATE, id: string): string {
    return targetName(kind, id, this.devices, this.templates, this.hass?.language, (count) =>
      this.tr('planDevices', { count }),
    );
  }

  /** Return the controls of the filter with the devices and templates that the scenarios name. */
  private filterFields(): FilterField[] {
    const lang = this.hass?.language;
    return [
      {
        key: 'devices',
        kind: 'multi',
        label: this.tr('filterDevices'),
        options: optionsOf(
          this.scenarios,
          (item) => stepDevices(item, this.devices),
          (id) => this.targetLabel(KIND_DEVICE, id),
          lang,
        ),
      },
      {
        key: 'templates',
        kind: 'multi',
        label: this.tr('filterTemplates'),
        options: optionsOf(
          this.scenarios,
          stepTemplates,
          (id) => this.targetLabel(KIND_TEMPLATE, id),
          lang,
        ),
      },
    ];
  }

  /** Return what the query is searched in: the name and the devices and templates of the steps. */
  private searchTexts(item: ScenarioInfo): string[] {
    return [
      item.name,
      ...stepDevices(item, this.devices).map((id) => this.targetLabel(KIND_DEVICE, id)),
      ...stepTemplates(item).map((id) => this.targetLabel(KIND_TEMPLATE, id)),
    ];
  }

  /** Render the button that opens the popup with the form for a new object. */
  private renderNew(): TemplateResult {
    return this.newPopup(
      this.tr('scnNew'),
      html`<tdc-scenario-form
        id="new"
        .hass=${this.hass}
        .info=${this.info}
        .templates=${this.templates}
        submitLabel=${this.tr('scnCreate')}
        ?busy=${this.busy}
        @tdc-submit=${(e: CustomEvent<ScenarioRequest>) => void this.add(e.detail)}
      ></tdc-scenario-form>`,
    );
  }

  /** Render the table row of one scenario and, if open, its form. */
  private renderRow(item: ScenarioInfo): TemplateResult {
    const first = item.steps[0];
    const { kind } = first ? describeTarget(first.target) : ({ kind: KIND_ALL } as const);
    const lang = this.hass?.language;
    const open = this.expanded.has(item.id);
    return html`<tr class="scenario card" @click=${() => this.toggle(item.id)}>
        ${this.nameCell(item.id, item.name)}
        <td data-label=${this.tr('scnSteps')}>
          ${this.tr('scnStepCount', { count: item.steps.length })}<br /><small
            >${
              first
                ? `${workLabel(lang, first.entity, first.action)} · ${this.tr(`schTarget_${kind}`)}`
                : ''
            }</small
          >
        </td>
        <td data-label=${this.tr('colActions')}>
          <button
            class="primary"
            ?disabled=${this.busy}
            @click=${(e: Event) => {
              e.stopPropagation();
              void this.start(item);
            }}
          >
            ${this.tr('scnRun')}
          </button>
          ${this.removeButton(() => this.api.removeScenario(item.id).then(() => undefined))}
        </td>
      </tr>
      ${
        open
          ? this.editRow(
              COLUMN_COUNT,
              item.id,
              html`<tdc-scenario-form
                .scenario=${item}
                .hass=${this.hass}
                ?busy=${this.busy}
                .templates=${this.templates}
                .info=${this.info}
              ></tdc-scenario-form>`,
              (request: ScenarioRequest) => void this.save(item, request),
            )
          : nothing
      }`;
  }

  /** Render the table of the scenarios that pass the filter. */
  private renderTable(scenarios: ScenarioInfo[]): TemplateResult {
    return html`<table class="cards">
      <tr>
        <th>${this.tr('schName')}</th>
        <th>${this.tr('scnSteps')}</th>
        <th>${this.tr('colActions')}</th>
      </tr>
      ${repeat(
        scenarios,
        (item) => item.id,
        (item) => this.renderRow(item),
      )}
    </table>`;
  }

  /** Render the element. */
  override render(): TemplateResult {
    return html`
      ${this.renderNew()}
      ${
        this.scenarios.length === 0
          ? html`<p>${this.tr('scnNone')}</p>`
          : this.renderFiltered(
              this.scenarios,
              this.filterFields(),
              scenarioRule(this.devices, (item) => this.searchTexts(item)),
              (shown) => this.renderTable(shown),
            )
      }
      <p>${this.message}<span class="error">${this.error}</span></p>
    `;
  }
}
