<script>
import { rtdb } from "../../Firebase";
import { ref, onValue } from "firebase/database";
import { submitReady } from '../firebase/rtdb';

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
    }
  },
  methods: {
    readyClicked(){
      this.ready = !this.ready;
      if(this.priority){
        submitReady(this.priority,this.gameid,this.ready);
      }
    },
    startGame(){
      console.log('Starting Game');
    }

  },
  beforeMount(){
    const playerListRef = ref(rtdb,`players/${this.gameid}`)
    onValue(playerListRef,(snapshot) =>{
      const playerList = snapshot.val();
      this.players = playerList;

      let allReady = true;

      for(let playerNumber in this.players){
        if(this.players[playerNumber].status == 'pending'){
          allReady = false;
        }
        if(this.players[playerNumber].username == this.self){
          this.priority = playerNumber;
        }
      }
      this.canStart = allReady;
    });
  }
};

</script>

<template>
  <main class="page-wrapper">
    <section>
      <div v-for="player in players" >
        <p>{{ player.username }}</p>
        <span :class="player.status">{{ player.status === 'ready' ? '✓' : '•' }}</span>
      </div>
      <button class="small" @click="readyClicked">{{ ready ? 'Set Not Ready' : 'Set Ready' }}</button>
    </section>
    <button v-if="hosting" :disabled="!canStart" @click="startGame">Start Game</button>
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