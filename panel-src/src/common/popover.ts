import { css, type PropertyValues } from 'lit';
import { state } from 'lit/decorators.js';
import { TdcElement } from './base';

const GAP_PX = 4;
const EDGE_PX = 12;
const MAX_HEIGHT_PX = 320;
const MIN_HEIGHT_PX = 120;
const FLIP_BELOW_PX = 200;

/** The look of a panel that opens below its button; it is a `popover="manual"` in the top layer. */
export const popoverStyles = css`
  .popover {
    position: fixed;
    inset: auto;
    margin: 0;
    overflow-y: auto;
    padding: 4px 0;
    border: 1px solid var(--divider-color);
    border-radius: 8px;
    background: var(--card-background-color);
    color: var(--primary-text-color);
    box-shadow: var(--dialog-box-shadow, var(--wa-shadow-l, var(--ha-card-box-shadow, none)));
  }
`;

/**
 * Base of the elements with a panel that closes on a click elsewhere and on Escape.
 *
 * The panel (`.popover`, with `popover="manual"`) is shown in the top layer and placed next to the
 * element, below it or, if there is no room, above it. So no dialog or table can cut it off.
 */
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

  /** Keep the panel at its element while the page scrolls or changes size. */
  private readonly follow = (): void => this.placePopover();

  /** Listen for outside clicks, Escape, scrolling and resizing while the element is on the page. */
  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('click', this.closeOutside);
    document.addEventListener('keydown', this.closeOnEscape);
    window.addEventListener('scroll', this.follow, true);
    window.addEventListener('resize', this.follow);
  }

  /** Stop listening when the element is removed. */
  override disconnectedCallback(): void {
    document.removeEventListener('click', this.closeOutside);
    document.removeEventListener('keydown', this.closeOnEscape);
    window.removeEventListener('scroll', this.follow, true);
    window.removeEventListener('resize', this.follow);
    super.disconnectedCallback();
  }

  /** Show and place the panel after every render while it is open. */
  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    if (this.open) this.placePopover();
  }

  /** Put the panel into the top layer and next to the element. */
  private placePopover(): void {
    const panel = this.renderRoot.querySelector<HTMLElement>('.popover');
    if (!this.open || !panel) return;
    if (!panel.matches(':popover-open')) panel.showPopover();
    const rect = this.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom - EDGE_PX;
    const above = rect.top - EDGE_PX;
    const up = below < FLIP_BELOW_PX && above > below;
    const room = up ? above : below;
    const { style } = panel;
    style.left = `${rect.left}px`;
    style.minWidth = `${rect.width}px`;
    style.maxHeight = `${Math.max(MIN_HEIGHT_PX, Math.min(MAX_HEIGHT_PX, room))}px`;
    style.top = up ? '' : `${rect.bottom + GAP_PX}px`;
    style.bottom = up ? `${window.innerHeight - rect.top + GAP_PX}px` : '';
  }
}
