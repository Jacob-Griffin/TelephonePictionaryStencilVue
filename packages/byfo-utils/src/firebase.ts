import { setDoc, doc, getDocFromServer, getFirestore } from 'firebase/firestore';
import { ref as rtdbRef, get, set, onValue, remove, getDatabase, onDisconnect, DataSnapshot, Unsubscribe } from 'firebase/database';
import { getDownloadURL, ref as storageRef, updateMetadata, uploadBytes, getStorage } from 'firebase/storage';
import { FirebaseOptions, initializeApp } from 'firebase/app';
import * as BYFO from './types';
import { config } from './config';
import { decodePath, encodePath, validUsername } from './general';

export class BYFOFirebaseAdapter {
  /**
   * Backs up the last submission time to prevent double ups on timeout submissions
   */
  lastForcedSubmission: number = null;

  /**
   * Holds the connection objects for the firebase services
   */
  connection: BYFO.FirebaseConnections = {
    db: null,
    rtdb: null,
    storage: null,
  };

  /**
   * Stores approximately how far off of the server clock the client is for better syncing
   */
  serverOffset: number;

  /**
   * Passes the firebase settings to the config object
   * Required for all other functions in byfo-utils/firebase
   *
   * @param config - The firebase config JSON object that the firebase console gives you
   */
  constructor(config: FirebaseOptions) {
    const app = initializeApp(config);
    this.connection.db = getFirestore(app);
    this.connection.rtdb = getDatabase(app);
    this.connection.storage = getStorage(app);
    const offsetRef = rtdbRef(this.connection.rtdb, '.info/serverTimeOffset');
    onValue(offsetRef, snap => {
      const offset = snap.val();
      this.serverOffset = offset;
    });
  }

  //#region firestore
  /**
   * Adds a game to the fire store
   * @param gameid - The game being stored
   * @param stacks - The full stack data object with all players and rounds
   * @returns true if successful, otherwise void
   */
  async storeGame(gameid: number, stacks: BYFO.GameStacks, metadata: BYFO.Metadata): Promise<boolean> {
    const docRef = doc(this.connection.db, `games/${gameid}`);
    await setDoc(docRef, stacks);

    const metadataRef = doc(this.connection.db, `metadata/${gameid}`);
    await setDoc(metadataRef, metadata);
    return true;
  }

  /**
   * Fetches the stacks from a completed game
   * @param gameid
   * @returns
   */
  async getGameData(gameid: number): Promise<BYFO.GameStacks> {
    const docRef = doc(this.connection.db, `games/${gameid}`);
    const snapshot = await getDocFromServer(docRef);
    const gameData = snapshot.data() as BYFO.GameStacks;
    return gameData;
  }

  /**
   * Fetches the metadata from a completed game
   * @param gameid
   * @returns
   */
  async getGameMetadata(gameid: number): Promise<BYFO.Metadata> {
    const docRef = doc(this.connection.db, `metadata/${gameid}`);
    const snapshot = await getDocFromServer(docRef);
    const metadata = (snapshot.data() as BYFO.Metadata | undefined) ?? { roundLength: 180000, date: 'unknown' };
    return metadata;
  }
  //#endregion

  //#region Realtime Database

  /**
   * Shorthand function for getting a Real Time Database Reference
   *
   * @param path - The location in your real time database that you're referencing
   * @returns A Real Time Database Reference for the given path
   *
   * @internal
   */
  ref(path: string) {
    if (this.connection.rtdb === null) {
      throw new Error('Firebase App Connection not configured');
    }
    const fixedPath = encodePath(path);
    return rtdbRef(this.connection.rtdb, fixedPath);
  }

  /**
   * Shorthand function for getting the value at a given reference path in the real time database
   *
   * @param path - The location in your real time database that you're fetching
   * @returns The value stored at that location, or null, if nothing is there
   */
  async getRef(path: string) {
    return await get(this.ref(path)).then(result => result.val());
  }

  /**
   * Simple random number generation that handles repeats
   * Used to generate the players order as they join the game
   *
   * @param taken - Values that are already "used"/will not be generated
   * @returns A value from 0-999 that is unique to the input set
   *
   * @internal
   */
  generatePriority(taken?: Set<number>): number {
    let priority = Math.floor(Math.random() * 1000);
    while (taken && taken.has(priority)) {
      priority = Math.floor(Math.random() * 1000);
    }
    return priority;
  }

