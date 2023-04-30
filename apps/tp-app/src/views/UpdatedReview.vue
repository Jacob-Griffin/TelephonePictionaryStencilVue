<script>
import "byfo-components/dist/components/tp-content";
import "byfo-components/dist/components/tp-review-chat";
import { getGameData } from "../firebase/firestore";
export default {
  data() {
    return {
      stacks: {},
      selected: false,
      currentIndex: 0,
      contentElement: undefined,
      imagesCached: new Set(),
      globalListeners: {
        keydown: this.keyHandler,
      },
    };
  },
  computed: {
    gameid() {
      return this.$route.params.gameid;
    },
    players() {
      let newList = Object.keys(this.stacks);
      newList.sort(
        (a, b) => a.localeCompare(b, "en", { sensitivity: "base" })
      );
      return newList;
    },
    indices() {
      let array = [];
      for (let i = 0; i < Object.keys(this.stacks).length; i++) {
        array.push(i);
      }
      return array;
    },
  },
  methods: {
    clickPlayer(username) {
      this.selected = username;
      this.currentIndex = 0;
      for (let i = 1; i < Object.keys(this.stacks).length; i += 2) {
        //Go through odd rounds and pre-emptively grab the images so that they instant-load on view
        this.cacheImage(username, i);
      }
    },
    increment() {
      if (this.currentIndex >= Object.keys(this.stacks).length - 1) return;
      this.currentIndex += 1;
    },
    showAll(){
      this.currentIndex = Object.keys(this.stacks).length - 1;
    },
    cacheImage(player, idx) {
      const imgURL = this.stacks[player][idx].content;
      //If we already cached this image, move on
      if (this.imagesCached.has(imgURL)) return;

      //Otherwise, grab it
      fetch(imgURL, { mode: "no-cors" });
      //We don't actually need to do anything with the fetched data,
      //we're just pre-emptively grabbing it so that the page can use the cached version instantly instead of waiting
      this.imagesCached.add(imgURL);
    },
    goHome() {
      window.open("/", "_self");
    },
  },
  async beforeMount() {
    this.stacks = await getGameData(this.gameid);
    for (let event in this.globalListeners) {
      document.addEventListener(event, this.globalListeners[event]);
    }
    const self = window.localStorage.getItem("username");
    if (self && self in this.stacks) {
      this.clickPlayer(self);
    }
    //Once the page knows who you are, you are officially done with the game
    //Get rid of this so things behave as expected afterwards (anonymously)
    window.localStorage.removeItem("username");
  },
  beforeUnmount() {
    for (let event in this.globalListeners) {
      document.removeEventListener(event, this.globalListeners[event]);
    }
  },
};
</script>

<template>
  <div class="playerSelector">
    <button
      @click="() => clickPlayer(player)"
      v-for="player in players"
      class="small"
      :class="{ selected: player == selected }"
    >
      {{ player }}
    </button>
  </div>
  <section v-if="selected">
    <tp-review-chat :index="currentIndex" :stackProxy.prop="stacks[selected]"></tp-review-chat>
  </section>
  <div class="chatNavigator">
    <button class='small' v-if="selected" @click="increment">Next</button>
    <button class='small' v-if="selected" @click="showAll">Show All</button><br />
  </div>
  <button id="homeButton" @click="goHome">Return to home</button>
</template>

<style>

#app {
  overflow: hidden;
  height: 100vh;
}

.chatNavigator {
  display:flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  max-width: 30rem;
  width:fit-content;
  margin:1rem;
  flex:none;
}

#homeButton {
  flex:none;
  margin-bottom: .5rem;
}

.playerSelector {
  width: 92%;
  max-width: 1050px;
  height: 3.5rem;
  flex: none;
  overflow: hidden;
  white-space: nowrap;
  margin-bottom: 1rem;
  padding: 0.2rem;
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
  border-radius: .5rem;
  background-color: var(--scroll-color);
}

section {
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
