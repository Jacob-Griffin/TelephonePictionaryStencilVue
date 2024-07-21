import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

/**
 * A logo element. Used to attributify the "shape" of the logo
 *
 */
@customElement('byfo-logo')
export class ByfoLogo extends LitElement {
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

    :host([inset]) {
      position: relative;
      top: -1.5rem;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'byfo-logo': ByfoLogo;
  }
}
