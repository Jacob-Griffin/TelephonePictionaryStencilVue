import { rtdb } from "../../Firebase";
import { ref, push, get, set } from "firebase/database";

export async function addPlayerToLobby(gameid, username):Promise<string|boolean> {
  //Grab the game
  const gameRef = ref(rtdb,`games/${gameid}`);
  if(!gameRef){
    return 'That game does not exist';
  }

  //If the game exists, read the data
  const gameInfo = await get(gameRef);
  const game = gameInfo.val();
  
  if(game.started){
    return 'Game has already started';
  }
  if(game.finished){
    return 'Game has already finished';
  }
  if(username in game.players){
    return 'That name is already taken in this game';
  }

  //If there are no issues, push in the new player
  const playersRef = ref(rtdb, `games/${gameid}/players`);
  const newPlayerRef = push(playersRef);
  set(newPlayerRef,username);

  return true;
}

export async function createLobby(gameid,username):Promise<string|boolean>{
  return false;
}

export async function getRound(gameid,username,round):Promise<{}>{
    return {
      content: '',
      contentType: 'text'
    }
}

export async function getRecipient(gameid,username):Promise<string>{
  return 'you';
}
