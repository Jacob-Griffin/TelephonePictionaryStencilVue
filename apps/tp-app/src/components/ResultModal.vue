<script>
export default {
  data() {
    return {
      gameid: "",
      findError: false,
    };
  },
  methods: {
    reviewGame() {
      /*
      if(game is not finished){
        this.findError = `Game ${this.gameid} has not yet finished`;
        return;
      }

      if(game does not exist){
        this.findError = `Game ${this.gameid} does not exist`;
        return;
      }
      */
      // If we made it past all the checks, navigate to the results
      //window.open(`/results/${this.gameid}`,'_self');
      //This is disabled until we have results to look at
      this.findError = "Results not yet supported";
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
