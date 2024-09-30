<script setup>
import { inject } from 'vue';
import { useRoute } from 'vue-router';

const store = inject('TpStore');
const gameid = useRoute().params.gameid;

document.addEventListener('tp-modal-action-join',({detail:{dest,gameid,playerid,name}})=>{
    store.setRejoinNumber(playerid);
    store.setUsername(name);
    store.setGameid(gameid);
  if(dest === 'lobby'){
    location.href = `/lobby/${gameid}`;
    return;
  }
  if(dest === 'game') {
    location.href = `/game/${gameid}`;
    return;
  }
})
</script>

<template>
  <main>
    <byfo-logo/>
    <section class="really needs-backdrop padding-wide-l">
      <byfo-routing-content :gameid="gameid" type="join"/>
    </section>
  </main>
</template>

<style>
main > byfo-logo {
    width: 30rem;
    max-width: 80vw;
    margin-inline: 3rem;
}
</style>