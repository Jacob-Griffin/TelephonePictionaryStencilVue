<script>
import {
  validGameId,
  validUsername,
  invalidCharactersList,
} from "../utils/expressions.js";

export default {
  data() {
    return {
      gameid: "",
      username: "",
      joinError: false,
    };
  },
  computed: {
    isDisabled() {
      if (!validUsername(this.username)) {
        if(this.username.length !== 0){
          //If the username exists and is invalid for other reasons, say why
          this.joinError = `Names cannot contain ${invalidCharactersList(
            this.username
          )}`;
          return true;
        }
        
      } else if (this.joinError && this.joinError.startsWith("Names cannot")) {
        //If the name was valid and that was the current error, clear it
        this.joinError = false;
      }
      
      if (!validGameId(this.gameid)) {
        if(this.gameid?.length){
          //If the username exists and is invalid for other reasons, say why
          this.joinError = 'Game Id must be 1-6 digits'
          return true;
        }
      } else if (this.joinError && this.joinError.startsWith("Game Id must")) {
        //If the name was valid and that was the current error, clear it
        this.joinError = false;
      }

      return !(
        this.gameid &&
        validGameId(this.gameid) &&
        this.username &&
        validUsername(this.username)
      );
    },
  },
  methods: {
    joinGame() {
      /*
      if(game started check){
        this.joinError =  `Game ${gameid} has already been started`;
        return;
      }

      if(name in game){
        this.joinError =  `Name already used in game ${gameid}`;
        return;
      }

      if(game doesn't exist){
        this.joinError =  `Game ${this.gameid} doesn't exist`
        return;
      }
      */

      if (!validGameId(this.gameid)) {
        this.joinError = `Please input a valid gameId`;
        return;
      }

      //If we made it past all the checks, navigate to the game, storing username
      document.cookie = `username=${this.username} path=/`;
      window.open(`/game/${this.gameid}`, "_self");
      return;
    },
  },
};
</script>

<template>
  <div class="modal">
    <article>
      <h1>Join a game</h1>
      <button class="close" @click="$emit('modal-closed')">x</button>
      <p>Name:</p>
      <input id="name-input" type="text" v-model="username" />
      <p>Game Id:</p>
      <input type="text" v-model="gameid" />
      <p class="error-text" v-if="joinError">{{ joinError }}</p>
      <button class="main-action" :disabled="isDisabled" @click="joinGame">
        Join
      </button>
    </article>
  </div>
</template>

<style>
@import "../assets/modal.css";
</style>
