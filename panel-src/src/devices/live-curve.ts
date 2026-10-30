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
        display: block;
        height: 32px;
        min-width: 80px;
        border-radius: 4px;
      }
      polyline {
        vector-effect: non-scaling-stroke;
      }
    `,
  ];

  /** Render the element. */
  override render(): TemplateResult {
    return html`<svg viewBox="0 0 ${WIDTH} ${HEIGHT}" preserveAspectRatio="none" role="img">
      <polyline points=${livePoints(this.samples, WIDTH, HEIGHT)}></polyline>
    </svg>`;
  }
}
