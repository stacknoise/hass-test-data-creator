import { LitElement, css, html, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { curveStyle } from '../common/curve-style';
import { livePoints, valueRange, type LiveSample } from './live';

const WIDTH = 240;
const HEIGHT = 40;

/** Draws the values that a live view has read from one entity so far. */
@customElement('tdc-live-curve')
export class LiveCurve extends LitElement {
  @property({ attribute: false }) samples: LiveSample[] = [];
  @property({ attribute: false }) source: LiveSample[] = [];

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
      polyline.source {
        stroke-dasharray: 4 3;
        opacity: 0.7;
      }
    `,
  ];

  /** Render the element. */
  override render(): TemplateResult {
    const range = valueRange(this.samples, this.source);
    return html`<svg viewBox="0 0 ${WIDTH} ${HEIGHT}" preserveAspectRatio="none" role="img">
      <polyline
        class="source"
        points=${livePoints(this.source, WIDTH, HEIGHT, 4, range)}
      ></polyline>
      <polyline points=${livePoints(this.samples, WIDTH, HEIGHT, 4, range)}></polyline>
    </svg>`;
  }
}
