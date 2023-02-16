<template>
  <div class="icon"></div>
</template>

<style>
.icon {
  background-image: var(--icon);
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  width: 100%;
  max-width: 720px;
  aspect-ratio: 1.4;
}

.small.icon {
  width: auto;
  height: 3rem;
  background-image: var(--small-icon);
}
</style>
