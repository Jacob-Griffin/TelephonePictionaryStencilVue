import { LitElement } from 'lit';

/**
 * Description of your element here. Use @ property doc tags to describe props
 */
export class ByfoContext {
  #sources: DependencyList;

  constructor(sources?: DependencyList) {
    if (sources) {
      this.#sources = sources;
    } else {
      this.#sources = {};
    }
    document.addEventListener('byfo-injection-request', this.handleInjection);
  }

  provide(key: keyof DependencyList, source: DependencyList[typeof key]) {
    this.#sources[key] = source;
  }

  handleInjection = ({ detail: { sourceElement, dependency } }: CustomEvent<InjectionRequest>) => {
    if (!this.#sources) {
      return;
    }
    (sourceElement[dependency] as DependencyList[typeof dependency]) = this.#sources[dependency];
  };
}

export function inject(target: LitElement & DependencyList, propertyKey: keyof DependencyList) {
  const request = new CustomEvent<InjectionRequest>('byfo-injection-request', { detail: { sourceElement: target, dependency: propertyKey } });
  document.dispatchEvent(request);
}

declare global {
  interface DocumentEventMap {
    'byfo-injection-request': CustomEvent<InjectionRequest>;
  }
}
