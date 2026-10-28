import { html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { describeError } from '../common/api';
import { TdcElement } from '../common/base';
import { MAX_DAYS, MIN_DAYS, clampDays } from './helpers';

/** Writes hourly statistics for the past days of the test sensors. */
@customElement('tdc-history-panel')
export class HistoryPanel extends TdcElement {
  @state() private days = 7;
  @state() private device = '';
  @state() private entity = '';
  @state() private busy = false;
  @state() private message = '';
  @state() private error = '';

  /** Import the history that the form describes. */
  private async importHistory(): Promise<void> {
    this.busy = true;
    this.message = '';
    this.error = '';
    try {
      const result = await this.api.importHistory(
        clampDays(this.days),
        this.device.trim() || undefined,
        this.entity.trim() || undefined,
      );
      this.message = this.tr('histDone', { ...result });
    } catch (err) {
      this.error = describeError(err);
    }
    this.busy = false;
  }

  /** Render the element. */
  override render(): TemplateResult {
    return html`
      <p>${this.tr('histIntro')}</p>
      <div class="row">
        <label style="flex: 0 1 180px"
          >${this.tr('histDays')}
          <input
            type="number"
            min=${MIN_DAYS}
            max=${MAX_DAYS}
            .value=${String(this.days)}
            @input=${(e: Event) => (this.days = Number((e.target as HTMLInputElement).value))}
          />
        </label>
        ${this.textField(this.tr('histDevice'), this.device, (v) => (this.device = v))}
        ${this.textField(this.tr('histEntity'), this.entity, (v) => (this.entity = v))}
        <button class="primary" ?disabled=${this.busy} @click=${() => void this.importHistory()}>
          ${this.tr('histImport')}
        </button>
      </div>
      <p>${this.message}<span class="error">${this.error}</span></p>
    `;
  }
}
