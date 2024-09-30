import { css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { LitElement } from 'lit';

/**
 * Description of your element here. Use @ property doc tags to describe props
 */
@customElement('byfo-canvas')
export class ByfoCanvas extends LitElement {
  render() {
    return html``;
  }
  static styles = css`
    :host {
      display: block;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'byfo-canvas': ByfoCanvas;
  }
}