  /**
   * Generates the default data for if a player does not submit.
   *
   * @param type - The type of content being generated
   * @returns A string with either a plaintext prompt or an image url
   *
   * @internal
   */
  getDefaultContent(type: 'text' | 'image'): string {
    if (type === 'image') {
      //As it stands, a "false" image will prompt the content to point to a single existing "no image" image
      //If we had a dynamic image generation, it would go here
      return '';
    }

    //If we had an API call for generating or suggesting text, it would go here
    return 'Whoops, I forgot to submit something :(';
  }

  /**
   * Interface function to put a player into a given lobby
   *
   * @param gameid - Game to join
   * @param username - User being added
   * @returns An object describing the result of the request
   *
   * @async
   * @external
   */
  async addPlayerToLobby(gameid: number, username: string): Promise<BYFO.ActionResponse> {
    //Grab the game status
    const gameStatus = await this.getRef(`game-statuses/${gameid}`);
    const result: BYFO.ActionResponse = {
      action: 'error',
    };
    //If the game exists, read the data
    if (!gameStatus) {
      result.detail = 'Game does not exist';
      return result;
    }
    if (gameStatus.finished) {
      result.detail = 'Game has already finished';
      return result;
    }

    //Check the players list
    const players: BYFO.PlayerList = await this.getWaitingPlayers(gameid);
    const playerNumbers = new Set<number>();

    // Check to make sure there isn't a rejoin or duplicate name
    for (let playerNumber in players) {
      const player = players[playerNumber];
      if (player.username === username) {
        if (player.status === 'missing') {
          return {
            action: 'join',
            detail: playerNumber,
            dest: gameStatus.started ? 'game' : 'lobby',
          };
        }
        if (!gameStatus.started) {
          result.detail = 'Username already taken in game';
          return result;
        }
      }
      playerNumbers.add(parseInt(playerNumber));
    }

    if (gameStatus.started) {
      result.detail = 'Game has already started';
      return result;
    }

    if (playerNumbers.size > config.maxPlayers) {
      result.detail = 'Too many players in game';
      return result;
    }

    //If there are no issues, push in the new player
    const newPlayerRef = this.ref(`players/${gameid}/${this.generatePriority(playerNumbers)}`);
    set(newPlayerRef, { username, status: 'ready' });

    return { action: 'lobby', dest: 'lobby' };
  }

  /**
   * Create a new lobby in the realtime database and add the host/creator
   * @param gameid - The gameid you want to create
   * @param username - The host
   * @returns void
   */
  createLobby(gameid: number, username: string): void {
    set(this.ref(`game-statuses/${gameid}`), {
      started: false,
      finished: false,
    });
    const newPlayerRef = this.ref(`players/${gameid}/${this.generatePriority()}`);
    set(newPlayerRef, { username, status: 'ready' });
  }

  /**
   * Gets the game status of a specified game
   * @param gameid - The game to get the status of
   * @returns Game status (if any)
   */
  async getGameStatus(gameid: number): Promise<BYFO.GameStatus> {
    return this.getRef(`game-statuses/${gameid}`);
  }

  /**
   * Gets the list of all game statuses
   * @returns An object pairing gameids to statuses
   */
  async listGameStatus(): Promise<{ [id: number]: BYFO.GameStatus }> {
    return this.getRef('game-statuses');
  }

  async createGame(user: string): Promise<string | false> {
    if (!validUsername(user)) {
      return false;
    }

    const gameStatuses = await this.listGameStatus();
    // Check which gameIds were/are in use via firestore, then generate one that's not there
    const usedIds = new Set<number>(Object.keys(gameStatuses).map(id => parseInt(id)));

    const devGame = user.match(/Jacob-dev-test-(draw|write)/i);
    if (devGame) {
      return this.createDevGame(devGame, Math.max(...usedIds) + 1);
    }
    // Try a random old game id
    let newId = Math.floor(Math.random() * 999999 + 1);

    //On conflict, this threshold is used to determine if we should keep generating random numbers
    //If the chance that a random number will conflict is too high, try something like incrementing instead
    const randomThreshold = 0.5;
    while (usedIds.has(newId)) {
      if (usedIds.size < randomThreshold * 999999) {
        newId = Math.floor(Math.random() * 999999 + 1);
      } else {
        newId++;
      }
    }

    //Send the request for this game to firestore
    await this.createLobby(newId, user);

    //Pass this id back so we can route the player to the lobby
    return `${newId}`;
  }

