import { LitElement, css, html } from 'lit-element';
import { DependencyList, InjectionRequest } from 'byfo-utils';

interface ByfoElementConstructor extends Function {
  uses: (keyof DependencyList)[];
}

/**
 * Description of your element here. Use @ property doc tags to describe props
 */
export class ByfoElement extends LitElement {
  static uses: (keyof DependencyList)[] = [];
  set injected(v: DependencyList) {
    for (const dep in v) {
      this[dep] = v[dep];
    }
  }
  [dep: keyof DependencyList]: DependencyList[typeof dep];

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
