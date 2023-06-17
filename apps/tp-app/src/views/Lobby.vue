<script>
import { rtdb } from '../../Firebase';
import { ref, get, onValue } from 'firebase/database';
import { beginGame } from '../firebase/rtdb';
import { toRaw } from 'vue';
import globalLimits from '../globalLimits';
import { sortNames } from '../utils/strings';

export default {
  data() {
    return {
      players: [],
      self: window.localStorage.getItem('username'),
      priority: undefined,
      hosting: window.localStorage.getItem('hosting'),
      roundLengthInput: '3:00',
      timeError: '',
    };
  },
  computed: {
    gameid() {
      return this.$route.params.gameid;
    },
    //Players by default are sorted by their priority. That is, the player order is generated as they join
    //This realphabetizes the players for displaying in the lobby's list
    sortedPlayers() {
      let newList = Object.values(toRaw(this.players));
      return sortNames(newList, 'username');
    },
    roundLength() {
      const input = this.roundLengthInput;
      if (input.length === 0) {
        this.timeError = '';
        return -1;
      }
      const matches = input.match(/^([0-9]+)(:[0-5][0-9])?$/);
      if (matches === null) {
        this.timeError = 'Improper format. Must be ss or mm:ss';
        return false;
      }
      let seconds = parseInt(matches[1]);
      if (matches[2]) {
        const secondString = matches[2].replace(/:/, '');
        let minutes = seconds;
        seconds = parseInt(secondString) + minutes * 60;
      }
      if (seconds > globalLimits.maxRoundLength * 60) {
        this.timeError = `Round time must be less than ${
          globalLimits.maxRoundLength
        } minutes or ${globalLimits.maxRoundLength * 60} seconds, if any`;
        return false;
      } else if (seconds < 5) {
        this.timeError = 'Round time must be at least 5 seconds';
        return false;
      } else {
        this.timeError = '';
      }
      return seconds * 1000; //Unix timestamps, like we use are in ms
    },
  },
  methods: {
    timerInputHandler(event) {
      this.roundLengthInput = event.target.value;
    },
    async startGame() {
      await beginGame(this.gameid, this.roundLength);
      location.href = `/game/${this.gameid}`;
    },
  },
  async beforeMount() {
    const playerListRef = ref(rtdb, `players/${this.gameid}`);
    const playerList = await get(playerListRef).then((list) => list.val());
    this.players = playerList;

    onValue(playerListRef, (snapshot) => {
      const playerList = snapshot.val();
      this.players = playerList;

      let isInGame = false;

      for (let playerNumber in this.players) {
        if (this.players[playerNumber].username == this.self) {
          this.priority = playerNumber;
          isInGame = true;
        }
      }

      if (!isInGame) {
        //If we discover that we're not supposed to be in this game, kick back to the home screen
        window.open('/', '_self');
        return;
      }
    });

    const gameStatusRef = ref(rtdb, `game-statuses/${this.gameid}`);

    //Subscribe to the game's status to see if it started
    onValue(gameStatusRef, (snapshot) => {
      const status = snapshot.val();
      //On the off chance that you jumped into a lobby of a finished game, redirect to the results
      if (status.finished) {
        window.open(`/results/${this.gameid}`, '_self');
        return;
      }
      //If the game started, go to the gameplay page
      if (status.started) {
        window.open(`/game/${this.gameid}`, '_self');
        return;
      }
    });
  },
};
</script>

<template>
  <main class="page-wrapper">
    <h2 class="needs-backdrop">Game {{ gameid }}</h2>
    <section class="playerlist">
      <p v-for="player in sortedPlayers">{{ player.username }}</p>
    </section>
    <div class="flex-col" v-if="hosting == gameid">
      <p class="needs-backdrop">Round length:</p>
      <input
        type="text"
        @input="timerInputHandler"
        value="3:00"
        placeholder="∞"
      />
      <p v-if="timeError" class="error-text">{{ timeError }}</p>
      <button :disabled="!roundLength" @click="startGame">Start Game</button>
    </div>
    <div class="flex-col needs-backdrop" v-else>
      <p>Waiting for host</p>
    </div>
  </main>
</template>

<style>
.page-wrapper {
  justify-content: center;
  gap: 2rem;
}
</style>