  /**
   * Creates a special game for testing that's meant to never end and jump right into a certain state
   * @param devMatch - a short array with the regex match data for a dev game username
   * @param gameid - The game being created
   * @returns The game id, if successful
   */
  async createDevGame([username, key]: string[], gameid: number): Promise<string | false> {
    if (!/^draw|write$/i.test(key)) return false;
    const isDraw = /^draw$/i.test(key);

    try {
      const promises = [];

      promises.push(
        set(this.ref(`game-statuses/${gameid}`), {
          started: true,
          finished: false,
        }),
      );

      const newPlayerRef = this.ref(`players/${gameid}/${this.generatePriority()}`);
      promises.push(set(newPlayerRef, { username, status: 'missing' }));

      const roundRef = this.ref(`game/${gameid}/round`);
      const round0 = {
        roundnumber: isDraw ? 1 : 2,
        endTime: -1,
      };
      promises.push(set(roundRef, round0));

      const staticRoundInfoRef = this.ref(`game/${gameid}/staticRoundInfo`);
      promises.push(
        set(staticRoundInfoRef, {
          lastRound: 1000,
          roundLength: -1,
        }),
      );

      const newRef = this.ref(`game/${gameid}/players/${username}`);
      promises.push(set(newRef, { to: username, from: username }));

      const finishedRef = this.ref(`game/${gameid}/finished/${username}`);
      promises.push(set(finishedRef, -1));

      await Promise.all(promises);
    } catch (e) {
      console.error(e);
      return false;
    }

    return `${gameid}`;
  }

  /**
   * Sets up the gameplay section in the realtime database, then marks the game as started
   * @param gameid - the game being started
   * @param roundLength - The time for every round of the game, in milliseconds
   * @returns void
   */
  async beginGame(gameid: number, roundLength: number): Promise<void> {
    //Set up the round variable at 0
    const roundRef = this.ref(`game/${gameid}/round`);
    const round0 = {
      roundnumber: 0,
      endTime: Date.now() + roundLength + this.serverOffset,
    };
    console.log(this.serverOffset);
    console.log(roundLength);
    console.log(Date.now());
    if (roundLength === -1) round0.endTime = -1;
    set(roundRef, round0);

    //Get the players
    const playerList: BYFO.Player[] = Object.values(await this.getWaitingPlayers(gameid));
    const staticRoundInfoRef = this.ref(`game/${gameid}/staticRoundInfo`);
    set(staticRoundInfoRef, {
      lastRound: playerList.length - 1,
      roundLength,
    });

    //List of outstanding promises, that way we can let them all run in parallel and only block for them at the end
    const promises = [];
    for (let i = 0; i < playerList.length; i++) {
      const name = playerList[i].username;

      //Set up the player-to-from list
      const fromIdx = i - 1 < 0 ? playerList.length - 1 : i - 1;
      const toIdx = (i + 1) % playerList.length;
      const from = playerList[fromIdx].username;
      const to = playerList[toIdx].username;
      const newRef = this.ref(`game/${gameid}/players/${name}`);
      promises.push(set(newRef, { to, from }));

      //Set up the "which round have they finished" status
      const finishedRef = this.ref(`game/${gameid}/finished/${name}`);
      promises.push(set(finishedRef, -1));
    }

    await Promise.all(promises);

    //Set the game status started to true
    const startedRef = this.ref(`game-statuses/${gameid}/started`);
    await set(startedRef, true);

    return;
  }

