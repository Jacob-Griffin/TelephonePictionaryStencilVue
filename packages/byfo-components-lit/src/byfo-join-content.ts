import { css, html } from 'lit-element';
import { customElement } from 'lit-element/decorators.js';
import { ByfoElement } from './byfo-element';

/**
 * Description of your element here. Use @ property doc tags to describe props
 */
@customElement('byfo-join-content')
export class ByfoJoinContent extends ByfoElement {
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
    'byfo-join-content': ByfoJoinContent;
  }
}
