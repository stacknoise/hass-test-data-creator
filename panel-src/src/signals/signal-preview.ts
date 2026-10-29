import { LitElement, css, html, svg, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { SignalDef } from '../common/types';
import { DEFAULT_MAX, optionsOf, specOf, valueAt } from './signals';
import { SHAPE_ENUM, SHAPE_STATE_MACHINE } from '../common/constants';

const COMPACT_WIDTH = 320;
const COMPACT_HEIGHT = 80;
const FULL_WIDTH = 800;
const FULL_HEIGHT = 100;
const POINTS = 480;
const PADDING = 6;
const AXIS_HEIGHT = 12;
const AXIS_HOURS = [0, 12, 24];
const DAY_SECONDS = 86400;

/** Draws one day of a signal with the same functions the backend uses. */
@customElement('tdc-signal-preview')
export class SignalPreview extends LitElement {
  @property({ attribute: false }) signal?: SignalDef;
  @property() unit = '';
  @property({ type: Boolean }) compact = false;

  static override styles = css`
    :host {
      display: block;
      color: var(--secondary-text-color);
      font-size: 0.8em;
    }
    svg {
      width: 100%;
      height: auto;
      background: var(--secondary-background-color);
      border-radius: 6px;
    }
    :host(:not([compact])) {
      margin-top: 12px;
    }
    :host([compact]) svg {
      max-width: 120px;
      border-radius: 3px;
    }
    text {
      fill: var(--secondary-text-color);
      font-size: 9px;
    }
    polyline {
      fill: none;
      stroke: var(--primary-color);
      stroke-width: 1.5;
    }
  `;

  /** Return the width of the drawing: the full one fills a wide dialog, the compact one a list row. */
  private get width(): number {
    return this.compact ? COMPACT_WIDTH : FULL_WIDTH;
  }

  /** Return the height of the curve area, without the axis labels. */
  private get height(): number {
    return this.compact ? COMPACT_HEIGHT : FULL_HEIGHT;
  }

  /** Return the points of the curve for 24 hours as an SVG point list. */
  private points(def: SignalDef): string {
    const spec = specOf(def, 1, 0);
    const options = optionsOf(spec);
    const values = Array.from({ length: POINTS + 1 }, (_, i) => {
      const value = valueAt(spec, (i / POINTS) * DAY_SECONDS);
      return typeof value === 'string' ? options.indexOf(value) : value;
    });
    const low = Math.min(...values);
    const high = Math.max(...values);
    const span = high - low || 1;
    return values
      .map((v, i) => {
        const x = (i / POINTS) * this.width;
        const y = this.height - PADDING - ((v - low) / span) * (this.height - 2 * PADDING);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }

  /** Return the labels of 0, 12 and 24 hours under the curve. */
  private axis(): TemplateResult {
    return svg`${AXIS_HOURS.map((hour) => {
      const x = (hour / 24) * this.width;
      const anchor = hour === 0 ? 'start' : hour === 24 ? 'end' : 'middle';
      return svg`<text x=${x} y=${this.height + AXIS_HEIGHT - 2} text-anchor=${anchor}>${hour} h</text>`;
    })}`;
  }

  /** Render the element. */
  override render(): TemplateResult {
    if (!this.signal) return html``;
    const discrete = this.signal.shape === SHAPE_ENUM || this.signal.shape === SHAPE_STATE_MACHINE;
    const options = discrete ? optionsOf(specOf(this.signal)).join(' · ') : '';
    const min = this.signal.min ?? 0;
    const max = this.signal.max ?? DEFAULT_MAX;
    const curve = html`<svg
      viewBox="0 0 ${this.width} ${this.height + (this.compact ? 0 : AXIS_HEIGHT)}"
      role="img"
    >
      ${svg`<polyline points=${this.points(this.signal)}></polyline>`}
      ${this.compact ? '' : this.axis()}
    </svg>`;
    if (this.compact) return curve;
    return html`${curve}
      <div>${discrete ? options : `${min} – ${max} ${this.unit}`}</div>`;
  }
}
