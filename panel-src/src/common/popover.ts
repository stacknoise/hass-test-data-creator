import { css } from 'lit';
import { state } from 'lit/decorators.js';
import { TdcElement } from './base';

/** The look of a panel that opens below its button; the element must be `position: relative`. */
export const popoverStyles = css`
  .popover {
    position: absolute;
    z-index: 10;
    top: 100%;
    left: 0;
    margin-top: 4px;
    min-width: 100%;
    max-height: 320px;
    overflow-y: auto;
    padding: 4px 0;
    border: 1px solid var(--divider-color);
    border-radius: 8px;
    background: var(--card-background-color);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
`;

/** Base of the elements with a panel that closes on a click elsewhere and on Escape. */
export abstract class PopoverElement extends TdcElement {
  @state() protected open = false;

  /** Close the panel when the user clicks anywhere else. */
  private readonly closeOutside = (event: Event): void => {
    if (!event.composedPath().includes(this)) this.open = false;
  };

  /** Close the panel on Escape. */
  private readonly closeOnEscape = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') this.open = false;
  };

  /** Listen for outside clicks and Escape while the element is on the page. */
  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('click', this.closeOutside);
    document.addEventListener('keydown', this.closeOnEscape);
  }

  /** Stop listening when the element is removed. */
  override disconnectedCallback(): void {
    document.removeEventListener('click', this.closeOutside);
    document.removeEventListener('keydown', this.closeOnEscape);
    super.disconnectedCallback();
  }
}
