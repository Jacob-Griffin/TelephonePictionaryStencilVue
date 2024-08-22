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
    return this.injected.firebase;
  }
  get store() {
    return this.injected.store;
  }

  constructor() {
    super();
    const dependencies = (this.constructor as ByfoElementConstructor).uses;
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
