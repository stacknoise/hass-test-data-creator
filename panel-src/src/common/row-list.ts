import { css } from 'lit';

/** The look of a scrollable list of four fixed-height rows with a range text and a small curve. */
export const rowListStyles = css`
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
    gap: 10px;
    box-sizing: border-box;
    height: var(--row-height);
    padding: 0 10px;
    border-bottom: 1px solid var(--divider-color);
  }
  li:last-child {
    border-bottom: none;
  }
  .range {
    flex: 0 0 auto;
    color: var(--secondary-text-color);
    font-size: 0.85em;
  }
  tdc-signal-preview {
    flex: 0 0 100px;
  }
`;
