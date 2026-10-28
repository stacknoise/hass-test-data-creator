import { html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { describeError } from '../common/api';
import { TdcElement } from '../common/base';
import type { TextKey } from '../common/i18n';
import { actionLabel, sortedByLabel } from '../common/labels';
import '../common/target-select';
import type { DeviceInfo, TemplateInfo } from '../common/types';
import { availableActions, platformSetsOfTarget, type TargetKind, type WorkForm } from './helpers';

const TARGET_KINDS: TargetKind[] = ['all', 'template', 'device', 'run'];
const DEVICE_LIMIT = 500;

/** Picks what runs where: a target, an action and an entity; only what fits the target is offered. */
@customElement('tdc-work-picker')
export class WorkPicker extends TdcElement {
  @property({ attribute: false }) work!: WorkForm;
  @property({ attribute: false }) actions: Record<string, string[]> = {};
  @property({ attribute: false }) templates: TemplateInfo[] = [];

  @state() private devices: DeviceInfo[] = [];
  @state() private error = '';

  /** Load the devices that the target can be chosen from and that decide which actions fit. */
  override connectedCallback(): void {
    super.connectedCallback();
    void this.loadDevices();
  }

  /** Read the devices. */
  private async loadDevices(): Promise<void> {
    try {
      this.devices = (await this.api.devices(0, DEVICE_LIMIT)).devices;
      this.error = '';
    } catch (err) {
      this.error = describeError(err);
    }
  }

  /** Tell the parent about the changed form. */
  private emit(patch: Partial<WorkForm>): void {
    this.dispatchEvent(new CustomEvent('tdc-work-change', { detail: { ...this.work, ...patch } }));
  }

  /** Return the actions that every device of the chosen target can do, sorted by their text. */
  private actionChoices(): string[] {
    const lang = this.hass?.language;
    const sets = platformSetsOfTarget(
      this.work.kind,
      this.work.targetIds,
      this.devices,
      this.templates,
    );
    return sortedByLabel(lang, availableActions(this.actions, sets), (action) =>
      actionLabel(lang, action),
    );
  }

  /** Move the action to one that fits, when the target changed under it. */
  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    const actions = this.actionChoices();
    if (actions.length && !actions.includes(this.work.action)) {
      this.emit({ action: actions[0], entity: '' });
    } else if (actions.length === 0 && this.work.action) {
      this.emit({ action: '', entity: '' });
    }
  }

  /** Render the select of the action; with nothing to offer it is disabled and asks to choose. */
  private renderAction(lang: string | undefined): TemplateResult {
    const actions = this.actionChoices();
    if (actions.length === 0) {
      return html`<label
        >${this.tr('schAction')}
        <select disabled>
          <option>${this.tr('pickOne')}</option>
        </select>
      </label>`;
    }
    return this.select(
      this.tr('schAction'),
      actions,
      this.work.action,
      (action) => actionLabel(lang, action),
      (action) => this.emit({ action, entity: '' }),
    );
  }

  /** Render the element. */
  override render(): TemplateResult {
    const lang = this.hass?.language;
    return html`
      <div class="fields">
        ${this.select(
          this.tr('schTarget'),
          TARGET_KINDS,
          this.work.kind,
          (kind) => this.tr(`schTarget_${kind}` as TextKey),
          (kind) => this.emit({ kind: kind as TargetKind, targetIds: [], entity: '' }),
        )}
        ${
          this.work.kind === 'all'
            ? nothing
            : html`<tdc-target-select
                .hass=${this.hass}
                kind=${this.work.kind}
                ?multiple=${this.work.kind === 'device'}
                .values=${this.work.targetIds}
                .templates=${this.templates}
                @tdc-target-change=${(e: CustomEvent<string[]>) =>
                  this.emit({ targetIds: e.detail, entity: '' })}
              ></tdc-target-select>`
        }
        ${this.renderAction(lang)}
      </div>
      ${this.error ? html`<p class="error">${this.error}</p>` : nothing}
    `;
  }
}
