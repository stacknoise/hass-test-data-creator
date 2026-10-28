import { html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { describeError } from '../common/api';
import { TdcElement } from '../common/base';
import type { TextKey } from '../common/i18n';
import { actionKeyLabel, labelOf, sortedByLabel } from '../common/labels';
import '../common/target-select';
import type { DeviceInfo, TemplateInfo } from '../common/types';
import {
  allEntities,
  availableActionKeys,
  entitiesOfTarget,
  entityKeysFor,
  type TargetKind,
  type WorkForm,
} from './helpers';

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

  /** Return the actions and entities that fit the chosen target. */
  private scope(): { actionKeys: string[]; entities: string[] } {
    const scoped = entitiesOfTarget(
      this.work.kind,
      this.work.targetIds,
      this.devices,
      this.templates,
    );
    const lang = this.hass?.language;
    const actionKeys = sortedByLabel(lang, availableActionKeys(this.actions, scoped), (key) =>
      actionKeyLabel(lang, key),
    );
    const entities = sortedByLabel(
      lang,
      entityKeysFor(scoped ?? allEntities(this.templates), this.work.actionKey),
      (key) => labelOf(lang, 'entity', key),
    );
    return { actionKeys, entities };
  }

  /** Move the action and the entity to ones that fit, when the target changed under them. */
  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    const { actionKeys, entities } = this.scope();
    if (actionKeys.length && !actionKeys.includes(this.work.actionKey)) {
      this.emit({ actionKey: actionKeys[0], entity: '' });
    } else if (entities.length && !entities.includes(this.work.entity)) {
      this.emit({ entity: entities[0] });
    }
  }

  /** Render the element. */
  override render(): TemplateResult {
    const { actionKeys, entities } = this.scope();
    const lang = this.hass?.language;
    return html`
      <div class="fields">
        ${this.select(
          this.tr('schTarget'),
          TARGET_KINDS,
          this.work.kind,
          (kind) => this.tr(`schTarget_${kind}` as TextKey),
          (kind) => this.emit({ kind: kind as TargetKind, targetIds: [] }),
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
                  this.emit({ targetIds: e.detail })}
              ></tdc-target-select>`
        }
        ${this.select(
          this.tr('schAction'),
          actionKeys,
          this.work.actionKey,
          (key) => actionKeyLabel(lang, key),
          (key) => this.emit({ actionKey: key, entity: '' }),
        )}
        ${this.select(
          this.tr('schEntity'),
          entities,
          this.work.entity || entities[0] || '',
          (key) => labelOf(lang, 'entity', key),
          (key) => this.emit({ entity: key }),
        )}
      </div>
      ${this.error ? html`<p class="error">${this.error}</p>` : nothing}
    `;
  }
}
