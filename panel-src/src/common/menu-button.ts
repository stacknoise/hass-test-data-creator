import { css, html, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { TdcElement } from './base';

/** One entry of a menu: the value that is reported and the text that is shown. */
export interface MenuItem {
  value: string;
  label: string;
}

/** A button that opens a menu; choosing an entry fires `tdc-pick` with its value. */
@customElement('tdc-menu-button')
export class MenuButton extends TdcElement {
  @property() label = '';
  @property({ attribute: false }) items: MenuItem[] = [];
  @property({ type: Boolean }) disabled = false;

  @state() private open = false;

  static override styles = [
    TdcElement.styles,
    css`
      :host {
        display: inline-block;
        position: relative;
      }
      :host > button {
        white-space: nowrap;
      }
      .menu {
        position: absolute;
        z-index: 10;
        top: 100%;
        left: 0;
        margin-top: 4px;
        min-width: 100%;
        max-height: 320px;
        overflow-y: auto;
        padding: 4px 0;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: var(--card-background-color);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }
      .menu button {
        display: block;
        width: 100%;
        text-align: left;
        white-space: nowrap;
        border: 0;
        border-radius: 0;
        background: none;
      }
      .menu button:hover,
      .menu button:focus-visible {
        background: var(--secondary-background-color);
      }
    `,
  ];

  /** Close the menu when the user clicks anywhere else. */
  private readonly closeOutside = (event: Event): void => {
    if (!event.composedPath().includes(this)) this.open = false;
  };

  /** Close the menu on Escape. */
  private readonly closeOnEscape = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') this.open = false;
  };

  /** Listen for outside clicks and Escape while the element is on the page. */
  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('click', this.closeOutside);
    document.addEventListener('keydown', this.closeOnEscape);
  }

  /** Stop listening when the element is removed. */
  override disconnectedCallback(): void {
    document.removeEventListener('click', this.closeOutside);
    document.removeEventListener('keydown', this.closeOnEscape);
    super.disconnectedCallback();
  }

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
          ? html`<div class="menu" role="menu">
              ${this.items.map(
                (item) =>
                  html`<button role="menuitem" @click=${() => this.pick(item.value)}>
                    ${item.label}
                  </button>`,
              )}
            </div>`
          : ''
      }
    `;
  }
}