  /**
   * Sends in the content for a round, and uploads the image to storage, if necessary
   * @param gameid - The game being submitted to
   * @param name - The player submitting something
   * @param round - The round number within the game
   * @param rawContent - The content to be written out
   * @param staticRoundInfo - Round metadata, like which round is last and how long rounds are
   * @returns void
   */
  async submitRound(
    gameid: number,
    name: string,
    round: number,
    rawContent: Blob | string | undefined,
    staticRoundInfo: BYFO.StaticRoundInfo,
    forced: boolean = false,
  ): Promise<true | void> {
    if (forced) {
      if (Date.now() - this.lastForcedSubmission < config.minRoundLength * 1000) {
        // If we got 2 forced submissions less than the minimum round length apart, they're surely in error
        return;
      }
      this.lastForcedSubmission = Date.now();
    }
    const contentType = round % 2 === 0 ? 'text' : 'image';
    if ((contentType === 'text' && rawContent instanceof Blob) || (contentType === 'image' && typeof rawContent === 'string')) {
      if (!forced) {
        throw new Error();
      }
      rawContent = this.getDefaultContent(contentType);
    }
    if (contentType === 'text' && (rawContent as string).length > config.textboxMaxCharacters) {
      if (!forced) {
        throw new Error();
      }
      rawContent = rawContent.slice(0, config.textboxMaxCharacters);
    }
    const content: string = rawContent instanceof Blob ? await this.uploadImage(gameid, name, round, rawContent) : rawContent || this.getDefaultContent(contentType);
    const savedContent: BYFO.RoundContent = { contentType, content };

    const stackRef = this.ref(`game/${gameid}/stacks/${name}/${round}`);
    await set(stackRef, savedContent);

    const playerFinishedRef = this.ref(`game/${gameid}/finished/${name}`);
    await set(playerFinishedRef, round);

    const finished = await this.getRef(`game/${gameid}/finished`);

    //Check every player. If someone's not done, leave now
    for (let player in finished) {
      if (finished[player] < round) {
        return;
      }
    }

    //If everyone's done:
    if (round == staticRoundInfo.lastRound) {
      //If this was the last round, finalize the game
      await this.finalizeGame(gameid);
      return;
    }
    //Set the round number and end time forward
    const roundRef = this.ref(`game/${gameid}/round/`);
    const newRoundData: BYFO.RoundData = {
      roundnumber: round + 1,
      endTime: Date.now() + staticRoundInfo.roundLength + this.serverOffset,
    };
    if (staticRoundInfo.roundLength === -1) newRoundData.endTime = -1;
    await set(roundRef, newRoundData);

    return true;
  }

  /**
   * Fetches the finished round for a given player in a given game
   * @param gameid
   * @param name
   * @returns The last round number that the player has submitted a response for
   */
  async fetchFinishedRound(gameid: number, name: string): Promise<number> {
    const round = await this.getRef(`game/${gameid}/finished/${name}`);
    return ~~round;
  }

  /**
   * Manually fetch round data the way the subscription would, so we can handle cases where data changed while the page wasn't being viewed
   * @param gameid
   * @param callback
   * @returns void
   */
  async resyncRoundData(gameid: number, callback: (snapshot: DataSnapshot) => unknown) {
    get(this.ref(`/games/${gameid}/finished`)).then(result => callback(result));
  }

  /**
   * Gets a card from active gameplay data
   * @param gameid - the game being played
   * @param target - the person being recieved from
   * @param round - the round number within the game
   * @returns Card data, or null if it doesn't exist
   */
  async fetchCard(gameid: number, target: string, round: number) {
    return this.getRef(`game/${gameid}/stacks/${target}/${round}`);
  }

  /**
   * Check if a prospective player was missing from the game, and mark them no longer missing
   * @param gameid - the game being rejoined
   * @param number - the player number
   * @returns A boolean of whether or not they successfully rejoined
   */
  async turnInMissing(gameid: number, number: number) {
    if (gameid > 999999) {
      //If this is a debug game, just assume it was a rejoin
      return true;
    }

    const status = await this.getRef(`players/${gameid}/${number}/status`);
    if (status === 'missing') {
      set(this.ref(`players/${gameid}/${number}/status`), 'ready');
      return true;
    }
    return false;
  }

  /**
   * Attaches a listener that will mark a player missing if they disconnect
   * @param gameid - the game being watched
   * @param playerNumber - the player number being watched
   * @returns An unsubscribe function
   */
  attachMissingListener(gameid: number, playerNumber: number) {
    const myStatusRef = this.ref(`players/${gameid}/${playerNumber}/status`);
    const listener = onDisconnect(myStatusRef);
    listener.set('missing'); // Normal behavior
    return listener; //Give the listener back so it can be canceled
  }

  /**
   * Listens for a game to be started
   * @extends {@link attachListener}
   */
  attachGameStatusListener(gameid: number, callback: (snapshot: DataSnapshot) => unknown) {
    return this.attachListener(`game-statuses/${gameid}`, callback);
  }

  /**
   * Listens for changes to the player list in a lobby
   * @extends {@link attachListener}
   */
  attachPlayerListener(gameid: number, callback: (snapshot: DataSnapshot) => unknown) {
    return this.attachListener(`players/${gameid}`, callback);
  }

  /**
   * Listens for new rounds
   * @extends {@link attachListener}
   */
  attachRoundListener(gameid: number, callback: (snapshot: DataSnapshot) => unknown) {
    return this.attachListener(`game/${gameid}/round`, callback);
  }

