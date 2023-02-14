<script>
import Logo from "./components/Logo.vue";
import { RouterView } from "vue-router";

export default {
  methods:{
    goHome(){
      window.open('/','_self');
    }
  }
}
</script>

<template>
  <header>
    <Logo @click="goHome"></Logo>
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
}

header > *{
  cursor:pointer;
}
</style>
