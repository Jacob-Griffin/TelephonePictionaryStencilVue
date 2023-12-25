import { setDoc, getDoc, doc, getDocFromServer, Firestore, getFirestore } from 'firebase/firestore';
import { ref, get, set, onValue, remove, Database, getDatabase, Unsubscribe, onDisconnect, DataSnapshot } from 'firebase/database';
import { FirebaseStorage, getDownloadURL, ref as storageRef, updateMetadata, uploadBytes, getStorage } from 'firebase/storage';
import { FirebaseApp, FirebaseOptions, initializeApp } from 'firebase/app';
import {
  GameStacks,
  Game,
  ActionResponse,
  PlayerList,
  Player,
  RoundContent,
  RoundData,
  GameStatus,
  GamePlayers,
  StaticRoundInfo
} from './types';
import config from './config';

let app:FirebaseApp;
let db:Firestore|null = null;
let rtdb:Database|null = null;
let storage:FirebaseStorage|null = null;

export function setFirebaseConfig(config:FirebaseOptions){
    app = initializeApp(config);
    db = getFirestore(app);
    rtdb = getDatabase(app);
    storage = getStorage(app);
}

//#region firestore
export async function storeGame(gameid:number, stacks:GameStacks):Promise<boolean>{
    const docRef = doc(db, `games/${gameid}`);
    await setDoc(docRef, stacks);
    return true;
  }
  
  export async function getGameData(gameid:number):Promise<Game> {
    const docRef = doc(db, `games/${gameid}`);
    const snapshot = await getDocFromServer(docRef);
    const gameData = snapshot.data() as Game;
    return gameData;
  }
//#endregion

