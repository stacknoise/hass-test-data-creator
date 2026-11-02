import { html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import type { CommonValues } from './common-fields';
import { CUSTOM } from './common-fields';
import type { EntityDef } from '../common/types';
import './entities-form';
import './entity-list';
import { WizardBase } from './wizard-base';

/** The wizard that creates many devices from a template or from custom entities. */
@customElement('tdc-creation-wizard')
export class CreationWizard extends WizardBase {
  @state() private custom: EntityDef[] = [];

  /** Return the entity definitions of the chosen template or of the custom device. */
  protected override entities(): EntityDef[] {
    return this.values.template === CUSTOM ? this.custom : super.entities();
  }

  /** Create the devices with the inputs of the form. */
  private create(): Promise<void> {
    const custom = this.values.template === CUSTOM;
    return this.submit(
      this.request(custom ? { entities: this.custom as unknown as Record<string, unknown>[] } : {}),
    );
  }

  /** Render the element. */
  override render(): TemplateResult {
    const custom = this.values.template === CUSTOM;
    return html`
      <tdc-device-fields
        .hass=${this.hass}
        .templates=${this.templates}
        .info=${this.info}
        allowCustom
        @tdc-fields-change=${(e: CustomEvent<CommonValues>) => this.take(e.detail)}
      ></tdc-device-fields>
      ${
        custom
          ? html`<div style="display: grid; gap: 20px">
              <tdc-entities-form
                .hass=${this.hass}
                .templates=${this.templates}
                .entities=${this.custom}
                .shapes=${this.info?.shapes ?? []}
                .platforms=${this.info?.platforms ?? []}
                @tdc-entities-change=${(e: CustomEvent<EntityDef[]>) => (this.custom = e.detail)}
              ></tdc-entities-form>
            </div>`
          : html`<p>
              <small>${this.tr('entityList')}</small>
              <tdc-entity-list .hass=${this.hass} .entities=${this.entities()}></tdc-entity-list>
            </p>`
      }
      ${this.renderEstimate()}
      ${this.renderSubmit(
        !this.values.template || this.entities().length === 0,
        () => void this.create(),
      )}
    `;
  }
}
