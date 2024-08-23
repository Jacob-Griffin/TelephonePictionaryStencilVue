import { LitElement, css, html } from 'lit';
import { DependencyList, InjectionRequest } from 'byfo-utils';

interface ByfoElementConstructor extends Function {
  uses: (keyof DependencyList)[];
}

/**
 * Description of your element here. Use @ property doc tags to describe props
 */
export class ByfoElement extends LitElement {
  static uses: (keyof DependencyList)[] = [];
  injected: DependencyList = {};
  get firebase() {
    this.lintDependency('firebase');
    return this.injected.firebase;
  }
  get store() {
    this.lintDependency('store');
    return this.injected.store;
  }

  get static() {
    return this.constructor as ByfoElementConstructor;
  }

  lintDependency(key: keyof DependencyList) {
    if (!this.static.uses.includes(key)) {
      console.error(`Component error - Attempted to use property ${key} in ${this.static.name} without injecting. Add '${key}' to the static "uses" array`);
      console.log(this.static);
      return;
    }
    if (!this.injected[key]) {
      console.warn(`Component is requesting injection ${key}, but no object was provided. Ensure you have a BYFODependencyProvider created, and that its sources are defined`);
    }
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
