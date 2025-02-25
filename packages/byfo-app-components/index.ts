import { css, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { html } from './src/utils/byfoHtml';
import { ByfoIcon } from './src/components/functional/Icon';
import type { Theme } from '@byfo/themes';
import { themes, applicationRules } from '@byfo/themes';
import { BYFOStore } from 'byfo-utils';

@customElement('byfo-testpage')
export default class BYFOTestpage extends LitElement {
  store: BYFOStore = new BYFOStore();
  connectedCallback(): void {
    super.connectedCallback();
    Object.values(themes).forEach((t: Theme) => t.install());
    themes[this.store.theme].apply();
    if (this.shadowRoot) {
      this.shadowRoot.adoptedStyleSheets = [...(this.shadowRoot?.adoptedStyleSheets ?? []), applicationRules];
    }
  }
  formFields = [
    {
      id: 'username',
      label: 'Name',
      initial: 'Jacob',
      validate: (v: string) => v.length > 0,
    },
    {
      id: 'gameid',
      label: 'Game ID',
      initial: '123456',
      validate: (v: string) => /\d{1,7}/.test(v),
    },
  ];
  render() {
    return html`<h1>BYFO Component test page</h1>
      <byfo-canvas backupKey=${'testkey'}></byfo-canvas>
      <byfo-modal id='settings'><span slot="buttontext">${ByfoIcon('gear')}</span><byfo-settings slot="content" .store=${this.store}></byfo-settings></byfo-modal>
      <byfo-modal
        ><span slot="buttontext">Hello!</span>
        <byfo-form slot='content' heading='Join Game' .onSubmit=${() => console.log('yippee!')} .fields=${this.formFields} buttonLabel='Join'></byfo-modal
      >`;
  }

  static styles = [
    css`
      #settings::part(openbutton) {
        position: fixed;
        top: 0;
        right: 0;
        width: 4rem;
        height: 4rem;
        border-radius: 0 0 0 1rem;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    'byfo-testpage': BYFOTestpage;
  }
}
