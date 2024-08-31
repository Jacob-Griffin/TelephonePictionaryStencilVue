import { LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { DependencyList, InjectionRequest } from '../common';
/**
 * Description of your element here. Use @ property doc tags to describe props
 */
@customElement('byfo-provider')
export class ByfoProvider extends LitElement {
  #sources?: DependencyList;
  set sources(v: DependencyList) {
    this.#sources = v;
  }

  handleInjection = ({ detail: { sourceElement, dependencies } }: CustomEvent<InjectionRequest>) => {
    if (!this.#sources) {
      return;
    }
    dependencies.forEach(dependency => {
      (sourceElement[dependency] as DependencyList[typeof dependency]) = this.#sources![dependency];
    });
  };

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('byfo-injection-request', this.handleInjection);
  }
  connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('byfo-injection-request', this.handleInjection);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'byfo-provider': ByfoProvider;
  }
  interface DocumentEventMap {
    'byfo-injection-request': CustomEvent<InjectionRequest>;
  }
}
