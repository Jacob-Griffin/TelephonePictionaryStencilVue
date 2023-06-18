<script setup>
import { inject } from 'vue';

const store = inject('TpStore');
</script>

<template>
  <div class="modal">
    <article>
      <h1>Settings</h1>
      <button class="close" @click="$emit('modal-closed')">x</button>

      <div class="theme-picker">
        <button v-for="theme in store.themes" class="theme-button" :class="{ selected: store.theme == theme.name }" @click="() => store.setTheme(theme.name)">
          {{ theme.icon }}&#xfe0e;
        </button>
      </div>

      <input type="checkbox" class="toggle" @input="e => store.setShowAll(e.target.checked)" :checked="store.alwaysShowAll" />
    </article>
  </div>
</template>

<style>
@import '../assets/modal.css';
.theme-picker {
  justify-content: right;
}

.theme-button {
  justify-self: right;
  width: 3rem;
  height: 3rem;
  border-radius: 0;
  border-block: 1px solid white;
  border-right: 1px solid white;
}

.theme-button:first-child {
  border-radius: 1rem 0 0 1rem;
  border-left: 1px solid white;
}

.theme-button:last-child {
  border-radius: 0 1rem 1rem 0;
}
</style>
