import { LitElement, css, html, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { curveStyle } from '../common/curve-style';
import { livePoints, type LiveSample } from './live';

const WIDTH = 240;
const HEIGHT = 40;

/** Draws the values that a live view has read from one entity so far. */
@customElement('tdc-live-curve')
export class LiveCurve extends LitElement {
  @property({ attribute: false }) samples: LiveSample[] = [];

  static override styles = [
    curveStyle,
    css`
      svg {
        max-width: 240px;
        flex: 1 1 160px;
        border-radius: 4px;
      }
    `,
  ];

  /** Render the element. */
  override render(): TemplateResult {
    return html`<svg viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img">
      <polyline points=${livePoints(this.samples, WIDTH, HEIGHT)}></polyline>
    </svg>`;
  }
}
