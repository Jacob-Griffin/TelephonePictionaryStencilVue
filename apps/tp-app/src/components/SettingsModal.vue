<script setup>
import { inject, ref } from 'vue';
import { stopPropagation } from 'byfo-utils';
import { themes } from 'byfo-themes';

const store = inject('TpStore');

const selected = ref('');
selected.value = store.theme;

const changeTheme = e => {
  const name = e.target.value;
  selected.value = name;
  store.setTheme(name);
};

// Toggle stuff should probably moved into a webcomponent, probably actually using a shadowdom this time
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
  <div class="modal" @click="$emit('modal-closed')">
    <article @click="stopPropagation">
      <h1>Settings</h1>
      <button class="close" @click="$emit('modal-closed')">
        <tp-icon icon="x"></tp-icon>
      </button>

      <section class="settings">
        <div>
          <h2 class="label">Theme</h2>
          <select @input="changeTheme" :value="store.theme">
            <option v-for="theme in themes" :value="theme.key">
              {{ theme.displayName }}
            </option>
          </select>
        </div>

        <div>
          <h2 class="label">Always "Show all" <tp-icon title="Applies to review page" icon="info"></tp-icon></h2>
          <div id="showAll-toggle" class="toggle-wrapper" @click="passClick" :class="store.alwaysShowAll ? 'checked' : ''">
            <input type="checkbox" id="showAllInput" @input="e => handleToggle('showAll', store.setShowAll, e)" :checked="store.alwaysShowAll" />
            <label for="showAllInput"></label>
          </div>
        </div>
      </section>

      <h4>Looking for help? Check our <a href="https://github.com/Jacob-Griffin/TelephonePictionary2.0/wiki/Knowlege-Base">knowlege base</a></h4>
    </article>
  </div>
</template>

<style>
@import '../assets/modal.css';

.settings {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.settings > div {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 500px;
  padding-block: 0.75rem;
  align-items: center;
}

.settings select {
  width: 20ch;
  height: 2rem;
  border-radius: 0.5rem;
  font-size: medium;
}
</style>
