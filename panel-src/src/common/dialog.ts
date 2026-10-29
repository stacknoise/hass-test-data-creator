import { css, html, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { TdcElement } from './base';

/** A modal popup with a heading; fires `tdc-close` when the user closes it with the button or Escape; a click outside does not close it. */
@customElement('tdc-dialog')
export class Dialog extends TdcElement {
  @property({ type: Boolean }) open = false;
  @property() heading = '';

  @query('dialog') private dialog?: HTMLDialogElement;

  static override styles = [
    TdcElement.styles,
    css`
      dialog {
        width: min(760px, 94vw);
        max-height: 90vh;
        padding: 16px 20px;
        border: 1px solid var(--divider-color);
        border-radius: 12px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        overflow-y: auto;
      }
      dialog::backdrop {
        background: var(
          --mdc-dialog-scrim-color,
          color-mix(in srgb, var(--primary-text-color) 32%, transparent)
        );
      }
      .head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }
      .head h3 {
        margin: 0;
      }
    `,
  ];

  /** Open or close the native dialog to match `open`. */
  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    if (!changed.has('open') || !this.dialog) return;
    if (this.open && !this.dialog.open) this.dialog.showModal();
    if (!this.open && this.dialog.open) this.dialog.close();
  }

  /** Tell the parent that the user closed the popup. */
  private close(): void {
    this.dispatchEvent(new CustomEvent('tdc-close'));
  }

  /** Render the element. */
  override render(): TemplateResult {
    return html`<dialog @close=${() => this.close()}>
      <div class="head">
        <h3>${this.heading}</h3>
        <button aria-label=${this.tr('detCancel')} @click=${() => this.close()}>✕</button>
      </div>
      <slot></slot>
    </dialog>`;
  }
}
