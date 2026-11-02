import { html, nothing, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { describeError } from '../common/api';
import { TdcElement } from '../common/base';
import type { RemovedSource } from '../common/types';

/** The question "remove the copies?" for every source that was removed, until it is answered. */
@customElement('tdc-source-banner')
export class SourceBanner extends TdcElement {
  @state() private removed: RemovedSource[] = [];
  @state() private busy = false;
  @state() private error = '';

  /** Ask the backend which removed sources wait for an answer. */
  async load(): Promise<void> {
    try {
      this.removed = await this.api.sourcesRemoved();
      this.error = '';
    } catch (err) {
      this.error = describeError(err);
    }
  }

  /** Read the question when the element is added to the page. */
  override connectedCallback(): void {
    super.connectedCallback();
    void this.load();
  }

  /** Send the answer, tell the list that devices may be gone, and ask again. */
  private async answer(source: RemovedSource, remove: boolean): Promise<void> {
    this.busy = true;
    try {
      await this.api.confirmSourceRemoved(source.id, remove);
      this.dispatchEvent(new CustomEvent('tdc-changed', { bubbles: true, composed: true }));
      await this.load();
    } catch (err) {
      this.error = describeError(err);
    }
    this.busy = false;
  }

  /** Render the element. */
  override render(): TemplateResult | typeof nothing {
    if (this.removed.length === 0 && !this.error) return nothing;
    return html`${this.removed.map(
        (source) =>
          html`<p class="warning">
            ${this.tr('sourceRemovedAsk', { name: source.name, count: source.devices.length })}
            <small>${source.devices.map((d) => d.name).join(', ')}</small>
            <button
              class="primary"
              ?disabled=${this.busy}
              @click=${() => void this.answer(source, true)}
            >
              ${this.tr('sourceRemoveYes')}
            </button>
            <button ?disabled=${this.busy} @click=${() => void this.answer(source, false)}>
              ${this.tr('sourceKeepNo')}
            </button>
          </p>`,
      )} <span class="error">${this.error}</span>`;
  }
}
