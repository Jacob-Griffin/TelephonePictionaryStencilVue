<script>
import {
  validGameId,
  validUsername,
  invalidCharactersList,
} from "../utils/expressions.js";
import { addPlayerToLobby } from "../firebase/rtdb.js";

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
      const isValidName = validUsername(this.username);
      if (!isValidName) {
        if (this.username.length !== 0) {
          //If the username exists and is invalid for other reasons, say why
          this.joinError = `Names cannot contain ${invalidCharactersList(
            this.username
          )}`;
          return true;
        }
      } else if (typeof isValidName === 'string'){
        this.joinError = isValidName;
        return true;
      } else if (this.joinError && this.joinError.startsWith("Names cannot")) {
        //If the name was valid and that was the current error, clear it
        this.joinError = false;
      }

      if (!validGameId(this.gameid)) {
        if (this.gameid?.length) {
          //If the username exists and is invalid for other reasons, say why
          this.joinError = "Game Id must be 1-6 digits";
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
    async joinGame() {
      //Valid gameid and username are being checked by is disabled
      if (this.isDisabled) {
        return;
      }

      //All other checks are handled by the db
      const result = await addPlayerToLobby(this.gameid, this.username);
      if (typeof result == "string") {
        //If there is an error, it will be a string, pass it to the error area
        this.joinError = result;
        return;
      }
      //If we're all good, navigate to the lobby
      window.sessionStorage.setItem('username',this.username);
      window.open(`/lobby/${this.gameid}`, "_self");
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
