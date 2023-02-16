<script>
import "byfo-components/dist/components/tp-content";
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
      let players = Object.keys(this.stacks);
      return players.sort();
    },
    item() {
      return this.stacks[this.selected][this.currentIndex];
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
      if (this.currentIndex >= this.indices.length - 1) return;
      this.currentIndex += 1;
    },
    decrement() {
      if (this.currentIndex <= 0) return;
      this.currentIndex -= 1;
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
    keyHandler(event) {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        this.increment();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        this.decrement();
        return;
      }
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
    const self = window.sessionStorage.getItem("username");
    if (self) this.clickPlayer(self);
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
    <h4><strong>From:</strong> {{ stacks[selected][currentIndex].from }}</h4>
    <div class="main-row">
      <p @click="decrement" class="arrow">{{ currentIndex > 0 ? "<" : "" }}</p>
      <tp-content
        :content="stacks[selected][currentIndex].content"
        :type="stacks[selected][currentIndex].contentType"
      ></tp-content>
      <p @click="increment" class="arrow">
        {{ currentIndex < indices.length - 1 ? ">" : "" }}
      </p>
    </div>
    <div class="carousel-dots">
      <p
        v-for="index in indices"
        :class="index == currentIndex ? 'dot dot-selected' : 'dot'"
        @click="() => (currentIndex = index)"
      >
        •
      </p>
    </div>
  </section>
  <button @click="goHome">Return to home</button>
</template>

<style>
.playerSelector {
  width: 92%;
  max-width: 1280px;
  height: 3.5rem;
  overflow-x: scroll;
  white-space: nowrap;
  margin-bottom: 1rem;
  padding: 0.2rem;
  user-select: none;
}

.playerSelector > button:not(:first-child) {
  margin: auto;
  margin-left: 0.5rem;
}

::-webkit-scrollbar {
  height: 4px;
  background: none;
}

::-webkit-scrollbar-track {
  width: 4px;
  background: none;
}

::-webkit-scrollbar-button {
  display: none;
}

::-webkit-scrollbar-thumb {
  width: 4px;
  border-radius: 2px;
  background-color: var(--scroll-color);
}

.main-row {
  width: 100%;
  display: flex;
  align-items: center;
  font-size: xx-large;
  gap: 0.5rem;
}

.arrow {
  cursor: pointer;
  flex-grow: 1;
  width: 4%;
  user-select: none;
  text-align: center;
  background-color: var(--selector-backdrop);
  padding-bottom: 0.25rem;
  border-radius: 0.5rem;
}

.arrow:empty {
  background-color: rgba(0, 0, 0, 0);
}

.main-row tp-content {
  flex-grow: 48;
}

.dot {
  color: var(--feature-unselected-color);
}

.dot-selected {
  color: var(--feature-selected-color);
}

.carousel-dots {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  width: fit-content;
  gap: 0.25rem;
  cursor: pointer;
  user-select: none;
  font-size: 2rem;
  font-weight: 900;
  background-color: var(--selector-backdrop);
  padding: 0 1rem;
  border-radius: 0.5rem;
}

section {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1150px;
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

strong {
  font-weight: 700;
}
</style>
