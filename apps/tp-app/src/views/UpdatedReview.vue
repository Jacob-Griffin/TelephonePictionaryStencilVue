<script setup>
import 'byfo-components/dist/components/tp-content';
import 'byfo-components/dist/components/tp-review-chat';
import { getGameData } from '../firebase/firestore';
import { sortNames } from '../utils/strings';
import { ref, reactive, inject } from 'vue';
import { useRoute } from 'vue-router';

const store = inject('TpStore');
const gameid = useRoute().params.gameid;

const stacks = await getGameData(gameid);
const players = sortNames(Object.keys(stacks));
const imagesCached = new Set();

const selected = ref('');
const showAllFlag = ref(!!store.alwaysShowAll);

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
const self = localStorage.getItem('username');
if (self && self in stacks) {
  clickPlayer(self);
}
//Once the page knows who you are, you are officially done with the game
//Get rid of this so things behave as expected afterwards (anonymously)
localStorage.removeItem('username');

//Check for temporary "Show All" cases, or listen for setting changes otherwise
const target = sessionStorage.getItem('fromSearch');
sessionStorage.removeItem('fromSearch');

if (target && target in stacks) {
  showAllFlag.value = true;
  clickPlayer(target);
} else {
  console.log('added listener');
  document.addEventListener('tp-settings-changed', ({ detail }) => {
    const { setting, value } = detail;
    console.log(detail);
    if (setting === 'alwaysShowAll') {
      console.log('setting to ', value);
      showAllFlag.value = value;
    }
  });
}
</script>

<template>
  <div class="playerSelector">
    <button @click="() => clickPlayer(player)" v-for="player in players" class="small" :class="{ selected: player == selected }">
      {{ player }}
    </button>
  </div>
  <section class="stack" v-if="selected">
    <tp-review-chat :showAll="showAllFlag" :stackProxy.prop="stacks[selected]"></tp-review-chat>
  </section>
  <section class="stack" v-else>
    <h4>Select a stack to begin viewing</h4>
  </section>
</template>

<style>
#app {
  overflow: hidden;
  height: 100vh;
}

.playerSelector {
  width: 92%;
  max-width: 1050px;
  line-height: 3rem;
  flex: none;
  margin-bottom: 1rem;
  user-select: none;
  text-align: center;
}

.playerSelector > button:not(:first-child) {
  margin: auto;
  margin-left: 0.5rem;
}

::-webkit-scrollbar {
  background: none;
}

::-webkit-scrollbar-track {
  background: none;
}

::-webkit-scrollbar-button {
  display: none;
}

::-webkit-scrollbar-thumb {
  border-radius: 0.5rem;
  background-color: var(--scroll-color);
}

.stack {
  display: flex;
  flex-direction: column;
  flex-shrink: 1;
  height: 100vh;
  min-height: 0;
  align-items: center;
  width: 100%;
  max-width: 900px;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

h4 {
  font-size: large;
  font-weight: 500;
  background-color: var(--color-backdrop);
  padding: 0.5rem 1.5rem;
  border-radius: 1rem;
}

.dark h4 {
  background-color: var(--selector-backdrop);
}
</style>
