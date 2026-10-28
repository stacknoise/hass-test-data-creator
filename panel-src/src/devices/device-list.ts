import { css, html, type TemplateResult } from 'lit';
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
const SWITCH_PLATFORMS = ['switch', 'light'];
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
      tr.device:hover {
        background: var(--secondary-background-color);
      }
      button.switch {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 2px 6px;
        border: 0;
        background: none;
      }
      .track {
        position: relative;
        width: 36px;
        height: 20px;
        border-radius: 10px;
        background: var(--disabled-text-color);
        transition: background 0.15s;
      }
      .on .track {
        background: var(--primary-color);
      }
      .knob {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--card-background-color);
        transition: transform 0.15s;
      }
      .on .knob {
        transform: translateX(16px);
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

  /** Render the switch of a switch or light entity; it shows the state and toggles it. */
  private renderSwitch(device: DeviceInfo, entity: EntityState): TemplateResult {
    const on = entity.state === 'on';
    const name = entityName(this.hass?.language, entity.key, entity.name);
    return html`<button
      class=${on ? 'switch on' : 'switch'}
      role="switch"
      aria-checked=${on ? 'true' : 'false'}
      ?disabled=${entity.state === 'unavailable'}
      title=${name}
      @click=${(event: Event) => {
        event.stopPropagation();
        void this.fire(device, entity);
      }}
    >
      <span class="track"><span class="knob"></span></span>
      ${name}
    </button>`;
  }

  /** Return the entries of the actions menu: the actions of entities without a state, and remove. */
  private menuItems(device: DeviceInfo): MenuItem[] {
    const lang = this.hass?.language;
    const items = device.entities
      .filter((e) => e.platform in ACTION_BY_PLATFORM && !SWITCH_PLATFORMS.includes(e.platform))
      .map((e) => ({
        value: `${FIRE_PREFIX}${e.key}`,
        label: `${entityName(lang, e.key, e.name)} – ${actionLabel(lang, ACTION_BY_PLATFORM[e.platform])}`,
      }));
    return sortedByLabel(
      lang,
      [...items, { value: REMOVE, label: this.tr('remove') }],
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
    const actionable = device.entities.filter((e) => e.platform in ACTION_BY_PLATFORM);
    const open = this.expanded.has(device.id);
    return html`<tr class="device card" @click=${() => this.toggle(device.id)}>
        <td class="name">${open ? '▾' : '▸'} ${device.name}</td>
        <td data-label=${this.tr('colTemplate')}>${this.templateName(device)}</td>
        <td data-label=${this.tr('colArea')}>${device.area ?? '–'}</td>
        <td data-label=${this.tr('colOutput')}>
          ${this.tr(OUTPUT_LABELS[device.output] ?? 'outputNative')}
        </td>
        <td data-label=${this.tr('colValues')}><small>${this.values(device)}</small></td>
        <td class="row" data-label=${this.tr('colActions')}>
          ${actionable
            .filter((e) => SWITCH_PLATFORMS.includes(e.platform))
            .map((e) => this.renderSwitch(device, e))}
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

  /** Render the element. */
  override render(): TemplateResult {
    if (!this.loaded) return html`${this.tr('loading')}`;
    return html`
      ${this.error ? html`<p class="error">${this.error}</p>` : ''}
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
