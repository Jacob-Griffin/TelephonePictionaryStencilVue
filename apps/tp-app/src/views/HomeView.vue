<script>
import Logo from '../components/Logo.vue';
import HostModal from '../components/HostModal.vue';
import JoinModal from '../components/JoinModal.vue';
import ResultModal from '../components/ResultModal.vue';

export default{
  data(){
    return {
      openModal: ""
    }
  },
  methods:{
    switchModal(event){
      this.openModal = event?.target.getAttribute("modal") ?? "";
    }
  }
}

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
</template>

<style>
  .buttonMenu{
    display:flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    padding:2rem;
    max-width: 768px;
    gap: 1rem;
  }
</style>