import { html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { describeError } from '../common/api';
import { TdcElement } from '../common/base';
import '../common/multi-select';
import { entityName, sortedByLabel } from '../common/labels';
import type { DeviceInfo } from '../common/types';
import { MAX_DAYS, MIN_DAYS, clampDays, sensorEntities } from './helpers';

const DEVICE_LIMIT = 500;

/** Writes hourly statistics for the past days of the test sensors. */
@customElement('tdc-history-panel')
export class HistoryPanel extends TdcElement {
  @state() private days = 7;
  @state() private chosen: string[] = [];
  @state() private entity = '';
  @state() private devices: DeviceInfo[] = [];
  @state() private busy = false;
  @state() private message = '';
  @state() private error = '';

  /** Load the devices that the form offers. */
  override connectedCallback(): void {
    super.connectedCallback();
    void this.loadDevices();
  }

  /** Read the devices. */
  private async loadDevices(): Promise<void> {
    try {
      this.devices = (await this.api.devices(0, DEVICE_LIMIT)).devices;
    } catch (err) {
      this.error = describeError(err);
    }
  }

  /** Choose the devices; a sensor that none of them has is dropped from the choice. */
  private pick(ids: string[]): void {
    this.chosen = ids;
    if (!sensorEntities(this.devices, ids).some((sensor) => sensor.key === this.entity)) {
      this.entity = '';
    }
  }

  /** Import the history that the form describes. */
  private async importHistory(): Promise<void> {
    this.busy = true;
    this.message = '';
    this.error = '';
    try {
      const result = await this.api.importHistory(
        clampDays(this.days),
        this.chosen.length > 1 ? this.chosen : this.chosen[0],
        this.entity || undefined,
      );
      this.message = this.tr('histDone', { ...result });
    } catch (err) {
      this.error = describeError(err);
    }
    this.busy = false;
  }

  /** Render a select whose first entry means "all"; the others are sorted by their text. */
  private renderChoice(
    label: string,
    options: { value: string; label: string }[],
    current: string,
    change: (value: string) => void,
  ): TemplateResult {
    const sorted = sortedByLabel(this.hass?.language, options, (option) => option.label);
    return html`<label
      >${label}
      <select @change=${(e: Event) => change((e.target as HTMLSelectElement).value)}>
        <option value="" ?selected=${current === ''}>${this.tr('histAll')}</option>
        ${sorted.map(
          (option) =>
            html`<option value=${option.value} ?selected=${option.value === current}>
              ${option.label}
            </option>`,
        )}
      </select>
    </label>`;
  }

  /** Render the element. */
  override render(): TemplateResult {
    const lang = this.hass?.language;
    const devices = this.devices.map((device) => ({ value: device.id, label: device.name }));
    const sensors = sensorEntities(this.devices, this.chosen).map((sensor) => ({
      value: sensor.key,
      label: entityName(lang, sensor.key, sensor.name),
    }));
    return html`
      <p>${this.tr('histIntro')}</p>
      <div class="fields bottom">
        <label
          >${this.tr('histDays')}
          <input
            type="number"
            min=${MIN_DAYS}
            max=${MAX_DAYS}
            .value=${String(this.days)}
            @input=${(e: Event) => (this.days = Number((e.target as HTMLInputElement).value))}
          />
        </label>
        <label
          >${this.tr('histDevice')}
          <tdc-multi-select
            .hass=${this.hass}
            .items=${devices}
            .selected=${this.chosen}
            empty=${this.tr('histAll')}
            @tdc-select-change=${(e: CustomEvent<string[]>) => this.pick(e.detail)}
          ></tdc-multi-select>
        </label>
        ${this.renderChoice(this.tr('histEntity'), sensors, this.entity, (key) => (this.entity = key))}
        <div>
          <button class="primary" ?disabled=${this.busy} @click=${() => void this.importHistory()}>
            ${this.tr('histImport')}
          </button>
        </div>
      </div>
      <p>${this.message}<span class="error">${this.error}</span></p>
    `;
  }
}
