<script setup>
import { inject, ref } from 'vue';

const store = inject('TpStore');

const selected = ref('');
selected.value = store.theme;

const changeTheme = e => {
  const name = e.target.value;
  selected.value = name;
  store.setTheme(name);
};

const handleToggle = (prop, setter, e) => {
  const enabled = e.target.checked;
  setter(enabled);
  const div = document.getElementById(`${prop}-toggle`);
  if (enabled && !div.classList.contains('checked')) {
    div.classList.add('checked');
    return;
  }
  if (!enabled) {
    div.classList.remove('checked');
  }
};

//This is to make sure you can click anywhere in the toggle to do the action
const passClick = e => {
  const target = e.target?.id?.match(/^(.+)-toggle$/)?.[1];
  if (target) {
    document.getElementById(`${target}Input`).click();
  }
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
          <select @input="changeTheme">
            <option v-for="theme in store.themes" :value="theme.name">
              {{ theme.displayName }}
            </option>
          </select>
        </div>

        <div>
          <h2 class="label">Always "Show all" <byfo-icon title="Applies to review page" icon="info"></byfo-icon></h2>
          <div id="showAll-toggle" class="toggle-wrapper" @click="passClick" :class="store.alwaysShowAll ? 'checked' : ''">
            <input type="checkbox" id="showAllInput" @input="e => handleToggle('showAll', store.setShowAll, e)" :checked="store.alwaysShowAll" />
            <label for="showAllInput"></label>
          </div>
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
  align-items: center;
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

select {
  width: 20ch;
  height: 2rem;
  border-radius: 0.5rem;
  font-size: medium;
}

.toggle-wrapper {
  height: 1.3rem;
  width: 2.3rem;
  position: relative;
  border-radius: 1rem;
  background-color: #777;
  cursor: pointer;
}

.toggle-wrapper.checked {
  background-color: var(--color-brand);
}

.toggle-wrapper > input {
  visibility: hidden;
}

.toggle-wrapper > label {
  display: block;
  position: absolute;
  cursor: pointer;
  top: 0.15rem;
  left: 0.15rem;
  transition: left 0.2s;
  background-color: var(--vt-c-white-mute);
  z-index: 1;
  height: 1rem;
  width: 1rem;
  border-radius: 0.55rem;
}

input:checked + label {
  left: 1.15rem;
}
</style>
