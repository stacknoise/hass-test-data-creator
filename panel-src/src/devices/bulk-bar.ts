import { css, html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { describeError } from '../common/api';
import { actionLabel, sortedByLabel } from '../common/labels';
import '../common/dialog';
import { areaPicker } from './area-picker';
import { TdcElement } from '../common/base';
import type { BulkRemovalPlan, BulkTarget, GroupInfo } from '../common/types';
import { actionChoices, actionInput, bulkParams, needsConfirmBox } from './bulk-helpers';
import { DEFAULT_FAULT_SECONDS, VALUE_ACTIONS } from './helpers';

const MODE_AREA = 'area';
const MODE_GROUP = 'group';
const MODE_ACTION = 'action';
const MODE_REMOVE = 'remove';
/** The dialog that is open, or none. */
type Mode = '' | typeof MODE_AREA | typeof MODE_GROUP | typeof MODE_ACTION | typeof MODE_REMOVE;
const LISTED_MAX = 8;

/** The bar over the device list with the bulk actions for the selected devices and their dialogs. */
@customElement('tdc-bulk-bar')
export class BulkBar extends TdcElement {
  @property({ type: Number }) count = 0;
  @property({ attribute: false }) target: BulkTarget = { ids: [] };
  @property({ attribute: false }) areas: string[] = [];
  @property({ attribute: false }) actions: Record<string, string[]> = {};
  @property({ type: Boolean }) mqtt = false;

  @state() private mode: Mode = '';
  @state() private busy = false;
  @state() private error = '';
  @state() private area = '';
  @state() private groupName = '';
  @state() private groupId = '';
  @state() private groups: GroupInfo[] = [];
  @state() private action = '';
  @state() private input = '';
  @state() private plan?: BulkRemovalPlan;
  @state() private confirmed = false;

  static override styles = [
    TdcElement.styles,
    css`
      .bar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
        margin: 8px 0;
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: var(--secondary-background-color);
      }
      .dialog-body {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .buttons {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
      }
    `,
  ];

  /** Leave a dialog when the selection changes under it. */
  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('target') && this.mode) this.close();
  }

  /** Return `expected` with the number the user saw, so the server refuses a changed selection. */
  private confirmedTarget(): BulkTarget {
    return { ...this.target, expected: this.count };
  }

  /** Close the dialog and forget its inputs. */
  private close(): void {
    this.mode = '';
    this.error = '';
    this.plan = undefined;
    this.confirmed = false;
  }

  /** Open the dialog of `mode`; the removal asks the server for its plan first. */
  private async open(mode: Mode): Promise<void> {
    this.error = '';
    this.mode = mode;
    try {
      if (mode === MODE_REMOVE) this.plan = await this.api.bulkRemovePlan(this.confirmedTarget());
      if (mode === MODE_GROUP) this.groups = await this.api.groups();
    } catch (err) {
      this.error = describeError(err);
    }
  }

  /** Run `call`, tell the list to reload and say what happened; an error stays in the dialog. */
  private async apply(call: () => Promise<string>): Promise<void> {
    this.busy = true;
    this.error = '';
    try {
      const message = await call();
      this.close();
      this.dispatchEvent(new CustomEvent('tdc-bulk-done', { detail: message }));
    } catch (err) {
      this.error = describeError(err);
    } finally {
      this.busy = false;
    }
  }

  /** Pause or resume the selected devices at once; no dialog, because the effect is reversible. */
  private async pause(paused: boolean): Promise<void> {
    await this.apply(async () => {
      const result = await this.api.bulkPause(this.confirmedTarget(), paused);
      return this.tr(paused ? 'bulkPaused' : 'bulkResumed', { count: result.devices });
    });
  }

  /** Render the buttons of the dialogs. */
  private buttons(label: string, enabled: boolean, run: () => Promise<string>): TemplateResult {
    return html`<div class="buttons">
      <button @click=${() => this.close()}>${this.tr('detCancel')}</button>
      <button
        class="primary"
        ?disabled=${this.busy || !enabled}
        @click=${() => void this.apply(run)}
      >
        ${label}
      </button>
    </div>`;
  }

  /** Render the dialog of the area. */
  private renderArea(): TemplateResult {
    return html`<label
        >${this.tr('detArea')}
        ${areaPicker(this.hass, this.areas, this.area, { field: this.tr('detArea'), none: this.tr('detAreaNone') }, (area) => (this.area = area))}
      </label>
      <small>${this.tr('detAreaHint')}</small>
      ${this.buttons(this.tr('bulkAreaApply'), true, async () => {
        const result = await this.api.bulkArea(this.confirmedTarget(), this.area.trim() || null);
        return this.tr('bulkMoved', { count: result.devices });
      })}`;
  }

  /** Render the dialog of the group. */
  private renderGroup(): TemplateResult {
    const existing = this.groupId !== '';
    const ready = existing || this.groupName.trim() !== '';
    return html`<small>${this.tr('bulkGroupNote')}</small>
      <label
        >${this.tr('bulkGroupExisting')}
        <select @change=${(e: Event) => (this.groupId = (e.target as HTMLSelectElement).value)}>
          <option value="">${this.tr('bulkGroupNew')}</option>
          ${this.groups.map(
            (g) =>
              html`<option value=${g.id} ?selected=${g.id === this.groupId}>${g.name}</option>`,
          )}
        </select>
      </label>
      ${
        existing
          ? nothing
          : html`<label
              >${this.tr('bulkGroupName')}
              <input
                .value=${this.groupName}
                @input=${(e: Event) => (this.groupName = (e.target as HTMLInputElement).value)}
              />
            </label>`
      }
      ${this.buttons(this.tr('bulkGroupApply'), ready, async () => {
        const group = existing ? { group_id: this.groupId } : { name: this.groupName.trim() };
        const result = await this.api.bulkGroup(this.confirmedTarget(), group);
        return this.tr('bulkGrouped', { name: result.name });
      })}`;
  }

  /** Return the parameters of the chosen action, or undefined while the input does not fit. */
  private actionParams(): Record<string, number> | undefined {
    return this.action ? bulkParams(this.action, this.input) : undefined;
  }

  /** Choose an action and preset its input. */
  private pickAction(action: string): void {
    this.action = action;
    this.input = String(VALUE_ACTIONS[action]?.start ?? DEFAULT_FAULT_SECONDS);
  }

  /** Render the dialog of the action. */
  private renderAction(): TemplateResult {
    const lang = this.hass?.language;
    const kind = actionInput(this.action);
    return html`<label
        >${this.tr('schAction')}
        <select @change=${(e: Event) => this.pickAction((e.target as HTMLSelectElement).value)}>
          <option value=""></option>
          ${sortedByLabel(lang, actionChoices(this.actions), (a) => actionLabel(lang, a)).map(
            (a) =>
              html`<option value=${a} ?selected=${a === this.action}>
                ${actionLabel(lang, a)}
              </option>`,
          )}
        </select>
      </label>
      ${
        kind === 'none'
          ? nothing
          : html`<label
              >${this.tr(kind === 'value' ? 'bulkActionValue' : 'bulkActionSeconds')}
              <input
                type="number"
                .value=${this.input}
                @input=${(e: Event) => (this.input = (e.target as HTMLInputElement).value)}
              />
            </label>`
      }
      ${this.buttons(this.tr('bulkActionRun'), this.actionParams() !== undefined, async () => {
        const result = await this.api.bulkAction(
          this.confirmedTarget(),
          this.action,
          this.actionParams() ?? {},
        );
        return this.tr('bulkRan', { count: result.devices, failed: result.failed });
      })}`;
  }

  /** Render the dialog of the removal: the number, what is in use, and the checkbox above 100. */
  private renderRemove(): TemplateResult {
    const plan = this.plan;
    if (!plan) return html`${this.error ? nothing : this.tr('loading')}`;
    const blocked = plan.in_use.length > 0;
    const box = needsConfirmBox(plan.count);
    const names = plan.in_use.map((item) => item.device);
    const shown = names.slice(0, LISTED_MAX).join(', ') + (names.length > LISTED_MAX ? ' …' : '');
    return html`<p>${this.tr('bulkRemoveLead', { count: plan.count })}</p>
      ${
        blocked
          ? html`<p class="error">${this.tr('bulkRemoveInUse', { names: shown })}</p>`
          : nothing
      }
      ${
        box
          ? html`<label class="row">
              <input
                type="checkbox"
                .checked=${this.confirmed}
                @change=${(e: Event) => (this.confirmed = (e.target as HTMLInputElement).checked)}
              />
              ${this.tr('bulkRemoveBox', { count: plan.count })}
            </label>`
          : nothing
      }
      ${this.buttons(
        this.tr('bulkRemoveApply', { count: plan.count }),
        !blocked && plan.count > 0 && (!box || this.confirmed),
        async () => {
          const result = await this.api.bulkRemove(this.confirmedTarget());
          return this.tr('bulkRemoved', { count: result.devices });
        },
      )}`;
  }

  /** Render the dialog for the current mode. */
  private renderDialog(): TemplateResult {
    const headings: Record<string, string> = {
      [MODE_AREA]: 'bulkAreaHeading',
      [MODE_GROUP]: 'bulkGroupHeading',
      [MODE_ACTION]: 'bulkActionHeading',
      [MODE_REMOVE]: 'bulkRemoveHeading',
    };
    const heading = this.mode
      ? this.tr(headings[this.mode] as 'bulkAreaHeading', { count: this.count })
      : '';
    return html`<tdc-dialog
      .hass=${this.hass}
      heading=${heading}
      ?open=${this.mode !== ''}
      @tdc-close=${() => this.close()}
    >
      <div class="dialog-body">
        ${this.mode === MODE_AREA ? this.renderArea() : nothing}
        ${this.mode === MODE_GROUP ? this.renderGroup() : nothing}
        ${this.mode === MODE_ACTION ? this.renderAction() : nothing}
        ${this.mode === MODE_REMOVE ? this.renderRemove() : nothing}
        ${this.error ? html`<p class="error">${this.error}</p>` : nothing}
      </div>
    </tdc-dialog>`;
  }

  /** Render the element. */
  override render(): TemplateResult {
    if (this.count === 0) return html`${nothing}`;
    return html`<div class="bar">
        <strong>${this.tr('bulkSelected', { count: this.count })}</strong>
        <button @click=${() => void this.open(MODE_AREA)}>${this.tr('bulkArea')}</button>
        ${
          this.mqtt
            ? html`<button @click=${() => void this.open(MODE_GROUP)}>
                ${this.tr('bulkGroup')}
              </button>`
            : nothing
        }
        <button @click=${() => void this.open(MODE_ACTION)}>${this.tr('bulkAction')}</button>
        <button @click=${() => void this.pause(true)} ?disabled=${this.busy}>
          ${this.tr('pause')}
        </button>
        <button @click=${() => void this.pause(false)} ?disabled=${this.busy}>
          ${this.tr('resume')}
        </button>
        <button @click=${() => void this.open(MODE_REMOVE)}>${this.tr('bulkRemove')}</button>
        <button @click=${() => this.dispatchEvent(new CustomEvent('tdc-bulk-clear'))}>
          ${this.tr('bulkClear')}
        </button>
      </div>
      ${this.renderDialog()}`;
  }
}
