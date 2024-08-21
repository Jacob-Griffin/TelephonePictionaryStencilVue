import { css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { ByfoElement } from './byfo-element';

/**
 * A logo element. Used to attributify the "shape" of the logo
 */
@customElement('byfo-logo')
export class ByfoLogo extends ByfoElement {
  render() {
    return html``;
  }
  static styles = css`
    :host {
      display: block;
      background-image: var(--icon);
      background-size: contain;
      background-position: center;
      background-repeat: no-repeat;
      width: 100%;
      max-width: 720px;
      aspect-ratio: 1.4;
    }

    :host([small]) {
      width: auto;
      height: 3rem;
      background-image: var(--small-icon);
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'byfo-logo': ByfoLogo;
  }
}
