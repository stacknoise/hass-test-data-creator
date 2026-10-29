import { css, html, type CSSResultGroup, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { TdcElement } from '../common/base';
import { rowListStyles } from '../common/row-list';
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
    rowListStyles,
    css`
      .name {
        flex: 1 1 auto;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--primary-text-color);
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
