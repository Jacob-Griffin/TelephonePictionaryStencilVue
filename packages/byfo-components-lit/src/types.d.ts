/**
 * Alternate Event typing that explicitly defines target as an element
 */
declare interface TargetedEvent extends Event {
  target: HTMLElement;
}

/**
 * Alternate InputEvent typing that explicitly says that target exists and has a value
 */
declare interface TargetedInputEvent extends InputEvent {
  target: HTMLInputElement;
}

declare type DependencyList = {
  firebase?: BYFOFirebaseAdapter;
  store?: TPStore;
};

declare type Dependency = keyof DependencyList;

declare type InjectionRequest = {
  sourceElement: HTMLElement & DependencyList;
  dependency: Dependency;
};
