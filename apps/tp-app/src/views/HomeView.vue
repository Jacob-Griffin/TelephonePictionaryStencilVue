<script setup>
import { inject, onBeforeUnmount, ref } from 'vue';
import 'byfo-components/tp-routing-modal';
import 'byfo-components/tp-tutorial-modal';

const store = inject('TpStore');
const firebase = inject('Firebase');
const year = inject('CurrentYear');
const modalEl = ref(null);
const tutorialModal = ref(null);

if (window.location.hash === '#enable-tutorial') {
  localStorage.setItem('tutorial', 'true');
} else if (window.location.hash === '#disable-tutorial') {
  localStorage.removeItem('tutorial');
}
const tutorialVisible = !!localStorage.getItem('tutorial');

const switchModal = event => {
  modalEl.value.rejoin = store.getRejoinData();
  modalEl.value.type = event?.target.getAttribute('modal') ?? '';
  modalEl.value.enabled = true;
};

const viewTutorial = () => {
  tutorialModal.value.enabled = true;
};

const handleHost = ({ detail: { gameid, name } }) => {
  store.setHosting(gameid);
  store.setUsername(name);
  store.setGameid(gameid);
  store.setRejoinNumber(undefined);
  if (gameid > 999999) {
    location.href = `/game/${gameid}`;
  } else {
    location.href = `/lobby/${gameid}`;
  }
};

const handleJoin = ({ detail: { dest, gameid, playerid, name } }) => {
  store.setRejoinNumber(playerid);
  store.setUsername(name);
  store.setGameid(gameid);
  if (dest === 'lobby') {
    location.href = `/lobby/${gameid}`;
    return;
  }
  if (dest === 'game') {
    location.href = `/game/${gameid}`;
    return;
  }
};

const handleResults = ({ detail: { gameid } }) => {
  location.href = `/review/${gameid}`;
  return;
};

const handleSearch = () => {
  location.href = `/search`;
  return;
};

document.addEventListener('tp-modal-action-host', handleHost);
document.addEventListener('tp-modal-action-join', handleJoin);
document.addEventListener('tp-modal-action-result', handleResults);

onBeforeUnmount(() => {
  document.removeEventListener('tp-modal-action-host', handleHost);
  document.removeEventListener('tp-modal-action-join', handleJoin);
  document.removeEventListener('tp-modal-action-result', handleResults);
});
</script>

<template>
  <main>
    <byfo-logo />
    <div class="buttonMenu">
      <button @click="switchModal" modal="join">Join Game</button>
      <button @click="switchModal" modal="host">Host Game</button>
      <button @click="switchModal" modal="result">View Completed Games</button>
      <button @click="handleSearch" modal="search">Search Completed Games</button>
      <button @click="viewTutorial" v-if="tutorialVisible">How to play</button>
    </div>
    <tp-routing-modal ref="modalEl" :firebase="firebase"></tp-routing-modal>
    <tp-tutorial-modal ref="tutorialModal"></tp-tutorial-modal>
  </main>
  <footer>
    <p>Copyright ©{{ year }} Jacob&nbsp;Griffin, Melinda&nbsp;Morang, Sarah&nbsp;Griffin. All rights reserved</p>
  </footer>
</template>

<style>
.buttonMenu {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 2rem;
  max-width: 768px;
  gap: 1rem;
  & > button:first-child {
    background-color: var(--color-important);
  }
}

footer {
  background-color: var(--color-brand);
  color: var(--color-button-text);
  width: 100vw;
  height: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-inline: 1rem;
  text-align: center;
}
</style>
