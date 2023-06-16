<script setup>
import Logo from "./components/Logo.vue";
import { RouterView } from "vue-router";
import { inGame, inHome } from "./utils/expressions";
import { ref, onBeforeMount } from 'vue';

//#region const on page load/route
const isInGame = inGame(window.location);
const isInHome = inHome(window.location);
const themes = [
  {
    name: "light",
    icon: "🔆",
  },
  {
    name: "dark",
    icon: "🌙",
  },
  {
    name: "classic",
    icon: "🕒",
  },
  {
    name: "candy",
    icon: "🍬",
  },
];
const themeExtends = {
  candy: "light",
  classic: "light",
};
//#endregion

//#region methods and states
const currentTheme = ref(window.localStorage.getItem("theme") ?? "classic");

const goHome = () => {
  if (isInGame) return;
  window.open("/", "_self");
};

const setTheme = (theme) => {
  document.body.setAttribute("class", "");
  document.body.classList.add(theme);
  if (themeExtends[theme]) {
    document.body.classList.add(themeExtends[theme]);
  }
  currentTheme.value = theme;
  window.localStorage.setItem("theme", theme);
}
//#endregion

onBeforeMount(() => setTheme(currentTheme.value));
</script>

<template>
  <header :class="isInHome ? 'invisible' : ''">
    <div class="same-size">
      <div class="home" @click="goHome" v-if="!isInHome && !isInGame">
        🏠&#xfe0e;
      </div>
    </div>
    <div>
      <Logo
        class="small logo"
        v-if="!isInHome"
      ></Logo>
    </div>
    <div class="same-size theme-picker">
      <button
        v-for="theme in themes"
        class="themebutton"
        :class="{ selected: currentTheme == theme.name }"
        @click="() => setTheme(theme.name, theme.extends)"
      >
        {{ theme.icon }}&#xfe0e;
      </button>
    </div>
  </header>
  <Suspense>
    <RouterView />
  </Suspense>
</template>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  line-height: 1.5;
  max-height: 100vh;
  width: 100%;
  padding: .75rem 1.25rem;
  margin-bottom: 1.25rem;
  box-sizing: border-box;
  background-color: var(--color-brand);
  user-select: none;
}

header.invisible {
  background-color: rgba(0, 0, 0, 0);
}

header *.pointer {
  cursor: pointer;
}

header > div {
  display: flex;
  flex-direction: row;
}

header .logo{
  align-self: center;
  justify-self: center;
}

.home {
  cursor: pointer;
  color: var(--color-button-text);
  height: 3rem;
  width: 3rem;
  font-size: xx-large;
  display: flex;
  align-content: center;
  justify-content: center;
}

div.same-size {
  width: 40%;
  display: flex;
}

.theme-picker {
  justify-content: right;
}

.themebutton {
  justify-self: right;
  width: 3rem;
  height: 3rem;
  border-radius: 0;
  border-block: 1px solid white;
  border-right: 1px solid white;
}

.themebutton:first-child {
  border-radius: 1rem 0 0 1rem;
  border-left: 1px solid white;
}

.themebutton:last-child {
  border-radius: 0 1rem 1rem 0;
}
</style>
