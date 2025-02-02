import { css, CSSResult, html, nothing } from 'lit-element';
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
    const betaUrl = this.isBeta ? '' : `https://beta.${window.location.host}`;
    fetch(`${betaUrl}/changelog.md`)
      .then(data => data.text())
      .then(changes => (this._changeContent = changes))
      .then(() => this.dispatchEvent(new CustomEvent('tp-version-changes-loaded')));
    this._changeContent = '...';
    return this._changeContent;
  }

  get hasChanges() {
    const content = this.changeContent;
    return content && content !== '...';
  }

  @property({ reflect: false }) store?: TPStore;

  @state() _changeContent?: string;
  isBeta = window.location.host.startsWith('beta.') || window.location.host.startsWith('localhost');

  switchBranch() {
    const transferData = this.store.getString();
    const oldHost = window.location.host;
    let newHost;
    if (oldHost.startsWith('localhost')) {
      newHost = oldHost;
    } else if (this.isBeta) {
      newHost = oldHost.replace(/^beta\./, '');
    } else {
      newHost = 'beta.' + oldHost;
    }
    const { pathname, search, hash } = window.location;
    const newLocation = `https://${newHost}${pathname}${search}${search ? '&' : '?'}${transferData}${hash}`;
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

  static override styles = [
    super.styles as CSSResult,
    css`
      .changes {
        padding: 1rem;
        border: 1px solid #888;
        border-radius: 0.5rem;
        max-height: 30rem;
        overflow-y: auto;
        & h2,
        h3,
        h4 {
          font-weight: 700;
        }

        & h3 {
          font-size: 1.55rem;
        }

        & h4 {
          font-size: 1.15rem;
        }
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    'byfo-version-modal': ByfoVersionModal;
  }
}
