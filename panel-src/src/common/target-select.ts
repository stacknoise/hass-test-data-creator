import { html, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { describeError } from './api';
import { TdcElement } from './base';
import type { TextKey } from './i18n';
import './multi-select';
import { resolveTargetId, targetOptions, type TargetKind } from './targets';
import type { DeviceInfo, TemplateInfo } from './types';
import { KIND_DEVICE, KIND_TEMPLATE } from './constants';

const KIND_LABELS: Record<TargetKind, TextKey> = {
  device: 'schTarget_device',
  template: 'schTarget_template',
  run: 'schTarget_run',
};

/** A select of the devices, templates or creations to aim at; fires `tdc-target-change` with the ids. */
@customElement('tdc-target-select')
export class TargetSelect extends TdcElement {
  @property() kind: TargetKind = KIND_DEVICE;
  @property({ attribute: false }) values: string[] = [];
  @property({ type: Boolean }) multiple = false;
  @property({ attribute: false }) templates: TemplateInfo[] = [];

  @state() private devices: DeviceInfo[] = [];
  @state() private error = '';

  /** Load the devices when the kind needs them. */
  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('kind') && this.kind !== KIND_TEMPLATE) void this.loadDevices();
    super.willUpdate(changed);
  }

  /** Read the devices; the creations are derived from them. */
  private async loadDevices(): Promise<void> {
    try {
      this.devices = (await this.api.devicesUpTo(Infinity)).devices;
      this.error = '';
    } catch (err) {
      this.error = describeError(err);
    }
  }

  /** Tell the parent about the chosen ids. */
  private emit(values: string[]): void {
    this.dispatchEvent(new CustomEvent('tdc-target-change', { detail: values }));
  }

  /** Take the only option, as there is nothing else to choose. */
  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    if (this.multiple && this.kind === KIND_DEVICE) return;
    const options = this.options();
    if (options.length === 1 && this.values[0] !== options[0].value) this.emit([options[0].value]);
  }

  /** Return the options of the kind. */
  private options(): { value: string; label: string }[] {
    return targetOptions(this.kind, this.devices, this.templates, this.hass?.language, (count) =>
      this.tr('planDevices', { count }),
    );
  }

  /** Render the select of one id; with a single option it is locked on it. */
  private renderSingle(
    options: { value: string; label: string }[],
    current: string,
  ): TemplateResult {
    const known = current === '' || options.some((option) => option.value === current);
    return html`<select
      ?disabled=${options.length === 1}
      @change=${(e: Event) => {
        const value = (e.target as HTMLSelectElement).value;
        this.emit(value ? [value] : []);
      }}
    >
      ${
        options.length === 1
          ? ''
          : html`<option value="" ?selected=${current === ''}>${this.tr('pickOne')}</option>`
      }
      ${known ? '' : html`<option value=${current} selected>${current}</option>`}
      ${options.map(
        (option) =>
          html`<option value=${option.value} ?selected=${option.value === current}>
            ${option.label}
          </option>`,
      )}
    </select>`;
  }

  /** Render the element. */
  override render(): TemplateResult {
    const options = this.options();
    const ids = this.values.map((value) => resolveTargetId(this.kind, value, this.devices));
    return html`<label>
      ${this.tr(KIND_LABELS[this.kind])}
      ${
        this.multiple && this.kind === KIND_DEVICE
          ? html`<tdc-multi-select
              .hass=${this.hass}
              .items=${options}
              .selected=${ids}
              empty=${this.tr('pickOne')}
              @tdc-select-change=${(e: CustomEvent<string[]>) => this.emit(e.detail)}
            ></tdc-multi-select>`
          : this.renderSingle(options, ids[0] ?? '')
      }
      ${this.error ? html`<small class="error">${this.error}</small>` : ''}
    </label>`;
  }
}
