<script>
import { rtdb } from "../../Firebase";
import { ref, get, onValue } from "firebase/database";
import { submitReady, beginGame } from "../firebase/rtdb";
import { toRaw } from "vue";
export default {
  data() {
    return {
      players: [],
      self: window.sessionStorage.getItem("username"),
      priority: undefined,
      hosting: window.sessionStorage.getItem("hosting"),
      ready: true,
      canStart: false,
      roundLengthInput: "3:00",
    };
  },
  computed: {
    gameid() {
      return this.$route.params.gameid;
    },
    //Players by default are sorted by there priority. That is, the player order is generated as they join
    //This realphabetizes the players for displaying in the lobby's list
    sortedPlayers() {
      let newList = Object.values(toRaw(this.players));
      newList.sort(
        (a, b) =>
          a.username &&
          b.username &&
          a.username.localeCompare(b.username, "en", { sensitivity: "base" })
      );
      return newList;
    },
    roundLength() {
      const input = this.roundLengthInput;
      const matches = input.match(/^([0-9]+):?([0-9]*)$/);
      if (matches === null) {
        return false;
      }
      let seconds = parseInt(matches[1]);
      if (matches[2]) {
        let minutes = seconds;
        seconds = parseInt(matches[2]) + minutes * 60;
      }
      return seconds * 1000; //Unix timestamps, like we use are in ms
    },
  },
  methods: {
    readyClicked() {
      this.ready = !this.ready;
      if (this.priority) {
        submitReady(this.priority, this.gameid, this.ready);
      }
    },
    timerInputHandler(event) {
      this.roundLengthInput = event.target.value;
    },
    async startGame() {
      await beginGame(this.gameid, this.roundLength);
      window.open(`/game/${this.gameid}`, "_self");
    },
  },
  async beforeMount() {
    const playerListRef = ref(rtdb, `players/${this.gameid}`);
    const playerList = await get(playerListRef).then((list) => list.val());
    this.players = playerList;

    onValue(playerListRef, (snapshot) => {
      const playerList = snapshot.val();
      this.players = playerList;

      let allReady = true;
      let isInGame = false;

      for (let playerNumber in this.players) {
        if (this.players[playerNumber].status == "pending") {
          allReady = false;
        }
        if (this.players[playerNumber].username == this.self) {
          this.priority = playerNumber;
          isInGame = true;
        }
      }

      if (!isInGame) {
        //If we discover that we're not supposed to be in this game, kick back to the home screen
        window.open("/", "_self");
      }
      this.canStart = allReady;
    });

    const gameStatusRef = ref(rtdb, `game-statuses/${this.gameid}`);

    //Subscribe to the game's status to see if it started
    onValue(gameStatusRef, (snapshot) => {
      const status = snapshot.val();
      //On the off chance that you jumped into a lobby of a finished game, redirect to the results
      if (status.finished) {
        window.open(`/results/${this.gameid}`, "_self");
        return;
      }
      //If the game started, go to the gameplay page
      if (status.started) {
        window.open(`/game/${this.gameid}`, "_self");
        return;
      }
    });
  },
};
</script>

<template>
  <main class="page-wrapper">
    <h2>Game {{ gameid }}</h2>
    <section class="playerlist">
      <div v-for="player in sortedPlayers">
        <p>{{ player.username }}</p>
        <span :class="player.status">{{
          player.status === "ready" ? "✓" : "•"
        }}</span>
      </div>
      <button class="small" @click="readyClicked">
        {{ ready ? "Set Not Ready" : "Set Ready" }}
      </button>
    </section>
    <div class="flex-col" v-if="hosting == gameid">
      <p>Round length: (seconds or minutes:seconds)</p>
      <input type="text" @input="timerInputHandler" value="3:00" />
      <button :disabled="!canStart || !roundLength" @click="startGame">
        Start Game
      </button>
    </div>
  </main>
</template>

<style>
.page-wrapper {
  justify-content: center;
  gap: 2rem;
}
</style>
