import { css, html, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { describeError } from '../common/api';
import { TdcElement } from '../common/base';
import '../common/target-select';
import type { TextKey } from '../common/i18n';
import { usageEntries } from '../devices/helpers';
import { sortedByLabel } from '../common/labels';
import type { RemovalPlan, RemovalTarget } from '../common/types';
import { KIND_ALL, LIST_SEPARATOR } from '../common/constants';

const LISTED_MAX = 20;

const TARGET_LABELS: Record<RemovalTarget, TextKey> = {
  all: 'targetAll',
  device: 'targetDevice',
  run: 'targetRun',
};

/** Shows what a removal would delete and removes it after the user confirms. */
@customElement('tdc-removal-panel')
export class RemovalPanel extends TdcElement {
  static override styles = [
    TdcElement.styles,
    css`
      .plan {
        margin-top: 20px;
      }
      .plan ul {
        margin: 0 0 12px;
        padding-left: 20px;
      }
    `,
  ];

  @property() target: RemovalTarget = KIND_ALL;
  @property() targetId = '';

  @state() private plan?: RemovalPlan;
  @state() private busy = false;
  @state() private leftover?: string[];
  @state() private message = '';
  @state() private error = '';

  /** Ask the backend what the removal of the selected target would delete. */
  private async showPlan(): Promise<void> {
    this.message = '';
    this.error = '';
    try {
      this.plan = await this.api.removalPlan(this.target, this.targetId || undefined);
    } catch (err) {
      this.plan = undefined;
      this.error = describeError(err);
    }
  }

  /** Run the removal that was shown. */
  private async confirm(): Promise<void> {
    this.busy = true;
    try {
      const result = await this.api.removalRun(this.target, this.targetId || undefined);
      this.message = this.tr('removed', { count: result.devices + result.orphans });
      this.plan = undefined;
    } catch (err) {
      this.error = describeError(err);
    }
    this.busy = false;
  }

  /** Ask the broker for retained topics of generated devices that the store does not know. */
  private async scanTopics(): Promise<void> {
    this.message = '';
    this.error = '';
    this.busy = true;
    try {
      this.leftover = (await this.api.orphanTopics()).topics;
    } catch (err) {
      this.leftover = undefined;
      this.error = describeError(err);
    }
    this.busy = false;
  }

  /** Delete the leftover topics that were shown. */
  private async deleteLeftover(): Promise<void> {
    this.busy = true;
    try {
      const result = await this.api.clearOrphanTopics(this.leftover ?? []);
      this.message = this.tr('leftoverDeleted', { count: result.cleared.length });
      this.leftover = undefined;
    } catch (err) {
      this.error = describeError(err);
    }
    this.busy = false;
  }

  /** Render the leftover topics and the button that deletes them. */
  private renderLeftover(topics: string[]): TemplateResult {
    if (topics.length === 0) return html`<p>${this.tr('leftoverNone')}</p>`;
    return html`<p>${this.tr('leftoverTopics', { count: topics.length })}</p>
      <p>
        <small
          >${topics.slice(0, LISTED_MAX).join(LIST_SEPARATOR)}${topics.length > LISTED_MAX ? ' …' : ''}</small
        >
      </p>
      <button class="primary" ?disabled=${this.busy} @click=${() => void this.deleteLeftover()}>
        ${this.tr('deleteLeftover')}
      </button>`;
  }

  /** Render the list of what will be removed. */
  private renderPlan(plan: RemovalPlan): TemplateResult {
    const total = plan.devices.length + plan.orphans.length;
    if (total === 0 && plan.runs.length === 0) return html`<p>${this.tr('planNothing')}</p>`;
    return html`<ul>
        <li>${this.tr('planDevices', { count: plan.devices.length })}</li>
        ${
          plan.groups.length
            ? html`<li>${this.tr('planGroups', { count: plan.groups.length })}</li>`
            : ''
        }
        ${
          plan.topics.length
            ? html`<li>${this.tr('planTopics', { count: plan.topics.length })}</li>`
            : ''
        }
        ${
          plan.statistics.length
            ? html`<li>${this.tr('planStatistics', { count: plan.statistics.length })}</li>`
            : ''
        }
        ${
          plan.scenarios.length
            ? html`<li>${this.tr('planScenarios', { count: plan.scenarios.length })}</li>`
            : ''
        }
        ${
          plan.schedules.length
            ? html`<li>${this.tr('planSchedules', { count: plan.schedules.length })}</li>`
            : ''
        }
        ${
          plan.orphans.length
            ? html`<li>${this.tr('planOrphans', { count: plan.orphans.length })}</li>`
            : ''
        }
        ${
          plan.areas.length
            ? html`<li>${this.tr('planAreas', { names: plan.areas.join(LIST_SEPARATOR) })}</li>`
            : ''
        }
      </ul>
      <p>
        <small
          >${plan.devices
            .slice(0, LISTED_MAX)
            .map((d) => d.name)
            .join(LIST_SEPARATOR)}${plan.devices.length > LISTED_MAX ? ' …' : ''}</small
        >
      </p>
      ${
        plan.in_use.length
          ? html`<p class="error">${this.tr('inUseWarning')}</p>
              <ul>
                ${plan.in_use.map(
                  (item) =>
                    html`<li>
                      ${item.device}:
                      ${usageEntries(item.usage)
                        .map((entry) => `${this.tr(`use_${entry.kind}` as TextKey)} ${entry.name}`)
                        .join(LIST_SEPARATOR)}
                    </li>`,
                )}
              </ul>`
          : ''
      }
      <button
        class="primary"
        ?disabled=${this.busy || plan.in_use.length > 0}
        @click=${() => void this.confirm()}
      >
        ${this.tr('confirmRemove')}
      </button>`;
  }

  /** Render the element. */
  override render(): TemplateResult {
    return html`
      <div class="fields bottom">
        <label
          >${this.tr('target')}
          <select
            @change=${(e: Event) => {
              this.target = (e.target as HTMLSelectElement).value as RemovalTarget;
              this.plan = undefined;
            }}
          >
            ${sortedByLabel(
              this.hass?.language,
              Object.keys(TARGET_LABELS) as RemovalTarget[],
              (kind) => this.tr(TARGET_LABELS[kind]),
            ).map(
              (kind) =>
                html`<option value=${kind} ?selected=${this.target === kind}>
                  ${this.tr(TARGET_LABELS[kind])}
                </option>`,
            )}
          </select>
        </label>
        ${
          this.target === KIND_ALL
            ? ''
            : html`<tdc-target-select
                .hass=${this.hass}
                kind=${this.target}
                .values=${this.targetId ? [this.targetId] : []}
                @tdc-target-change=${(e: CustomEvent<string[]>) => {
                  this.targetId = e.detail[0] ?? '';
                  this.plan = undefined;
                }}
              ></tdc-target-select>`
        }
        <div>
          <button
            ?disabled=${this.target !== KIND_ALL && !this.targetId}
            @click=${() => void this.showPlan()}
          >
            ${this.tr('showPlan')}
          </button>
        </div>
      </div>
      ${this.plan ? html`<div class="plan">${this.renderPlan(this.plan)}</div>` : ''}
      <div class="plan">
        <button ?disabled=${this.busy} @click=${() => void this.scanTopics()}>
          ${this.tr('scanTopics')}
        </button>
        ${this.leftover ? this.renderLeftover(this.leftover) : ''}
      </div>
      <p>${this.message}<span class="error">${this.error}</span></p>
    `;
  }
}
