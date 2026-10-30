import { css, html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { live } from 'lit/directives/live.js';
import { TdcElement } from './base';
import {
  KEY_DESCENDING,
  KEY_QUERY,
  KEY_SORT,
  activeCount,
  chipsOf,
  resetValues,
  withoutChip,
  type FilterChip,
  type FilterField,
  type FilterValue,
  type FilterValues,
} from './filter-state';
import { isTypingTarget, shortcutOf } from './shortcuts';
import './multi-select';
import type { SelectItem } from './multi-select';

/** How long the bar waits after the last change before it reports the filter. */
export const FILTER_DEBOUNCE_MS = 300;

/**
 * A search field, multi-selects, switches, an optional sort, chips of the active filters and a
 * counter. It reports the whole state as `tdc-filter-change`, debounced; the owner keeps `values`.
 */
@customElement('tdc-filter-bar')
export class FilterBar extends TdcElement {
  @property({ attribute: false }) fields: FilterField[] = [];
  @property({ attribute: false }) values: FilterValues = {};
  @property({ attribute: false }) sorts: SelectItem[] = [];
  @property() searchLabel = '';
  /** The key of the field that the search is put before; empty puts it first. */
  @property() searchBefore = '';
  @property({ type: Number }) matched = 0;
  @property({ type: Number }) total = 0;

  @state() private draft: FilterValues = {};

  private timer?: number;

  static override styles = [
    TdcElement.styles,
    css`
      .bar {
        align-items: flex-end;
        margin: 0 0 8px;
      }
      .bar > * {
        min-width: 160px;
        flex: 1 1 160px;
      }
      .bar .search {
        flex: 2 1 220px;
      }
      .bar .narrow {
        flex: 0 0 auto;
        min-width: 0;
      }
      .chips {
        margin: 0 0 8px;
        align-items: center;
      }
      .chip {
        padding: 2px 10px;
        border-radius: 14px;
        background: var(--secondary-background-color);
        font-size: 0.9em;
      }
      .count {
        color: var(--secondary-text-color);
      }
      label.switch {
        flex-direction: row;
        align-items: center;
        gap: 6px;
        color: var(--primary-text-color);
      }
      label.switch input {
        width: auto;
        min-height: 0;
      }
    `,
  ];

  /** Take over the values of the owner, unless a change is still waiting to be reported. */
  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('values') && this.timer === undefined) this.draft = this.values;
  }

  /** Listen for the shortcuts while the bar is on the page. */
  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('keydown', this.onKey);
  }

  /** Run a shortcut: `/` focuses the search field, `Esc` resets the filter. */
  private readonly onKey = (event: KeyboardEvent): void => {
    const input = this.shadowRoot?.querySelector<HTMLInputElement>('input[type=search]');
    const origin = event.composedPath()[0] ?? null;
    const action = shortcutOf({
      key: event.key,
      modified: event.ctrlKey || event.metaKey || event.altKey,
      typing: isTypingTarget(origin),
      inSearch: origin === input,
      dialogOpen: document.querySelector('tdc-dialog[open]') !== null,
    });
    if (action === 'search' && input) {
      event.preventDefault();
      input.focus();
      input.select();
    } else if (action === 'reset' && activeCount(this.fields, this.draft) > 0) {
      this.replace(resetValues(this.fields, this.draft));
      input?.blur();
    }
  };

  /** Stop a pending report and the shortcuts when the bar is removed. */
  override disconnectedCallback(): void {
    document.removeEventListener('keydown', this.onKey);
    window.clearTimeout(this.timer);
    this.timer = undefined;
    super.disconnectedCallback();
  }

  /** Change one value and report the state after the debounce time. */
  private set(key: string, value: FilterValue, immediately = false): void {
    this.draft = { ...this.draft, [key]: value };
    this.report(immediately);
  }

  /** Replace the whole state, as reset and the chips do, and report it. */
  private replace(values: FilterValues): void {
    this.draft = values;
    this.report(true);
  }

  /** Report the state of the bar now or after the debounce time. */
  private report(immediately: boolean): void {
    window.clearTimeout(this.timer);
    const send = (): void => {
      this.timer = undefined;
      this.dispatchEvent(new CustomEvent('tdc-filter-change', { detail: this.draft }));
    };
    if (immediately) send();
    else this.timer = window.setTimeout(send, FILTER_DEBOUNCE_MS);
  }

  /** Render the control of one field. */
  private renderField(field: FilterField): TemplateResult {
    const value = this.draft[field.key];
    if (field.kind === 'switch') {
      return html`<label class="switch narrow">
        <input
          type="checkbox"
          .checked=${value === true}
          @change=${(e: Event) => this.set(field.key, (e.target as HTMLInputElement).checked, true)}
        />
        ${field.label}
      </label>`;
    }
    const selected = Array.isArray(value) ? value : value ? [String(value)] : [];
    return html`<label>
      ${field.label}
      <tdc-multi-select
        .hass=${this.hass}
        .items=${field.options ?? []}
        .selected=${selected}
        ?single=${field.kind === 'choice'}
        empty=${this.tr('filterAny')}
        @tdc-select-change=${(e: CustomEvent<string[]>) =>
          this.set(field.key, field.kind === 'choice' ? (e.detail[0] ?? '') : e.detail, true)}
      ></tdc-multi-select>
    </label>`;
  }

  /** Render the choice of the sort and its direction. */
  private renderSort(): TemplateResult | typeof nothing {
    if (!this.sorts.length) return nothing;
    const descending = this.draft[KEY_DESCENDING] === true;
    const chosen = String(this.draft[KEY_SORT] ?? '');
    return html`<label class="narrow">
        ${this.tr('filterSortBy')}
        <select
          .value=${live(chosen)}
          @change=${(e: Event) => this.set(KEY_SORT, (e.target as HTMLSelectElement).value, true)}
        >
          <option value="">${this.tr('sortDefault')}</option>
          ${this.sorts.map((s) => html`<option value=${s.value}>${s.label}</option>`)}
        </select>
      </label>
      <button
        class="narrow"
        title=${this.tr(descending ? 'sortDescending' : 'sortAscending')}
        @click=${() => this.set(KEY_DESCENDING, !descending, true)}
      >
        ${descending ? '↓' : '↑'}
      </button>`;
  }

  /** Render one chip of an active filter. */
  private renderChip(chip: FilterChip): TemplateResult {
    return html`<span class="chip">
      ${chip.label}
      <a
        href="#"
        role="button"
        title=${this.tr('filterRemove')}
        @click=${(e: Event) => {
          e.preventDefault();
          this.replace(withoutChip(this.fields, this.draft, chip));
        }}
        >×</a
      >
    </span>`;
  }

  /** Return true if the search leads the bar: no field to put it before is named or found. */
  private searchFirst(): boolean {
    return !this.fields.some((field) => field.key === this.searchBefore);
  }

  /** Render the search field. */
  private renderSearch(): TemplateResult {
    return html`<label class="search">
      ${this.searchLabel || this.tr('filterSearch')}
      <input
        type="search"
        placeholder=${this.tr('filterSearchHint')}
        .value=${live(String(this.draft[KEY_QUERY] ?? ''))}
        @input=${(e: Event) => this.set(KEY_QUERY, (e.target as HTMLInputElement).value)}
      />
    </label>`;
  }

  /** Render the element. */
  override render(): TemplateResult {
    const chips = chipsOf(this.fields, this.draft);
    const active = activeCount(this.fields, this.draft) > 0;
    return html`
      <div class="row bar">
        ${this.searchFirst() ? this.renderSearch() : nothing}
        ${this.fields.map(
          (field) =>
            html`${field.key === this.searchBefore ? this.renderSearch() : nothing}${this.renderField(field)}`,
        )}
        ${this.renderSort()}
      </div>
      <div class="row chips">
        ${chips.map((chip) => this.renderChip(chip))}
        ${
          active
            ? html`<button @click=${() => this.replace(resetValues(this.fields, this.draft))}>
                ${this.tr('filterReset')}
              </button>`
            : nothing
        }
        <small class="count">
          ${this.tr('filterCount', { matched: this.matched, total: this.total })}
        </small>
      </div>
    `;
  }
}
