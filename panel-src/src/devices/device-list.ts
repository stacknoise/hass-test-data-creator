import { css, html, nothing, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { describeError } from '../common/api';
import { TdcElement, containerHost } from '../common/base';
import '../common/menu-button';
import type { MenuItem } from '../common/menu-button';
import type { DeviceInfo, EntityState, Info } from '../common/types';
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
import './device-detail';
import { knownAreas, usageEntries } from './helpers';

const PAGE_SIZE = 200;
const REFRESH_MS = 10_000;
const ACTION_BY_PLATFORM: Record<string, string> = {
  switch: 'toggle',
  event: 'press',
  binary_sensor: 'pulse',
  light: 'toggle',
};
const FIRE_PREFIX = 'fire:';
const REMOVE = 'remove';
const VALUE_PLATFORMS = ['sensor', 'switch', 'binary_sensor', 'light', 'cover', 'climate'];

/** Lists the generated devices with live values and manual actions. */
@customElement('tdc-device-list')
export class DeviceList extends TdcElement {
  static override styles = [
    TdcElement.styles,
    containerHost,
    css`
      tr.device {
        cursor: pointer;
      }
      td.nowrap {
        white-space: nowrap;
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
      tr.device:hover {
        background: var(--secondary-background-color);
      }
    `,
  ];

  @state() private devices: DeviceInfo[] = [];
  @state() private total = 0;
  @state() private loaded = false;
  @state() private error = '';
  @state() private creating = false;
  @state() private info?: Info;
  @state() private expanded = new Set<string>();

  private timer?: number;

  /** Load the data when the element is added to the page. */
  override connectedCallback(): void {
    super.connectedCallback();
    void this.loadInfo();
    void this.refresh();
    this.timer = window.setInterval(() => void this.refresh(), REFRESH_MS);
  }

  /** Stop the refresh timer when the element is removed. */
  override disconnectedCallback(): void {
    window.clearInterval(this.timer);
    super.disconnectedCallback();
  }

  /** Load the actions that the detail view offers. */
  private async loadInfo(): Promise<void> {
    try {
      this.info = await this.api.info();
    } catch (err) {
      this.error = describeError(err);
    }
  }

  /** Open or close the details of a device. */
  private toggle(id: string): void {
    const next = new Set(this.expanded);
    if (!next.delete(id)) next.add(id);
    this.expanded = next;
  }

  /** Reload the devices that are shown now, at least the first page. */
  async refresh(more = false): Promise<void> {
    const limit = Math.max(PAGE_SIZE, this.devices.length + (more ? PAGE_SIZE : 0));
    try {
      const page = await this.api.devices(0, limit);
      this.devices = page.devices;
      this.total = page.total;
      this.error = '';
    } catch (err) {
      this.error = describeError(err);
    }
    this.loaded = true;
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
    if (value === REMOVE) {
      this.dispatchEvent(
        new CustomEvent('tdc-remove', { detail: { target: 'device', id: device.id } }),
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
      .slice(0, 4)
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

  /** Render the table row of one device. */
  private renderRow(device: DeviceInfo): TemplateResult {
    const open = this.expanded.has(device.id);
    return html`<tr class="device card" @click=${() => this.toggle(device.id)}>
        <td class="name nowrap">${open ? '▾' : '▸'} ${device.name}</td>
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
          ? html`<tr>
              <td colspan="6">
                <tdc-device-detail
                  .hass=${this.hass}
                  .device=${device}
                  .actions=${this.info?.actions ?? {}}
                  .shapes=${this.info?.shapes ?? []}
                  .areas=${knownAreas(this.hass.areas, this.devices)}
                  @tdc-changed=${() => void this.refresh()}
                ></tdc-device-detail>
              </td>
            </tr>`
          : ''
      }`;
  }

  /** Render the button that opens the popup with the form for new devices. */
  private renderNew(): TemplateResult {
    return html`
      <p>
        <button class="primary" @click=${() => (this.creating = true)}>
          + ${this.tr('create')}
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
                  void this.refresh();
                }}
              ></tdc-creation-wizard>`
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
      ${
        this.devices.length === 0
          ? html`<p>${this.tr('noDevices')}</p>`
          : html`<table class="cards">
                <thead>
                  <tr>
                    <th>${this.tr('colName')}</th>
                    <th>${this.tr('colTemplate')}</th>
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
                <small>
                  ${this.tr('devicesOf', { shown: this.devices.length, total: this.total })}
                </small>
                ${
                  this.devices.length < this.total
                    ? html`<button @click=${() => void this.refresh(true)}>
                        ${this.tr('loadMore')}
                      </button>`
                    : ''
                }
              </p>`
      }
    `;
  }
}
