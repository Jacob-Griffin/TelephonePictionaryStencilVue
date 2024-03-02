<script setup>
import { inject, onBeforeUnmount, ref } from 'vue';
import 'byfo-components/dist/components/tp-routing-modal';
import 'byfo-components/dist/components/tp-tutorial-modal';

const store = inject('TpStore');
const firebase = inject('Firebase');
const modalEl = ref(null);
const tutorialModal = ref(null);
const buildDate = ref(__BUILD_DATE__);

const switchModal = event => {
  modalEl.value.rejoin = store.getRejoinData();
  modalEl.value.type = event?.target.getAttribute('modal') ?? '';
  modalEl.value.enabled = true;
};

const viewTutorial = () => {
  tutorialModal.value.enabled = true;
}

document.addEventListener('tp-modal-action-host',({detail:{gameid,name}})=>{
  store.setHosting(gameid);
  store.setUsername(name);
  store.setGameid(gameid);
  store.setRejoinNumber(undefined);
  if (gameid > 999999) {
    location.href = `/game/${gameid}`;
  } else {
    location.href = `/lobby/${gameid}`;
  }
});

document.addEventListener('tp-modal-action-join',({detail:{dest,gameid,name}})=>{
  if(dest === 'lobby'){
    store.setRejoinNumber(undefined);
    store.setUsername(name);
    store.setGameid(gameid);
    location.href = `/lobby/${gameid}`;
    return;
  }
  if(dest === 'game') {
    store.setRejoinNumber(gameid);
    store.setUsername(name);
    store.setGameid(gameid);
    location.href = `/game/${gameid}`;
    return;
  }
})

document.addEventListener('tp-modal-action-result',({detail:{gameid}})=>{
  location.href = `/review/${gameid}`;
  return;
});
onBeforeUnmount(()=>{
  document.removeEventListener('tp-modal-action-host');
  document.removeEventListener('tp-modal-action-join');
  document.removeEventListener('tp-modal-action-result');
})
</script>

<template>
  <main>
    <div class="icon"></div>
    <div class="buttonMenu">
      <button @click="switchModal" modal="host">Host Game</button>
      <button @click="switchModal" modal="join">Join Game</button>
      <button @click="switchModal" modal="result">View Completed Games</button>
      <button @click="viewTutorial">How to play</button>
    </div>
    <tp-routing-modal ref="modalEl" :firebase="firebase"></tp-routing-modal>
    <tp-tutorial-modal ref="tutorialModal"></tp-tutorial-modal>
  </main>
  <footer>
    <p>Copyright ©{{buildDate.year}} Jacob&nbsp;Griffin, Melinda&nbsp;Morang, Sarah&nbsp;Griffin. All rights reserved</p>
    <p>Updated: {{buildDate.full}}</p>
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
}

footer {
  background-color: var(--color-brand);
  color: var(--color-button-text);
  width: 100vw;
  box-sizing: border-box;
  height: 6rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-inline: 1rem;
  text-align: center;
}
</style>
