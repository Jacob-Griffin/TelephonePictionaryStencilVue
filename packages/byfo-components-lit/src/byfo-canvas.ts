import { css, html } from 'lit-element';
import { customElement } from 'lit-element/decorators.js';
import { ByfoElement } from './byfo-element';

/**
 * Description of your element here. Use @ property doc tags to describe props
 */
@customElement('byfo-canvas')
export class ByfoCanvas extends ByfoElement {
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
