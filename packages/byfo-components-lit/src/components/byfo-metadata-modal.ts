import { css, html, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ByfoModal } from './byfo-modal';
import { BYFOFirebaseAdapter, Metadata } from 'byfo-utils';
import { inject } from '../dependencies';

/**
 * Description of your element here. Use @ property doc tags to describe props
 */
@customElement('byfo-metadata-modal')
export class ByfoMetadataModal extends ByfoModal {
  @property({ reflect: true }) gameid?: string;

  @state() metadata?: Metadata | Promise<Metadata>;

  @inject firebase?: BYFOFirebaseAdapter;

  timeString(ms: number) {
    if (ms < 0) {
      return '';
    }
    let seconds = ms / 1000;
    const minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;
    if (minutes > 0 && seconds > 0) {
      return `${minutes} minutes, ${seconds} seconds`;
    }
    if (minutes > 0) {
      return `${minutes} minutes`;
    }
    if (seconds > 0) {
      return `${seconds} seconds`;
    }
  }

  formatDate(date: string) {
    if (date === 'unknown') {
      return 'Unknown';
    }
    const datePattern = /(?<day>\w{3} \w{3} \d{2} \d{4}) (?<time>[\d:]+) (?<offset>\w{3}[+\-]\d{4}) \((?<timezone>.+)\)/;
    const parsed = datePattern.exec(date)?.groups;
    if (!parsed) {
      return 'Unknown';
    }
    return html`${parsed.day} @${parsed.time} <abbr title=${parsed.offset}>${parsed.timezone}</abbr>`;
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (this.gameid && this.firebase) {
      this.metadata = this.firebase.getGameMetadata(~~this.gameid);
      this.metadata.then(result => (this.metadata = result));
    }
  }

  willUpdate(_changedProperties: PropertyValues): void {
    if (!this.firebase || this.metadata !== undefined) {
      return;
    }
    if (_changedProperties.has('gameid')) {
      this.firebase.getGameMetadata(~~_changedProperties.get('gameid')).then(md => (this.metadata = md));
    }
  }

  renderBody() {
    if (!this.gameid) {
      return html``;
    }
    const metadata = this.metadata && !(this.metadata instanceof Promise) ? this.metadata : { date: 'unknown', roundLength: 180000 };
    return html`<h2>Game ${this.gameid}</h2>
      <p>
        <strong>Game finished: </strong>
        ${this.formatDate(metadata.date)}
      </p>
      <p>
        <strong>Round Length: </strong>
        ${this.timeString(metadata.roundLength)}
      </p>`;
  }

  static styles = css`
    ${ByfoModal.styles}
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'byfo-metadata-modal': ByfoMetadataModal;
  }
}
