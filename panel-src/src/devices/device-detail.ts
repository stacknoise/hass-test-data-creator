import { css, html, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { describeError } from '../common/api';
import { TdcElement } from '../common/base';
import type { DeviceInfo, EntityState } from '../common/types';
import {
  DEFAULT_FAULT_SECONDS,
  FAULT_PREFIX,
  VALUE_ACTIONS,
  actionsFor,
  faultParams,
  valueParams,
} from './helpers';

/** The details of one device: its area and every entity with its actions and faults. */
@customElement('tdc-device-detail')
export class DeviceDetail extends TdcElement {
  @property({ attribute: false }) device!: DeviceInfo;
  @property({ attribute: false }) actions: Record<string, string[]> = {};
  @property({ attribute: false }) areas: string[] = [];

  @state() private areaDraft?: string;
  @state() private values: Record<string, string> = {};
  @state() private faultKind: Record<string, string> = {};
  @state() private faultSeconds: Record<string, string> = {};
  @state() private busy = false;
  @state() private error = '';

  static override styles = [
    TdcElement.styles,
    css`
      :host {
        padding: 8px 0 12px;
      }
      td {
        vertical-align: middle;
      }
      input[type='number'] {
        width: 80px;
      }
      select {
        width: auto;
      }
    `,
  ];

  /** Run a call, tell the list to reload, and show an error as text. */
  private async run(call: () => Promise<unknown>): Promise<void> {
    this.busy = true;
    this.error = '';
    try {
      await call();
      this.dispatchEvent(new CustomEvent('tdc-changed', { bubbles: true, composed: true }));
    } catch (err) {
      this.error = describeError(err);
    }
    this.busy = false;
  }

  /** Save the area; an empty text takes the device out of its area. */
  private async saveArea(): Promise<void> {
    const text = (this.areaDraft ?? this.device.area ?? '').trim();
    await this.run(async () => {
      await this.api.updateDevice(this.device.id, text || null);
      this.areaDraft = undefined;
    });
  }

  /** Fire an action of an entity. */
  private fire(
    entity: EntityState,
    action: string,
    params?: Record<string, unknown>,
  ): Promise<void> {
    return this.run(() => this.api.fire(this.device.id, entity.key, action, params));
  }

  /** Render the area field with a list of the known areas. */
  private renderArea(): TemplateResult {
    const draft = this.areaDraft ?? this.device.area ?? '';
    const changed = draft.trim() !== (this.device.area ?? '');
    return html`<div class="row">
      <label style="flex: 0 1 320px"
        >${this.tr('detArea')}
        <input
          list="tdc-areas"
          .value=${draft}
          placeholder=${this.tr('detAreaNone')}
          @input=${(e: Event) => (this.areaDraft = (e.target as HTMLInputElement).value)}
        />
        <datalist id="tdc-areas">
          ${this.areas.map((name) => html`<option value=${name}></option>`)}
        </datalist>
      </label>
      <button
        class="primary"
        ?disabled=${this.busy || !changed}
        @click=${() => void this.saveArea()}
      >
        ${this.tr('detSaveArea')}
      </button>
      <small>${this.tr('detAreaHint')}</small>
    </div>`;
  }

  /** Render the buttons and fields of the actions that take a number. */
  private renderValueAction(entity: EntityState, action: string): TemplateResult {
    const spec = VALUE_ACTIONS[action];
    const id = `${entity.key}:${action}`;
    const text = this.values[id] ?? String(spec.start);
    const params = valueParams(action, text);
    return html`<span class="row">
      <input
        type="number"
        min=${spec.min}
        max=${spec.max}
        .value=${text}
        @input=${(e: Event) =>
          (this.values = { ...this.values, [id]: (e.target as HTMLInputElement).value })}
      />
      <button
        ?disabled=${this.busy || !params}
        @click=${() => void this.fire(entity, action, params)}
      >
        ${action}
      </button>
    </span>`;
  }

  /** Render the fault select with the duration and its start button. */
  private renderFault(entity: EntityState, kinds: string[]): TemplateResult {
    const kind = this.faultKind[entity.key] ?? kinds[0];
    const text = this.faultSeconds[entity.key] ?? String(DEFAULT_FAULT_SECONDS);
    const params = faultParams(text);
    return html`<span class="row">
      <select
        @change=${(e: Event) =>
          (this.faultKind = {
            ...this.faultKind,
            [entity.key]: (e.target as HTMLSelectElement).value,
          })}
      >
        ${kinds.map((k) => html`<option value=${k} ?selected=${k === kind}>${k}</option>`)}
      </select>
      <input
        type="number"
        min="1"
        .value=${text}
        title=${this.tr('detSeconds')}
        @input=${(e: Event) =>
          (this.faultSeconds = {
            ...this.faultSeconds,
            [entity.key]: (e.target as HTMLInputElement).value,
          })}
      />
      <button
        ?disabled=${this.busy || !params}
        @click=${() => void this.fire(entity, `${FAULT_PREFIX}${kind}`, params)}
      >
        ${this.tr('detFault')}
      </button>
    </span>`;
  }

  /** Render the row of one entity. */
  private renderEntity(entity: EntityState): TemplateResult {
    const available = actionsFor(this.actions, entity.platform);
    return html`<tr>
      <td>${entity.name}<br /><small>${entity.platform}</small></td>
      <td>
        ${entity.state ?? '–'}${entity.unit ? ` ${entity.unit}` : ''}${
          entity.fault ? html`<br /><small class="warning">⚠ ${entity.fault}</small>` : ''
        }
      </td>
      <td class="row">
        ${available.plain.map(
          (action) =>
            html`<button ?disabled=${this.busy} @click=${() => void this.fire(entity, action)}>
              ${action}
            </button>`,
        )}
        ${available.withValue.map((action) => this.renderValueAction(entity, action))}
        ${available.faults.length ? this.renderFault(entity, available.faults) : ''}
      </td>
    </tr>`;
  }

  /** Render the element. */
  override render(): TemplateResult {
    return html`
      ${this.renderArea()}
      <table>
        <tr>
          <th>${this.tr('detEntity')}</th>
          <th>${this.tr('detState')}</th>
          <th>${this.tr('colActions')}</th>
        </tr>
        ${this.device.entities.map((entity) => this.renderEntity(entity))}
      </table>
      <p class="error">${this.error}</p>
    `;
  }
}
