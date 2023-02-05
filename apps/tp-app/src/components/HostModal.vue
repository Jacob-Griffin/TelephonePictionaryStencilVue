<script>
import { validUsername, invalidCharactersList } from "../utils/expressions.js";

export default {
  data() {
    return {
      username: "",
      hostError: false,
    };
  },
  computed: {
    isDisabled() {
      if (!validUsername(this.username)) {
        if(this.username.length !== 0){
          //If the username exists and is invalid for other reasons, say why
          this.hostError = `Names cannot contain ${invalidCharactersList(
            this.username
          )}`;
        }
        return true;
      } else if (this.hostError && this.hostError.startsWith("Names cannot")) {
        //If the name was valid and that was the current error, clear it
        this.hostError = false;
      }
      return false;
    },
  },
  methods: {
    joinGame() {
      const gameid = this.createGame();
      window.name = this.username;
      document.cookie = `username=${this.username} path=/`;
      window.open(`/game/${gameid}`, "_self");
      return;
    },
    createGame() {
      if (!validUsername(this.username)) {
        return false;
      }

      // Check which gameIds were/are in use via firestore, then generate one that's not there
      const usedIds = new Set(
        /*Firestore check goes here. TEMP: no ids are used*/ []
      );

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
      /* */

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
        Join
      </button>
    </article>
  </div>
</template>

<style>
@import "../assets/modal.css";
</style>
