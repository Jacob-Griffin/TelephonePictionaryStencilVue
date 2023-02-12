import { rtdb } from "../../Firebase";
import { ref, get, set } from "firebase/database";

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

  for(let existingUser of Object.values(players)){
    if(existingUser.username === username){
      return 'That name is already taken in this game';
    }
  }

  //If there are no issues, push in the new player
  const newPlayerRef = ref(rtdb,`players/${gameid}/${generatePriority(new Set(Object.keys(players)))}`);
  set(newPlayerRef,{username,status:'pending'});

  return true;
}

export function createLobby(gameid,username){
  set(ref(rtdb,`game-statuses/${gameid}`),{started:false,finished:false});
  const newPlayerRef = ref(rtdb,`players/${gameid}/${generatePriority()}`);
  set(newPlayerRef,{username,status:'pending'});
}

export async function listGameStatus(){
  const statusesRef = ref(rtdb,'game-statuses');
  return get(statusesRef).then((statusList)=>statusList.val());
}

export function submitReady(usernumber,gameid,readyStatus){
  const statusRef = ref(rtdb,`players/${gameid}/${usernumber}/status`);
  const newStatus = readyStatus ? "ready" : "pending";
  set(statusRef,newStatus);
}
