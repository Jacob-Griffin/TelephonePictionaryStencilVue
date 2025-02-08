import { config as defaultConfig, BYFOConfig } from './config';
import { BYFOFirebaseAdapter, PlayerList } from './firebase';
import { validGameId, validUsername } from './general';

export class BYFOGameState {
  config: BYFOConfig;
  #firebase: BYFOFirebaseAdapter;
  constructor(firebase: BYFOFirebaseAdapter, gameid: number | string, self: string) {
    this.config = Object.assign({}, defaultConfig, firebase.gameConfig);

    if (!validGameId(gameid.toString())) {
      this.error = new Error(`Game error: invalid gameid ${gameid}`);
      return;
    }
    const usernameError = validUsername(self, this.config.usernameMaxCharacters);
    if (typeof usernameError === 'string') {
      this.error = new Error(usernameError);
      return;
    }

    this.#gameid = ~~gameid;
    this.#self = self;
    this.#firebase = firebase;

    this.initialize()
      .then(() => {
        this.provide();
        document.addEventListener('byfo-use-gamestate', this.provide);
      })
      .catch(e => {
        if (e.type === 'StateError') {
          throw e;
        }
      });
  }

  async initialize() {
    const status = await this.#firebase.getGameStatus(this.#gameid);
    if (!status) {
      throw new GameStateError('pre-game');
    } else if (status.started) {
      return await this.initializeGameplay();
    } else if (status.finished) {
      throw new GameStateError('post-game');
    } else {
      return await this.initializeLobby();
    }
  }

  async initializeGameplay() {}

  async initializeLobby() {}

  error?: Error;

  #gameid?: number;
  get gameid() {
    return this.#gameid;
  }

  #self?: string;
  get self() {
    return this.#self;
  }

  #watcherMap = new Map();

  on<T extends keyof BYFOGameState>(prop: T, fn: (v: BYFOGameState[T]) => void) {
    const watchers = this.#watcherMap.get(prop).slice() ?? [];
    watchers.push(fn);
    this.#watcherMap.set(prop, watchers);
  }

  #round?: number;
  get round() {
    return this.#round;
  }
  set round(v) {
    this.#round = v;
    const watchers = this.#watcherMap.get('round') ?? [];
    watchers.forEach((watcher: (v: number) => void) => watcher(v));
  }

  #players?: PlayerList;
  get players() {
    return this.#players;
  }
  set players(v) {
    this.#players = v;
    const watchers = this.#watcherMap.get('players') ?? [];
    watchers.forEach((watcher: (v: PlayerList) => void) => watcher(v));
  }

  provide(event?: DocumentEventMap['byfo-use-gamestate']) {
    if (event) {
      event.detail.requester.state = this;
    } else {
      document.dispatchEvent(new CustomEvent('byfo-provide-gamestate', { detail: this }));
    }
  }
}

type Destination = 'pre-game' | 'lobby' | 'game' | 'post-game';
class GameStateError extends Error {
  type = 'StateError';
  destination: Destination;
  constructor(destination: Destination) {
    super(`GameState error: global state is ${destination}`);
    this.destination = destination;
  }
}

declare global {
  interface DocumentEventMap {
    'byfo-use-gamestate': CustomEvent<{ requester: { state: BYFOGameState } }>;
    'byfo-provide-gamestate': CustomEvent<BYFOGameState>;
  }
}
