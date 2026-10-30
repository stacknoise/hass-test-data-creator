import { css, html, nothing, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { describeError } from '../common/api';
import { containerHost } from '../common/base';
import { TdcPollingElement } from '../common/polling';
import '../common/filter-bar';
import {
  readFilter,
  resetValues,
  writeFilter,
  type FilterField,
  type FilterValues,
} from '../common/filter-state';
import '../common/menu-button';
import type { MenuItem } from '../common/menu-button';
import type { DeviceFacets, DeviceInfo, EntityState, FacetEntry } from '../common/types';
import {
  OUTPUT_LABELS,
  actionLabel,
  entityName,
  labelOf,
  sortedByLabel,
  stateLabel,
  templateLabel,
} from '../common/labels';
import '../common/dialog';
import '../wizard/creation-wizard';
import '../wizard/template-manager';
import './device-detail';
import './bulk-bar';
import {
  NO_SELECTION,
  bulkTarget,
  canSelectAll,
  pageState,
  selectionCount,
  toggleOne,
  togglePage,
  type Selection,
} from './bulk-helpers';
import './duplicate-dialog';
import {
  DEVICE_FIELDS,
  DEVICE_FILTER_TAB,
  SEARCH_BEFORE,
  ariaSort,
  nextSort,
  type SortColumn,
  deviceRequest,
  facetItems,
  knownAreas,
  lastPageOffset,
  usageEntries,
} from './helpers';
import { KIND_DEVICE, PLATFORM_SENSOR } from '../common/constants';

const VALUES_SHOWN = 4;
const COLUMN_COUNT = 7;

export const PAGE_SIZE = 50;
const ACTION_BY_PLATFORM: Record<string, string> = {
  switch: 'toggle',
  event: 'press',
  binary_sensor: 'pulse',
  light: 'toggle',
};
const FIRE_PREFIX = 'fire:';
const REMOVE = 'remove';
const DUPLICATE = 'duplicate';
const PAUSE = 'pause';
const VALUE_PLATFORMS = [PLATFORM_SENSOR, 'switch', 'binary_sensor', 'light', 'cover', 'climate'];

/** Lists the generated devices with live values and manual actions. */
@customElement('tdc-device-list')
export class DeviceList extends TdcPollingElement {
  static override styles = [
    TdcPollingElement.styles,
    containerHost,
    css`
      tr.device {
        cursor: pointer;
      }
      td.nowrap {
        white-space: nowrap;
      }
      small.paused {
        margin-left: 6px;
        padding: 1px 6px;
        border-radius: 8px;
        color: var(--text-primary-color);
        background: var(--warning-color);
      }
      td.check,
      th.check {
        width: 1%;
      }
      td.nowrap.row {
        flex-wrap: nowrap;
      }
      td.values {
        width: 100%;
      }
      @container (max-width: 760px) {
        table.cards tr.card > td.nowrap {
          white-space: normal;
        }
        td.values {
          width: auto;
        }
      }
      th.sortable {
        cursor: pointer;
        user-select: none;
      }
      th.sortable:hover {
        color: var(--primary-text-color);
      }
      tr.device:hover {
        background: var(--secondary-background-color);
      }
    `,
  ];

  @state() private devices: DeviceInfo[] = [];
  @state() private total = 0;
  @state() private matched = 0;
  @state() private offset = 0;
  @state() private loaded = false;
  @state() private templating = false;
  @state() private duplicating?: DeviceInfo;
  @state() private facets?: DeviceFacets;
  @state() private filter: FilterValues = readFilter(DEVICE_FILTER_TAB, DEVICE_FIELDS);

  @state() private selection: Selection = NO_SELECTION;

  private facetsStale = true;

  /** Nothing to prepare: the list needs the actions only for the detail view. */
  protected override optionsLoaded(): void {}

  /** Reload the page that is shown; after devices were removed, step back to the last page. */
  override async refresh(): Promise<void> {
    const request = deviceRequest(this.filter);
    const withFacets = this.facetsStale;
    this.facetsStale = false;
    try {
      let page = await this.api.devices(this.offset, PAGE_SIZE, request, withFacets);
      if (page.devices.length === 0 && this.offset > 0) {
        this.offset = lastPageOffset(page.matched, PAGE_SIZE);
        page = await this.api.devices(this.offset, PAGE_SIZE, request, withFacets);
      }
      this.devices = page.devices;
      this.total = page.total;
      this.matched = page.matched;
      if (page.facets) this.facets = page.facets;
      this.error = '';
    } catch (err) {
      this.facetsStale ||= withFacets;
      this.error = describeError(err);
    }
    this.loaded = true;
  }

  /** Reload and ask for the filter options too, as after a change of the devices. */
  private reload(): void {
    this.facetsStale = true;
    void this.refresh();
  }

  /** Apply a new filter from the bar: remember it, go to the first page and reload. */
  private setFilter(values: FilterValues): void {
    this.filter = values;
    this.selection = NO_SELECTION;
    writeFilter(DEVICE_FILTER_TAB, values);
    this.offset = 0;
    this.reload();
  }

  /** Return the label of a template as the list shows it. */
  private facetTemplate(entry: FacetEntry): string {
    if (entry.value === 'custom') return this.tr('customTemplate');
    return templateLabel(this.hass?.language, entry.value, entry.value);
  }

  /** Return the controls of the filter bar with the options that the last facets offer. */
  private filterFields(): FilterField[] {
    const lang = this.hass?.language;
    const facets = this.facets;
    const options = (
      group: keyof DeviceFacets,
      key: string,
      label: (entry: FacetEntry) => string,
    ) => facetItems(facets?.[group], this.filter[key], label);
    const stateLabels: Record<string, string> = {
      fault: this.tr('filterFault'),
      used: this.tr('filterUsed'),
      unused: this.tr('filterUnused'),
      paused: this.tr('filterPaused'),
    };
    return [
      {
        key: 'state',
        kind: 'choice',
        label: this.tr('detState'),
        options: options('state', 'state', (e) => stateLabels[e.value] ?? e.value),
      },
      {
        key: 'templates',
        kind: 'multi',
        label: this.tr('colTemplate'),
        options: options('templates', 'templates', (e) => this.facetTemplate(e)),
      },
      {
        key: 'areas',
        kind: 'multi',
        label: this.tr('colArea'),
        options: options('areas', 'areas', (e) =>
          e.value === '' ? this.tr('areasNone') : e.value,
        ),
      },
      {
        key: 'outputs',
        kind: 'multi',
        label: this.tr('colOutput'),
        options: options('outputs', 'outputs', (e) =>
          this.tr(OUTPUT_LABELS[e.value] ?? 'outputNative'),
        ),
      },
      {
        key: 'platforms',
        kind: 'multi',
        label: this.tr('detEntity'),
        options: options('platforms', 'platforms', (e) => labelOf(lang, 'platform', e.value)),
      },
      {
        key: 'runs',
        kind: 'multi',
        label: this.tr('schTarget_run'),
        options: options('runs', 'runs', (e) => e.label || e.value),
      },
      { key: 'custom', kind: 'switch', label: this.tr('filterCustom') },
    ];
  }

  /** Render the filter bar. */
  private renderFilter(): TemplateResult {
    return html`<tdc-filter-bar
      .hass=${this.hass}
      .fields=${this.filterFields()}
      .values=${this.filter}
      searchBefore=${SEARCH_BEFORE}
      .matched=${this.matched}
      .total=${this.total}
      @tdc-filter-change=${(e: CustomEvent<FilterValues>) => this.setFilter(e.detail)}
    ></tdc-filter-bar>`;
  }

  /** Render a column header that sorts the list: one click ascending, a second descending, a third off. */
  private sortHeader(column: SortColumn, label: string): TemplateResult {
    const order = ariaSort(this.filter, column);
    const arrow = { ascending: '▲', descending: '▼', none: '' }[order];
    return html`<th
      class="sortable"
      aria-sort=${order}
      @click=${() => this.setFilter(nextSort(this.filter, column))}
    >
      ${label} <span class="arrow">${arrow}</span>
    </th>`;
  }

  /** Show another page of the list. */
  private goTo(offset: number): void {
    this.offset = offset;
    void this.refresh();
  }

  /** Run the action of an entity and reload the list. */
  private async fire(device: DeviceInfo, entity: EntityState): Promise<void> {
    try {
      await this.api.fire(device.id, entity.key, ACTION_BY_PLATFORM[entity.platform]);
      await this.refresh();
    } catch (err) {
      this.error = describeError(err);
    }
  }

  /** Pause the device, or resume it if it is paused, and reload the list. */
  private async togglePause(device: DeviceInfo): Promise<void> {
    try {
      await this.api.bulkPause({ ids: [device.id] }, !device.paused);
      await this.refresh();
    } catch (err) {
      this.error = describeError(err);
    }
  }

  /** Return the entries of the actions menu: the main action of every entity, and remove. */
  private menuItems(device: DeviceInfo): MenuItem[] {
    const lang = this.hass?.language;
    const items = device.entities
      .filter((e) => e.platform in ACTION_BY_PLATFORM)
      .map((e) => ({
        value: `${FIRE_PREFIX}${e.key}`,
        label: `${entityName(lang, e.key, e.name)} – ${actionLabel(lang, ACTION_BY_PLATFORM[e.platform])}`,
      }));
    return sortedByLabel(
      lang,
      [
        ...items,
        { value: DUPLICATE, label: this.tr('duplicate') },
        { value: PAUSE, label: this.tr(device.paused ? 'resume' : 'pause') },
        {
          value: REMOVE,
          label: this.tr('remove'),
          disabled: usageEntries(device.used_by).length > 0,
          hint: this.tr('removeBlocked'),
        },
      ],
      (i) => i.label,
    );
  }

  /** Run the chosen entry of the actions menu. */
  private pick(device: DeviceInfo, value: string): void {
    if (value === DUPLICATE) {
      this.duplicating = device;
      return;
    }
    if (value === PAUSE) {
      void this.togglePause(device);
      return;
    }
    if (value === REMOVE) {
      this.dispatchEvent(
        new CustomEvent('tdc-remove', { detail: { target: KIND_DEVICE, id: device.id } }),
      );
      return;
    }
    const entity = device.entities.find((e) => `${FIRE_PREFIX}${e.key}` === value);
    if (entity) void this.fire(device, entity);
  }

  /** Return the current values of the first entities as one line. */
  private values(device: DeviceInfo): string {
    const lang = this.hass?.language;
    return device.entities
      .filter((e) => VALUE_PLATFORMS.includes(e.platform))
      .slice(0, VALUES_SHOWN)
      .map((e) => {
        const unit = e.unit ? ` ${e.unit}` : '';
        const fault = e.fault ? ` ⚠ ${labelOf(lang, 'fault', e.fault)}` : '';
        return `${entityName(lang, e.key, e.name)}: ${stateLabel(lang, e.state)}${unit}${fault}`;
      })
      .join(' · ');
  }

  /** Return the text of the template of a device. */
  private templateName(device: DeviceInfo): string {
    if (device.template === 'custom') return this.tr('customTemplate');
    return templateLabel(this.hass?.language, device.template, device.model);
  }

  /** Return the ids of the devices on this page. */
  private pageIds(): string[] {
    return this.devices.map((d) => d.id);
  }

  /** Return how much of this page is selected. */
  private pageState(): 'none' | 'some' | 'all' {
    return pageState(this.selection, this.pageIds());
  }

  /** Render the offer to select all matches, the bulk bar and the result of the last bulk action. */
  private renderBulk(): TemplateResult {
    const count = selectionCount(this.selection, this.matched);
    return html`
      ${
        this.selection.all
          ? html`<p class="row">
              <small>${this.tr('bulkAllSelected', { count: this.matched })}</small>
              <button @click=${() => (this.selection = NO_SELECTION)}>
                ${this.tr('bulkClear')}
              </button>
            </p>`
          : canSelectAll(this.selection, this.pageIds(), this.matched)
            ? html`<p class="row">
                <button @click=${() => (this.selection = { ids: this.selection.ids, all: true })}>
                  ${this.tr('bulkSelectAll', { count: this.matched })}
                </button>
              </p>`
            : nothing
      }
      <tdc-bulk-bar
        .hass=${this.hass}
        .count=${count}
        .target=${bulkTarget(this.selection, deviceRequest(this.filter))}
        .areas=${knownAreas(this.hass.areas, this.devices)}
        .actions=${this.info?.actions ?? {}}
        .mqtt=${this.info?.mqtt ?? false}
        @tdc-bulk-clear=${() => (this.selection = NO_SELECTION)}
        @tdc-bulk-done=${(e: CustomEvent<string>) => {
          this.selection = NO_SELECTION;
          this.reload();
          this.message = e.detail;
        }}
      ></tdc-bulk-bar>
      ${this.message ? html`<p>${this.message}</p>` : nothing}
    `;
  }

  /** Render the table row of one device. */
  private renderRow(device: DeviceInfo): TemplateResult {
    const open = this.expanded.has(device.id);
    return html`<tr class="device card" @click=${() => this.toggle(device.id)}>
        <td class="check" @click=${(event: Event) => event.stopPropagation()}>
          <input
            type="checkbox"
            aria-label=${this.tr('bulkSelectRow', { name: device.name })}
            .checked=${this.selection.all || this.selection.ids.has(device.id)}
            ?disabled=${this.selection.all}
            @change=${() => (this.selection = toggleOne(this.selection, device.id))}
          />
        </td>
        <td class="name nowrap">
          ${open ? '▾' : '▸'} ${device.name}
          ${device.paused ? html`<small class="paused">${this.tr('pausedBadge')}</small>` : nothing}
        </td>
        <td class="nowrap" data-label=${this.tr('colTemplate')}>${this.templateName(device)}</td>
        <td class="nowrap" data-label=${this.tr('colArea')}>${device.area ?? '–'}</td>
        <td class="nowrap" data-label=${this.tr('colOutput')}>
          ${this.tr(OUTPUT_LABELS[device.output] ?? 'outputNative')}
        </td>
        <td class="values" data-label=${this.tr('colValues')}>
          <small>${this.values(device)}</small>
        </td>
        <td class="row nowrap" data-label=${this.tr('colActions')}>
          <tdc-menu-button
            .hass=${this.hass}
            label=${this.tr('colActions')}
            .items=${this.menuItems(device)}
            @click=${(event: Event) => event.stopPropagation()}
            @tdc-pick=${(e: CustomEvent<string>) => this.pick(device, e.detail)}
          ></tdc-menu-button>
        </td>
      </tr>
      ${
        open
          ? this.detailRow(
              COLUMN_COUNT,
              html`<tdc-device-detail
                .hass=${this.hass}
                .device=${device}
                .actions=${this.info?.actions ?? {}}
                .shapes=${this.info?.shapes ?? []}
                .areas=${knownAreas(this.hass.areas, this.devices)}
                @tdc-changed=${() => this.reload()}
              ></tdc-device-detail>`,
            )
          : ''
      }`;
  }

  /** Render the buttons that open the popups to create devices and to manage the own templates. */
  private renderNew(): TemplateResult {
    return html`
      <p>
        <button class="primary" @click=${() => (this.creating = true)}>
          + ${this.tr('create')}
        </button>
        <button class="primary" @click=${() => (this.templating = true)}>
          ${this.tr('tplManage')}
        </button>
      </p>
      <tdc-dialog
        .hass=${this.hass}
        heading=${this.tr('create')}
        ?open=${this.creating}
        @tdc-close=${() => (this.creating = false)}
      >
        ${
          this.creating
            ? html`<tdc-creation-wizard
                .hass=${this.hass}
                @tdc-created=${() => {
                  this.creating = false;
                  this.reload();
                }}
              ></tdc-creation-wizard>`
            : nothing
        }
      </tdc-dialog>
      <tdc-dialog
        .hass=${this.hass}
        heading=${this.tr('duplicate')}
        ?open=${this.duplicating !== undefined}
        @tdc-close=${() => (this.duplicating = undefined)}
      >
        ${
          this.duplicating
            ? html`<tdc-duplicate-dialog
                .hass=${this.hass}
                .device=${this.duplicating}
                @tdc-created=${() => {
                  this.duplicating = undefined;
                  void this.refresh();
                }}
              ></tdc-duplicate-dialog>`
            : nothing
        }
      </tdc-dialog>
      <tdc-dialog
        .hass=${this.hass}
        heading=${this.tr('tplManage')}
        ?open=${this.templating}
        @tdc-close=${() => (this.templating = false)}
      >
        ${
          this.templating
            ? html`<tdc-template-manager .hass=${this.hass}></tdc-template-manager>`
            : nothing
        }
      </tdc-dialog>
    `;
  }

  /** Render the element. */
  override render(): TemplateResult {
    if (!this.loaded) return html`${this.tr('loading')}`;
    return html`
      ${this.renderNew()} ${this.error ? html`<p class="error">${this.error}</p>` : ''}
      ${this.total === 0 ? '' : this.renderFilter()}
      ${
        this.total === 0
          ? html`<p>${this.tr('noDevices')}</p>`
          : this.matched === 0
            ? html`<p>
                ${this.tr('noMatches')}
                <a
                  href="#"
                  @click=${(e: Event) => {
                    e.preventDefault();
                    this.setFilter(resetValues(this.filterFields(), this.filter));
                  }}
                  >${this.tr('noMatchesReset')}</a
                >
              </p>`
            : html`${this.renderBulk()}
                <table class="cards">
                  <thead>
                    <tr>
                      <th class="check">
                        <input
                          type="checkbox"
                          aria-label=${this.tr('bulkSelectPage')}
                          .checked=${this.pageState() === 'all'}
                          .indeterminate=${this.pageState() === 'some'}
                          ?disabled=${this.selection.all}
                          @change=${() =>
                            (this.selection = togglePage(this.selection, this.pageIds()))}
                        />
                      </th>
                      ${this.sortHeader('name', this.tr('colName'))}
                      ${this.sortHeader('template', this.tr('colTemplate'))}
                      <th>${this.tr('colArea')}</th>
                      <th>${this.tr('colOutput')}</th>
                      <th>${this.tr('colValues')}</th>
                      <th>${this.tr('colActions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${repeat(
                      this.devices,
                      (d) => d.id,
                      (d) => this.renderRow(d),
                    )}
                  </tbody>
                </table>
                <p class="row">
                  <button
                    ?disabled=${this.offset === 0}
                    @click=${() => this.goTo(Math.max(0, this.offset - PAGE_SIZE))}
                  >
                    ${this.tr('pagePrevious')}
                  </button>
                  <small>
                    ${this.tr('devicesRange', {
                      from: this.offset + 1,
                      to: this.offset + this.devices.length,
                      total: this.matched,
                    })}
                  </small>
                  <button
                    ?disabled=${this.offset + this.devices.length >= this.matched}
                    @click=${() => this.goTo(this.offset + PAGE_SIZE)}
                  >
                    ${this.tr('pageNext')}
                  </button>
                </p>`
      }
    `;
  }
}
