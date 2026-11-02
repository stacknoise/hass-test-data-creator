import { html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import type { EntityDef } from '../common/types';
import type { CommonValues } from './common-fields';
import { CUSTOM } from './common-fields';
import './source-step';
import type { SourceChoice } from './source-helpers';
import { WizardBase } from './wizard-base';

/** The wizard that creates copies of a real device (source); the entities come from the source. */
@customElement('tdc-follow-wizard')
export class FollowWizard extends WizardBase {
  @state() private choice: SourceChoice | null = null;

  /** Return the entities of the copy, which the source step derived from the source. */
  protected override entities(): EntityDef[] {
    return this.choice?.entities ?? [];
  }

  /** Create the copies; the source and the entities that follow it are part of the request. */
  private create(): Promise<void> {
    if (!this.choice) return Promise.resolve();
    return this.submit(
      this.request({
        template: CUSTOM,
        entities: this.choice.entities as unknown as Record<string, unknown>[],
        source: this.choice.source,
      }),
    );
  }

  /** Render the element. */
  override render(): TemplateResult {
    return html`
      <p><small>${this.tr('sourceIntro')}</small></p>
      <tdc-device-fields
        .hass=${this.hass}
        .info=${this.info}
        noTemplate
        seed-hint="seedHintSource"
        @tdc-fields-change=${(e: CustomEvent<CommonValues>) => this.take(e.detail)}
      ></tdc-device-fields>
      <tdc-source-step
        .hass=${this.hass}
        seed=${this.values.seed}
        @tdc-source-change=${(e: CustomEvent<SourceChoice | null>) => (this.choice = e.detail)}
      ></tdc-source-step>
      ${this.renderEstimate()} ${this.renderSubmit(this.choice === null, () => void this.create())}
    `;
  }
}
