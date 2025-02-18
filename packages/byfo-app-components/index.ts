import { LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { html } from './src/utils/byfoHtml';

@customElement('byfo-testpage')
export default class BYFOTestpage extends LitElement {
  test = 5;
  render() {
    return html`<h1>BYFO Component test page #${this.test}!</h1>
      <byfo-canvas backupKey=${'testkey'}></byfo-canvas>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'byfo-testpage': BYFOTestpage;
  }
}
