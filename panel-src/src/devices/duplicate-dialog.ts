import { html, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { describeError } from '../common/api';
import { TdcElement } from '../common/base';
import type { DeviceInfo } from '../common/types';

const DEFAULT_PATTERN = '{template} {n}';
const MAX_COPIES = 500;

/** Asks for the number of copies and the name pattern of a device to duplicate; fires `tdc-created`. */
@customElement('tdc-duplicate-dialog')
export class DuplicateDialog extends TdcElement {
  @property({ attribute: false }) device!: DeviceInfo;

  @state() private count = 1;
  @state() private pattern = DEFAULT_PATTERN;
  @state() private busy = false;
  @state() private error = '';

  /** Create the copies and tell the parent. */
  private async submit(): Promise<void> {
    this.busy = true;
    try {
      await this.api.duplicate(this.device.id, this.count, this.pattern);
      this.error = '';
      this.dispatchEvent(new CustomEvent('tdc-created', { bubbles: true, composed: true }));
    } catch (err) {
      this.error = describeError(err);
    }
    this.busy = false;
  }

  /** Render the element. */
  override render(): TemplateResult {
    const valid = Number.isInteger(this.count) && this.count >= 1 && this.count <= MAX_COPIES;
    return html`
      <p><b>${this.device.name}</b></p>
      <div class="row">
        <label
          >${this.tr('dupCount')}
          <input
            type="number"
            min="1"
            max=${MAX_COPIES}
            .value=${String(this.count)}
            @input=${(e: Event) => (this.count = Number((e.target as HTMLInputElement).value))}
          />
        </label>
        <label
          >${this.tr('dupPattern')}
          <input
            type="text"
            maxlength="64"
            .value=${this.pattern}
            @input=${(e: Event) => (this.pattern = (e.target as HTMLInputElement).value)}
          />
        </label>
      </div>
      <p><small>${this.tr('dupHint')}</small></p>
      ${this.error ? html`<p class="error">${this.error}</p>` : ''}
      <button class="primary" ?disabled=${this.busy || !valid} @click=${() => void this.submit()}>
        ${this.tr('dupDo')}
      </button>
    `;
  }
}
