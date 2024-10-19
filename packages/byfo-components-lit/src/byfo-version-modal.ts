import { html, nothing } from 'lit-element';
import { customElement, property, state } from 'lit-element/decorators.js';
import { ByfoModal } from './byfo-modal';
import { TPStore, formatMarkdown } from 'byfo-utils';

/**
 * Description of your element here. Use @ property doc tags to describe props
 */
@customElement('byfo-version-modal')
export class ByfoVersionModal extends ByfoModal {
  get changeContent(): string {
    if (this._changeContent) {
      return this._changeContent;
    }
    fetch('https://beta.blowyourfaceoff.com/changelog.md')
      .then(data => data.text())
      .then(changes => (this._changeContent = changes));
    this._changeContent = '...';
    return this._changeContent;
  }

  get hasChanges() {
    const content = this.changeContent;
    return content && content !== '...';
  }

  @property({ reflect: false }) store?: TPStore;

  @state() _changeContent?: string;
  isBeta = window.location.hostname.startsWith('beta.');

  switchBranch() {
    const transferData = this.store.getString();
    let newHost = window.location.host;
    if (newHost.startsWith('localhost')) {
      newHost = 'blowyourfaceoff.com';
    }
    if (this.isBeta) {
      newHost = 'beta.' + newHost;
    } else {
      newHost = newHost.replace(/^beta\./, '');
    }
    const { protocol, pathname, search, hash } = window.location;
    const newLocation = `${protocol}//${newHost}${pathname}${search}${search ? '&' : '?'}${transferData}${hash}`;
    window.location.href = newLocation;
  }

  renderBody() {
    const isBeta = this.isBeta;
    const input = Object.assign([formatMarkdown(this.changeContent) as string], { raw: formatMarkdown(this.changeContent) }) as TemplateStringsArray;
    const content = html(input);
    return html`<h2>We have a beta!</h2>
      ${isBeta ? html`<h5>(you are here)</h5>` : nothing}
      <p>The beta version of the game has features that are mostly stable but just have a few more things to iron out. Here's what's different right now:</p>
      <div class="changes a"><span>${content}</span></div>
      <button @click=${this.switchBranch}>${isBeta ? 'Return to stable' : 'Try beta'}</button>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'byfo-version-modal': ByfoVersionModal;
  }
}
