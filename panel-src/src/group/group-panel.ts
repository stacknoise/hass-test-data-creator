import { css, html, nothing, type TemplateResult } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import '../common/dialog';
import { describeError } from '../common/api';
import { TdcElement, containerHost } from '../common/base';
import type { SelectItem } from '../common/multi-select';
import { TdcPollingElement } from '../common/polling';
import type { DeviceInfo, GroupInfo } from '../common/types';
import './group-form';
import type { GroupForm, GroupRequest } from './group-form';

const DEVICE_LIMIT = 500;
const Z2M_OUTPUT = 'z2m';

/** Creates, lists, changes and removes groups of Zigbee2MQTT devices. */
@customElement('tdc-group-panel')
export class GroupPanel extends TdcPollingElement {
  static override styles = [
    TdcElement.styles,
    containerHost,
    css`
      tr.group {
        cursor: pointer;
      }
      tr.group:hover {
        background: var(--secondary-background-color);
      }
    `,
  ];

  @state() private groups: GroupInfo[] = [];
  @state() private devices: DeviceInfo[] = [];
  @state() private expanded = new Set<string>();
  @state() private creating = false;

  @query('tdc-group-form#new') private newForm?: GroupForm;

  /** Nothing to prepare: the forms offer the devices that the list reads. */
  protected optionsLoaded(): void {
    this.error = '';
  }

  /** Reload the groups and the devices. */
  protected async refresh(): Promise<void> {
    try {
      const [groups, page] = await Promise.all([
        this.api.groups(),
        this.api.devices(0, DEVICE_LIMIT),
      ]);
      this.groups = groups;
      this.devices = page.devices;
    } catch (err) {
      this.error = describeError(err);
    }
  }

  /** Return the Zigbee2MQTT devices, the only ones that can be members. */
  private members(): SelectItem[] {
    return this.devices
      .filter((device) => device.output === Z2M_OUTPUT)
      .map((device) => ({ value: device.id, label: device.name }));
  }

  /** Return the names of the members of a group, as one text. */
  private memberNames(item: GroupInfo): string {
    const names = new Map(this.devices.map((device) => [device.id, device.name]));
    return item.members.map((id) => names.get(id) ?? id).join(', ');
  }

  /** Create the group that the new form describes and close the popup. */
  private async add(request: GroupRequest): Promise<void> {
    await this.run(async () => {
      await this.api.addGroup(request.name, request.members);
      this.newForm?.reset();
      this.creating = false;
    });
  }

  /** Save the changes of a group and close its form. */
  private async save(item: GroupInfo, request: GroupRequest): Promise<void> {
    await this.run(async () => {
      await this.api.updateGroup(item.id, request.name, request.members);
      this.toggle(item.id);
    });
  }

  /** Open or close the form of a group. */
  private toggle(id: string): void {
    const next = new Set(this.expanded);
    if (!next.delete(id)) next.add(id);
    this.expanded = next;
  }

  /** Render the button that opens the popup with the form for a new group. */
  private renderNew(): TemplateResult {
    return html`
      <p>
        <button class="primary" @click=${() => (this.creating = true)}>
          + ${this.tr('grpNew')}
        </button>
      </p>
      <tdc-dialog
        .hass=${this.hass}
        heading=${this.tr('grpNew')}
        ?open=${this.creating}
        @tdc-close=${() => (this.creating = false)}
      >
        <tdc-group-form
          id="new"
          .hass=${this.hass}
          .devices=${this.members()}
          submitLabel=${this.tr('grpAdd')}
          ?busy=${this.busy}
          @tdc-submit=${(e: CustomEvent<GroupRequest>) => void this.add(e.detail)}
        ></tdc-group-form>
      </tdc-dialog>
    `;
  }

  /** Render the table row of one group and, if open, its form. */
  private renderRow(item: GroupInfo): TemplateResult {
    const open = this.expanded.has(item.id);
    return html`<tr class="group card" @click=${() => this.toggle(item.id)}>
        <td class="name">
          ${open ? '▾' : '▸'} ${item.name}<br /><small
            >${this.tr('grpNumber', { number: item.number })}</small
          >
        </td>
        <td data-label=${this.tr('grpMembers')}>${this.memberNames(item)}</td>
        <td data-label=${this.tr('colActions')}>
          <button
            ?disabled=${this.busy}
            @click=${(e: Event) => {
              e.stopPropagation();
              void this.run(() => this.api.removeGroup(item.id));
            }}
          >
            ${this.tr('remove')}
          </button>
        </td>
      </tr>
      ${
        open
          ? html`<tr>
              <td colspan="3">
                <tdc-group-form
                  .hass=${this.hass}
                  .devices=${this.members()}
                  .group=${item}
                  submitLabel=${this.tr('schSave')}
                  ?busy=${this.busy}
                  @tdc-submit=${(e: CustomEvent<GroupRequest>) => void this.save(item, e.detail)}
                  @tdc-cancel=${() => this.toggle(item.id)}
                ></tdc-group-form>
              </td>
            </tr>`
          : nothing
      }`;
  }

  /** Render the element. */
  override render(): TemplateResult {
    return html`
      ${this.renderNew()}
      ${
        this.groups.length === 0
          ? html`<p>${this.tr('grpNone')}</p>`
          : html`<table class="cards">
              <tr>
                <th>${this.tr('colName')}</th>
                <th>${this.tr('grpMembers')}</th>
                <th>${this.tr('colActions')}</th>
              </tr>
              ${repeat(
                this.groups,
                (item) => item.id,
                (item) => this.renderRow(item),
              )}
            </table>`
      }
      <p class="error">${this.error}</p>
    `;
  }
}
