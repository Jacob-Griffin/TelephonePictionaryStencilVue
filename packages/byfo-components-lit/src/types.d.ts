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

declare type ModalAction = {
  gameid?: string;
  name?: string;
  playerid?: string;
  query?: string;
  dest?: 'lobby' | 'game' | 'search';
};

declare type Inputs = {
  gameid?: string;
  name?: string;
  search?: string;
};

declare type RouteType = 'join' | 'host' | 'review' | 'search';

declare interface Content {
  from: string;
  contentType: string;
  content: string;
}
