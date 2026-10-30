import { css } from 'lit';

/** The look of a curve drawn as an SVG polyline, shared by the signal preview and the live curve. */
export const curveStyle = css`
  svg {
    width: 100%;
    height: auto;
    background: var(--secondary-background-color);
  }
  polyline {
    fill: none;
    stroke: var(--primary-color);
    stroke-width: 1.5;
  }
`;
