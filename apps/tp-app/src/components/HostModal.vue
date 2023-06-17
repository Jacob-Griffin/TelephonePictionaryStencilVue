<script>
import { validUsername, invalidCharactersList } from '../utils/expressions';
import { listGameStatus, createLobby, createDevGame } from '../firebase/rtdb';
export default {
  data() {
    return {
      username: '',
      hostError: false,
    };
  },
  computed: {
    isDisabled() {
      const isValidName = validUsername(this.username);
      if (!isValidName) {
        if (this.username.length !== 0) {
          //If the username exists and is invalid for other reasons, say why
          this.hostError = `Names cannot contain ${invalidCharactersList(
            this.username
          )}`;
        }
        return true;
      } else if (typeof isValidName === 'string') {
        this.hostError = isValidName;
      } else if (this.hostError && this.hostError.startsWith('Names cannot')) {
        //If the name was valid and that was the current error, clear it
        this.hostError = false;
      }
      return false;
    },
  },
  methods: {
    async joinGame() {
      const gameid = await this.createGame();
      if (!gameid) {
        return;
      }
      localStorage.setItem('hosting', gameid);
      localStorage.setItem('username', this.username);
      if (gameid > 999999) {
        location.href = `/game/${gameid}`;
      } else {
        location.href = `/lobby/${gameid}`;
      }
      return;
    },
    async createGame() {
      if (!validUsername(this.username)) {
        return false;
      }

      const gameStatuses = await listGameStatus();
      // Check which gameIds were/are in use via firestore, then generate one that's not there
      const usedIds = new Set(Object.keys(gameStatuses));

      const devGame = this.username.match(/Jacob-dev-test-(draw|write)/i);
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
      await createLobby(newId, this.username);

      //Pass this id back so we can route the player to the lobby
      return newId;
    },
  },
};
</script>

<template>
  <div class="modal">
    <article>
      <h1>Host a game</h1>
      <button class="close" @click="$emit('modal-closed')">x</button>
      <p>Name:</p>
      <input id="name-input" type="text" v-model="username" />
      <p class="error-text" v-if="hostError">{{ hostError }}</p>
      <button class="main-action" :disabled="isDisabled" @click="joinGame">
        Host
      </button>
    </article>
  </div>
</template>

<style>
@import '../assets/modal.css';
</style>
