<script setup>
import { inject, ref } from 'vue';

const store = inject('TpStore');

const selected = ref('');
selected.value = store.theme;

const changeTheme = ({ name }) => {
  selected.value = name;
  store.setTheme(name);
};
</script>

<template>
  <div class="modal">
    <article>
      <h1>Settings</h1>
      <button class="close" @click="$emit('modal-closed')">
        <byfo-icon icon="x"></byfo-icon>
      </button>

      <section>
        <div>
          <h2 class="label">Theme</h2>
          <div class="theme-picker">
            <button v-for="theme in store.themes" class="theme-button" :class="{ selected: selected == theme.name }" @click="() => changeTheme(theme)">
              {{ theme.icon }}&#xfe0e;
            </button>
          </div>
        </div>

        <div>
          <h2 class="label" aria-label="Always 'Show all'">Always "Show all" <byfo-icon title="Applies to review page" icon="info"></byfo-icon></h2>
          <input type="checkbox" class="toggle" @input="e => store.setShowAll(e.target.checked)" :checked="store.alwaysShowAll" />
        </div>
      </section>
    </article>
  </div>
</template>

<style>
@import '../assets/modal.css';

section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

section > div {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 500px;
  padding-block: 0.75rem;
}

section > div:last-child {
  border-bottom: none;
}

[icon='info'] {
  display: inline-block;
  position: relative;
  cursor: pointer;
  top: 0.15em;
  height: 1em;
  width: 1em;
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
