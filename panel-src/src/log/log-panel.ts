import { css, html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { describeError } from '../common/api';
import { TdcElement } from '../common/base';
import { startPolling } from '../common/polling';
import type { LogEntry } from '../common/types';
import type { TextKey } from '../common/i18n';
import {
  LOG_MAX_CATCH_UP,
  LOG_PAGE,
  LOG_ROW_HEIGHT,
  appendEntries,
  atBottom,
  deltaText,
  formatTime,
  logFileName,
  toCsv,
  toJson,
  valueText,
  visibleRange,
} from './helpers';

/** The time between two reads of the log while the tab is open. */
const POLL_MS = 1000;
/** The rows kept in the browser when the backend does not say how many it holds. */
const DEFAULT_CAPACITY = 5000;
/** The height of the list; it scrolls inside. */
const LIST_HEIGHT = 'min(65vh, 640px)';

/** The live log: every state change of the generated entities while this tab is open. */
@customElement('tdc-log-panel')
export class LogPanel extends TdcElement {
  @state() private entries: LogEntry[] = [];
  @state() private paused = false;
  @state() private frozen = 0;
  @state() private listTop = 0;
  @state() private missed = 0;
  @state() private message = '';
  @state() private error = '';

  @query('.list') private list?: HTMLElement;

  private lastSeq = 0;
  private capacity = DEFAULT_CAPACITY;
  private follow = true;
  private reading = false;
  private stopPolling?: () => void;

  static override styles = [
    TdcElement.styles,
    css`
      .bar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }
      .bar .grow {
        flex: 1;
      }
      .list {
        position: relative;
        overflow-y: auto;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--card-background-color);
      }
      .head,
      .row {
        display: grid;
        grid-template-columns:
          110px minmax(120px, 1fr) minmax(120px, 1fr) minmax(160px, 1.5fr)
          90px;
        gap: 8px;
        align-items: center;
        padding: 0 8px;
        box-sizing: border-box;
      }
      .head {
        position: sticky;
        top: 0;
        z-index: 1;
        height: 30px;
        font-size: 0.8em;
        font-weight: 500;
        color: var(--secondary-text-color);
        background: var(--secondary-background-color);
        border-bottom: 1px solid var(--divider-color);
      }
      .row {
        height: ${LOG_ROW_HEIGHT}px;
        border-bottom: 1px solid var(--divider-color);
        font-size: 0.9em;
      }
      .row > span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .time {
        font-variant-numeric: tabular-nums;
        color: var(--secondary-text-color);
      }
      .delta {
        color: var(--secondary-text-color);
        margin-left: 6px;
      }
      .cause {
        display: inline-block;
        line-height: 1.5;
        font-size: 0.8em;
        padding: 1px 8px;
        border-radius: 999px;
        border: 1px solid var(--divider-color);
        color: var(--secondary-text-color);
      }
      .cause.fault {
        border-color: var(--error-color);
        color: var(--error-color);
      }
      .unavailable {
        color: var(--warning-color);
      }
      .empty {
        padding: 16px;
        color: var(--secondary-text-color);
      }
    `,
  ];

  /** Start reading the log when the tab opens. */
  override connectedCallback(): void {
    super.connectedCallback();
    void this.read();
    this.stopPolling = startPolling(() => void this.read(), POLL_MS);
  }

  /** Stop reading and tell the backend, which empties the log at once. */
  override disconnectedCallback(): void {
    this.stopPolling?.();
    void this.api.logStop().catch(() => undefined);
    super.disconnectedCallback();
  }

  /** Keep the list at its end while it follows the newest entry. */
  protected override updated(changed: PropertyValues): void {
    if (this.follow && !this.paused && changed.has('entries') && this.list) {
      this.list.scrollTop = this.list.scrollHeight;
    }
  }

  /** Read the entries that came since the last read; a backlog is fetched in a few calls. */
  private async read(): Promise<void> {
    if (this.reading) return;
    this.reading = true;
    try {
      for (let round = 0; round < LOG_MAX_CATCH_UP; round += 1) {
        const reply = await this.api.logGet(this.lastSeq, LOG_PAGE);
        this.capacity = reply.capacity || DEFAULT_CAPACITY;
        if (reply.last_seq < this.lastSeq) {
          this.entries = [];
          this.frozen = 0;
          this.lastSeq = 0;
          continue;
        }
        this.missed += reply.dropped;
        this.entries = appendEntries(this.entries, reply.entries, this.capacity);
        if (reply.entries.length > 0) this.lastSeq = reply.entries[reply.entries.length - 1].seq;
        this.error = '';
        if (reply.entries.length < LOG_PAGE) break;
      }
    } catch (err) {
      this.error = describeError(err);
    }
    this.reading = false;
  }

  /** The entries that the list shows: all, or the ones that were there when it was paused. */
  private shown(): LogEntry[] {
    return this.paused
      ? this.entries.slice(Math.max(0, this.entries.length - this.frozen))
      : this.entries;
  }

  /** Freeze the view at the current end, or let it catch up again. */
  private togglePause(): void {
    this.paused = !this.paused;
    this.frozen = this.paused ? this.entries.length : 0;
    if (!this.paused) this.follow = true;
  }

  /** Empty the log here and in the backend. */
  private async clear(): Promise<void> {
    try {
      await this.api.logClear();
      this.entries = [];
      this.frozen = 0;
      this.missed = 0;
      this.message = '';
    } catch (err) {
      this.error = describeError(err);
    }
  }

  /** Save the shown entries as a file in the browser. */
  private save(kind: 'csv' | 'json'): void {
    const entries = this.shown();
    const name = logFileName(new Date(), kind);
    const text = kind === 'csv' ? toCsv(entries) : toJson(entries);
    const type = kind === 'csv' ? 'text/csv' : 'application/json';
    const url = URL.createObjectURL(new Blob([text], { type }));
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
    this.message = this.tr('logSaved', { name, count: entries.length });
  }

  /** Remember the scroll position and whether the list follows the newest entry. */
  private onScroll(): void {
    if (!this.list) return;
    this.listTop = this.list.scrollTop;
    this.follow = atBottom(this.list.scrollTop, this.list.clientHeight, this.list.scrollHeight);
  }

  /** Render the buttons and the counters over the list. */
  private renderBar(shown: number): TemplateResult {
    const waiting = this.paused ? this.entries.length - this.frozen : 0;
    return html`<div class="bar">
      <button @click=${() => this.togglePause()}>
        ${this.paused ? this.tr('logResume') : this.tr('logPause')}
      </button>
      <button @click=${() => void this.clear()}>${this.tr('logClear')}</button>
      <span class="grow">
        ${this.tr('logCount', { count: shown })}
        ${waiting > 0 ? html` · ${this.tr('logNew', { count: waiting })}` : nothing}
      </span>
      <span>${this.tr('logSave')}:</span>
      <button ?disabled=${shown === 0} @click=${() => this.save('csv')}>
        ${this.tr('logSaveCsv')}
      </button>
      <button ?disabled=${shown === 0} @click=${() => this.save('json')}>
        ${this.tr('logSaveJson')}
      </button>
    </div>`;
  }

  /** Render one row of the list. */
  private renderRow(entry: LogEntry): TemplateResult {
    const unavailable = entry.new === 'unavailable';
    const delta = deltaText(entry.delta);
    return html`<div class="row">
      <span class="time">${formatTime(entry.at)}</span>
      <span title=${entry.device}>${entry.device}</span>
      <span title=${entry.key}>${entry.name}</span>
      <span class=${unavailable ? 'unavailable' : ''}>
        ${valueText(entry.old, entry.unit)} → ${valueText(entry.new, entry.unit)}
        ${delta ? html`<span class="delta">${delta}</span>` : nothing}
      </span>
      <span
        ><span class="cause ${entry.cause}"
          >${this.tr(`logCause_${entry.cause}` as TextKey)}</span
        ></span
      >
    </div>`;
  }

  /** Render the element. */
  override render(): TemplateResult {
    const shown = this.shown();
    const viewHeight = this.list?.clientHeight ?? 640;
    const { start, end } = visibleRange(shown.length, this.listTop, viewHeight);
    return html`
      <p>${this.tr('logIntro')}</p>
      ${this.renderBar(shown.length)}
      ${this.missed > 0 ? html`<p class="warning">${this.tr('logMissed', { count: this.missed })}</p>` : nothing}
      <div class="list" style="height: ${LIST_HEIGHT}" @scroll=${() => this.onScroll()}>
        <div class="head">
          <span>${this.tr('logColTime')}</span>
          <span>${this.tr('logColDevice')}</span>
          <span>${this.tr('logColEntity')}</span>
          <span>${this.tr('logColChange')}</span>
          <span>${this.tr('logColCause')}</span>
        </div>
        ${
          shown.length === 0
            ? html`<div class="empty">${this.tr('logEmpty')}</div>`
            : html`<div style="height: ${shown.length * LOG_ROW_HEIGHT}px; position: relative">
                <div style="transform: translateY(${start * LOG_ROW_HEIGHT}px)">
                  ${shown.slice(start, end).map((entry) => this.renderRow(entry))}
                </div>
              </div>`
        }
      </div>
      <p>${this.message}<span class="error">${this.error}</span></p>
    `;
  }
}
