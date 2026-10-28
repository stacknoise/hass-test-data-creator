import { html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { describeError } from '../common/api';
import { TdcElement, containerHost } from '../common/base';
import { TdcPollingElement } from '../common/polling';
import type { DeviceInfo, GroupInfo } from '../common/types';
import { parseAreas } from '../wizard/helpers';

const DEVICE_LIMIT = 500;

/** Lists, creates and removes groups of Zigbee2MQTT devices. */
@customElement('tdc-group-panel')
export class GroupPanel extends TdcPollingElement {
  static override styles = [TdcElement.styles, containerHost];

  @state() private groups: GroupInfo[] = [];
  @state() private names: Record<string, string> = {};
  @state() private name = '';
  @state() private members = '';

  /** Nothing to prepare: the form has no choices that depend on the backend. */
  protected optionsLoaded(): void {
    this.error = '';
  }

  /** Reload the groups and the names of the devices. */
  protected async refresh(): Promise<void> {
    try {
      const [groups, page] = await Promise.all([
        this.api.groups(),
        this.api.devices(0, DEVICE_LIMIT),
      ]);
      this.groups = groups;
      this.names = Object.fromEntries(page.devices.map((d: DeviceInfo) => [d.id, d.name]));
    } catch (err) {
      this.error = describeError(err);
    }
  }

  /** Create the group that the form describes. */
  private async add(): Promise<void> {
    await this.run(async () => {
      await this.api.addGroup(this.name, parseAreas(this.members));
      this.name = '';
      this.members = '';
    });
  }

  /** Render the table row of one group. */
  private renderRow(item: GroupInfo): TemplateResult {
    const names = item.members.map((id) => this.names[id] ?? id).join(', ');
    return html`<tr class="card">
      <td class="name">
        ${item.name}<br /><small>${this.tr('grpNumber', { number: item.number })}</small>
      </td>
      <td data-label=${this.tr('grpMembers')}>${names}</td>
      <td data-label=${this.tr('colActions')}>
        <button
          ?disabled=${this.busy}
          @click=${() => void this.run(() => this.api.removeGroup(item.id))}
        >
          ${this.tr('remove')}
        </button>
      </td>
    </tr>`;
  }

  /** Render the element. */
  override render(): TemplateResult {
    return html`
      ${
        this.groups.length === 0
          ? html`<p>${this.tr('grpNone')}</p>`
          : html`<table class="cards">
              <tr>
                <th>${this.tr('colName')}</th>
                <th>${this.tr('grpMembers')}</th>
                <th>${this.tr('colActions')}</th>
              </tr>
              ${this.groups.map((item) => this.renderRow(item))}
            </table>`
      }
      <h3>${this.tr('grpNew')}</h3>
      <div class="row">
        ${this.textField(this.tr('colName'), this.name, (v) => (this.name = v))}
        ${this.textField(this.tr('grpMembers'), this.members, (v) => (this.members = v), {
          flex: '2 1 320px',
        })}
        <button
          class="primary"
          ?disabled=${this.busy || !this.name.trim() || !this.members.trim()}
          @click=${() => void this.add()}
        >
          ${this.tr('grpAdd')}
        </button>
      </div>
      <p class="error">${this.error}</p>
    `;
  }
}
