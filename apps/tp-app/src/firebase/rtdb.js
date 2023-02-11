import { rtdb } from "../../Firebase";
import { ref, push, get, set } from "firebase/database";

function generatePriority(taken=undefined){
  let priority = Math.floor(Math.random()*1000);
  while(taken && taken.has(priority)){
    priority = Math.floor(Math.random()*1000);
  }
  return priority
}

export async function addPlayerToLobby(gameid, username) {
  //Grab the game status
  const gameRef = ref(rtdb,`game-statuses/${gameid}`);
  
  const gameStatus = await get(gameRef).then((result) => result.val());
  //If the game exists, read the data
  if(!gameStatus){
    return 'Game does not exist';
  }
  if(gameStatus.started){
    return 'Game has already started';
  }
  if(gameStatus.finished){
    return 'Game has already finished';
  }
  const playersRef = ref(rtdb,`players/${gameid}`);
  const players = await get(playersRef).then((result) => result.val());
  const playerSet = new Set(Object.values(players));

  if(playerSet.has(username)){
    return 'That name is already taken in this game';
  }

  //If there are no issues, push in the new player
  const newPlayerRef = ref(rtdb,`players/${gameid}/${generatePriority(new Set(Object.values(players)))}`);
  set(newPlayerRef,username);

  return true;
}



export async function createLobby(gameid,username){
  set(ref(rtdb,`game-statuses/${gameid}`),{started:false,finished:false});
  const newPlayerRef = ref(rtdb,`players/${gameid}/${generatePriority()}`);
  set(newPlayerRef,username);
}

export async function listGameStatus(){
  const statusesRef = ref(rtdb,'game-statuses');
  return get(statusesRef).then((statusList)=>statusList.val());
}
