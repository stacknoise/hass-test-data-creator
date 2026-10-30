import { LitElement, css, html, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { livePoints, type LiveSample } from './live';

const WIDTH = 240;
const HEIGHT = 40;

/** Draws the values that a live view has read from one entity so far. */
@customElement('tdc-live-curve')
export class LiveCurve extends LitElement {
  @property({ attribute: false }) samples: LiveSample[] = [];

  static override styles = css`
    svg {
      width: 100%;
      max-width: 240px;
      height: auto;
      background: var(--secondary-background-color);
      border-radius: 4px;
    }
    polyline {
      fill: none;
      stroke: var(--primary-color);
      stroke-width: 1.5;
    }
  `;

  /** Render the element. */
  override render(): TemplateResult {
    return html`<svg viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img">
      <polyline points=${livePoints(this.samples, WIDTH, HEIGHT)}></polyline>
    </svg>`;
  }
}
