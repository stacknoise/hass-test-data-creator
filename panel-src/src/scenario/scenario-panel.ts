import { css, html, nothing, type TemplateResult } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import '../common/dialog';
import { describeError } from '../common/api';
import { workLabel } from '../common/labels';
import { TdcElement, containerHost } from '../common/base';
import { TdcPollingElement } from '../common/polling';
import type { ScenarioInfo } from '../common/types';
import { describeTarget } from '../schedule/helpers';
import './scenario-form';
import type { ScenarioForm, ScenarioRequest } from './scenario-form';

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

  @query('tdc-scenario-form#new') private newForm?: ScenarioForm;

  /** Nothing to prepare: the forms start themselves when the actions are known. */
  protected optionsLoaded(): void {
    this.error = '';
  }

  /** Reload the scenarios. */
  protected async refresh(): Promise<void> {
    try {
      this.scenarios = await this.api.scenarios();
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
    const { kind } = first ? describeTarget(first.target) : { kind: 'all' as const };
    const lang = this.hass?.language;
    const open = this.expanded.has(item.id);
    return html`<tr class="scenario card" @click=${() => this.toggle(item.id)}>
        <td class="name">${open ? '▾' : '▸'} ${item.name}</td>
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
              3,
              item.id,
              html`<tdc-scenario-form
                .hass=${this.hass}
                .info=${this.info}
                .templates=${this.templates}
                .scenario=${item}
                submitLabel=${this.tr('schSave')}
                ?busy=${this.busy}
                @tdc-submit=${(e: CustomEvent<ScenarioRequest>) => void this.save(item, e.detail)}
              ></tdc-scenario-form>`,
            )
          : nothing
      }`;
  }

  /** Render the element. */
  override render(): TemplateResult {
    return html`
      ${this.renderNew()}
      ${
        this.scenarios.length === 0
          ? html`<p>${this.tr('scnNone')}</p>`
          : html`<table class="cards">
              <tr>
                <th>${this.tr('schName')}</th>
                <th>${this.tr('scnSteps')}</th>
                <th>${this.tr('colActions')}</th>
              </tr>
              ${repeat(
                this.scenarios,
                (item) => item.id,
                (item) => this.renderRow(item),
              )}
            </table>`
      }
      <p>${this.message}<span class="error">${this.error}</span></p>
    `;
  }
}
