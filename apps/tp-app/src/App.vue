<script setup>
import Logo from "./components/Logo.vue";
import { RouterView } from "vue-router";
</script>

<template>
  <header>
    <Logo></Logo>
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
  box-sizing: border-box;
  background-color: var(--color-brand);
}
</style>
