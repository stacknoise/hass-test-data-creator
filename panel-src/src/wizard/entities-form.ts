import { html, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { TdcElement } from '../common/base';
import { sortedByLabel, templateLabel } from '../common/labels';
import type { EntityDef, TemplateInfo } from '../common/types';
import './entity-editor';

/** The entities of a custom device or an own template: an optional start from a template and the entity editor. */
@customElement('tdc-entities-form')
export class EntitiesForm extends TdcElement {
  @property({ attribute: false }) templates: TemplateInfo[] = [];
  @property({ attribute: false }) entities: EntityDef[] = [];
  @property({ attribute: false }) shapes: string[] = [];
  @property({ attribute: false }) platforms: string[] = [];

  @state() private pendingBase = '';

  /** Tell the parent that the entities changed. */
  private change(entities: EntityDef[]): void {
    this.dispatchEvent(new CustomEvent('tdc-entities-change', { detail: entities }));
  }

  /** Take over the entities of the template `pendingBase` and drop the current ones. */
  private applyBase(): void {
    const base = this.templates.find((t) => t.id === this.pendingBase);
    if (base) this.change(structuredClone(base.entities));
    this.pendingBase = '';
  }

  /** Take over the template `id` at once when the list is empty, otherwise ask first. */
  private chooseBase(id: string): void {
    this.pendingBase = id;
    if (this.entities.length === 0) this.applyBase();
  }

  /** Render the choice of a template as the start of the entities, with the warning. */
  private renderBase(): TemplateResult {
    const lang = this.hass?.language;
    const base = this.templates.find((t) => t.id === this.pendingBase);
    return html`<div class="row form">
        <label style="flex: 1 1 220px"
          >${this.tr('baseTemplate')}
          <select
            .value=${this.pendingBase}
            @change=${(e: Event) => this.chooseBase((e.target as HTMLSelectElement).value)}
          >
            <option value="">${this.tr('baseNone')}</option>
            ${sortedByLabel(lang, this.templates, (t) => templateLabel(lang, t.id, t.name)).map(
              (t) =>
                html`<option value=${t.id} ?selected=${t.id === this.pendingBase}>
                  ${templateLabel(lang, t.id, t.name)}
                </option>`,
            )}
          </select>
        </label>
      </div>
      ${
        base
          ? html`<p class="warning">
              ${this.tr('baseReplace', {
                old: this.entities.length,
                count: base.entities.length,
                name: templateLabel(lang, base.id, base.name),
              })}
              <button class="primary" @click=${() => this.applyBase()}>
                ${this.tr('baseApply')}
              </button>
              <button @click=${() => (this.pendingBase = '')}>${this.tr('detCancel')}</button>
            </p>`
          : ''
      }`;
  }

  /** Render the element. */
  override render(): TemplateResult {
    return html`<div style="display: grid; gap: 20px">
      ${this.renderBase()}
      <tdc-entity-editor
        .hass=${this.hass}
        .entities=${this.entities}
        .shapes=${this.shapes}
        .platforms=${this.platforms}
        @tdc-entities-change=${(e: CustomEvent<EntityDef[]>) => this.change(e.detail)}
      ></tdc-entity-editor>
    </div>`;
  }
}
