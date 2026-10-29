import { css, html, type CSSResultGroup, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { TdcElement } from '../common/base';
import { labelOf, sortedByLabel } from '../common/labels';
import type { EntityDef, SignalDef } from '../common/types';
import '../signals/curve-editor';
import '../signals/signal-preview';
import {
  entityProblem,
  hasSignal,
  keyOf,
  newEntity,
  withItem,
  withoutItem,
  withPlatform,
} from './entity-helpers';
import { rangeLabel } from './helpers';
import { PLATFORM_SENSOR } from '../common/constants';

const NEW = -1;

/** Lists the entities of a custom device and adds, changes and removes them with a form. */
@customElement('tdc-entity-editor')
export class EntityEditor extends TdcElement {
  @property({ attribute: false }) entities: EntityDef[] = [];
  @property({ attribute: false }) shapes: string[] = [];
  @property({ attribute: false }) platforms: string[] = [];

  @state() private draft?: EntityDef;
  @state() private editIndex = NEW;
  @state() private keyTouched = false;

  static override styles: CSSResultGroup = [
    TdcElement.styles,
    css`
      :host {
        --row-height: 44px;
      }
      ul {
        list-style: none;
        margin: 0;
        padding: 0;
        height: calc(4 * var(--row-height) + 2px);
        box-sizing: border-box;
        overflow-y: auto;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
      }
      li {
        display: flex;
        align-items: center;
        gap: 10px;
        box-sizing: border-box;
        height: var(--row-height);
        padding: 0 10px;
        border-bottom: 1px solid var(--divider-color);
      }
      li:last-child {
        border-bottom: none;
      }
      li.editing {
        background: var(--secondary-background-color);
      }
      .name {
        flex: 1 1 auto;
        min-width: 0;
      }
      .name div {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .range {
        flex: 0 0 auto;
        color: var(--secondary-text-color);
        font-size: 0.85em;
      }
      tdc-signal-preview {
        flex: 0 0 90px;
      }
      .empty {
        justify-content: center;
        text-align: center;
        color: var(--secondary-text-color);
      }
      .head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
      }
      .draft {
        margin-top: 10px;
        padding: 12px;
        border: 1px dashed var(--primary-color);
        border-radius: 6px;
        display: grid;
        gap: 10px;
      }
      .actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        align-items: center;
      }
      button.small {
        padding: 2px 8px;
      }
      button.danger {
        color: var(--error-color);
      }
    `,
  ];

  /** Tell the parent about the changed list. */
  private emit(entities: EntityDef[]): void {
    this.dispatchEvent(new CustomEvent('tdc-entities-change', { detail: entities }));
  }

  /** Open the form for a new entity. */
  private add(): void {
    this.draft = newEntity(this.platforms.includes(PLATFORM_SENSOR) ? PLATFORM_SENSOR : 'switch');
    this.editIndex = NEW;
    this.keyTouched = false;
  }

  /** Open the form for the entity at `index`. */
  private edit(index: number): void {
    this.draft = structuredClone(this.entities[index]);
    this.editIndex = index;
    this.keyTouched = true;
  }

  /** Remove the entity at `index`. */
  private removeAt(index: number): void {
    this.emit(withoutItem(this.entities, index));
    if (this.editIndex === index) this.draft = undefined;
    else if (this.editIndex > index) this.editIndex -= 1;
  }

  /** Close the form without saving. */
  private cancel(): void {
    this.draft = undefined;
  }

  /** Take the draft into the list. */
  private apply(): void {
    if (!this.draft) return;
    this.emit(withItem(this.entities, this.editIndex, this.draft));
    this.draft = undefined;
  }

  /** Change a field of the draft; the key follows the name until it was typed by hand. */
  private setField(field: 'name' | 'key' | 'unit', value: string): void {
    if (!this.draft) return;
    const next = { ...this.draft, [field]: value };
    if (field === 'key') this.keyTouched = true;
    if (field === 'name' && !this.keyTouched) next.key = keyOf(value);
    if (field === 'unit' && !value) delete next.unit;
    this.draft = next;
  }

  /** Return the keys of all entities except the one being edited. */
  private otherKeys(): string[] {
    return this.entities.filter((_, i) => i !== this.editIndex).map((e) => e.key);
  }

  /** Render one row of the list. */
  private renderRow(entity: EntityDef, index: number): TemplateResult {
    const platform = labelOf(this.hass?.language, 'platform', entity.platform);
    return html`<li class=${index === this.editIndex && this.draft ? 'editing' : ''}>
      <span class="name">
        <div title=${entity.name}>${entity.name}</div>
        <small>${entity.key} · ${platform}</small>
      </span>
      ${
        entity.signal
          ? html`<span class="range">${rangeLabel(entity.signal, entity.unit)}</span>
              <tdc-signal-preview compact .signal=${entity.signal}></tdc-signal-preview>`
          : ''
      }
      <button class="small" @click=${() => this.edit(index)}>${this.tr('entEdit')}</button>
      <button class="small danger" @click=${() => this.removeAt(index)}>
        ${this.tr('entDelete')}
      </button>
    </li>`;
  }

  /** Render the form of the entity being added or changed. */
  private renderDraft(draft: EntityDef): TemplateResult {
    const problem = entityProblem(draft, this.otherKeys());
    const lang = this.hass?.language;
    return html`<div class="draft">
      <b>${this.tr(this.editIndex < 0 ? 'entNew' : 'entChange')}</b>
      <div class="row form">
        <label style="flex: 1 1 160px"
          >${this.tr('colName')}
          <input
            .value=${draft.name}
            @input=${(e: Event) => this.setField('name', (e.target as HTMLInputElement).value)}
          />
        </label>
        <label style="flex: 1 1 140px"
          >${this.tr('entKey')}
          <input
            .value=${draft.key}
            @input=${(e: Event) => this.setField('key', (e.target as HTMLInputElement).value)}
          />
        </label>
        <label style="flex: 1 1 140px"
          >${this.tr('entPlatform')}
          <select
            @change=${(e: Event) =>
              (this.draft = withPlatform(draft, (e.target as HTMLSelectElement).value))}
          >
            ${sortedByLabel(lang, this.platforms, (p) => labelOf(lang, 'platform', p)).map(
              (platform) =>
                html`<option value=${platform} ?selected=${platform === draft.platform}>
                  ${labelOf(lang, 'platform', platform)}
                </option>`,
            )}
          </select>
        </label>
        ${
          draft.platform === PLATFORM_SENSOR
            ? html`<label style="flex: 0 1 90px"
                >${this.tr('entUnit')}
                <input
                  .value=${draft.unit ?? ''}
                  @input=${(e: Event) => this.setField('unit', (e.target as HTMLInputElement).value)}
                />
              </label>`
            : ''
        }
      </div>
      ${
        draft.event_types
          ? html`<label
              >${this.tr('entEventTypesLabel')}
              <input
                .value=${draft.event_types.join(', ')}
                @input=${(e: Event) =>
                  (this.draft = {
                    ...draft,
                    event_types: (e.target as HTMLInputElement).value
                      .split(',')
                      .map((type) => type.trim())
                      .filter(Boolean),
                  })}
              />
            </label>`
          : ''
      }
      ${
        hasSignal(draft.platform) && draft.signal
          ? html`<tdc-curve-editor
              .hass=${this.hass}
              .signal=${draft.signal}
              .shapes=${this.shapes}
              unit=${draft.unit ?? ''}
              @tdc-signal-change=${(e: CustomEvent<SignalDef>) =>
                (this.draft = { ...draft, signal: e.detail })}
            ></tdc-curve-editor>`
          : ''
      }
      <div class="actions">
        <span class="error">${problem ? this.tr(problem) : ''}</span>
        <button @click=${() => this.cancel()}>${this.tr('detCancel')}</button>
        <button class="primary" ?disabled=${problem !== ''} @click=${() => this.apply()}>
          ${this.tr('entApply')}
        </button>
      </div>
    </div>`;
  }

  /** Render the element. */
  override render(): TemplateResult {
    return html`<div class="head">
        <b>${this.tr('customEntities')} (${this.entities.length})</b>
        <button class="primary" @click=${() => this.add()}>${this.tr('entAdd')}</button>
      </div>
      <ul>
        ${
          this.entities.length
            ? this.entities.map((entity, index) => this.renderRow(entity, index))
            : html`<li class="empty">${this.tr('entEmpty')}</li>`
        }
      </ul>
      ${this.draft ? this.renderDraft(this.draft) : ''}`;
  }
}
