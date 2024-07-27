<script setup>
import 'byfo-components/tp-player-list';
import { onMounted } from 'vue';
import { config, sortNamesBy } from 'byfo-utils/rollup';
import { useRoute } from 'vue-router';
import { ref, inject } from 'vue';

const store = inject('TpStore');
const firebase = inject('Firebase');

const players = ref([]);
const gameid = useRoute().params.gameid;

const showCopied = ref(false);
let copiedTimeout = null;

const roundLength = ref(180000);
const timeError = ref('');

const startGame = async () => {
  if(players.value.length < config.minPlayers){
    return;
  }
  await firebase.beginGame(gameid, roundLength.value);
  location.href = `/game/${gameid}`;
};

//Before Mount
const rejoinNumber = store.rejoinNumber;
if (rejoinNumber) {
  const rejoined = await firebase.turnInMissing(gameid, rejoinNumber);
  if (!rejoined) {
    //If a rejoin number exists, but the data doesn't match, you're not supposed to be here
    location.href = '/';
  }
}

const playerList = await firebase.getWaitingPlayers(gameid);
const rawPlayers = Object.values(playerList);
//Players by default are sorted by their priority. That is, the player order is generated as they join
//This realphabetizes the players for displaying in the lobby's list
players.value = sortNamesBy(rawPlayers, 'username');

for (const playerNumber in playerList) {
  if (playerList[playerNumber]?.username === store.username) {
    firebase.attachMissingListener(gameid,playerNumber);
  }
}

firebase.attachPlayerListener(gameid, snapshot => {
  const playerList = snapshot.val();
  const rawPlayers = Object.values(playerList);
  players.value = sortNamesBy(rawPlayers, 'username');

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

//Subscribe to the game's status to see if it started
firebase.attachGameStatusListener(gameid, snapshot => {
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
  document.addEventListener('tp-time-input', ({ detail }) => {
    roundLength.value = detail.value;
    timeError.value = detail.timeError;
  });
});

const copyLink = () => {
  const link = `${location.origin}/join/${gameid}`;
  navigator.clipboard.writeText(link);
  showCopied.value = true;
  clearTimeout(copiedTimeout);
  copiedTimeout = setTimeout(()=>{showCopied.value = false;},3000);
}
</script>

<template>
  <main>
    <section>
      <h2 class="needs-backdrop">Game {{ gameid }}</h2>
      <button @click="copyLink" class="small">{{showCopied ? `✓ Copied` : `&#xFE0E;📋 Copy Game Link`}}</button>
    </section>
    <tp-player-list :players="players" :messageStart="'Waiting for players. Invite players with the game number or by sharing the join link above'" :messageEnd="`${players.length} players in lobby (${players.length < config.minPlayers ? `req. ${config.minPlayers}` : `max ${config.maxPlayers}`})`"/>
    <div id="host-controls" v-if="store.hosting == gameid">
      <p class="needs-backdrop">Round length in minutes:</p>
      <tp-time-input :max-minutes="config.maxRoundLength" init-value="3.0" placeholder="∞" />
      <p v-if="timeError" class="error-text">{{ timeError }}</p>
      <button :disabled="!roundLength || players.length < 3" @click="startGame">Start Game</button>
    </div>
  </main>
</template>

<style>
main {
  justify-content: center;
  gap: 1rem;
  & > section {
    width: 20ch;
    text-align: center;
  }
}

#host-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin: 0;
  padding: 0;
}
</style>
