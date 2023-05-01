<script>
import "byfo-components/dist/components/tp-content";
import "byfo-components/dist/components/tp-review-chat";
import { getGameData } from "../firebase/firestore";
export default {
  data() {
    return {
      stacks: {},
      selected: false,
      showAllFlag: false,
      imagesCached: new Set(),
      viewedIndices: {},
      _playerAmount: undefined
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
    playerAmount(){
      if(!this._playerAmount){
        this._playerAmount = Object.keys(this.stacks).length;
      }
      return this._playerAmount;
    },
  },
  methods: {
    clickPlayer(username) {
      this.selected = username;
      for (let i = 1; i < this.playerAmount; i += 2) {
        //Go through odd rounds and pre-emptively grab the images so that they instant-load on view
        this.cacheImage(username, i);
      }
    },
    increment() {
      if (this.viewedIndices[this.selected] >= this.playerAmount - 1) return;
      this.viewedIndices[this.selected] += 1;
    },
    showAll(){
      this.viewedIndices[this.selected] = this.playerAmount - 1;
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
    const self = window.localStorage.getItem("username");
    if (self && self in this.stacks) {
      this.clickPlayer(self);
    }
    //Once the page knows who you are, you are officially done with the game
    //Get rid of this so things behave as expected afterwards (anonymously)
    window.localStorage.removeItem("username");

    //Check "Show All" cases

    //Origin: search
    const target = window.localStorage.getItem("fromSearch");
    if(target && target in this.stacks){
      this.showAllFlag = true;
      this.clickPlayer(target);
    }
    window.localStorage.removeItem("fromSearch");

    //Flag set (Not yet implemented)
    if(window.localStorage.getItem("alwaysShowAll")){
      this.showAllFlag = true;
    }

    //Set the "viewed indices to all or none based on show all flag"
    for(let player in this.stacks){
      this.viewedIndices[player] = this.showAllFlag ? this.playerAmount : 0
    }
  }
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
    <tp-review-chat :index="viewedIndices[selected]" :stackProxy.prop="stacks[selected]"></tp-review-chat>
  </section>
  <div class="chatNavigator" v-if="selected && !showAllFlag">
    <button class='small' @click="increment">Next</button>
    <button class='small' @click="showAll">Show All</button><br />
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
