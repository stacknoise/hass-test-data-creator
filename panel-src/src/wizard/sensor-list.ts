import { LitElement, css, html, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { EntityDef } from '../common/types';
import '../signals/signal-preview';
import { rangeLabel } from './helpers';
import { PLATFORM_SENSOR } from '../common/constants';

/** Lists the sensors of a template with name, value range and a small curve in a scrollable box. */
@customElement('tdc-sensor-list')
export class SensorList extends LitElement {
  @property({ attribute: false }) entities: EntityDef[] = [];

  static override styles = css`
    ul {
      list-style: none;
      margin: 0;
      padding: 0;
      max-height: 180px;
      overflow-y: auto;
      border: 1px solid var(--divider-color);
      border-radius: 6px;
    }
    li {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 4px 10px;
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
  `;

  /** Render the element. */
  override render(): TemplateResult {
    const sensors = this.entities.filter((e) => e.platform === PLATFORM_SENSOR && e.signal);
    if (!sensors.length) return html``;
    return html`<ul>
      ${sensors.map(
        (sensor) =>
          html`<li>
            <span class="name" title=${sensor.name}>${sensor.name}</span>
            <span class="range">${rangeLabel(sensor.signal!, sensor.unit)}</span>
            <tdc-signal-preview compact .signal=${sensor.signal}></tdc-signal-preview>
          </li>`,
      )}
    </ul>`;
  }
}
