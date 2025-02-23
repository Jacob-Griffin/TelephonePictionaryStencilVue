import { LitElement, nothing } from 'lit';
import { customElement } from 'lit/decorators.js';
import { html } from './src/utils/byfoHtml';
import { map } from 'lit/directives/map.js';
import { themes, applicationRules, ThemeMap } from '@byfo/themes';

@customElement('byfo-testpage')
export default class BYFOTestpage extends LitElement {
  currentTheme: keyof ThemeMap = 'dark';
  connectedCallback(): void {
    super.connectedCallback();
    Object.values(themes).forEach((t: ThemeMap[keyof ThemeMap]) => t.install());
    themes[this.currentTheme].apply();
    if (this.shadowRoot) {
      this.shadowRoot.adoptedStyleSheets = [...(this.shadowRoot?.adoptedStyleSheets ?? []), applicationRules];
    }
  }
  handleTheme = (e: InputEvent) => {
    const themetag = (e.target as HTMLSelectElement).value;
    this.currentTheme = themetag;
    themes[themetag as keyof ThemeMap].apply();
  };
  render() {
    return html`<h1>BYFO Component test page</h1>
      <byfo-canvas backupKey=${'testkey'}></byfo-canvas>
      <div style="position:fixed; top: 1rem; right: 1rem;">
        <select @input=${this.handleTheme}>
          ${map(
            Object.values(themes),
            (theme: ThemeMap[keyof ThemeMap]) => html`<option value=${theme.name} selected=${theme.name === this.currentTheme || nothing}>${theme.displayName}</option>`,
          )}
        </select>
      </div> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'byfo-testpage': BYFOTestpage;
  }
}
