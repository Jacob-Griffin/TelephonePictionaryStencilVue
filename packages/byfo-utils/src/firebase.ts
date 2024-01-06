import { setDoc, doc, getDocFromServer, getFirestore } from 'firebase/firestore';
import { ref as rtdbRef, get, set, onValue, remove, getDatabase, onDisconnect, DataSnapshot } from 'firebase/database';
import { getDownloadURL, ref as storageRef, updateMetadata, uploadBytes, getStorage } from 'firebase/storage';
import { FirebaseOptions, initializeApp } from 'firebase/app';

import { GameStacks, Game, ActionResponse, PlayerList, Player, RoundContent, RoundData, GameStatus, GamePlayers, StaticRoundInfo, FirebaseConnections } from './types';

import config from './config';

/**
 * Holds the connection objects for the firebase services
 */
const connection: FirebaseConnections = {
  db: null,
  rtdb: null,
  storage: null,
};

/**
 * Passes the firebase settings to the config object
 * Required for all other functions in byfo-utils/firebase
 *
 * @param config - The firebase config JSON object that the firebase console gives you
 */
export function setFirebaseConfig(config: FirebaseOptions) {
  const app = initializeApp(config);
  connection.db = getFirestore(app);
  connection.rtdb = getDatabase(app);
  connection.storage = getStorage(app);
}

//#region firestore
/**
 * Adds a game to the fire store
 * @param gameid - The game being stored
 * @param stacks - The full stack data object with all players and rounds
 * @returns true if successful, otherwise void
 */
export async function storeGame(gameid: number, stacks: GameStacks): Promise<boolean> {
  const docRef = doc(connection.db, `games/${gameid}`);
  await setDoc(docRef, stacks);
  return true;
}

/**
 *
 * @param gameid
 * @returns
 */
