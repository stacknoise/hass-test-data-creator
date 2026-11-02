import { html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import type { SourceRequest } from '../common/types';
import type { CommonValues } from './common-fields';
import './source-step';
import { WizardBase } from './wizard-base';

/** The wizard that creates copies of a real device (source); the entities come from the template. */
@customElement('tdc-follow-wizard')
export class FollowWizard extends WizardBase {
  @state() private source: SourceRequest | null = null;

  /** Create the copies; the source is part of the request. */
  private create(): Promise<void> {
    return this.submit(this.request(this.source ? { source: this.source } : {}));
  }

  /** Render the element. */
  override render(): TemplateResult {
    return html`
      <p><small>${this.tr('sourceIntro')}</small></p>
      <tdc-device-fields
        .hass=${this.hass}
        .templates=${this.templates}
        .info=${this.info}
        seed-hint="seedHintSource"
        @tdc-fields-change=${(e: CustomEvent<CommonValues>) => this.take(e.detail)}
      ></tdc-device-fields>
      <tdc-source-step
        .hass=${this.hass}
        .entities=${this.entities()}
        template=${this.values.template}
        seed=${this.values.seed}
        @tdc-source-change=${(e: CustomEvent<SourceRequest | null>) => (this.source = e.detail)}
      ></tdc-source-step>
      ${this.renderEstimate()}
      ${this.renderSubmit(!this.values.template || this.source === null, () => void this.create())}
    `;
  }
}
