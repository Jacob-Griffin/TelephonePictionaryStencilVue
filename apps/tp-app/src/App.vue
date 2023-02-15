<script>
import Logo from "./components/Logo.vue";
import { RouterView } from "vue-router";
import { inGame } from "./utils/expressions";

export default {
  data(){
    return {
      inGame: inGame(window.location)
    }
  },
  methods:{
    goHome(){
      if(this.inGame) return;
      window.open('/','_self');
    }
  }
}
</script>

<template>
  <header>
    <Logo @click="goHome" :class="!inGame?'pointer':''"></Logo>
  </header>

  <RouterView />
</template>

<style scoped>
@import "./assets/base.css";
header {
  display: flex;
  justify-content: start;
  line-height: 1.5;
  max-height: 100vh;
  width: 100%;
  padding: 1rem 2rem;
  margin-bottom: 2rem;
  box-sizing: border-box;
  background-color: var(--color-brand);
  user-select: none;
}

header > *.pointer{
  cursor:pointer;
}
</style>
