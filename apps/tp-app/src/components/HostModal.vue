<script setup>
</script>

<template>
    <div class="modal">
        <article>
            <h1>Host a game</h1>
            <button class="close" @click="$emit('modal-closed')">x</button>
        </article>
    </div>
</template>

<style>
    @import '../assets/modal.css';
</style>