import { css, html, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { live } from 'lit/directives/live.js';
import { TdcElement } from './base';
import { sortedByLabel } from './labels';
import { PopoverElement, popoverStyles } from './popover';

/** One option of a select: the value that is kept and the text that is shown. */
export interface SelectItem {
  value: string;
  label: string;
}

/** Returns `selected` with `value` added or removed; a blank value changes nothing. */
export function toggled(selected: string[], value: string, on: boolean): string[] {
  const clean = value.trim();
  if (!clean) return selected;
  const rest = selected.filter((item) => item !== clean);
  return on ? [...rest, clean] : rest;
}

/** A dropdown with a check box per option; with `allowAdd` the user can add an option of their own. */
@customElement('tdc-multi-select')
export class MultiSelect extends PopoverElement {
  @property({ attribute: false }) items: SelectItem[] = [];
  @property({ attribute: false }) selected: string[] = [];
  @property({ type: Boolean }) allowAdd = false;
  @property() empty = '';

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

  /** Add the value in the field to the selection and clear the field. */
  private add(): void {
    this.emit(toggled(this.selected, this.draft, true));
    this.draft = '';
  }

  /** Return the options and the selected values that have no option, sorted by their text. */
  private options(): SelectItem[] {
    const known = new Set(this.items.map((item) => item.value));
    const extra = this.selected
      .filter((value) => !known.has(value))
      .map((value) => ({ value, label: value }));
    return sortedByLabel(this.hass?.language, [...this.items, ...extra], (item) => item.label);
  }

  /** Render the field to add a value of one's own. */
  private renderAdd(): TemplateResult {
    return html`<div class="row add">
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
    </div>`;
  }

  /** Render the element. */
  override render(): TemplateResult {
    const options = this.options();
    const shown = this.selected.map(
      (value) => options.find((item) => item.value === value)?.label ?? value,
    );
    return html`
      <button
        class="trigger"
        aria-haspopup="listbox"
        aria-expanded=${this.open ? 'true' : 'false'}
        @click=${() => (this.open = !this.open)}
      >
        ${
          shown.length
            ? html`<span class="summary">${shown.join(', ')}</span>`
            : html`<span class="summary empty">${this.empty || this.tr('areasNone')}</span>`
        }
        <span>▾</span>
      </button>
      ${
        this.open
          ? html`<div class="popover" popover="manual" role="listbox" aria-multiselectable="true">
              ${this.allowAdd ? this.renderAdd() : ''}
              ${options.map(
                (item) =>
                  html`<label class="option">
                    <input
                      type="checkbox"
                      .checked=${this.selected.includes(item.value)}
                      @change=${(e: Event) =>
                        this.emit(
                          toggled(
                            this.selected,
                            item.value,
                            (e.target as HTMLInputElement).checked,
                          ),
                        )}
                    />
                    ${item.label}
                  </label>`,
              )}
            </div>`
          : ''
      }
    `;
  }
}