  /**
   * Listens for changes to who's finished which rounds
   * @extends {@link attachListener}
   */
  attachFinishedListener(gameid: number, callback: (snapshot: DataSnapshot) => unknown) {
    return this.attachListener(`game/${gameid}/finished`, callback);
  }

  /**
   * Generic function to add a listener for a given realtime database path
   * @param path - The location to be watched
   * @param callback - The function to be called on watched update
   * @returns Unsubscribe function for the listener
   */
  attachListener(path: string, callback: (snapshot: DataSnapshot) => unknown) {
    const pathRef = this.ref(path);
    return onValue(pathRef, callback);
  }

  /**
   * Gets the players currently in the lobby
   * @param gameid - Game to be fetched
   * @returns A list of player objects
   */
  async getWaitingPlayers(gameid: number): Promise<BYFO.PlayerList> {
    return this.getRef(`players/${gameid}`);
  }

  /**
   * Gets who a player is sending to and recieving from
   * @param gameid - The game being referenced
   * @param name - The player being referenced
   * @returns The to and from data for the searched player
   */
  async getToAndFrom(gameid: number, name: string) {
    return this.getRef(`game/${gameid}/players/${name}`);
  }

  /**
   * Gets the randomly assigned number for a given player
   * @param gameid - The game being referenced
   * @param name - The player being referenced
   * @returns The player id within that game
   */
  async getPlayerNumber(gameid: number, name: string) {
    const players: BYFO.PlayerList = await this.getWaitingPlayers(gameid);
    for (let num in players) {
      if (players[num].username === name) {
        return num;
      }
    }
    return undefined;
  }

  /**
   * Gets the static round info for a game
   * @param gameid - The game
   * @returns The static round info
   */
  async getStaticRoundInfo(gameid: number): Promise<BYFO.StaticRoundInfo> {
    return this.getRef(`game/${gameid}/staticRoundInfo`);
  }

  /**
   * Cleans up real time gameplay data and sends it to the firestore
   * @param gameid - The game being adjusted
   * @returns void
   */
  async finalizeGame(gameid: number) {
    const stackData = await this.getRef(`game/${gameid}/stacks`);
    const playerOrder: BYFO.GamePlayers = await this.getRef(`game/${gameid}/players`);
    const roundLength: number = await this.getRef(`game/${gameid}/staticRoundInfo/roundLength`);

    const metadata = {
      date: new Date().toString(),
      roundLength,
    };

    const finalStackData: BYFO.GameStacks = {};
    for (let player in stackData) {
      let source = player;
      finalStackData[player] = {};
      for (let i = 0; i < stackData[source].length; i++) {
        finalStackData[player][i] = { ...stackData[source][i], from: decodePath(source) };
        source = encodePath(playerOrder[source].to);
      }
    }

    const gameFinishedRef = this.ref(`game-statuses/${gameid}/finished`);
    set(gameFinishedRef, true);

    this.storeGame(gameid, finalStackData, metadata).then(
      success => {
        //Delete the game from the realtime database
        remove(this.ref(`game/${gameid}`));
      },
      failure => {
        console.log('failed to store game');
      },
    );
    return;
  }

  /**
   * Adds time to an active gameplay round
   * @param gameid - The game to add time to
   * @param msToAdd - The amount of time to add in ms
   * @returns void
   */
  async sendAddTime(gameid: number, msToAdd: number) {
    if (msToAdd < 1000) return;

    const oldEndTime: number = await this.getRef(`game/${gameid}/round/endTime`);

    if (!oldEndTime) throw new Error('Cannot find game round to add time');

    const baseTime = Math.max(oldEndTime, Date.now());
    const endTime = baseTime + msToAdd;

    return set(this.ref(`game/${gameid}/round/endTime`), endTime);
  }
  //#endregion

  //#region Storage
  /**
   * Adds an image to firebase storage
   * @param gameid - The game the image is from
   * @param player - The author of the image
   * @param round - The round the image is from
   * @param imgData - The raw image blob
   * @returns The url to the uploaded image
   */
  async uploadImage(gameid: number, player: string, round: number, imgData: Blob | false) {
    if (!imgData || imgData.size === 0) {
      return '/default.png';
    }
    const imgref = storageRef(this.connection.storage, `/games/${gameid}/${round}/${player}.png`);
    updateMetadata(imgref, { cacheControl: 'public,max-age=86400' });
    await uploadBytes(imgref, imgData, { contentType: 'image/png' });
    return getDownloadURL(imgref);
  }
  //#endregion
}
