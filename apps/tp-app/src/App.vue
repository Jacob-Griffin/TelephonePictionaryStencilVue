<script setup>
import { RouterView } from 'vue-router';
import SettingsModal from './components/SettingsModal.vue';
import { inGame, inHome, TPStore } from 'byfo-utils';
import { ref, onBeforeMount, provide } from 'vue';
import 'byfo-native-components/byfo-icon';
import 'byfo-components/dist/components/tp-time-input';

const isInGame = inGame(location);
const isInHome = inHome(location);

const goHome = () => {
  if (isInGame) return;
  location.href = '/';
};

const showingSettings = ref(false);

const tp = new TPStore();
provide('TpStore', tp);
onBeforeMount(() => tp.useTheme());
</script>

<template>
  <header :class="isInHome ? 'invisible' : ''">
    <div class="same-size">
      <div class="menu-button" @click="goHome" v-if="!isInHome && !isInGame">
        <byfo-icon icon="home"></byfo-icon>
      </div>
    </div>
    <div>
      <div class="small icon logo" v-if="!isInHome"></div>
    </div>
    <div class="same-size"></div>
  </header>
  <div id="settings-control">
    <div class="menu-button" @click="showingSettings = true">
      <byfo-icon icon="gear"></byfo-icon>
    </div>
  </div>
  <Suspense>
    <RouterView />
  </Suspense>
  <SettingsModal v-if="showingSettings" @modal-closed="showingSettings = false"></SettingsModal>
</template>

<style scoped>
header,
#settings-control {
  display: flex;
  justify-content: space-between;
  line-height: 1.5;
  max-height: 100vh;
  width: 100%;
  padding: 0.75rem 1.25rem;
  margin-bottom: 1.25rem;
  box-sizing: border-box;
  background-color: var(--color-brand);
  user-select: none;
}

header.invisible {
  background-color: rgba(0, 0, 0, 0);
}

header > div {
  display: flex;
  flex-direction: row;
}

header .logo {
  align-self: center;
  justify-self: center;
}

#settings-control {
  width: 4.5rem;
  height: 4.5rem;
  padding: 1rem;
  margin-bottom: 0;
  position: absolute;
  top: 0;
  right: 0;
  border-radius: 0 0 0 1rem;
}

.menu-button {
  cursor: pointer;
  color: var(--color-button-text);
  height: 2.5rem;
  width: 2.5rem;
  font-size: xx-large;
  display: flex;
  align-content: center;
  justify-content: center;
}

.menu-button byfo-icon {
  stroke: var(--color-button-text);
  fill: var(--color-button-text);
}

div.same-size {
  width: 40%;
  display: flex;
  align-items: center;
}
</style>