//#region Realtime Database
function generatePriority(taken?:Set<number>):number {
    let priority = Math.floor(Math.random() * 1000);
    while (taken && taken.has(priority)) {
      priority = Math.floor(Math.random() * 1000);
    }
    return priority;
  }
  
  function getDefaultContent(type:'text' | 'image'):string {
    if(type === 'image'){
      //As it stands, a "false" image will prompt the content to point to a single existing "no image" image
      //If we had a dynamic image generation, it would go here
      return '';
    }
    
    //If we had an API call for generating or suggesting text, it would go here
    return 'Whoops, I forgot to submit something :(';

  }
  
  export async function addPlayerToLobby(gameid:number, username:string):Promise<ActionResponse> {
    //Grab the game status
    const gameRef = ref(rtdb, `game-statuses/${gameid}`);
  
    const gameStatus = await get(gameRef).then(result => result.val());
    const result:ActionResponse = {
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
    const players:PlayerList = await getWaitingPlayers(gameid);
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
    const newPlayerRef = ref(rtdb, `players/${gameid}/${generatePriority(playerNumbers)}`);
    set(newPlayerRef, { username, status: 'ready' });
  
    return { action: 'lobby' };
  }
  
  export function createLobby(gameid:number, username:string):void {
    set(ref(rtdb, `game-statuses/${gameid}`), {
      started: false,
      finished: false,
    });
    const newPlayerRef = ref(rtdb, `players/${gameid}/${generatePriority()}`);
    set(newPlayerRef, { username, status: 'ready' });
  }
  
  export async function getGameStatus(gameid:number):Promise<GameStatus>{
    const statusRef = ref(rtdb, `game-statuses/${gameid}`);
    return get(statusRef).then(status => status.val());
  }
  
  export async function listGameStatus():Promise<{[id:number]:GameStatus}> {
    const statusesRef = ref(rtdb, 'game-statuses');
    return get(statusesRef).then(statusList => statusList.val());
  }
  
  export async function createDevGame([username, key]:string[], gameid:number):Promise<number|boolean> {
    if (!/^draw|write$/i.test(key)) return false;
    const isDraw = /^draw$/i.test(key);
  
    try {
      const promises = [];
  
      promises.push(
        set(ref(rtdb, `game-statuses/${gameid}`), {
          started: true,
          finished: false,
        }),
      );
  
      const newPlayerRef = ref(rtdb, `players/${gameid}/${generatePriority()}`);
      promises.push(set(newPlayerRef, { username, status: 'missing' }));
  
      const roundRef = ref(rtdb, `game/${gameid}/round`);
      const round0 = {
        roundnumber: isDraw ? 1 : 2,
        endTime: -1,
      };
      promises.push(set(roundRef, round0));
  
      const staticRoundInfoRef = ref(rtdb, `game/${gameid}/staticRoundInfo`);
      promises.push(
        set(staticRoundInfoRef, {
          lastRound: 1000,
          roundLength: -1,
        }),
      );
  
      const newRef = ref(rtdb, `game/${gameid}/players/${username}`);
      promises.push(set(newRef, { to: username, from: username }));
  
      const finishedRef = ref(rtdb, `game/${gameid}/finished/${username}`);
      promises.push(set(finishedRef, -1));
  
      await Promise.all(promises);
    } catch (e) {
      console.error(e);
      return false;
    }
  
    return gameid;
  }
  
  export async function beginGame(gameid:number, roundLength:number):Promise<void> {
    //Set up the round variable at 0
    const roundRef = ref(rtdb, `game/${gameid}/round`);
    const round0 = {
      roundnumber: 0,
      endTime: Date.now() + roundLength,
    };
    if (roundLength === -1) round0.endTime = -1;
    set(roundRef, round0);
  
    //Get the players
    const playerList:Player[] = Object.values(await getWaitingPlayers(gameid));
    const staticRoundInfoRef = ref(rtdb, `game/${gameid}/staticRoundInfo`);
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
      const newRef = ref(rtdb, `game/${gameid}/players/${name}`);
      promises.push(set(newRef, { to, from }));
  
      //Set up the "which round have they finished" status
      const finishedRef = ref(rtdb, `game/${gameid}/finished/${name}`);
      promises.push(set(finishedRef, -1));
    }
  
    await Promise.all(promises);
  
    //Set the game status started to true
    const startedRef = ref(rtdb, `game-statuses/${gameid}/started`);
    await set(startedRef, true);
  
    return;
  }
  
  export async function submitRound(gameid:number, name:string, round:number, rawContent:Blob|string|undefined, staticRoundInfo:StaticRoundInfo) {
    const contentType = round%2 === 0 ? 'text' : 'image';
    const content:string = rawContent instanceof Blob ? await uploadImage(gameid,name,round,rawContent) : rawContent || getDefaultContent(contentType);
    const savedContent:RoundContent = { contentType, content }
  
    const stackRef = ref(rtdb, `game/${gameid}/stacks/${name}/${round}`);
    await set(stackRef, savedContent);
  
    const playerFinishedRef = ref(rtdb, `game/${gameid}/finished/${name}`);
    await set(playerFinishedRef, round);
  
    const finishedRef = ref(rtdb, `game/${gameid}/finished`);
    const finished = await get(finishedRef).then(result => result.val());
  
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
    const roundRef = ref(rtdb, `game/${gameid}/round/`);
    const newRoundData:RoundData = {
      roundnumber: round + 1,
      endTime: Date.now() + staticRoundInfo.roundLength,
    };
    if (staticRoundInfo.roundLength === -1) newRoundData.endTime = -1;
    await set(roundRef, newRoundData);
  
    return;
  }
  
  export async function fetchCard(gameid:number, target:string, round:number) {
    const cardRef = ref(rtdb, `game/${gameid}/stacks/${target}/${round}`);
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
  
  export async function turnInMissing(gameid:number, number:number) {
    if (gameid > 999999) {
      //If this is a debug game, just assume it was a rejoin
      return true;
    }
    const statusref = ref(rtdb, `players/${gameid}/${number}/status`);
    const status = await get(statusref).then(result => result.val());
    if (status === 'missing') {
      set(statusref, 'ready');
      return true;
    }
    return false;
  }

  export function attachMissingListener(gameid:number,playerNumber:number){
    const myStatusRef = ref(rtdb, `players/${gameid}/${playerNumber}/status`);
    const listener = onDisconnect(myStatusRef);
    listener.set('missing') // Normal behavior
    return listener; //Give the listener back so it can be canceled
  }

  export function attachGameStatusListener(gameid:number, callback:(snapshot:DataSnapshot)=>unknown){
    return attachListener(`game-statuses/${gameid}`,callback);
  }

  export function attachPlayerListener(gameid:number, callback:(snapshot:DataSnapshot)=>unknown){
    return attachListener(`players/${gameid}`,callback);
  }

  export function attachRoundListener(gameid:number,callback:(snapshot:DataSnapshot)=>unknown){
    return attachListener(`game/${gameid}/round`,callback);
  }

  export function attachFinishedListener(gameid:number,callback:(snapshot:DataSnapshot)=>unknown){
    return attachListener(`game/${gameid}/finished`, callback);
  }

  function attachListener(path:string,callback:(snapshot:DataSnapshot)=>unknown){
    const pathRef = ref(rtdb, path);
    return onValue(pathRef, callback);
  }

  export async function getWaitingPlayers(gameid:number):Promise<PlayerList>{
    return get(ref(rtdb, `players/${gameid}`)).then(result => result.val())
  }
  
  export async function getToAndFrom(gameid:number, name:string) {
    const playerref = ref(rtdb, `game/${gameid}/players/${name}`);
    return get(playerref).then(result => result.val());
  }
  
  export async function getPlayerNumber(gameid:number, name:string) {
    const players:PlayerList = await getWaitingPlayers(gameid);
    for (let num in players) {
      if (players[num].username === name) {
        return num;
      }
    }
    return undefined;
  }
  
  export async function getStaticRoundInfo(gameid:number) {
    const playerref = ref(rtdb, `game/${gameid}/staticRoundInfo`);
    return get(playerref).then(result => result.val());
  }
  
  export async function finalizeGame(gameid:number) {
    const allStacksRef = ref(rtdb, `game/${gameid}/stacks`);
    const playerref = ref(rtdb, `game/${gameid}/players`);
  
    const playerPromise = get(playerref).then(result => result.val());
    const stackData = await get(allStacksRef).then(snap => snap.val());
    const playerOrder:GamePlayers = await playerPromise;
  
    const finalStackData:GameStacks = {};
    for (let player in stackData) {
      let source = player;
      finalStackData[player] = {};
      for (let i = 0; i < stackData[source].length; i++) {
        finalStackData[player][i] = { ...stackData[source][i], from: source };
        source = playerOrder[source].to;
      }
    }
  
    const gameFinishedRef = ref(rtdb, `game-statuses/${gameid}/finished`);
    set(gameFinishedRef, true);
  
    storeGame(gameid, finalStackData).then(
      success => {
        //Delete the game from the
        const gameRef = ref(rtdb, `game/${gameid}`);
        remove(gameRef);
      },
      failure => {
        console.log('failed to store game');
      },
    );
    return;
  }
  
  export async function sendAddTime(gameid:number, msToAdd:number) {
    if (msToAdd < 1000) return;
  
    const roundRef = ref(rtdb, `game/${gameid}/round/endTime`);
    const oldEndTime = await get(roundRef).then(result => result.val());
  
    if (!oldEndTime) return;
  
    const baseTime = Math.max(oldEndTime, Date.now());
    const endTime = baseTime + msToAdd;
  
    return set(roundRef, endTime);
  }
  //#endregion

  //#region Storage
export async function uploadImage(gameid:number, player:string, round:number, imgData:Blob|false) {
  if (!imgData || imgData.size === 0) {
    return '/default.png';
  }
  const imgref = storageRef(storage, `/games/${gameid}/${round}/${player}.png`);
  updateMetadata(imgref, { cacheControl: 'public,max-age=86400' });
  await uploadBytes(imgref, imgData, { contentType: 'image/png' });
  return getDownloadURL(imgref);
}
//#endregion