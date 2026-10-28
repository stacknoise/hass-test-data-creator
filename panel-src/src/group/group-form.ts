import { html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { TdcElement } from '../common/base';
import '../common/multi-select';
import type { SelectItem } from '../common/multi-select';
import type { GroupInfo } from '../common/types';

/** What the form hands to the parent: the name and the ids of the members. */
export interface GroupRequest {
  name: string;
  members: string[];
}

/** The form of a group: empty for a new one, filled from `group` to change it. */
@customElement('tdc-group-form')
export class GroupForm extends TdcElement {
  @property({ attribute: false }) devices: SelectItem[] = [];
  @property({ attribute: false }) group?: GroupInfo;
  @property() submitLabel = '';
  @property({ type: Boolean }) busy = false;

  @state() private name = '';
  @state() private members: string[] = [];

  private loadedId?: string;

  /** Fill the form from the group once. */
  protected override willUpdate(changed: PropertyValues): void {
    if (this.group && this.loadedId !== this.group.id) {
      this.loadedId = this.group.id;
      this.name = this.group.name;
      this.members = [...this.group.members];
    }
    super.willUpdate(changed);
  }

  /** Clear the form, so that the next group starts fresh. */
  reset(): void {
    this.name = '';
    this.members = [];
  }

  /** Tell the parent to save what the form describes. */
  private submit(): void {
    this.dispatchEvent(
      new CustomEvent<GroupRequest>('tdc-submit', {
        detail: { name: this.name.trim(), members: this.members },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Render the element. */
  override render(): TemplateResult {
    return html`
      <div class="fields">
        ${this.textField(this.tr('colName'), this.name, (v) => (this.name = v))}
        <label
          >${this.tr('grpMembers')}
          <tdc-multi-select
            .hass=${this.hass}
            .items=${this.devices}
            .selected=${this.members}
            empty=${this.tr('pickOne')}
            @tdc-select-change=${(e: CustomEvent<string[]>) => (this.members = e.detail)}
          ></tdc-multi-select>
          ${this.devices.length === 0 ? html`<small>${this.tr('grpNoDevices')}</small>` : nothing}
        </label>
      </div>
      ${this.submitRow({
        enabled: !!this.name.trim() && this.members.length > 0,
        busy: this.busy,
        label: this.submitLabel || this.tr('schSave'),
        editing: !!this.group,
        submit: () => this.submit(),
      })}
    `;
  }
}
