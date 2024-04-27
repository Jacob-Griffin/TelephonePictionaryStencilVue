<script setup>
import 'byfo-components/tp-content';
import 'byfo-components/tp-review-chat';
import 'byfo-components/tp-icon';
import 'byfo-components/tp-metadata-modal';
import { sortNames } from 'byfo-utils/rollup';
import { ref, inject, computed } from 'vue';
import { useRoute } from 'vue-router';

const store = inject('TpStore');
const firebase = inject('Firebase');
const route = useRoute();
const gameid = route.params.gameid;
const searchedPlayer = route.query?.stack;

const stacks = await firebase.getGameData(gameid);
const players = sortNames(Object.keys(stacks));
const imagesCached = new Set();

const metadata = await firebase.getGameMetadata(gameid);
const metadataModal = ref(null);

const openMetadata = () => {
  metadataModal.value.metadata = metadata;
  metadataModal.value.gameid = gameid;
  metadataModal.value.enabled ||= true;
}

const selected = ref('');
const showAllFlag = ref(!!store.alwaysShowAll);

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

const cacheImage = (player, idx) => {
  const imgURL = stacks[player][idx].content;
  //If we already cached this image, move on
  if (imagesCached.has(imgURL)) return;

  //Otherwise, grab it
  fetch(imgURL, { mode: 'no-cors' });
  //We don't actually need to do anything with the fetched data,
  //we're just pre-emptively grabbing it so that the page can use the cached version instantly instead of waiting
  imagesCached.add(imgURL);
};

const clickPlayer = username => {
  selected.value = username;
  if (!showAllFlag.value) {
    for (let i = 1; i < players.length; i += 2) {
      //Go through odd rounds and pre-emptively grab the images so that they instant-load on view
      cacheImage(username, i);
    }
  }
  if(showCollapse.value && !collapsed.value){
    toggleCollapse();
  }
};

//If the user wasn't looking for something specific, and has the show all flag on, precache the beginning of each stack
if (showAllFlag.value) {
  players.forEach(username => {
    //Get the first (up to) 3 images from each stack if the show all flag is on to avoid weird "laggy" appearance on switch
    //A player would have to be real fast to click and scroll to the 4th image before it could load
    //This does cost bandwidth to pre-cache every stack like this when the user may not look at all of them, but it's better than the weird lag effect.
    for (let i = 1; i < players.length && i <= 5; i += 2) {
      cacheImage(username, i);
    }
  });
}

// Check if we're coming out of a game
const self = searchedPlayer ?? store.username;
if (self && self in stacks) {
  clickPlayer(self);
}

//Check for temporary "Show All" cases, or listen for setting changes otherwise
const target = sessionStorage.getItem('fromSearch');
sessionStorage.removeItem('fromSearch');

if (target && target in stacks) {
  showAllFlag.value = true;
  clickPlayer(target);
} else {
  document.addEventListener('tp-settings-changed', ({ detail }) => {
    const { setting, value } = detail;
    if (setting === 'alwaysShowAll') {
      showAllFlag.value = value;
    }
  });
}

//Once all of the loading is done, and any effects happened, clear the backed up game data
store.clearGameData();
</script>

<template>
  <h2>Game {{ gameid }}<tp-icon icon='info' title='Game details' @click="openMetadata"/></h2> 
  <div id="playerSelector" :class="collapsed ? 'collapsed' : ''" ref="playerSelector">
    <p v-if="showCollapse" @click="toggleCollapse">▶</p>
    <button @click="() => clickPlayer(player)" v-for="player in players" class="small" :class="{ selected: player == selected }">
      {{ player }}
    </button>
  </div>
  <section class="stack" v-if="selected">
    <tp-review-chat :showAll="showAllFlag" :stackProxy.prop="stacks[selected]"></tp-review-chat>
  </section>
  <section class="unselected stack" v-else>
    <h3 class='really needs-backdrop'>Select a stack to begin viewing</h3>
  </section>
  <tp-metadata-modal ref="metadataModal"></tp-metadata-modal>
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

tp-icon[icon='info']{
  position: absolute;
  top: 0.48rem;
  right: -1.5rem;

  height: 1.32rem;
  width: 1.32rem;
  cursor: pointer;

  & > svg {
    top: -0.35rem;
  }
}
</style>
