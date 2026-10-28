import { css, html, nothing, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { describeError } from '../common/api';
import { TdcElement } from '../common/base';
import type { DeviceInfo, EntityState, SignalDef } from '../common/types';
import type { TextKey } from '../common/i18n';
import { actionLabel, entityName, labelOf, sortedByLabel, stateLabel } from '../common/labels';
import '../common/menu-button';
import type { MenuItem } from '../common/menu-button';
import '../signals/curve-editor';
import { isDiscrete } from '../signals/editor-helpers';
import {
  DEFAULT_FAULT_SECONDS,
  FAULT_PREFIX,
  VALUE_ACTIONS,
  actionsFor,
  usageEntries,
  faultParams,
  valueParams,
} from './helpers';

/** The details of one device: its area and every entity with its actions and faults. */
@customElement('tdc-device-detail')
export class DeviceDetail extends TdcElement {
  @property({ attribute: false }) device!: DeviceInfo;
  @property({ attribute: false }) actions: Record<string, string[]> = {};
  @property({ attribute: false }) areas: string[] = [];
  @property({ attribute: false }) shapes: string[] = [];

  @state() private areaDraft?: string;
  @state() private picked: Record<string, string> = {};
  @state() private inputs: Record<string, string> = {};
  @state() private curves: Record<string, SignalDef> = {};
  @state() private busy = false;
  @state() private error = '';

  static override styles = [
    TdcElement.styles,
    css`
      :host {
        padding: 8px 0 12px;
        container-type: inline-size;
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
      .area-row {
        align-items: flex-end;
      }
      .area-row small {
        padding-bottom: 8px;
      }
      .curve {
        padding: 4px 0 8px;
      }
      .usage {
        margin: 24px 0 8px 32px;
      }
      .usage ul {
        margin: 8px 0 0;
        padding-left: 20px;
      }
      @container (max-width: 560px) {
        table,
        tbody {
          display: block;
        }
        tr:first-child {
          display: none;
        }
        tr {
          display: flex;
          flex-wrap: wrap;
          column-gap: 12px;
          border-bottom: 1px solid var(--divider-color);
        }
        td {
          border-bottom: 0;
        }
        td:last-child {
          flex: 1 1 100%;
        }
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

  /** Open the curve editor of a sensor with its current curve. */
  private openCurve(entity: EntityState): void {
    if (entity.signal) this.curves = { ...this.curves, [entity.key]: { ...entity.signal } };
  }

  /** Close the curve editor of a sensor without saving. */
  private closeCurve(entity: EntityState): void {
    const rest = { ...this.curves };
    delete rest[entity.key];
    this.curves = rest;
  }

  /** Save the curve of a sensor and close its editor. */
  private async saveCurve(entity: EntityState): Promise<void> {
    const signal = this.curves[entity.key];
    await this.run(async () => {
      await this.api.setSignal(this.device.id, entity.key, signal);
      this.closeCurve(entity);
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
    return html`<div class="row area-row">
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

  /** Return the entries of the action menu of an entity, sorted by their text. */
  private menuItems(entity: EntityState): MenuItem[] {
    const lang = this.hass?.language;
    const found = actionsFor(this.actions, entity.platform);
    const actions = [
      ...found.plain,
      ...found.withValue,
      ...found.faults.map((kind) => `${FAULT_PREFIX}${kind}`),
    ];
    return sortedByLabel(lang, actions, (a) => actionLabel(lang, a)).map((a) => ({
      value: a,
      label: actionLabel(lang, a),
    }));
  }

  /** Run a plain action at once; an action with a number or a fault asks for its input first. */
  private pick(entity: EntityState, action: string): void {
    if (action in VALUE_ACTIONS || action.startsWith(FAULT_PREFIX)) {
      this.picked = { ...this.picked, [entity.key]: action };
    } else {
      void this.fire(entity, action);
    }
  }

  /** Forget the action that waits for its input. */
  private cancelPick(entity: EntityState): void {
    const rest = { ...this.picked };
    delete rest[entity.key];
    this.picked = rest;
  }

  /** Render the input of the chosen action: a number in its range, or the seconds of a fault. */
  private renderPicked(entity: EntityState): TemplateResult | string {
    const action = this.picked[entity.key];
    if (!action) return '';
    const spec = VALUE_ACTIONS[action];
    const id = `${entity.key}:${action}`;
    const text = this.inputs[id] ?? String(spec ? spec.start : DEFAULT_FAULT_SECONDS);
    const params = spec ? valueParams(action, text) : faultParams(text);
    return html`<span class="row">
      <strong>${actionLabel(this.hass?.language, action)}</strong>
      <input
        type="number"
        min=${spec ? spec.min : 1}
        max=${spec ? spec.max : nothing}
        .value=${text}
        title=${spec ? `${spec.min} – ${spec.max}` : this.tr('detSeconds')}
        @input=${(e: Event) =>
          (this.inputs = { ...this.inputs, [id]: (e.target as HTMLInputElement).value })}
      />
      <small>${spec ? `${spec.min} – ${spec.max}` : this.tr('detSeconds')}</small>
      <button
        class="primary"
        ?disabled=${this.busy || !params}
        @click=${async () => {
          await this.fire(entity, action, params);
          if (!this.error) this.cancelPick(entity);
        }}
      >
        ${this.tr('detRun')}
      </button>
      <button ?disabled=${this.busy} @click=${() => this.cancelPick(entity)}>
        ${this.tr('detCancel')}
      </button>
    </span>`;
  }

  /** Render the curve editor of one sensor with its save and cancel buttons. */
  private renderCurve(entity: EntityState): TemplateResult {
    return html`<tr>
      <td colspan="3" class="curve">
        <tdc-curve-editor
          .hass=${this.hass}
          .signal=${this.curves[entity.key]}
          .shapes=${this.shapes.filter((shape) => !isDiscrete(shape))}
          unit=${entity.unit ?? ''}
          @tdc-signal-change=${(e: CustomEvent<SignalDef>) =>
            (this.curves = { ...this.curves, [entity.key]: e.detail })}
        ></tdc-curve-editor>
        <p class="row">
          <button
            class="primary"
            ?disabled=${this.busy}
            @click=${() => void this.saveCurve(entity)}
          >
            ${this.tr('detSaveCurve')}
          </button>
          <button ?disabled=${this.busy} @click=${() => this.closeCurve(entity)}>
            ${this.tr('detCancel')}
          </button>
        </p>
      </td>
    </tr>`;
  }

  /** Render the row of one entity. */
  private renderEntity(entity: EntityState): TemplateResult {
    const lang = this.hass?.language;
    const items = this.menuItems(entity);
    const editable = entity.signal != null && !isDiscrete(entity.signal.shape);
    return html`<tr>
        <td>
          ${entityName(lang, entity.key, entity.name)}<br /><small
            >${labelOf(lang, 'platform', entity.platform)}</small
          >
        </td>
        <td>
          ${stateLabel(lang, entity.state)}${entity.unit ? ` ${entity.unit}` : ''}${
            entity.fault
              ? html`<br /><small class="warning">⚠ ${labelOf(lang, 'fault', entity.fault)}</small>`
              : ''
          }
        </td>
        <td class="row">
          ${
            items.length
              ? html`<tdc-menu-button
                  .hass=${this.hass}
                  label=${this.tr('detActions')}
                  ?disabled=${this.busy}
                  .items=${items}
                  @tdc-pick=${(e: CustomEvent<string>) => this.pick(entity, e.detail)}
                ></tdc-menu-button>`
              : ''
          }
          ${this.renderPicked(entity)}
          ${
            editable
              ? html`<button
                  ?disabled=${this.busy || entity.key in this.curves}
                  @click=${() => this.openCurve(entity)}
                >
                  ${this.tr('detCurve')}
                </button>`
              : ''
          }
        </td>
      </tr>
      ${entity.key in this.curves ? this.renderCurve(entity) : ''}`;
  }

  /** Render the list of the schedules, scenarios and groups that name the device. */
  private renderUsage(): TemplateResult {
    const entries = usageEntries(this.device.used_by);
    if (entries.length === 0)
      return html`<p class="usage"><small>${this.tr('useNone')}</small></p>`;
    return html`<details class="usage">
      <summary>${this.tr('useTitle', { count: entries.length })}</summary>
      <ul>
        ${entries.map(
          (entry) => html`<li>${this.tr(`use_${entry.kind}` as TextKey)}: ${entry.name}</li>`,
        )}
      </ul>
    </details>`;
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
      ${this.renderUsage()}
      <p class="error">${this.error}</p>
    `;
  }
}
