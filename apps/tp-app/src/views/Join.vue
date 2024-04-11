<script setup>
import { inject } from 'vue';
import { useRoute } from 'vue-router';
import 'byfo-components/tp-logo';
import 'byfo-components/tp-join-content';

const store = inject('TpStore');
const firebase = inject('Firebase');
const gameid = useRoute().params.gameid;
const rejoinData = store.getRejoinData();

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
</script>

<template>
  <main>
    <tp-logo/>
    <tp-join-content :firebase="firebase" :gameid="gameid" :rejoinData="rejoinData"/>
  </main>
</template>

<style>
main > tp-logo {
    width: 30rem;
    max-width: 80vw;
    margin-inline: 3rem;
}
</style>