import { css, html, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { describeError } from '../common/api';
import { TdcElement, toggled } from '../common/base';
import type {
  ImportMode,
  ImportPlan,
  TransferCategory,
  TransferFile,
  TransferPage,
} from '../common/types';
import { MAX_PAGE_SIZE } from '../common/constants';
import {
  CATEGORY_LABELS,
  IMPORT_ORDER,
  MAX_BATCH_BYTES,
  PURGE_ORDER,
  buildTransferFile,
  entriesOf,
  exportFileName,
  fileCategories,
  knownNames,
  needsConfirmation,
  offeredCategories,
  parseTransferFile,
  splitBatches,
  sumPlans,
} from './helpers';

const MODES: ImportMode[] = ['add', 'sync', 'replace'];
const MODE_LABELS = { add: 'trfModeAdd', sync: 'trfModeSync', replace: 'trfModeReplace' } as const;
const PROBLEMS_SHOWN = 20;
const DEFAULT_MAX_BYTES = 32 * 1024 * 1024;

/** Exports devices, own templates, schedules, scenarios and groups to a file, and imports them. */
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
  @state() private file?: TransferFile;
  @state() private fileName = '';
  @state() private take = new Set<string>();
  @state() private modes: Partial<Record<TransferCategory, ImportMode>> = {};
  @state() private plans?: ImportPlan[];

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

  /** The categories of the file that are chosen for import and offered here, in import order. */
  private importing(): TransferCategory[] {
    const offered = offeredCategories(this.mqtt);
    return IMPORT_ORDER.filter(
      (category) =>
        this.take.has(category) &&
        offered.includes(category) &&
        this.file &&
        fileCategories(this.file).includes(category),
    );
  }

  /** The batch of entries that goes to the backend, without the entries. */
  private batch(category: TransferCategory, items: object[], first: boolean) {
    const chosen = this.importing();
    return {
      category,
      mode: this.modes[category] ?? 'add',
      items,
      known: knownNames(this.file as TransferFile, chosen),
      replacing: chosen.filter((name) => this.modes[name] === 'replace'),
      first,
      file_name: this.fileName,
    };
  }

  /** Read the file the user chose and offer its categories. */
  private async chooseFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const chosen = input.files?.[0];
    this.plans = undefined;
    this.message = '';
    this.error = '';
    if (!chosen) return;
    const info = await this.api.info().catch(() => undefined);
    const parsed = parseTransferFile(
      await chosen.text(),
      info?.limits.max_transfer_bytes ?? DEFAULT_MAX_BYTES,
    );
    if ('error' in parsed) {
      this.file = undefined;
      this.error = this.tr(parsed.error, parsed.values);
      return;
    }
    this.file = parsed.file;
    this.fileName = chosen.name;
    this.take = new Set(fileCategories(parsed.file));
    this.modes = {};
  }

  /** Ask the backend what the import would do, batch by batch, and sum it per category. */
  private async showPlan(): Promise<void> {
    this.busy = true;
    this.message = '';
    this.error = '';
    try {
      const plans: ImportPlan[] = [];
      for (const category of this.importing()) {
        const parts = splitBatches(
          entriesOf(this.file as TransferFile, category),
          MAX_PAGE_SIZE,
          MAX_BATCH_BYTES,
        );
        const results: ImportPlan[] = [];
        for (const [index, items] of (parts.length ? parts : [[]]).entries()) {
          results.push(await this.api.transferPlan(this.batch(category, items, index === 0)));
        }
        plans.push(sumPlans(results));
      }
      this.plans = plans;
    } catch (err) {
      this.plans = undefined;
      this.error = describeError(err);
    }
    this.busy = false;
  }

  /** Run the import: first the removals of every replace, then the creations. */
  private async runImport(): Promise<void> {
    this.busy = true;
    this.error = '';
    try {
      const chosen = this.importing();
      const done: ImportPlan[] = [];
      for (const category of PURGE_ORDER.filter((name) => chosen.includes(name))) {
        if (this.modes[category] !== 'replace') continue;
        done.push(
          await this.api.transferRun({ ...this.batch(category, [], true), phase: 'purge' }),
        );
      }
      for (const category of chosen) {
        const parts = splitBatches(
          entriesOf(this.file as TransferFile, category),
          MAX_PAGE_SIZE,
          MAX_BATCH_BYTES,
        );
        for (const [index, items] of parts.entries()) {
          done.push(await this.api.transferRun(this.batch(category, items, index === 0)));
        }
      }
      const total = sumPlans(done.length ? done : [this.emptyPlan()]);
      this.message = this.tr('trfDone', {
        created: total.create,
        updated: total.update,
        deleted: total.delete,
        problems: total.problems.length,
      });
      this.plans = undefined;
      await this.loadCounts();
    } catch (err) {
      this.error = describeError(err);
    }
    this.busy = false;
  }

  /** A plan with nothing in it. */
  private emptyPlan(): ImportPlan {
    return {
      category: 'devices',
      mode: 'add',
      create: 0,
      update: 0,
      skip: 0,
      conflict: 0,
      delete: 0,
      problems: [],
    };
  }

  /** Render the checkbox and mode of one category of the file. */
  private renderFileCategory(category: TransferCategory): TemplateResult {
    return html`<tr>
      <td>
        <label class="choice">
          <input
            type="checkbox"
            .checked=${this.take.has(category)}
            @change=${() => {
              this.take = toggled(this.take, category);
              this.plans = undefined;
            }}
          />
          ${this.tr(CATEGORY_LABELS[category])}
          (${entriesOf(this.file as TransferFile, category).length})
        </label>
      </td>
      <td>
        <select
          ?disabled=${!this.take.has(category)}
          @change=${(e: Event) => {
            this.modes = {
              ...this.modes,
              [category]: (e.target as HTMLSelectElement).value as ImportMode,
            };
            this.plans = undefined;
          }}
        >
          ${MODES.map(
            (mode) =>
              html`<option value=${mode} ?selected=${(this.modes[category] ?? 'add') === mode}>
                ${this.tr(MODE_LABELS[mode])}
              </option>`,
          )}
        </select>
      </td>
    </tr>`;
  }

  /** Render the plan table and the problems. */
  private renderPlan(plans: ImportPlan[]): TemplateResult {
    const problems = plans.flatMap((plan) => plan.problems);
    return html`<h3>${this.tr('trfPlanTitle')}</h3>
      <table>
        <tr>
          <th>${this.tr('trfColCategory')}</th>
          <th>${this.tr('trfColCreate')}</th>
          <th>${this.tr('trfColUpdate')}</th>
          <th>${this.tr('trfColSkip')}</th>
          <th>${this.tr('trfColConflict')}</th>
          <th>${this.tr('trfColDelete')}</th>
        </tr>
        ${plans.map(
          (plan) =>
            html`<tr>
              <td>${this.tr(CATEGORY_LABELS[plan.category])}</td>
              <td>${plan.create}</td>
              <td>${plan.update}</td>
              <td>${plan.skip}</td>
              <td>${plan.conflict}</td>
              <td>${plan.delete}</td>
            </tr>`,
        )}
      </table>
      ${
        problems.length
          ? html`<h3>${this.tr('trfProblems')}</h3>
              <ul>
                ${problems
                  .slice(0, PROBLEMS_SHOWN)
                  .map(
                    (problem) =>
                      html`<li>${problem.name} · ${problem.code} · ${problem.reason}</li>`,
                  )}
              </ul>
              ${
                problems.length > PROBLEMS_SHOWN
                  ? html`<small
                      >${this.tr('trfProblemMore', { count: problems.length - PROBLEMS_SHOWN })}</small
                    >`
                  : ''
              }`
          : ''
      }
      <p>
        <button class="primary" ?disabled=${this.busy} @click=${() => void this.runImport()}>
          ${
            needsConfirmation(plans)
              ? this.tr('trfRunConfirm', {
                  updates: plans.reduce((sum, plan) => sum + plan.update, 0),
                  deletes: plans.reduce((sum, plan) => sum + plan.delete, 0),
                })
              : this.tr('trfRun')
          }
        </button>
      </p>`;
  }

  /** Render the import section. */
  private renderImport(): TemplateResult {
    return html`<section>
      <h3>${this.tr('trfImportTitle')}</h3>
      <p>${this.tr('trfImportIntro')}</p>
      <p>
        <input
          type="file"
          accept="application/json,.json"
          @change=${(e: Event) => void this.chooseFile(e)}
        />
      </p>
      ${
        this.file
          ? html`<p><small>${this.tr('trfFileLoaded', { name: this.fileName })}</small></p>
              <table>
                ${fileCategories(this.file)
                  .filter((category) => offeredCategories(this.mqtt).includes(category))
                  .map((category) => this.renderFileCategory(category))}
              </table>
              <p>
                <button
                  ?disabled=${this.busy || this.importing().length === 0}
                  @click=${() => void this.showPlan()}
                >
                  ${this.tr('trfCheck')}
                </button>
              </p>`
          : ''
      }
      ${this.plans ? this.renderPlan(this.plans) : ''}
    </section>`;
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
      </section>
      ${this.renderImport()}
      <p>${this.message}<span class="error">${this.error}</span></p>
    `;
  }
}
