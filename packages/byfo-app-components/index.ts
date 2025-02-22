import { LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { html } from './src/utils/byfoHtml';
import themes from '@byfo/themes';
const { light, dark } = themes;

@customElement('byfo-testpage')
export default class BYFOTestpage extends LitElement {
  test = 5;
  connectedCallback(): void {
    super.connectedCallback();
    light.install();
    dark.install();
    dark.apply();
  }
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
