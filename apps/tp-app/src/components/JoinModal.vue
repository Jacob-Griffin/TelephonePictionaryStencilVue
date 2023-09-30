<script setup>
import { validGameId, validUsername, invalidCharactersList } from '../utils/expressions.js';
import { stopPropagation } from '../utils/event.js';
import { addPlayerToLobby } from '../firebase/rtdb.js';
import { ref, inject, computed } from 'vue';

const store = inject('TpStore');

const gameid = ref('');
const username = ref('');
const joinError = ref('');

if (store.username && store.gameid) {
  // This means that if we're holding onto current game data, autopopulate it
  gameid.value = store.gameid;
  username.value = store.username;
  joinError.value = 'Populated from incomplete game';
}

const isDisabled = computed(() => {
  const thisUsername = username.value;
  const isValidName = validUsername(thisUsername);
  if (!isValidName) {
    if (thisUsername.length !== 0) {
      //If the username exists and is invalid for other reasons, say why
      this.joinError = `Names cannot contain ${invalidCharactersList(thisUsername)}`;
      return true;
    }
  } else if (typeof isValidName === 'string') {
    joinError.value = isValidName;
    return true;
  } else if (joinError.value && joinError.value.startsWith('Names cannot')) {
    //If the name was valid and that was the current error, clear it
    joinError.value = '';
  }
  const thisGameid = gameid.value;
  if (!validGameId(thisGameid)) {
    if (thisGameid?.length) {
      //If the username exists and is invalid for other reasons, say why
      joinError.value = 'Game Id must be 1-6 digits';
      return true;
    }
  } else if (joinError.value && joinError.value.startsWith('Game Id must')) {
    //If the name was valid and that was the current error, clear it
    joinError.value = false;
  }

  return !(thisGameid && validGameId(thisGameid) && thisUsername && isValidName);
});

const joinGame = async () => {
  //Valid gameid and username are being checked by is disabled
  if (isDisabled.value) {
    return;
  }

  const gid = gameid.value;
  const user = username.value;

  //All other checks are handled by the db
  const result = await addPlayerToLobby(gid, user);
  switch (result.action) {
    case 'error':
      //If there is an error, it will be a string, pass it to the error area
      joinError.value = result.detail;
      //TODO: if game was finished, link to results, but don't redirect
      return;
    case 'join':
      store.setRejoinNumber(result.detail);
      store.setUsername(user);
      store.setGameid(gid);
      location.href = `/${result.dest}/${gid}`;
      return;
    case 'lobby':
      //If we're all good, navigate to the lobby
      store.setRejoinNumber(undefined);
      store.setUsername(user);
      store.setGameid(gid);
      location.href = `/lobby/${gid}`;
      return;
  }
};
</script>

<template>
  <div class="modal" @click="$emit('modal-closed')">
    <article @click="stopPropagation">
      <h1>Join a game</h1>
      <button class="close" @click="$emit('modal-closed')"><byfo-icon icon="x"></byfo-icon></button>
      <p>Name:</p>
      <input id="name-input" type="text" v-model="username" />
      <p>Game Id:</p>
      <input type="text" inputmode="numeric" v-model="gameid" />
      <p class="error-text" v-if="joinError">{{ joinError }}</p>
      <button class="main-action" :disabled="isDisabled" @click="joinGame">Join</button>
    </article>
  </div>
</template>

<style>
@import '../assets/modal.css';
</style>
