import { html, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { describeError } from '../common/api';
import { TdcElement } from '../common/base';
import type { EntityDef, Info, TemplateInfo } from '../common/types';
import './entities-form';
import { keyOf } from './entity-helpers';

/** The form that saves an own template: a name and its entities; with `editing` set it changes that template. */
@customElement('tdc-template-wizard')
export class TemplateWizard extends TdcElement {
  @property({ attribute: false }) editing?: TemplateInfo;

  @state() private info?: Info;
  @state() private templates: TemplateInfo[] = [];
  @state() private name = '';
  @state() private entities: EntityDef[] = [];
  @state() private busy = false;
  @state() private error = '';

  /** Load the data when the element is added to the page. */
  override async connectedCallback(): Promise<void> {
    super.connectedCallback();
    try {
      [this.info, this.templates] = await Promise.all([this.api.info(), this.api.templates()]);
    } catch (err) {
      this.error = describeError(err);
    }
  }

  /** Take over the template that is edited. */
  protected override willUpdate(changed: PropertyValues): void {
    if (!changed.has('editing')) return;
    this.name = this.editing?.name ?? '';
    this.entities = structuredClone(this.editing?.entities ?? []);
  }

  /** Save the template and tell the parent; editing keeps the id of the template. */
  private async save(): Promise<void> {
    const name = this.name.trim();
    this.busy = true;
    this.error = '';
    try {
      const saved = await this.api.saveTemplate(
        this.editing?.id ?? keyOf(name),
        name,
        this.entities,
      );
      this.dispatchEvent(new CustomEvent('tdc-template-saved', { detail: saved }));
    } catch (err) {
      this.error = describeError(err);
    }
    this.busy = false;
  }

  /** Render the element. */
  override render(): TemplateResult {
    const name = this.name.trim();
    const id = this.editing?.id ?? keyOf(name);
    const exists = !this.editing && this.templates.some((t) => t.id === id && !t.bundled);
    return html`
      <div style="display: grid; gap: 20px">
        <label
          >${this.tr('tplName')}
          <input
            .value=${this.name}
            @input=${(e: Event) => (this.name = (e.target as HTMLInputElement).value)}
          />
          ${exists ? html`<small class="warning">${this.tr('tplExists')}</small>` : ''}
        </label>
        <tdc-entities-form
          .hass=${this.hass}
          .templates=${this.templates}
          .entities=${this.entities}
          .shapes=${this.info?.shapes ?? []}
          .platforms=${this.info?.platforms ?? []}
          @tdc-entities-change=${(e: CustomEvent<EntityDef[]>) => (this.entities = e.detail)}
        ></tdc-entities-form>
      </div>
      <p class="row">
        <button
          class="primary"
          ?disabled=${this.busy || !id || this.entities.length === 0}
          @click=${() => void this.save()}
        >
          ${this.tr('tplSave')}
        </button>
        <span class="error">${this.error}</span>
      </p>
    `;
  }
}
