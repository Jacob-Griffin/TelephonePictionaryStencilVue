import { config as defaultConfig, BYFOConfig } from './config';
import { BYFOFirebaseAdapter, PlayerList, RoundContent, RoundData } from './firebase';
import { validGameId, validUsername } from './general';
import { useAccessor } from './accessors';

export class BYFOGameState {
  #firebase: BYFOFirebaseAdapter;
  constructor(firebase?: BYFOFirebaseAdapter, gameid?: number | string, self?: string) {
    this.#config = Object.assign({}, defaultConfig, firebase?.gameConfig ?? {});
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

  #gameplayHandles: Record<string, number | (() => void)> = {
    clearAll: () => {
      Object.values(this.#gameplayHandles).forEach(handle => {
        if (typeof handle === 'function') {
          handle();
        } else {
          clearInterval(handle);
        }
      });
    },
  };

  async initializeGameplay() {
    let retries = 3;
    let initialRoundData = await this.#firebase.getRoundData(this.gameid);
    while (!initialRoundData && retries > 0) {
      initialRoundData = await this.#firebase.getRoundData(this.gameid);
    }
    if (!initialRoundData) {
      throw new GameStateError('pre-game');
    }
    const { from, to } = await this.#firebase.getToAndFrom(this.gameid, this.self);
    this.#from = from;
    this.#to = to;

    this.#gameplayHandles.timeChange = this.on('endtime', v => (this.currentTimeRemaining = v - this.#firebase.now));
    await this.handleRoundChange(initialRoundData);
    this.#gameplayHandles.time = setInterval(() => (this.currentTimeRemaining = this.endtime - this.#firebase.now), 500);

    this.#gameplayHandles.roundChange = this.#firebase.onRoundChange(this.gameid, this.handleRoundChange);
  }

  async handleRoundChange(data: RoundData) {
    this.endtime = data.endTime;
    this.round = data.roundnumber;
    this.state = this.round % 2 === 0 ? 'writing' : 'drawing';
    if (this.round > 0) {
      this.recievedCard = await this.#firebase.fetchCard(this.gameid, this.from, this.round - 1);
    }
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

  #from: string;
  get from() {
    return this.#from;
  }

  #to: string;
  get to() {
    return this.#to;
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
  currentTimeRemaining?: number;
  players?: PlayerList | Record<string, number>;
  recievedCard?: RoundContent;

  on = useAccessor<BYFOGameState>(['round', 'currentTimeRemaining', 'endtime', 'players', 'recievedCard', 'state'], this);
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
