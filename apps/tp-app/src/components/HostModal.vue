<script setup>
import { validUsername, invalidCharactersList } from '../utils/expressions';
import { listGameStatus, createLobby, createDevGame } from '../firebase/rtdb';
import { inject, ref, computed } from 'vue';

const store = inject('TpStore');

const username = ref('');
const hostError = ref('');

const isDisabled = computed(() => {
  const isValidName = validUsername(username.value);
  if (!isValidName) {
    if (username.value !== 0) {
      //If the username exists and is invalid for other reasons, say why
      hostError.value = `Names cannot contain ${invalidCharactersList(this.username)}`;
    }
    return true;
  } else if (typeof isValidName === 'string') {
    hostError.value = isValidName;
  } else if (hostError.value && hostError.value.startsWith('Names cannot')) {
    //If the name was valid and that was the current error, clear it
    hostError.value = false;
  }
  return false;
});

const createGame = async () => {
  const user = username.value;
  if (!validUsername(user)) {
    return false;
  }

  const gameStatuses = await listGameStatus();
  // Check which gameIds were/are in use via firestore, then generate one that's not there
  const usedIds = new Set(Object.keys(gameStatuses));

  const devGame = user.match(/Jacob-dev-test-(draw|write)/i);
  if (devGame) {
    const devGameId = createDevGame(devGame, Math.max(...usedIds) + 1);
    return devGameId;
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
  await createLobby(newId, user);

  //Pass this id back so we can route the player to the lobby
  return newId;
};

const joinGame = async () => {
  const gameid = await createGame();
  if (!gameid) {
    return;
  }
  store.setHosting(gameid);
  store.setUsername(username.value);
  store.setGameid(gameid);
  if (gameid > 999999) {
    location.href = `/game/${gameid}`;
  } else {
    location.href = `/lobby/${gameid}`;
  }
  return;
};
</script>

<template>
  <div class="modal">
    <article>
      <h1>Host a game</h1>
      <button class="close" @click="$emit('modal-closed')">
        <byfo-icon icon="x"></byfo-icon>
      </button>
      <p>Name:</p>
      <input id="name-input" type="text" v-model="username" />
      <p class="error-text" v-if="hostError">{{ hostError }}</p>
      <button class="main-action" :disabled="isDisabled" @click="joinGame">Host</button>
    </article>
  </div>
</template>

<style>
@import '../assets/modal.css';
</style>
