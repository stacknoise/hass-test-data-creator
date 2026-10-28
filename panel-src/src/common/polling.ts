import { state } from 'lit/decorators.js';
import { describeError } from './api';
import { TdcElement } from './base';
import type { Info, TemplateInfo } from './types';

const REFRESH_MS = 10_000;

/** Base of the tabs that list objects of the backend: loads the options, polls and runs calls. */
export abstract class TdcPollingElement extends TdcElement {
  @state() protected info?: Info;
  @state() protected templates: TemplateInfo[] = [];
  @state() protected message = '';
  @state() protected error = '';
  @state() protected busy = false;

  private timer?: number;

  /** Reload the objects that the tab lists. */
  protected abstract refresh(): Promise<void>;

  /** Prepare the form once the actions and the templates are known. */
  protected abstract optionsLoaded(info: Info): void;

  /** Load the data when the element is added to the page. */
  override connectedCallback(): void {
    super.connectedCallback();
    void this.loadOptions();
    void this.refresh();
    this.timer = window.setInterval(() => void this.refresh(), REFRESH_MS);
  }

  /** Stop the refresh timer when the element is removed. */
  override disconnectedCallback(): void {
    window.clearInterval(this.timer);
    super.disconnectedCallback();
  }

  /** Load the actions and the templates that the forms offer. */
  private async loadOptions(): Promise<void> {
    try {
      [this.info, this.templates] = await Promise.all([this.api.info(), this.api.templates()]);
      this.optionsLoaded(this.info);
    } catch (err) {
      this.error = describeError(err);
    }
  }

  /** Run a call, then reload; a text it returns is shown, an error is shown as text. */
  protected async run(call: () => Promise<unknown>): Promise<void> {
    this.busy = true;
    this.message = '';
    this.error = '';
    try {
      const result = await call();
      this.message = typeof result === 'string' ? result : '';
      await this.refresh();
    } catch (err) {
      this.error = describeError(err);
    }
    this.busy = false;
  }
}
