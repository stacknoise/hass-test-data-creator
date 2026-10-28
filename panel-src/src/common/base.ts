import { LitElement, css, type CSSResultGroup } from 'lit';
import { property } from 'lit/decorators.js';
import { TdcApi } from './api';
import { languageOf, t, type TextKey } from './i18n';
import type { Hass } from './types';

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

  /** The text `key` in the language of Home Assistant. */
  protected tr(key: TextKey, values?: Record<string, string | number>): string {
    return t(languageOf(this.hass?.language), key, values);
  }
}
