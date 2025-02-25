import { LitElement, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { html } from '../utils/byfoHtml';

import buttonStyles from '../styles/button.style.ts';
import { applicationRules, ThemeId, themes } from '@byfo/themes';
import { TPStore } from 'byfo-utils';

@customElement('byfo-settings')
export default class BYFOSettings extends LitElement {
  @property() store?: TPStore;

  #themeKeys?: ThemeId[];

  themeChanged(e: InputEvent) {
    if (!this.store) {
      return;
    }
    const themeid = (e.target as HTMLSelectElement).value as ThemeId;
    this.store.theme = themeid as string;
    themes[themeid].apply();
  }

  resetCustomTheme() {}

  renderThemeOption(themeid: ThemeId) {
    return html`<option value=${themeid} ?selected=${this.store!.theme === themeid}>${themes[themeid].displayName}</option>`;
  }

  renderSettings() {
    this.#themeKeys ??= Object.keys(themes) as ThemeId[];
    return html`<h2>Settings</h2>
      <section>
        <h3>Theme</h3>
        <select @input=${this.themeChanged}>
          ${map(this.#themeKeys, theme => this.renderThemeOption(theme))}
        </select>
        <h3>Background Customization</h3>
        <button @click=${this.resetCustomTheme}>Reset Background</button>
      </section>`;
  }

  render() {
    const noStore = html`<p>Settings Store not Loaded</p>`;
    return html`${this.store ? this.renderSettings() : noStore}`;
  }

  static styles = [
    css`
      :host {
        min-width: 24rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2rem;
        button {
          font-size: 1.3rem;
          padding: 0.5rem 1.5rem;
          box-sizing: border-box;
          height: fit-content;
          width: fit-content;
        }
      }
      h2 {
        margin: 0;
        font-size: 2rem;
      }
      section {
        display: grid;
        grid-template-columns: 2fr 30ch;
        grid-auto-rows: 2.5rem;
        column-gap: 1rem;
        row-gap: 1rem;
        select,
        input {
          height: 2.5em;
          place-self: center stretch;
        }

        button {
          place-self: center;
        }

        h3 {
          font-size: 1.3rem;
          place-self: center start;
          margin: 0;
        }
      }
    `,
    buttonStyles,
    applicationRules,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    'byfo-settings': BYFOSettings;
  }
  export interface Field {
    id: string;
    label: string;
    initial: string;
    validate?: (val: string) => boolean;
  }
}
