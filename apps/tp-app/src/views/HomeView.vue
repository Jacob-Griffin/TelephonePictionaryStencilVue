<script setup>
import { ref, onBeforeUnmount } from 'vue';
const openModal = ref('');

const switchModal = event => {
  openModal.value = event?.target.getAttribute('modal') ?? '';
};

const keyHandler = event => {
  if (event.key !== 'Enter') return;
  const target = document.querySelector('.main-action');
  if (!target) return;

  target.click();
};

document.addEventListener('keydown', keyHandler);
onBeforeUnmount(() => document.removeEventListener('keydown', keyHandler));
</script>

<template>
  <main>
    <Logo></Logo>
    <div class="buttonMenu">
      <button @click="switchModal" modal="host">Host Game</button>
      <button @click="switchModal" modal="join">Join Game</button>
      <button @click="switchModal" modal="result">View Completed Games</button>
    </div>
    <HostModal v-if="openModal == 'host'" @modal-closed="switchModal"></HostModal>
    <JoinModal v-if="openModal == 'join'" @modal-closed="switchModal"></JoinModal>
    <ResultModal v-if="openModal == 'result'" @modal-closed="switchModal"></ResultModal>
  </main>
  <footer>
    <p>Copyright ©2023 Jacob&nbsp;Griffin, Melinda&nbsp;Morang, Sarah&nbsp;Griffin. All rights reserved</p>
  </footer>
</template>

<style>
.buttonMenu {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 2rem;
  max-width: 768px;
  gap: 1rem;
}

footer {
  background-color: var(--color-brand);
  color: var(--color-button-text);
  width: 100vw;
  box-sizing: border-box;
  height: 4rem;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-inline: 1rem;
  text-align: center;
}
</style>
