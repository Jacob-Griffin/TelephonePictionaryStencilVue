import { BYFOFirebaseAdapter } from './firebase';
import { TPStore } from './Store';

export type DependencyList = {
  firebase?: BYFOFirebaseAdapter;
  store?: TPStore;
};

interface InjectionTarget extends HTMLElement {
  injected: DependencyList;
}

export type InjectionRequest = {
  sourceElement: InjectionTarget;
  dependencies: (keyof DependencyList)[];
};

export class BYFODependencyProvider {
  sources: DependencyList;
  handleInjection = ({ detail: { sourceElement, dependencies } }: CustomEvent<InjectionRequest>) => {
    const injected: DependencyList = {};
    dependencies.forEach(dependency => {
      (injected[dependency] as DependencyList[typeof dependency]) = this.sources[dependency];
    });
    sourceElement.injected = injected;
  };

  constructor(sources: DependencyList) {
    this.sources = sources;
    document.addEventListener('byfo-injection-request', this.handleInjection);
  }

  destroy() {
    document.removeEventListener('byfo-injection-request', this.handleInjection);
  }
}
