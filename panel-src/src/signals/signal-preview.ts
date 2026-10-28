import { LitElement, css, html, svg, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { SignalDef } from '../common/types';
import { specOf, valueAt } from './signals';

const WIDTH = 320;
const HEIGHT = 80;
const POINTS = 96;
const DAY_SECONDS = 86400;

/** Draws one day of a signal with the same functions the backend uses. */
@customElement('tdc-signal-preview')
export class SignalPreview extends LitElement {
  @property({ attribute: false }) signal?: SignalDef;
  @property() unit = '';

  static override styles = css`
    :host {
      display: block;
      color: var(--secondary-text-color);
      font-size: 0.8em;
    }
    svg {
      width: 100%;
      max-width: 420px;
      height: auto;
      background: var(--secondary-background-color);
      border-radius: 6px;
    }
    polyline {
      fill: none;
      stroke: var(--primary-color);
      stroke-width: 1.5;
    }
  `;

  /** Return the points of the curve for 24 hours as an SVG point list. */
  private points(def: SignalDef): string {
    const spec = specOf(def, 1, 0);
    const values = Array.from({ length: POINTS + 1 }, (_, i) =>
      valueAt(spec, (i / POINTS) * DAY_SECONDS),
    );
    const low = Math.min(...values);
    const high = Math.max(...values);
    const span = high - low || 1;
    return values
      .map((v, i) => {
        const x = (i / POINTS) * WIDTH;
        const y = HEIGHT - 6 - ((v - low) / span) * (HEIGHT - 12);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }

  /** Render the element. */
  override render(): TemplateResult {
    if (!this.signal) return html``;
    const min = this.signal.min ?? 0;
    const max = this.signal.max ?? 100;
    return html`<svg viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img">
        ${svg`<polyline points=${this.points(this.signal)}></polyline>`}
      </svg>
      <div>${min} – ${max} ${this.unit}</div>`;
  }
}
