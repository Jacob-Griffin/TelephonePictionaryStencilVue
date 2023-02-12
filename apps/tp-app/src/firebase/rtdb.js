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

export async function getGameStatus(gameid){
  const statusRef = ref(rtdb,`game-statuses/${gameid}`);
  return get(statusRef).then(status => status.val());
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

export async function beginGame(gameid){
  //List of outstanding promises, that way we can let them all run in parallel and only block for them at the end
  const promises = [];

  //Set up the round variable at 0
  const roundRef = ref(rtdb,`game/${gameid}/round`);
  set(roundRef,0);

  //Get the players
  const playerList = Object.values(await get(ref(rtdb,`players/${gameid}`)).then(players => players.val()));
  
  for(let i = 0; i < playerList.length; i++){
    const name = playerList[i].username;

    //Set up the player-to-from list
    const fromIdx = i-1 < 0 ? playerList.length-1 : i-1;
    const from = playerList[fromIdx].username;
    const to =   playerList[(i+1)%playerList.length].username;
    const newRef = ref(rtdb,`game/${gameid}/players/${name}`);
    promises.push(set(newRef,{to,from}));

    //Set up the stacks
    const stackRef = ref(rtdb,`game/${gameid}/stacks/${name}`);
    promises.push(set(stackRef,{}));
  }

  //Set the game status started to true
  const startedRef = ref(rtdb,`game-statuses/${gameid}/started`);
  promises.push(set(startedRef,true));

  await Promise.all(promises);
  return;
}
