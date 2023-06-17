import { rtdb } from '../../Firebase';
import { ref, get, set, onValue, remove } from 'firebase/database';
import { storeGame } from './firestore';
import { uploadImage } from './storage';
import globalLimits from '../globalLimits';

function generatePriority(taken = undefined) {
  let priority = Math.floor(Math.random() * 1000);
  while (taken && taken.has(priority)) {
    priority = Math.floor(Math.random() * 1000);
  }
  return priority;
}

function defaultImage() {
  //As it stands, a "false" image will prompt the content to point to a single existing "no image" image
  //If we had a dynamic image generation, it would go here
  return false;
}

function defaultText() {
  //If we had an API call for generating or suggesting these sorts of things, it would go here
  return 'Whoops, I forgot to submit something :(';
}

export async function addPlayerToLobby(gameid, username) {
  //Grab the game status
  const gameRef = ref(rtdb, `game-statuses/${gameid}`);

  const gameStatus = await get(gameRef).then(result => result.val());
  const result = {
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
  const playersRef = ref(rtdb, `players/${gameid}`);
  const players = await get(playersRef).then(result => result.val());

  // Check to make sure there isn't a rejoin or duplicate name
  for (let playerNumber in players) {
    const player = players[playerNumber];
    if (player.username === username) {
      if (player.status === 'missing') {
        return {
          action: 'join',
          detail: playerNumber,
        };
      }
      if (!gameStatus.started) {
        result.detail = 'Username already taken in game';
        return result;
      }
    }
  }

  if (gameStatus.started) {
    result.detail = 'Game has already started';
    return result;
  }

  if (players.length > globalLimits.maxPlayers) {
    result.detail = 'Too many players in game';
    return result;
  }

  //If there are no issues, push in the new player
  const newPlayerRef = ref(rtdb, `players/${gameid}/${generatePriority(new Set(Object.keys(players)))}`);
  set(newPlayerRef, { username, status: 'ready' });

  return { action: 'lobby' };
}

export function createLobby(gameid, username) {
  set(ref(rtdb, `game-statuses/${gameid}`), {
    started: false,
    finished: false,
  });
  const newPlayerRef = ref(rtdb, `players/${gameid}/${generatePriority()}`);
  set(newPlayerRef, { username, status: 'ready' });
}

export async function getGameStatus(gameid) {
  const statusRef = ref(rtdb, `game-statuses/${gameid}`);
  return get(statusRef).then(status => status.val());
}

export async function listGameStatus() {
  const statusesRef = ref(rtdb, 'game-statuses');
  return get(statusesRef).then(statusList => statusList.val());
}

export async function createDevGame([username, key], gameid) {
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

export async function beginGame(gameid, roundLength) {
  //List of outstanding promises, that way we can let them all run in parallel and only block for them at the end
  const promises = [];

  //Set up the round variable at 0
  const roundRef = ref(rtdb, `game/${gameid}/round`);
  const round0 = {
    roundnumber: 0,
    endTime: Date.now() + roundLength,
  };
  if (roundLength === -1) round0.endTime = -1;
  set(roundRef, round0);

  //Get the players
  const playerList = Object.values(await get(ref(rtdb, `players/${gameid}`)).then(players => players.val()));
  const staticRoundInfoRef = ref(rtdb, `game/${gameid}/staticRoundInfo`);
  set(staticRoundInfoRef, {
    lastRound: playerList.length - 1,
    roundLength,
  });
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

  //Set the game status started to true
  const startedRef = ref(rtdb, `game-statuses/${gameid}/started`);
  promises.push(set(startedRef, true));

  await Promise.all(promises);
  return;
}

export async function submitRound(gameid, name, round, roundData, staticRoundInfo) {
  let { contentType, content } = roundData;
  let savedContent = { contentType };
  if (!content) {
    //Blank images will be tested *before* generating a url and will be passed as ""
    if (contentType === 'image') {
      content = defaultImage();
    } else {
      content = defaultText();
    }
  }
  if (contentType === 'image') {
    savedContent.content = await uploadImage(gameid, name, round, content);
  } else {
    savedContent.content = content;
  }

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
  const newRoundData = {
    roundnumber: round + 1,
    endTime: Date.now() + staticRoundInfo.roundLength,
  };
  if (staticRoundInfo.roundLength === -1) newRoundData.endTime = -1;
  await set(roundRef, newRoundData);

  return;
}

export async function fetchCard(gameid, target, round) {
  const cardRef = ref(rtdb, `game/${gameid}/stacks/${target}/${round}`);
  let value = new Promise(resolve => {
    let unsub;
    unsub = onValue(cardRef, snapshot => {
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

export async function turnInMissing(gameid, number) {
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

export async function getToAndFrom(gameid, name) {
  const playerref = ref(rtdb, `game/${gameid}/players/${name}`);
  return get(playerref).then(result => result.val());
}

export async function getPlayerNumber(gameid, name) {
  const players = await get(ref(rtdb, `players/${gameid}`)).then(result => result.val());
  for (let num in players) {
    if (players[num].username === name) {
      return num;
    }
  }
  return undefined;
}

export async function getStaticRoundInfo(gameid) {
  const playerref = ref(rtdb, `game/${gameid}/staticRoundInfo`);
  return get(playerref).then(result => result.val());
}

export async function finalizeGame(gameid) {
  const allStacksRef = ref(rtdb, `game/${gameid}/stacks`);
  const playerref = ref(rtdb, `game/${gameid}/players`);

  const playerPromise = get(playerref).then(result => result.val());
  const stackData = await get(allStacksRef).then(snap => snap.val());
  const playerOrder = await playerPromise;

  const finalStackData = {};
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
