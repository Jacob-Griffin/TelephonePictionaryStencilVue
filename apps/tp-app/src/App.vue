<script setup>
import { RouterView, useRoute} from 'vue-router';
import { inGame, inHome, TPStore, BYFOFirebaseAdapter } from 'byfo-utils/rollup';
import { ref, onBeforeMount, provide, onMounted, watch } from 'vue';
import 'byfo-components/tp-icon';
import '@component/byfo-logo';
import '@component/byfo-settings-modal';
import '@component/byfo-provider';
import { firebaseConfig } from '../firebase.secrets';

const path = useRoute().path;
const isInGame = ref(inGame(path));
const isInHome = ref(inHome(path));

const goHome = () => {
  if (isInGame.value) return;
  location.href = '/';
};

const settingsmodal = ref(null);
const buildDate = ref(__BUILD_DATE__);

const store = new TPStore();
provide('TpStore', store);

const firebase = new BYFOFirebaseAdapter(firebaseConfig);
provide('Firebase',firebase);

watch(useRoute(), (r) => {
  isInGame.value = inGame(r.path);
  isInHome.value = inHome(r.path);
});

onBeforeMount(() => {
  store.useTheme();
  store.useCustomStyles();
});
</script>

<template>
  <div float left @click="goHome" v-if="!isInHome && !isInGame">
    <tp-icon icon="home"></tp-icon>
  </div>
  <header :class="isInHome ? 'invisible' : ''">
    <byfo-logo small v-if="!isInHome"/>
  </header>
  <div float right @click="settingsmodal.enabled = true">
    <tp-icon icon="gear"></tp-icon>
  </div>
  <Suspense>
    <RouterView />
  </Suspense>
  <byfo-provider :sources="{firebase,store}"></byfo-provider>
  <byfo-settings-modal :buildDate="buildDate"></byfo-settings-modal>
</template>

<style scoped>
header {
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: 1.5;
  max-height: 100vh;
  width: 100%;
  padding: 0.75rem 1.25rem;
  margin-bottom: 1.25rem;
  background-color: var(--color-brand);
  user-select: none;
  color: var(--color-button-text);
  z-index: -1;

  &.invisible {
    background-color: rgba(0, 0, 0, 0);
    height: 5rem;
  }

  & > * {
    /* make sure the even distribution is actually even */
    min-width: 6rem;
  }
}

div[float]{
  width: 4.5rem;
  height: 4.5rem;
  padding: 1rem;
  margin-bottom: 0;
  position: absolute;
  top: 0;
  user-select: none;
  background-color: var(--color-brand);
  cursor: pointer;

  &[left]{
    left: 0;
    border-radius: 0 0 1rem 0;
  }
  &[right]{
    right: 0;
    border-radius: 0 0 0 1rem;
  }

  & tp-icon {
    display: block;
    height: 2.5rem;
    width: 2.5rem;
    stroke: var(--color-button-text);
    fill: var(--color-button-text);
  }
}
</style>
