import { config as defaultConfig, BYFOConfig } from './config';
import { BYFOFirebaseAdapter, PlayerList, RoundContent } from './firebase';
import { validGameId, validUsername } from './general';

const accessorKeys = ['round', 'endtime', 'players', 'recievedCard', 'state'] as const;
type BYFOGameStateAccessor = (typeof accessorKeys)[number];

export class BYFOGameState {
  #firebase: BYFOFirebaseAdapter;
  constructor(firebase?: BYFOFirebaseAdapter, gameid?: number | string, self?: string) {
    this.#config = Object.assign({}, defaultConfig, firebase?.gameConfig ?? {});
    accessorKeys.forEach(this.#installAccessor.bind(this));
    if (!validGameId(gameid.toString())) {
      this.#error = new Error(`Game error: invalid gameid ${gameid}`);
      return;
    }
    const usernameError = validUsername(self, this.config.usernameMaxCharacters);
    if (typeof usernameError === 'string') {
      this.#error = new Error(usernameError);
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

  async initializeGameplay() {
    // let initialRoundData = await this.#firebase.getRoundData(this.gameid);
  }

  async initializeLobby() {}

  //#region readonly
  #gameid?: number;
  get gameid() {
    return this.#gameid;
  }

  #self?: string;
  get self() {
    return this.#self;
  }

  #config: BYFOConfig;
  get config() {
    return this.#config;
  }

  #error?: Error;
  get error() {
    return this.#error;
  }
  //#endregion

  //#region Accessors
  state?: 'drawing' | 'writing' | 'waiting' | 'lobby';
  round?: number;
  endtime?: number;
  players?: PlayerList | Record<string, number>;
  recievedCard?: RoundContent;

  #store: { [T in BYFOGameStateAccessor]?: BYFOGameState[T] } = {};

  #watcherMap: Map<BYFOGameStateAccessor, Record<string, (v: BYFOGameState[BYFOGameStateAccessor]) => void>> = new Map();

  on<T extends BYFOGameStateAccessor>(prop: T, fn: (v: BYFOGameState[T]) => void, { instant }: { instant?: boolean } = {}): () => void {
    const watchers = this.#watcherMap.get(prop) ?? {};
    const id = Math.floor(Math.random() * 10000).toString();
    watchers[id] = fn;
    this.#watcherMap.set(prop, watchers);
    if (instant) {
      fn(this[prop]);
    }
    return () => {
      const watchers = this.#watcherMap.get(prop);
      delete watchers[id];
      this.#watcherMap.set(prop, watchers);
    };
  }

  #installAccessor(key: BYFOGameStateAccessor) {
    Object.defineProperty(this, key, {
      get() {
        return this.#store?.[key];
      },
      set(v) {
        this.#store[key] = v;
        const watchers = this.#watcherMap.get(key) ?? {};
        Object.values(watchers).forEach((watcher: (v: BYFOGameState[typeof key]) => void) => watcher(v));
      },
    });
  }
  //#endregion

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
