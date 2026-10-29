import { css, html, type CSSResultGroup, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { TdcElement } from '../common/base';
import { labelOf } from '../common/labels';
import type { EntityDef } from '../common/types';
import '../signals/signal-preview';
import { rangeLabel } from './helpers';

/** Lists the entities of a template with name, value range and a small curve in a scrollable box. */
@customElement('tdc-entity-list')
export class EntityList extends TdcElement {
  @property({ attribute: false }) entities: EntityDef[] = [];

  static override styles: CSSResultGroup = [
    TdcElement.styles,
    css`
      :host {
        --row-height: 40px;
      }
      ul {
        list-style: none;
        margin: 0;
        padding: 0;
        height: calc(4 * var(--row-height) + 2px);
        box-sizing: border-box;
        overflow-y: auto;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
      }
      li {
        display: flex;
        align-items: center;
        gap: 12px;
        box-sizing: border-box;
        height: var(--row-height);
        padding: 0 10px;
        border-bottom: 1px solid var(--divider-color);
      }
      li:last-child {
        border-bottom: none;
      }
      .name {
        flex: 1 1 auto;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--primary-text-color);
      }
      .range {
        flex: 0 0 auto;
        color: var(--secondary-text-color);
        font-size: 0.85em;
      }
      tdc-signal-preview {
        flex: 0 0 120px;
      }
    `,
  ];

  /** Render the element. */
  override render(): TemplateResult {
    if (!this.entities.length) return html``;
    return html`<ul>
      ${this.entities.map(
        (entity) =>
          html`<li>
            <span class="name" title=${entity.name}>${entity.name}</span>
            ${
              entity.signal
                ? html`<span class="range">${rangeLabel(entity.signal, entity.unit)}</span>
                    <tdc-signal-preview compact .signal=${entity.signal}></tdc-signal-preview>`
                : html`<span class="range"
                    >${labelOf(this.hass?.language, 'platform', entity.platform)}</span
                  >`
            }
          </li>`,
      )}
    </ul>`;
  }
}
