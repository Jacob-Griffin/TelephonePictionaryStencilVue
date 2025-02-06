import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('byfo-canvas')
export default class BYFOCanvas extends LitElement {
  render() {
    return html`<p>Hello World</p>`;
  }

  static styles = [
    css`
      p {
        color: red;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    'byfo-canvas': BYFOCanvas;
  }
}