export async function getGameData(gameid: number): Promise<Game> {
  const docRef = doc(connection.db, `games/${gameid}`);
  const snapshot = await getDocFromServer(docRef);
  const gameData = snapshot.data() as Game;
  return gameData;
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
function ref(path: string) {
  if (connection.rtdb === null) {
    throw new Error('Firebase App Connection not configured');
  }
  return rtdbRef(connection.rtdb, path);
}

/**
 * Shorthand function for getting the value at a given reference path in the real time database
 *
 * @param path - The location in your real time database that you're fetching
 * @returns The value stored at that location, or null, if nothing is there
 */
async function getRef(path: string) {
  return await get(ref(path)).then(result => result.val());
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
function generatePriority(taken?: Set<number>): number {
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
function getDefaultContent(type: 'text' | 'image'): string {
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
export async function addPlayerToLobby(gameid: number, username: string): Promise<ActionResponse> {
  //Grab the game status
  const gameStatus = await getRef(`game-statuses/${gameid}`);
  const result: ActionResponse = {
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
  const players: PlayerList = await getWaitingPlayers(gameid);
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
  const newPlayerRef = ref(`players/${gameid}/${generatePriority(playerNumbers)}`);
  set(newPlayerRef, { username, status: 'ready' });

  return { action: 'lobby' };
}

/**
 * Create a new lobby in the realtime database and add the host/creator
 * @param gameid - The gameid you want to create
 * @param username - The host
 * @returns void
 */
export function createLobby(gameid: number, username: string): void {
  set(ref(`game-statuses/${gameid}`), {
    started: false,
    finished: false,
  });
  const newPlayerRef = ref(`players/${gameid}/${generatePriority()}`);
  set(newPlayerRef, { username, status: 'ready' });
}

/**
 * Creates a special game for testing that's meant to never end and jump right into a certain state
 * @param devMatch - a short array with the regex match data for a dev game username
 * @param gameid - The game being created
 * @returns The game id, if successful
 */
export async function createDevGame([username, key]: string[], gameid: number): Promise<number | boolean> {
  if (!/^draw|write$/i.test(key)) return false;
  const isDraw = /^draw$/i.test(key);

  try {
    const promises = [];

    promises.push(
      set(ref(`game-statuses/${gameid}`), {
        started: true,
        finished: false,
      }),
    );

    const newPlayerRef = ref(`players/${gameid}/${generatePriority()}`);
    promises.push(set(newPlayerRef, { username, status: 'missing' }));

    const roundRef = ref(`game/${gameid}/round`);
    const round0 = {
      roundnumber: isDraw ? 1 : 2,
      endTime: -1,
    };
    promises.push(set(roundRef, round0));

    const staticRoundInfoRef = ref(`game/${gameid}/staticRoundInfo`);
    promises.push(
      set(staticRoundInfoRef, {
        lastRound: 1000,
        roundLength: -1,
      }),
    );

    const newRef = ref(`game/${gameid}/players/${username}`);
    promises.push(set(newRef, { to: username, from: username }));

    const finishedRef = ref(`game/${gameid}/finished/${username}`);
    promises.push(set(finishedRef, -1));

    await Promise.all(promises);
  } catch (e) {
    console.error(e);
    return false;
  }

  return gameid;
}

/**
 * Sets up the gameplay section in the realtime database, then marks the game as started
 * @param gameid - the game being started
 * @param roundLength - The time for every round of the game, in milliseconds
 * @returns void
 */
export async function beginGame(gameid: number, roundLength: number): Promise<void> {
  //Set up the round variable at 0
  const roundRef = ref(`game/${gameid}/round`);
  const round0 = {
    roundnumber: 0,
    endTime: Date.now() + roundLength,
  };
  if (roundLength === -1) round0.endTime = -1;
  set(roundRef, round0);

  //Get the players
  const playerList: Player[] = Object.values(await getWaitingPlayers(gameid));
  const staticRoundInfoRef = ref(`game/${gameid}/staticRoundInfo`);
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
    const newRef = ref(`game/${gameid}/players/${name}`);
    promises.push(set(newRef, { to, from }));

    //Set up the "which round have they finished" status
    const finishedRef = ref(`game/${gameid}/finished/${name}`);
    promises.push(set(finishedRef, -1));
  }

  await Promise.all(promises);

  //Set the game status started to true
  const startedRef = ref(`game-statuses/${gameid}/started`);
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
export async function submitRound(gameid: number, name: string, round: number, rawContent: Blob | string | undefined, staticRoundInfo: StaticRoundInfo) {
  const contentType = round % 2 === 0 ? 'text' : 'image';
  const content: string = rawContent instanceof Blob ? await uploadImage(gameid, name, round, rawContent) : rawContent || getDefaultContent(contentType);
  const savedContent: RoundContent = { contentType, content };

  const stackRef = ref(`game/${gameid}/stacks/${name}/${round}`);
  await set(stackRef, savedContent);

  const playerFinishedRef = ref(`game/${gameid}/finished/${name}`);
  await set(playerFinishedRef, round);

  const finished = await getRef(`game/${gameid}/finished`);

  //Check every player. If someone's not done, leave now
  for (let player in finished) {
    if (finished[player] < round) {
      return;
    }
  }

  //If everyone's done:
  if (round == staticRoundInfo.lastRound) {
    //If this was the last round, finalize the game
    await finalizeGame(gameid);
    return;
  }
  //Set the round number and end time forward
  const roundRef = ref(`game/${gameid}/round/`);
  const newRoundData: RoundData = {
    roundnumber: round + 1,
    endTime: Date.now() + staticRoundInfo.roundLength,
  };
  if (staticRoundInfo.roundLength === -1) newRoundData.endTime = -1;
  await set(roundRef, newRoundData);

  return;
}

/**
 * Gets a card from active gameplay data
 * @param gameid - the game being played
 * @param target - the person being recieved from
 * @param round - the round number within the game
 * @returns Card data, or null if it doesn't exist
 */
export async function fetchCard(gameid: number, target: string, round: number) {
  //Try in a new commit
  //return getRef(`game/${gameid}/stacks/${target}/${round}`);
  const cardRef = ref(`game/${gameid}/stacks/${target}/${round}`);
  let value = new Promise(resolve => {
    const unsub = onValue(cardRef, snapshot => {
      const newvalue = snapshot.val();
      if (newvalue !== null) {
        unsub();
        resolve(newvalue);
      }
    });
  });

  //value is a promise that will resolve to the eventual card
  return value;
}

/**
 * Check if a prospective player was missing from the game, and mark them no longer missing
 * @param gameid - the game being rejoined
 * @param number - the player number
 * @returns A boolean of whether or not they successfully rejoined
 */
export async function turnInMissing(gameid: number, number: number) {
  if (gameid > 999999) {
    //If this is a debug game, just assume it was a rejoin
    return true;
  }

  const status = await getRef(`players/${gameid}/${number}/status`);
  if (status === 'missing') {
    set(ref(`players/${gameid}/${number}/status`), 'ready');
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
export function attachMissingListener(gameid: number, playerNumber: number) {
  const myStatusRef = ref(`players/${gameid}/${playerNumber}/status`);
  const listener = onDisconnect(myStatusRef);
  listener.set('missing'); // Normal behavior
  return listener; //Give the listener back so it can be canceled
}

/**
 * Listens for a game to be started
 * @extends {@link attachListener}
 */
export function attachGameStatusListener(gameid: number, callback: (snapshot: DataSnapshot) => unknown) {
  return attachListener(`game-statuses/${gameid}`, callback);
}

/**
 * Listens for changes to the player list in a lobby
 * @extends {@link attachListener}
 */
export function attachPlayerListener(gameid: number, callback: (snapshot: DataSnapshot) => unknown) {
  return attachListener(`players/${gameid}`, callback);
}

/**
 * Listens for new rounds
 * @extends {@link attachListener}
 */
export function attachRoundListener(gameid: number, callback: (snapshot: DataSnapshot) => unknown) {
  return attachListener(`game/${gameid}/round`, callback);
}

/**
 * Listens for changes to who's finished which rounds
 * @extends {@link attachListener}
 */
export function attachFinishedListener(gameid: number, callback: (snapshot: DataSnapshot) => unknown) {
  return attachListener(`game/${gameid}/finished`, callback);
}

/**
 * Generic function to add a listener for a given realtime database path
 * @param path - The location to be watched
 * @param callback - The function to be called on watched update
 * @returns Unsubscribe function for the listener
 */
function attachListener(path: string, callback: (snapshot: DataSnapshot) => unknown) {
  const pathRef = ref(path);
  return onValue(pathRef, callback);
}

/**
 * Gets the players currently in the lobby
 * @param gameid - Game to be fetched
 * @returns A list of player objects
 */
export async function getWaitingPlayers(gameid: number): Promise<PlayerList> {
  return getRef(`players/${gameid}`);
}

/**
 * Gets who a player is sending to and recieving from
 * @param gameid - The game being referenced
 * @param name - The player being referenced
 * @returns The to and from data for the searched player
 */
export async function getToAndFrom(gameid: number, name: string) {
  return getRef(`game/${gameid}/players/${name}`);
}

/**
 * Gets the randomly assigned number for a given player
 * @param gameid - The game being referenced
 * @param name - The player being referenced
 * @returns The player id within that game
 */
export async function getPlayerNumber(gameid: number, name: string) {
  const players: PlayerList = await getWaitingPlayers(gameid);
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
export async function getStaticRoundInfo(gameid: number) {
  return getRef(`game/${gameid}/staticRoundInfo`);
}

/**
 * Cleans up real time gameplay data and sends it to the firestore
 * @param gameid - The game being adjusted
 * @returns void
 */
export async function finalizeGame(gameid: number) {
  const stackData = await getRef(`game/${gameid}/stacks`);
  const playerOrder: GamePlayers = await getRef(`game/${gameid}/players`);

  const finalStackData: GameStacks = {};
  for (let player in stackData) {
    let source = player;
    finalStackData[player] = {};
    for (let i = 0; i < stackData[source].length; i++) {
      finalStackData[player][i] = { ...stackData[source][i], from: source };
      source = playerOrder[source].to;
    }
  }

  const gameFinishedRef = ref(`game-statuses/${gameid}/finished`);
  set(gameFinishedRef, true);

  storeGame(gameid, finalStackData).then(
    success => {
      //Delete the game from the realtime database
      remove(ref(`game/${gameid}`));
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
export async function sendAddTime(gameid: number, msToAdd: number) {
  if (msToAdd < 1000) return;

  const oldEndTime: number = await getRef(`game/${gameid}/round/endTime`);

  if (!oldEndTime) throw new Error('Cannot find game round to add time');

  const baseTime = Math.max(oldEndTime, Date.now());
  const endTime = baseTime + msToAdd;

  return set(ref(`game/${gameid}/round/endTime`), endTime);
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
export async function uploadImage(gameid: number, player: string, round: number, imgData: Blob | false) {
  if (!imgData || imgData.size === 0) {
    return '/default.png';
  }
  const imgref = storageRef(connection.storage, `/games/${gameid}/${round}/${player}.png`);
  updateMetadata(imgref, { cacheControl: 'public,max-age=86400' });
  await uploadBytes(imgref, imgData, { contentType: 'image/png' });
  return getDownloadURL(imgref);
}
//#endregion
