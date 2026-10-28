import { css, html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { describeError } from '../common/api';
import { TdcElement } from '../common/base';
import type { DeviceInfo, EntityState, Info } from '../common/types';
import './device-detail';
import { knownAreas } from './helpers';

const PAGE_SIZE = 200;
const REFRESH_MS = 10_000;
const ACTION_BY_PLATFORM: Record<string, string> = {
  switch: 'toggle',
  event: 'press',
  binary_sensor: 'pulse',
  light: 'toggle',
};
const VALUE_PLATFORMS = ['sensor', 'switch', 'binary_sensor', 'light', 'cover', 'climate'];

/** Lists the generated devices with live values and manual actions. */
@customElement('tdc-device-list')
export class DeviceList extends TdcElement {
  static override styles = [
    TdcElement.styles,
    css`
      tr.device {
        cursor: pointer;
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

  /** Return the current values of the first entities as one line. */
  private values(device: DeviceInfo): string {
    return device.entities
      .filter((e) => VALUE_PLATFORMS.includes(e.platform))
      .slice(0, 4)
      .map(
        (e) =>
          `${e.name}: ${e.state ?? '–'}${e.unit ? ` ${e.unit}` : ''}${e.fault ? ` ⚠ ${e.fault}` : ''}`,
      )
      .join(' · ');
  }

  /** Render the table row of one device. */
  private renderRow(device: DeviceInfo): TemplateResult {
    const actionable = device.entities.filter((e) => e.platform in ACTION_BY_PLATFORM);
    const open = this.expanded.has(device.id);
    return html`<tr class="device" @click=${() => this.toggle(device.id)}>
        <td>${open ? '▾' : '▸'} ${device.name}</td>
        <td>${device.model}</td>
        <td>${device.area ?? '–'}</td>
        <td>${device.output}</td>
        <td><small>${this.values(device)}</small></td>
        <td class="row">
          ${actionable.map(
            (e) =>
              html`<button
                @click=${(event: Event) => {
                  event.stopPropagation();
                  void this.fire(device, e);
                }}
              >
                ${e.name}
              </button>`,
          )}
          <button
            @click=${(event: Event) => {
              event.stopPropagation();
              this.dispatchEvent(
                new CustomEvent('tdc-remove', { detail: { target: 'device', id: device.id } }),
              );
            }}
          >
            ${this.tr('remove')}
          </button>
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

  /** Render the element. */
  override render(): TemplateResult {
    if (!this.loaded) return html`${this.tr('loading')}`;
    return html`
      ${this.error ? html`<p class="error">${this.error}</p>` : ''}
      ${
        this.devices.length === 0
          ? html`<p>${this.tr('noDevices')}</p>`
          : html`<table>
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
