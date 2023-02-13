<script>
import { rtdb } from "../../Firebase";
import { ref, get, onValue } from "firebase/database";
import { submitReady, beginGame } from '../firebase/rtdb';
import { toRaw } from "vue";
export default {
  data() {
    return {
      players: [],
      self: window.sessionStorage.getItem('username'),
      priority: undefined,
      hosting: window.sessionStorage.getItem('hosting'),
      ready: false,
      canStart: false
    };
  },
  computed:{
    gameid(){
      return this.$route.params.gameid;
    },
    //Players by default are sorted by there priority. That is, the player order is generated as they join
    //This realphabetizes the players for displaying in the lobby's list
    sortedPlayers(){
      let newList = Object.values(toRaw(this.players));
      newList.sort((a,b) => a.username && b.username && a.username.localeCompare(b.username,'en',{sensitivity:'base'}));
      return newList;
    }
  },
  methods: {
    readyClicked(){
      this.ready = !this.ready;
      if(this.priority){
        submitReady(this.priority,this.gameid,this.ready);
      }
    },
    async startGame(){
      await beginGame(this.gameid);
      //window.open(`/game/${this.gameid}`)
    }

  },
  async beforeMount(){
    const playerListRef = ref(rtdb,`players/${this.gameid}`);
    const playerList = await get(playerListRef).then(list => list.val());
    this.players = playerList;

    onValue(playerListRef,(snapshot) =>{
      const playerList = snapshot.val();
      this.players = playerList;

      let allReady = true;
      let isInGame = false;

      for(let playerNumber in this.players){
        if(this.players[playerNumber].status == 'pending'){
          allReady = false;
        }
        if(this.players[playerNumber].username == this.self){
          this.priority = playerNumber;
          isInGame = true;
        }
      }

      if(!isInGame){
        //If we discover that we're not supposed to be in this game, kick back to the home screen
        window.open('/','_self');
      }
      this.canStart = allReady;
    });

    const gameStatusRef = ref(rtdb,`game-statuses/${this.gameid}`);

    //Subscribe to the game's status to see if it started
    onValue(gameStatusRef,(snapshot) =>{
      const status = snapshot.val();
      //On the off chance that you jumped into a lobby of a finished game, redirect to the results
      if(status.finished){
        window.open(`/results/${this.gameid}`,'_self');
        return;
      }
      //If the game started, go to the gameplay page
      if(status.started){
        window.open(`/game/${this.gameid}`,'_self');
        return;
      }
    })
  }
};
</script>

<template>
  <main class="page-wrapper">
    <h2>Game {{ gameid }}</h2>
    <section>
      <div v-for="player in sortedPlayers">
        <p>{{ player.username }}</p>
        <span :class="player.status">{{ player.status === 'ready' ? '✓' : '•' }}</span>
      </div>
      <button class="small" @click="readyClicked">{{ ready ? 'Set Not Ready' : 'Set Ready' }}</button>
    </section>
    <button v-if="hosting == gameid" :disabled="!canStart" @click="startGame">Start Game</button>
  </main>
</template>

<style>
  .page-wrapper{
    justify-content: center;
    gap: 2rem;
  }
  section{
    width: 100%;
    max-width: 30rem;
    height: fit-content;
    background-color: rgba(220,220,220,.6);
    padding:2rem;
    display:flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    border-radius: 1rem;
  }
  section > div{
    display:flex;
    gap:2rem;
    width:100%;
    max-width: 15rem;
  }
</style>