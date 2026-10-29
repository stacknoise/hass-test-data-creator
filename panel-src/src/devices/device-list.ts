import { css, html, nothing, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { describeError } from '../common/api';
import { TdcElement, containerHost, toggled } from '../common/base';
import '../common/menu-button';
import type { MenuItem } from '../common/menu-button';
import type { DeviceInfo, EntityState, Info, TemplateInfo } from '../common/types';
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
import '../wizard/template-wizard';
import './device-detail';
import { knownAreas, lastPageOffset, usageEntries } from './helpers';
import { KIND_DEVICE, PLATFORM_SENSOR } from '../common/constants';

const VALUES_SHOWN = 4;
const COLUMN_COUNT = 6;

export const PAGE_SIZE = 50;
const REFRESH_MS = 10_000;
const ACTION_BY_PLATFORM: Record<string, string> = {
  switch: 'toggle',
  event: 'press',
  binary_sensor: 'pulse',
  light: 'toggle',
};
const FIRE_PREFIX = 'fire:';
const REMOVE = 'remove';
const VALUE_PLATFORMS = [PLATFORM_SENSOR, 'switch', 'binary_sensor', 'light', 'cover', 'climate'];

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
  @state() private offset = 0;
  @state() private loaded = false;
  @state() private error = '';
  @state() private creating = false;
  @state() private templating = false;
  @state() private editedTemplate?: TemplateInfo;
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
    this.expanded = toggled(this.expanded, id);
  }

  /** Reload the page that is shown; after devices were removed, step back to the last page. */
  async refresh(): Promise<void> {
    try {
      let page = await this.api.devices(this.offset, PAGE_SIZE);
      if (page.devices.length === 0 && this.offset > 0) {
        this.offset = lastPageOffset(page.total, PAGE_SIZE);
        page = await this.api.devices(this.offset, PAGE_SIZE);
      }
      this.devices = page.devices;
      this.total = page.total;
      this.error = '';
    } catch (err) {
      this.error = describeError(err);
    }
    this.loaded = true;
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
          ? this.detailRow(
              COLUMN_COUNT,
              html`<tdc-device-detail
                .hass=${this.hass}
                .device=${device}
                .actions=${this.info?.actions ?? {}}
                .shapes=${this.info?.shapes ?? []}
                .areas=${knownAreas(this.hass.areas, this.devices)}
                @tdc-changed=${() => void this.refresh()}
              ></tdc-device-detail>`,
            )
          : ''
      }`;
  }

  /** Open the popup of the template form, for a new template or to change `template`. */
  private openTemplate(template?: TemplateInfo): void {
    this.creating = false;
    this.editedTemplate = template;
    this.templating = true;
  }

  /** Render the buttons that open the popups with the forms for new devices and new templates. */
  private renderNew(): TemplateResult {
    return html`
      <p>
        <button class="primary" @click=${() => (this.creating = true)}>
          + ${this.tr('create')}
        </button>
        <button @click=${() => this.openTemplate()}>+ ${this.tr('tplCreate')}</button>
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
                @tdc-edit-template=${(e: CustomEvent<TemplateInfo>) => this.openTemplate(e.detail)}
                @tdc-created=${() => {
                  this.creating = false;
                  void this.refresh();
                }}
              ></tdc-creation-wizard>`
            : nothing
        }
      </tdc-dialog>
      <tdc-dialog
        .hass=${this.hass}
        heading=${this.editedTemplate ? this.tr('tplEdit') : this.tr('tplCreate')}
        ?open=${this.templating}
        @tdc-close=${() => (this.templating = false)}
      >
        ${
          this.templating
            ? html`<tdc-template-wizard
                .hass=${this.hass}
                .editing=${this.editedTemplate}
                @tdc-template-saved=${() => (this.templating = false)}
              ></tdc-template-wizard>`
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
                    total: this.total,
                  })}
                </small>
                <button
                  ?disabled=${this.offset + this.devices.length >= this.total}
                  @click=${() => this.goTo(this.offset + PAGE_SIZE)}
                >
                  ${this.tr('pageNext')}
                </button>
              </p>`
      }
    `;
  }
}
