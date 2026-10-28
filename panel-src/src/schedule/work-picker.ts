import { html, nothing, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { TdcElement } from '../common/base';
import type { TextKey } from '../common/i18n';
import type { TemplateInfo } from '../common/types';
import { actionKeys, entityKeysFor, type TargetKind, type WorkForm } from './helpers';

const TARGET_KINDS: TargetKind[] = ['all', 'template', 'device', 'run'];

/** Picks what runs where: a target, an action and an entity; used by schedules and scenarios. */
@customElement('tdc-work-picker')
export class WorkPicker extends TdcElement {
  @property({ attribute: false }) work!: WorkForm;
  @property({ attribute: false }) actions: Record<string, string[]> = {};
  @property({ attribute: false }) templates: TemplateInfo[] = [];

  /** Tell the parent about the changed form. */
  private emit(patch: Partial<WorkForm>): void {
    this.dispatchEvent(new CustomEvent('tdc-work-change', { detail: { ...this.work, ...patch } }));
  }

  /** Render the element. */
  override render(): TemplateResult {
    const entities = entityKeysFor(this.templates, this.work.actionKey);
    return html`
      <div class="row">
        ${this.select(
          this.tr('schTarget'),
          TARGET_KINDS,
          this.work.kind,
          (kind) => this.tr(`schTarget_${kind}` as TextKey),
          (kind) => this.emit({ kind: kind as TargetKind }),
        )}
        ${
          this.work.kind === 'all'
            ? nothing
            : this.textField(this.tr('targetId'), this.work.targetId, (v) =>
                this.emit({ targetId: v }),
              )
        }
        ${this.select(
          this.tr('schAction'),
          actionKeys(this.actions),
          this.work.actionKey,
          (key) => key,
          (key) => this.emit({ actionKey: key, entity: '' }),
        )}
        ${this.select(
          this.tr('schEntity'),
          entities,
          this.work.entity || entities[0] || '',
          (key) => key,
          (key) => this.emit({ entity: key }),
        )}
      </div>
    `;
  }
}
