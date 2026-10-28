import { html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { describeError } from '../common/api';
import { TdcElement } from '../common/base';
import type { DeviceInfo, EntityState } from '../common/types';

const PAGE_SIZE = 200;
const REFRESH_MS = 10_000;
const ACTION_BY_PLATFORM: Record<string, string> = {
  switch: 'toggle',
  event: 'press',
  binary_sensor: 'pulse',
};

/** Lists the generated devices with live values and manual actions. */
@customElement('tdc-device-list')
export class DeviceList extends TdcElement {
  @state() private devices: DeviceInfo[] = [];
  @state() private total = 0;
  @state() private loaded = false;
  @state() private error = '';

  private timer?: number;

  /** Load the data when the element is added to the page. */
  override connectedCallback(): void {
    super.connectedCallback();
    void this.refresh();
    this.timer = window.setInterval(() => void this.refresh(), REFRESH_MS);
  }

  /** Stop the refresh timer when the element is removed. */
  override disconnectedCallback(): void {
    window.clearInterval(this.timer);
    super.disconnectedCallback();
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
      .filter(
        (e) => e.platform === 'sensor' || e.platform === 'switch' || e.platform === 'binary_sensor',
      )
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
    return html`<tr>
      <td>${device.name}</td>
      <td>${device.model}</td>
      <td>${device.area ?? '–'}</td>
      <td>${device.output}</td>
      <td><small>${this.values(device)}</small></td>
      <td class="row">
        ${actionable.map(
          (e) => html`<button @click=${() => void this.fire(device, e)}>${e.name}</button>`,
        )}
        <button
          @click=${() =>
            this.dispatchEvent(
              new CustomEvent('tdc-remove', { detail: { target: 'device', id: device.id } }),
            )}
        >
          ${this.tr('remove')}
        </button>
      </td>
    </tr>`;
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
                  ${this.devices.map((d) => this.renderRow(d))}
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
