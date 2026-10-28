import { css, html, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { live } from 'lit/directives/live.js';
import { TdcElement } from './base';
import { sortedByLabel } from './labels';
import { PopoverElement, popoverStyles } from './popover';

/** Returns `selected` with `name` added or removed; a blank name changes nothing. */
export function toggled(selected: string[], name: string, on: boolean): string[] {
  const clean = name.trim();
  if (!clean) return selected;
  const rest = selected.filter((item) => item !== clean);
  return on ? [...rest, clean] : rest;
}

/** A dropdown with a check box per option and a field to add an option of one's own. */
@customElement('tdc-multi-select')
export class MultiSelect extends PopoverElement {
  @property({ attribute: false }) options: string[] = [];
  @property({ attribute: false }) selected: string[] = [];

  @state() private draft = '';

  static override styles = [
    TdcElement.styles,
    popoverStyles,
    css`
      :host {
        display: block;
        position: relative;
      }
      button.trigger {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        width: 100%;
        min-height: 36px;
        text-align: left;
      }
      .summary {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .empty {
        color: var(--secondary-text-color);
      }
      .add {
        flex-wrap: nowrap;
        padding: 4px 8px 8px;
        border-bottom: 1px solid var(--divider-color);
      }
      label.option {
        flex-direction: row;
        align-items: center;
        gap: 8px;
        padding: 4px 12px;
        font-size: 1em;
        color: var(--primary-text-color);
        cursor: pointer;
      }
      label.option:hover {
        background: var(--secondary-background-color);
      }
      label.option input {
        width: auto;
        min-height: 0;
      }
    `,
  ];

  /** Tell the parent about the new selection. */
  private emit(selected: string[]): void {
    this.dispatchEvent(new CustomEvent('tdc-select-change', { detail: selected }));
  }

  /** Add the name in the field to the selection and clear the field. */
  private add(): void {
    this.emit(toggled(this.selected, this.draft, true));
    this.draft = '';
  }

  /** Render the element. */
  override render(): TemplateResult {
    const names = sortedByLabel(
      this.hass?.language,
      [...new Set([...this.options, ...this.selected])],
      (name) => name,
    );
    return html`
      <button
        class="trigger"
        aria-haspopup="listbox"
        aria-expanded=${this.open ? 'true' : 'false'}
        @click=${() => (this.open = !this.open)}
      >
        ${
          this.selected.length
            ? html`<span class="summary">${this.selected.join(', ')}</span>`
            : html`<span class="summary empty">${this.tr('areasNone')}</span>`
        }
        <span>▾</span>
      </button>
      ${
        this.open
          ? html`<div class="popover" role="listbox" aria-multiselectable="true">
              <div class="row add">
                <input
                  .value=${live(this.draft)}
                  placeholder=${this.tr('areasAdd')}
                  @input=${(e: Event) => (this.draft = (e.target as HTMLInputElement).value)}
                  @keydown=${(e: KeyboardEvent) => {
                    if (e.key === 'Enter') this.add();
                  }}
                />
                <button ?disabled=${!this.draft.trim()} @click=${() => this.add()}>
                  ${this.tr('areasAddButton')}
                </button>
              </div>
              ${names.map(
                (name) =>
                  html`<label class="option">
                    <input
                      type="checkbox"
                      .checked=${this.selected.includes(name)}
                      @change=${(e: Event) =>
                        this.emit(
                          toggled(this.selected, name, (e.target as HTMLInputElement).checked),
                        )}
                    />
                    ${name}
                  </label>`,
              )}
            </div>`
          : ''
      }
    `;
  }
}
