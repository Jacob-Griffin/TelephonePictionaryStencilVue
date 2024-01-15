<script setup>
import { getGameStatus } from 'byfo-utils/firebase';
import { ref } from 'vue';
import { stopPropagation } from 'byfo-utils';

const gameid = ref('');
const findError = ref('');

const reviewGame = async () => {
  const status = await getGameStatus(gameid.value);
  if (!status) {
    findError.value = 'Game does not exist';
    return;
  }
  if (!status.finished) {
    findError.value = 'Game not finished';
    return;
  }
  // If we made it past all the checks, navigate to the results
  location.href = `/review/${gameid.value}`;
  return;
};
</script>

<template>
  <div class="modal" @click="$emit('modal-closed')">
    <article @click="stopPropagation">
      <h1>Review game results</h1>
      <button class="close" @click="$emit('modal-closed')">
        <tp-icon icon="x"></tp-icon>
      </button>
      <p>Game Id:</p>
      <input type="text" inputmode="numeric" v-model="gameid" />
      <p class="error-text" v-if="findError">{{ findError }}</p>
      <button class="main-action" @click="reviewGame">View</button>
    </article>
  </div>
</template>

<style>
@import '../assets/modal.css';
</style>
