<script>
import { RouterLink } from "vue-router";

export default {
  data() {
    return {
        gameid:"",
        username:"",
        joinError:false
    }
  },
  computed:{
    isDisabled(){
        return !(this.gameid || /^[1-9]{1,6}$/.test(this.gameid));
    }
  },
  methods:{
    joinGame(){
        const response = this.isAvailableGame();
        if(response.success){
            window.name = this.username;
            window.open(`/game/${this.gameid}`,'_self');
            return;
        }
        this.joinError = response.message;
    },
    isAvailableGame(){
        let success = true;
        let message = "success";

        //Only one error will display, the later in this function, the higher priority
        /*
        if(game started check){
            success = false;
            message = `Game ${gameid} has already been started`;
        }

        if(name in game){
            success = false;
            message = `Name already used in game ${gameid}`;
        }
        */

        if(this.username.length === 0){
            success = false;
            message = "Please Input a name";
        }

        return {
            success,
            message
        }
    }
  }
};
</script>

<template>
  <div class="modal">
    <article>
      <h1>Join a game</h1>
      <button class="close" @click="$emit('modal-closed')">x</button>
      <p>Name:</p>
      <input id="name-input" type="text" v-model="username" />
      <p>Game Id:</p>
      <input type="text" v-model="gameid" />
      <p class="error-text" v-if="joinError">{{ joinError }}</p>
      <button class="main-action" :disabled="isDisabled" @click="joinGame">
        Join
      </button>
    </article>
  </div>
</template>

<style>
@import "../assets/modal.css";
</style>
