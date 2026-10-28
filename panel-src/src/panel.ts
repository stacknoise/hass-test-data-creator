import { css, html, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { TdcElement } from './common/base';
import type { RemovalTarget } from './common/types';
import './devices/device-list';
import './group/group-panel';
import './history/history-panel';
import './removal/removal-panel';
import './scenario/scenario-panel';
import './schedule/schedule-panel';
import './wizard/creation-wizard';

/** The tabs of the panel. */
type Tab = 'devices' | 'create' | 'schedules' | 'scenarios' | 'groups' | 'history' | 'remove';

/** The sidebar panel: header with the test environment badge and five tabs. */
@customElement('hass-test-data-creator-panel')
export class TdcPanel extends TdcElement {
  @property({ type: Boolean }) narrow = false;

  @state() private tab: Tab = 'devices';
  @state() private removeTarget: RemovalTarget = 'all';
  @state() private removeId = '';

  static override styles = [
    TdcElement.styles,
    css`
      :host {
        padding: 16px;
        max-width: 1100px;
        margin: 0 auto;
      }
      header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
      }
      header h2 {
        margin: 0;
      }
      .badge {
        font-size: 0.75em;
        padding: 2px 10px;
        border-radius: 999px;
        border: 1px solid var(--warning-color);
        color: var(--warning-color);
      }
      nav {
        display: flex;
        gap: 4px;
        border-bottom: 1px solid var(--divider-color);
        margin-bottom: 16px;
      }
      nav button {
        border: 0;
        border-bottom: 2px solid transparent;
        border-radius: 0;
        background: none;
      }
      nav button.active {
        border-bottom-color: var(--primary-color);
        color: var(--primary-color);
      }
    `,
  ];

  /** Switch to the removal tab with a preset target. */
  private startRemoval(event: CustomEvent<{ target: RemovalTarget; id: string }>): void {
    this.removeTarget = event.detail.target;
    this.removeId = event.detail.id;
    this.tab = 'remove';
  }

  /** Render one tab button. */
  private renderTab(tab: Tab, label: string): TemplateResult {
    return html`<button class=${this.tab === tab ? 'active' : ''} @click=${() => (this.tab = tab)}>
      ${label}
    </button>`;
  }

  /** Render the element. */
  override render(): TemplateResult {
    return html`
      <header>
        <h2>${this.tr('title')}</h2>
        <span class="badge">${this.tr('badge')}</span>
      </header>
      <nav>
        ${this.renderTab('devices', this.tr('tabDevices'))}
        ${this.renderTab('create', this.tr('tabCreate'))}
        ${this.renderTab('schedules', this.tr('tabSchedules'))}
        ${this.renderTab('scenarios', this.tr('tabScenarios'))}
        ${this.renderTab('groups', this.tr('tabGroups'))}
        ${this.renderTab('history', this.tr('tabHistory'))}
        ${this.renderTab('remove', this.tr('tabRemove'))}
      </nav>
      ${
        this.tab === 'devices'
          ? html`<tdc-device-list
              .hass=${this.hass}
              @tdc-remove=${this.startRemoval}
            ></tdc-device-list>`
          : ''
      }
      ${
        this.tab === 'create'
          ? html`<tdc-creation-wizard .hass=${this.hass}></tdc-creation-wizard>`
          : ''
      }
      ${
        this.tab === 'schedules'
          ? html`<tdc-schedule-panel .hass=${this.hass}></tdc-schedule-panel>`
          : ''
      }
      ${
        this.tab === 'scenarios'
          ? html`<tdc-scenario-panel .hass=${this.hass}></tdc-scenario-panel>`
          : ''
      }
      ${this.tab === 'groups' ? html`<tdc-group-panel .hass=${this.hass}></tdc-group-panel>` : ''}
      ${
        this.tab === 'history'
          ? html`<tdc-history-panel .hass=${this.hass}></tdc-history-panel>`
          : ''
      }
      ${
        this.tab === 'remove'
          ? html`<tdc-removal-panel
              .hass=${this.hass}
              .target=${this.removeTarget}
              .targetId=${this.removeId}
            ></tdc-removal-panel>`
          : ''
      }
    `;
  }
}
