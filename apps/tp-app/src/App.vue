<script setup>
import { RouterView } from 'vue-router';
import { inGame, inHome, TPStore, BYFOFirebaseAdapter } from 'byfo-utils/rollup';
import { ref, onBeforeMount, provide, onMounted } from 'vue';
import 'byfo-components/dist/components/tp-icon';
import 'byfo-components/dist/components/tp-logo';
import 'byfo-components/dist/components/tp-time-input';
import 'byfo-components/dist/components/tp-settings-modal';
import { firebaseConfig } from '../firebase.secrets';

const isInGame = inGame(location);
const isInHome = inHome(location);

const goHome = () => {
  if (isInGame) return;
  location.href = '/';
};

const settingsmodal = ref(null);
const buildDate = ref(__BUILD_DATE__);

const tp = new TPStore();
provide('TpStore', tp);

const firebase = new BYFOFirebaseAdapter(firebaseConfig);
provide('Firebase',firebase);

onBeforeMount(() => tp.useTheme());
onMounted(()=>{
  settingsmodal.value.store = tp;
})
</script>

<template>
  <header :class="isInHome ? 'invisible' : ''">
    <div>
      <div class="menu-button" @click="goHome" v-if="!isInHome && !isInGame">
        <tp-icon icon="home"></tp-icon>
      </div>
    </div>
    <tp-logo small v-if="!isInHome"/>
    <div></div>
  </header>
  <div id="settings-control">
    <div class="menu-button" @click="settingsmodal.enabled = true">
      <tp-icon icon="gear"></tp-icon>
    </div>
  </div>
  <Suspense>
    <RouterView />
  </Suspense>
  <tp-settings-modal ref="settingsmodal" :buildDate="buildDate"></tp-settings-modal>
</template>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  line-height: 1.5;
  max-height: 100vh;
  width: 100%;
  padding: 0.75rem 1.25rem;
  margin-bottom: 1.25rem;
  background-color: var(--color-brand);
  user-select: none;

  &.invisible {
    background-color: rgba(0, 0, 0, 0);
  }

  & > * {
    /* make sure the even distribution is actually even */
    min-width: 6rem;
  }
}

.menu-button {
  cursor: pointer;
  color: var(--color-button-text);
  height: 2.5rem;
  width: 2.5rem;
  font-size: xx-large;

  & > tp-icon {
    stroke: var(--color-button-text);
    fill: var(--color-button-text);
  }
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
  background-color: var(--color-brand);
  user-select: none;
}
</style>
