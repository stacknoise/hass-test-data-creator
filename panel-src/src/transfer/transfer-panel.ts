import { css, html, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { describeError } from '../common/api';
import { TdcElement, toggled } from '../common/base';
import type { TransferCategory, TransferPage } from '../common/types';
import { CATEGORY_LABELS, buildTransferFile, exportFileName, offeredCategories } from './helpers';

/** Exports devices, own templates, schedules, scenarios and groups to a file. */
@customElement('tdc-transfer-panel')
export class TransferPanel extends TdcElement {
  static override styles = [
    TdcElement.styles,
    css`
      .choice {
        flex-direction: row;
        align-items: center;
        gap: 8px;
        color: var(--primary-text-color);
      }
      .choice input {
        width: auto;
        min-height: 0;
      }
      section {
        margin-bottom: 24px;
      }
    `,
  ];

  @property({ type: Boolean }) mqtt = false;

  @state() private counts: Partial<Record<TransferCategory, number>> = {};
  @state() private chosen = new Set<string>();
  @state() private busy = false;
  @state() private message = '';
  @state() private error = '';

  /** Read how many entries each category has. */
  override connectedCallback(): void {
    super.connectedCallback();
    void this.loadCounts();
  }

  /** Count the entries of every category without reading them. */
  private async loadCounts(): Promise<void> {
    try {
      const counted = await Promise.all(
        offeredCategories(true).map(
          async (category) =>
            [category, (await this.api.transferExport(category, 0, 0)).total] as const,
        ),
      );
      this.counts = Object.fromEntries(counted);
    } catch (err) {
      this.error = describeError(err);
    }
  }

  /** Save `text` as a file in the browser. */
  private download(name: string, text: string): void {
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
  }

  /** Read the chosen categories from the backend and save them as one file. */
  private async exportChosen(): Promise<void> {
    this.busy = true;
    this.message = '';
    this.error = '';
    try {
      const pages: Partial<Record<TransferCategory, TransferPage[]>> = {};
      let entries = 0;
      for (const category of offeredCategories(this.mqtt)) {
        if (!this.chosen.has(category)) continue;
        pages[category] = await this.api.transferExportAll(category);
        entries += pages[category].reduce((sum, page) => sum + page.items.length, 0);
      }
      const now = new Date();
      const name = exportFileName(now);
      this.download(name, JSON.stringify(buildTransferFile(pages, now.toISOString()), null, 2));
      this.message = this.tr('trfExported', { name, count: entries });
    } catch (err) {
      this.error = describeError(err);
    }
    this.busy = false;
  }

  /** Render the checkbox of one category with its number of entries. */
  private renderChoice(category: TransferCategory): TemplateResult {
    const count = this.counts[category] ?? 0;
    return html`<label class="choice">
      <input
        type="checkbox"
        .checked=${this.chosen.has(category)}
        ?disabled=${count === 0}
        @change=${() => (this.chosen = toggled(this.chosen, category))}
      />
      ${this.tr(CATEGORY_LABELS[category])} (${count})
    </label>`;
  }

  /** Render the element. */
  override render(): TemplateResult {
    const usable = offeredCategories(this.mqtt).filter(
      (category) => this.chosen.has(category) && (this.counts[category] ?? 0) > 0,
    );
    return html`
      <p>${this.tr('trfIntro')}</p>
      <section>
        <h3>${this.tr('trfExportTitle')}</h3>
        <fieldset>
          ${offeredCategories(this.mqtt).map((category) => this.renderChoice(category))}
        </fieldset>
        <p class="row">
          <button
            class="primary"
            ?disabled=${this.busy || usable.length === 0}
            @click=${() => void this.exportChosen()}
          >
            ${this.tr('trfExport')}
          </button>
          ${usable.length === 0 ? html`<small>${this.tr('trfNothing')}</small>` : ''}
        </p>
        <p>${this.message}<span class="error">${this.error}</span></p>
      </section>
    `;
  }
}
