import { LitElement, css, html } from 'lit';
import { BYFOFirebaseAdapter, TPStore } from 'byfo-utils';
import { Dependency, InjectionRequest } from '../common';

interface ByfoElementConstructor extends Function {
  uses: Dependency[];
}

/**
 * Description of your element here. Use @ property doc tags to describe props
 */
export class ByfoElement extends LitElement {
  static uses: Dependency[] = [];

  _firebase?: BYFOFirebaseAdapter;
  _store?: TPStore;

  set firebase(v: BYFOFirebaseAdapter | undefined) {
    this._firebase = v;
  }
  set store(v: TPStore | undefined) {
    this._store = v;
  }
  get firebase() {
    if (!this._firebase) {
    }
    return this._firebase;
  }
  get store() {
    if (!this._store) {
      console.warn('Attempting to use the store without injection. Please add a byfo-provider to the page and supply it with the constructed TPStore adapter');
    }
    return this._store;
  }

  get static() {
    return this.constructor as ByfoElementConstructor;
  }

  //Explicitly type render root as shadow root
  renderRoot = this.renderRoot as DocumentFragment;

  constructor() {
    super();
    const dependencies = this.static.uses;
    if (dependencies.length > 0 && !!dependencies.forEach) {
      const request = new CustomEvent<InjectionRequest>('byfo-injection-request', { detail: { sourceElement: this, dependencies } });
      document.dispatchEvent(request);
    }
  }

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
    'byfo-element': ByfoElement;
  }
}
