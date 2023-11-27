<script setup>
import { rtdb } from '../../Firebase';
import { ref as dbRef, get, onValue, onDisconnect } from 'firebase/database';
import { beginGame, turnInMissing } from '../firebase/rtdb';
import { onMounted, toRaw } from 'vue';
import { config, sortNames } from 'byfo-utils';
import { useRoute } from 'vue-router';
import { ref, inject } from 'vue';

const store = inject('TpStore');

const players = ref([]);
const gameid = useRoute().params.gameid;

const roundLength = ref(180000);
const timeError = ref('');

const startGame = async () => {
  await beginGame(gameid, roundLength.value);
  location.href = `/game/${gameid}`;
};

//Before Mount
const rejoinNumber = store.rejoinNumber;
if (rejoinNumber) {
  const rejoined = await turnInMissing(gameid, rejoinNumber);
  if (!rejoined) {
    //If a rejoin number exists, but the data doesn't match, you're not supposed to be here
    location.href = '/';
  }
}

const playerListRef = dbRef(rtdb, `players/${gameid}`);
const playerList = await get(playerListRef).then(list => list.val());
const rawPlayers = Object.values(toRaw(playerList));
//Players by default are sorted by their priority. That is, the player order is generated as they join
//This realphabetizes the players for displaying in the lobby's list
players.value = sortNames(rawPlayers, 'username');

for (const playerNumber in playerList) {
  if (playerList[playerNumber]?.username === store.username) {
    const myStatusRef = dbRef(rtdb, `players/${gameid}/${playerNumber}/status`);
    onDisconnect(myStatusRef).set('missing');
  }
}

onValue(playerListRef, snapshot => {
  const playerList = snapshot.val();
  const rawPlayers = Object.values(toRaw(playerList));
  players.value = sortNames(rawPlayers, 'username');

  let isInGame = false;

  for (let playerNumber in rawPlayers) {
    if (rawPlayers[playerNumber].username == store.username) {
      isInGame = true;
    }
  }

  if (!isInGame) {
    //If we discover that we're not supposed to be in this game, kick back to the home screen
    location.href = '/';
    return;
  }
});

const gameStatusRef = dbRef(rtdb, `game-statuses/${gameid}`);

//Subscribe to the game's status to see if it started
onValue(gameStatusRef, snapshot => {
  const status = snapshot.val();
  //On the off chance that you jumped into a lobby of a finished game, redirect to the results
  if (status.finished) {
    location.href = `/results/${gameid}`;
    return;
  }
  //If the game started, go to the gameplay page
  if (status.started) {
    location.href = `/game/${gameid}`;
    return;
  }
});

onMounted(() => {
  document.addEventListener('byfo-time-input', ({ detail }) => {
    console.log(detail);
    roundLength.value = detail.value;
    timeError.value = detail.timeError;
  });
});
</script>

<template>
  <main class="page-wrapper">
    <h2 class="needs-backdrop">Game {{ gameid }}</h2>
    <section class="playerlist">
      <p v-for="player in players">{{ player.username }}</p>
    </section>
    <div class="flex-col" v-if="store.hosting == gameid">
      <p class="needs-backdrop">Round length:</p>
      <byfo-time-input :max-minutes="config.maxRoundLength" init-value="3:00" placeholder="∞" />
      <p v-if="timeError" class="error-text">{{ timeError }}</p>
      <button :disabled="!roundLength" @click="startGame">Start Game</button>
    </div>
    <div class="flex-col needs-backdrop" v-else>
      <p>Waiting for host</p>
    </div>
  </main>
</template>

<style>
.page-wrapper {
  justify-content: center;
  gap: 2rem;
}
</style>
