import { css, html, type CSSResultGroup, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { describeError } from '../common/api';
import { TdcElement } from '../common/base';
import { rowListStyles } from '../common/row-list';
import type { TemplateInfo } from '../common/types';
import './template-wizard';

/** The popup content that lists the own templates and opens the form to create, change or delete them. */
@customElement('tdc-template-manager')
export class TemplateManager extends TdcElement {
  @state() private own: TemplateInfo[] = [];
  @state() private form = false;
  @state() private editing?: TemplateInfo;
  @state() private confirming = '';
  @state() private busy = false;
  @state() private error = '';

  static override styles: CSSResultGroup = [
    TdcElement.styles,
    rowListStyles,
    css`
      li > span {
        flex: 1 1 auto;
        min-width: 0;
      }
      li.empty {
        justify-content: center;
        color: var(--secondary-text-color);
      }
    `,
  ];

  /** Load the templates when the element is added to the page. */
  override async connectedCallback(): Promise<void> {
    super.connectedCallback();
    await this.reload();
  }

  /** Read the own templates again. */
  private async reload(): Promise<void> {
    try {
      this.own = (await this.api.templates()).filter((t) => !t.bundled);
    } catch (err) {
      this.error = describeError(err);
    }
  }

  /** Show the form for a new template, or to change `template`. */
  private openForm(template?: TemplateInfo): void {
    this.editing = template;
    this.form = true;
    this.error = '';
  }

  /** Go back to the list after the template was saved or the form was left. */
  private async closeForm(): Promise<void> {
    this.form = false;
    await this.reload();
  }

  /** Delete the template `id` after the question was confirmed. */
  private async removeTemplate(id: string): Promise<void> {
    this.busy = true;
    this.error = '';
    try {
      await this.api.deleteTemplate(id);
      this.confirming = '';
      await this.reload();
    } catch (err) {
      this.error = describeError(err);
    }
    this.busy = false;
  }

  /** Render the buttons of one row: change and delete, or the question before a delete. */
  private renderActions(template: TemplateInfo): TemplateResult {
    if (this.confirming !== template.id) {
      return html`<button class="small" @click=${() => this.openForm(template)}>
          ${this.tr('entEdit')}
        </button>
        <button class="small danger" @click=${() => (this.confirming = template.id)}>
          ${this.tr('entDelete')}
        </button>`;
    }
    return html`<button
        class="small danger"
        ?disabled=${this.busy}
        @click=${() => void this.removeTemplate(template.id)}
      >
        ${this.tr('tplDeleteConfirm')}
      </button>
      <button class="small" @click=${() => (this.confirming = '')}>
        ${this.tr('detCancel')}
      </button>`;
  }

  /** Render the list of the own templates. */
  private renderList(): TemplateResult {
    return html`<p class="end">
        <button class="primary" @click=${() => this.openForm()}>+ ${this.tr('tplNew')}</button>
      </p>
      <ul>
        ${
          this.own.length
            ? this.own.map(
                (template) =>
                  html`<li>
                    <span>
                      <div title=${template.name}>${template.name}</div>
                      <small>${this.tr('tplEntities', { count: template.entities.length })}</small>
                    </span>
                    ${this.renderActions(template)}
                  </li>`,
              )
            : html`<li class="empty">${this.tr('tplNone')}</li>`
        }
      </ul>
      <p class="error">${this.error}</p>`;
  }

  /** Render the element. */
  override render(): TemplateResult {
    if (!this.form) return this.renderList();
    return html`<p>
        <button @click=${() => void this.closeForm()}>‹ ${this.tr('tplBack')}</button>
      </p>
      <tdc-template-wizard
        .hass=${this.hass}
        .editing=${this.editing}
        @tdc-template-saved=${() => void this.closeForm()}
      ></tdc-template-wizard>`;
  }
}
