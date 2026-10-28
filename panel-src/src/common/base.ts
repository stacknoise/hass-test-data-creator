import { LitElement, css, html, nothing, type CSSResultGroup, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { TdcApi } from './api';
import { languageOf, t, type TextKey } from './i18n';
import { sortedByLabel } from './labels';
import type { Hass } from './types';

/** Lets a component answer container queries; only for blocks that fill their row, never inline items. */
export const containerHost = css`
  :host {
    container-type: inline-size;
  }
`;

/** Return `ids` with `id` added, or removed if it is in. */
export function toggled(ids: Set<string>, id: string): Set<string> {
  const next = new Set(ids);
  if (!next.delete(id)) next.add(id);
  return next;
}

/** What the buttons under a form need. */
export interface SubmitRowOptions {
  enabled: boolean;
  busy: boolean;
  label: string;
  /** Whether an existing object is changed; then a cancel button is shown too. */
  editing: boolean;
  submit: () => void;
  /** Buttons in front of the save button. */
  extra?: TemplateResult;
}

/** The look that buttons and form fields share. */
const controlStyle = css`
  border-radius: 6px;
  border: 1px solid var(--divider-color);
  background: var(--card-background-color);
  color: var(--primary-text-color);
`;

/** Base class of all panel elements: the `hass` object, the API client and translated texts. */
export abstract class TdcElement extends LitElement {
  @property({ attribute: false }) hass!: Hass;

  private client?: { hass: Hass; api: TdcApi };

  static override styles: CSSResultGroup = css`
    :host {
      display: block;
      color: var(--primary-text-color);
      font-family: var(--paper-font-body1_-_font-family, inherit);
    }
    h2,
    h3 {
      margin: 0 0 12px;
      font-weight: 500;
    }
    button {
      font: inherit;
      padding: 6px 14px;
      ${controlStyle}
      cursor: pointer;
    }
    button.primary {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }
    button:disabled {
      opacity: 0.5;
      cursor: default;
    }
    input,
    select,
    textarea {
      font: inherit;
      box-sizing: border-box;
      width: 100%;
      padding: 6px 8px;
      ${controlStyle}
    }
    input,
    select {
      min-height: 36px;
    }
    label {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 0.9em;
      color: var(--secondary-text-color);
    }
    small {
      color: var(--secondary-text-color);
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th,
    td {
      text-align: left;
      padding: 6px 8px;
      border-bottom: 1px solid var(--divider-color);
      vertical-align: top;
    }
    th {
      font-size: 0.8em;
      font-weight: 500;
      color: var(--secondary-text-color);
    }
    .error {
      color: var(--error-color);
    }
    .warning {
      color: var(--warning-color);
    }
    @container (max-width: 760px) {
      table.cards thead,
      table.cards tr:has(> th) {
        display: none;
      }
      table.cards,
      table.cards tbody,
      table.cards tr,
      table.cards td {
        display: block;
      }
      table.cards tbody {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 12px;
        margin-top: 12px;
      }
      table.cards tr:not(.card) {
        grid-column: 1 / -1;
      }
      table.cards tr.card {
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 4px 8px;
      }
      table.cards tr.card > td {
        display: flex;
        gap: 12px;
        padding: 4px 0;
        border-bottom: 0;
      }
      table.cards tr.card > td[data-label]::before {
        content: attr(data-label);
        flex: 0 0 90px;
        color: var(--secondary-text-color);
        font-size: 0.8em;
        padding-top: 2px;
      }
      table.cards tr.card > td.name {
        font-weight: 500;
      }
      table.cards tr.card > td.row {
        flex-wrap: wrap;
      }
      table.cards tr.card > td.row::before {
        flex-basis: 100%;
      }
    }
    .row.form {
      align-items: flex-start;
    }
    .fields {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 8px 12px;
      align-items: start;
      margin-bottom: 8px;
    }
    .end {
      display: flex;
      justify-content: flex-end;
    }
    .fields.bottom {
      align-items: end;
    }
    fieldset {
      margin: 0 0 12px;
      padding: 8px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
    }
    legend {
      padding: 0 6px;
      color: var(--secondary-text-color);
    }
    .fields > .wide {
      grid-column: 1 / -1;
    }
    .row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
    }
  `;

  /** The API client for the current `hass` object. */
  protected get api(): TdcApi {
    if (this.client?.hass !== this.hass) {
      this.client = { hass: this.hass, api: new TdcApi(this.hass) };
    }
    return this.client.api;
  }

  /** Render a labelled text input that reports each change as text. */
  protected textField(
    label: string,
    value: string,
    change: (value: string) => void,
    options: { flex?: string; placeholder?: string } = {},
  ): TemplateResult {
    return html`<label style="flex: ${options.flex ?? '1 1 200px'}"
      >${label}
      <input
        .value=${value}
        placeholder=${options.placeholder ?? ''}
        @input=${(e: Event) => change((e.target as HTMLInputElement).value)}
      />
    </label>`;
  }

  /** Render a labelled select; `text` returns the label of a value, and the options are sorted by it.
   * With a single value there is nothing to choose, so the select is locked on it. */
  protected select(
    label: string,
    values: string[],
    current: string,
    text: (value: string) => string,
    change: (value: string) => void,
  ): TemplateResult {
    return html`<label style="flex: 1 1 180px"
      >${label}
      <select
        ?disabled=${values.length === 1}
        @change=${(e: Event) => change((e.target as HTMLSelectElement).value)}
      >
        ${sortedByLabel(this.hass?.language, values, text).map(
          (value) =>
            html`<option value=${value} ?selected=${value === current || values.length === 1}>
              ${text(value)}
            </option>`,
        )}
      </select>
    </label>`;
  }

  /** Render a table row that spans the table and holds the details of the row above it. */
  protected detailRow(columns: number, content: TemplateResult): TemplateResult {
    return html`<tr>
      <td colspan=${columns}>${content}</td>
    </tr>`;
  }

  /** Render the buttons under a form: save and, when an object is changed, cancel. */
  protected submitRow(options: SubmitRowOptions): TemplateResult {
    return html`<p class="row">
      ${options.extra ?? nothing}
      <button
        class="primary"
        ?disabled=${!options.enabled || options.busy}
        @click=${options.submit}
      >
        ${options.label}
      </button>
      ${
        options.editing
          ? html`<button
              ?disabled=${options.busy}
              @click=${() => this.dispatchEvent(new CustomEvent('tdc-cancel'))}
            >
              ${this.tr('detCancel')}
            </button>`
          : nothing
      }
    </p>`;
  }

  /** The text `key` in the language of Home Assistant. */
  protected tr(key: TextKey, values?: Record<string, string | number>): string {
    return t(languageOf(this.hass?.language), key, values);
  }
}
