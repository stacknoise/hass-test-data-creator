import { css, html, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { TdcElement } from '../common/base';
import type { SourceState } from '../common/types';
import { sourceBadge } from './helpers';

/** The small badge that shows whether a source is ok, offline or removed. */
@customElement('tdc-source-badge')
export class SourceBadge extends TdcElement {
  @property() state: SourceState = 'ok';

  static override styles = [
    TdcElement.styles,
    css`
      small {
        padding: 1px 6px;
        border-radius: 8px;
        color: var(--text-primary-color);
      }
      .ok {
        background: var(--success-color);
      }
      .warn {
        background: var(--warning-color);
      }
      .error {
        background: var(--error-color);
      }
    `,
  ];

  /** Render the element. */
  override render(): TemplateResult {
    const badge = sourceBadge(this.state);
    return html`<small class=${badge.tone}>${this.tr(badge.text)}</small>`;
  }
}
