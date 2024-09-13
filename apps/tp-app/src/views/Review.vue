<script setup>
import 'byfo-components/tp-review-chat';
import 'byfo-components/tp-metadata-modal';
import { sortNames, decodePath, encodePath } from 'byfo-utils/rollup';
import { ref, inject, computed } from 'vue';
import { useRoute } from 'vue-router';

const store = inject('TpStore');
const firebase = inject('Firebase');
const route = useRoute();
const gameid = route.params.gameid;
const searchedPlayer = route.query?.stack;

const encodedPlayers = new Set()
const players = await firebase.getPlayers(gameid).then(idMap => Object.values(idMap).map(({username}) => {
  encodedPlayers.add(encodePath(username)); 
  return username;
})).then(sortNames);
const metadataModal = ref(null);

const openMetadata = () => {
  metadataModal.value.enabled ||= true;
}
const {location:{hash}} = window;
const selected = ref(hash && encodedPlayers.has(hash) ? hash : '');
const tempShowAllFlag = ref(false);

const playerSelector = ref(null);
const showCollapse = computed(() => {
  if(!playerSelector.value) return false;
  const height = playerSelector.value.getBoundingClientRect().height;
  const screenHeight = window.innerHeight;
  return height/screenHeight > 0.16;
});
const collapsed = ref(false);
const toggleCollapse = () => {
  if(!showCollapse){
    collapsed.value = false;
    return;
  }
  collapsed.value = !collapsed.value;
}

const clickPlayer = username => {
  selected.value = encodePath(username);
  let newURL = window.location.href;
  const queryParam = `?stack=${username}`
  if(window.location.search){
    newURL = newURL.replace(/\?stack=[^?&]+/,queryParam);
  } else {
    if(window.location.hash){
      newURL = newURL.replace('#',`?stack=${queryParam}#`);
    } else {
      newURL += queryParam;
    }
  }
  history.replaceState({},null,newURL);
  if(showCollapse.value && !collapsed.value){
    toggleCollapse();
  }
};

// Check if we're coming out of a game
const self = searchedPlayer ?? store.username;
if (self && encodedPlayers.has(self)) {
  clickPlayer(self);
}

//Check for temporary "Show All" cases, or listen for setting changes otherwise
const target = sessionStorage.getItem('fromSearch');
sessionStorage.removeItem('fromSearch');

if (target && encodedPlayers.has(target)) {
  tempShowAllFlag.value = true;
  clickPlayer(target);
}

//Once all of the loading is done, and any effects happened, clear the backed up game data
store.clearGameData();
</script>

<template>
  <h2>Game {{ gameid }}<byfo-icon icon='statistics' title='Game details' @click="openMetadata"/></h2> 
  <div id="playerSelector" :class="collapsed ? 'collapsed' : ''" ref="playerSelector">
    <p v-if="showCollapse" @click="toggleCollapse">▶</p>
    <button @click="() => clickPlayer(player)" v-for="player in players" class="small" :class="{ selected: encodePath(player) === selected }">
      {{ player }}
    </button>
  </div>
  <section class="stack" v-if="selected">
    <byfo-review-chat :gameid="gameid" :stackName="selected" :showAllOverride="tempShowAllFlag"></byfo-review-chat>
  </section>
  <section class="unselected stack" v-else>
    <h3 class='really needs-backdrop'>Select a stack to begin viewing</h3>
  </section>
  <byfo-metadata-modal :gameid="gameid" ref="metadataModal"></byfo-metadata-modal>
</template>

<style>
#app {
  overflow: hidden;
  height: 100vh;
}

#playerSelector {
  width: 92%;
  max-width: 1050px;
  line-height: 3rem;
  flex: none;
  margin-bottom: 1rem;
  user-select: none;
  text-align: center;
  
  & > p{
    cursor: pointer;
    position:absolute;
    top: 0;
    left: 0;
    transform:rotate(90deg);
  }

  &.collapsed {
    height:3rem;
    overflow-y: hidden;

    & > p{
      transform:rotate(0);
    }
  }

  & > button:not(:first-child) {
    margin: auto;
    margin-left: 0.5rem;
  }
}

.stack {
  flex-grow: 1;
  overflow: hidden;
  align-items: center;
  width: 100%;
  max-width: 900px;
  margin-bottom: 1.5rem;

  &.unselected {
    padding: 1rem;
    & h3 {
      line-height: 3.5rem;
      text-align: center;
    }
  }
}

byfo-icon[icon='statistics']{
  display: inline-flex;
  margin-left: 0.5rem;
  height: 1em;
  width: 1em;
  padding: 0.1em;
  cursor: pointer;
  border: 1px solid var(--color-text);
  border-radius: 0.5em;
}
</style>
