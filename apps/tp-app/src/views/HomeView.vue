<script setup>
import { inject, onBeforeUnmount, ref } from 'vue';
import 'byfo-components/dist/components/tp-routing-modal';

const store = inject('TpStore');
const firebase = inject('Firebase');
const modalEl = ref(null);

const switchModal = event => {
  modalEl.value.rejoin = store.getRejoinData();
  modalEl.value.type = event?.target.getAttribute('modal') ?? '';
  modalEl.value.enabled = true;
};

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
    </div>
    <tp-routing-modal ref="modalEl" :firebase="firebase"></tp-routing-modal>
  </main>
  <footer>
    <p>Copyright ©2023 Jacob&nbsp;Griffin, Melinda&nbsp;Morang, Sarah&nbsp;Griffin. All rights reserved</p>
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
  height: 4rem;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-inline: 1rem;
  text-align: center;
}
</style>
