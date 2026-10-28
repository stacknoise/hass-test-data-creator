import { css, html, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { TdcElement } from './base';
import { PopoverElement, popoverStyles } from './popover';

/** One entry of a menu: the value that is reported and the text that is shown. */
export interface MenuItem {
  value: string;
  label: string;
  disabled?: boolean;
  hint?: string;
}

/** A button that opens a menu; choosing an entry fires `tdc-pick` with its value. */
@customElement('tdc-menu-button')
export class MenuButton extends PopoverElement {
  @property() label = '';
  @property({ attribute: false }) items: MenuItem[] = [];
  @property({ type: Boolean }) disabled = false;

  static override styles = [
    TdcElement.styles,
    popoverStyles,
    css`
      :host {
        display: inline-block;
        position: relative;
      }
      :host > button {
        white-space: nowrap;
      }
      .popover button {
        display: block;
        width: 100%;
        text-align: left;
        white-space: nowrap;
        border: 0;
        border-radius: 0;
        background: none;
      }
      .popover button:hover,
      .popover button:focus-visible {
        background: var(--secondary-background-color);
      }
    `,
  ];

  /** Report the chosen entry and close the menu. */
  private pick(value: string): void {
    this.open = false;
    this.dispatchEvent(new CustomEvent('tdc-pick', { detail: value }));
  }

  /** Render the element. */
  override render(): TemplateResult {
    return html`
      <button
        aria-haspopup="menu"
        aria-expanded=${this.open ? 'true' : 'false'}
        ?disabled=${this.disabled}
        @click=${() => (this.open = !this.open)}
      >
        ${this.label} ▾
      </button>
      ${
        this.open
          ? html`<div class="popover" popover="manual" role="menu">
              ${this.items.map(
                (item) =>
                  html`<button
                    role="menuitem"
                    ?disabled=${item.disabled}
                    title=${item.hint ?? ''}
                    @click=${() => this.pick(item.value)}
                  >
                    ${item.label}
                  </button>`,
              )}
            </div>`
          : ''
      }
    `;
  }
}
