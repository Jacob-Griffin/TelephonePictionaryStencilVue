<script>
import { getGameStatus } from '../firebase/rtdb';

export default {
  data() {
    return {
      gameid: "",
      findError: false,
    };
  },
  methods: {
    async reviewGame() {
      const status = await getGameStatus(this.gameid)
      if(!status){
        this.findError = "Game does not exist";
        return;
      }
      if(!status.finished){
        this.findError = "Game not finished";
        return;
      }
      // If we made it past all the checks, navigate to the results
      window.open(`/review/${this.gameid}`,'_self');
      return;
    },
  },
};
</script>

<template>
  <div class="modal">
    <article>
      <h1>Review game results</h1>
      <button class="close" @click="$emit('modal-closed')">x</button>
      <p>Game Id:</p>
      <input type="text" v-model="gameid" />
      <p class="error-text" v-if="findError">{{ findError }}</p>
      <button class="main-action" @click="reviewGame">View</button>
    </article>
  </div>
</template>

<style>
@import "../assets/modal.css";
</style>
