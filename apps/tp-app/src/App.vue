<script>
import Logo from "./components/Logo.vue";
import { RouterView } from "vue-router";
import { inGame,inHome } from "./utils/expressions";

export default {
  data(){
    return {
      inGame: inGame(window.location),
      inHome: inHome(window.location),
      currentTheme: window.localStorage.getItem('theme') ?? 'classic',
      themes:[
        {
          name:"light",
          icon:"🔆"
        },
        {
          name:"dark",
          icon:"🌙"
        },
        {
          name:"classic",
          icon:"🕒"
        },
        {
          name:"candy",
          icon:"🍬"
        }
      ],
      extends:{
        "candy":"light",
        "classic":"light",
      }
    }
  },
  methods:{
    goHome(){
      if(this.inGame) return;
      window.open('/','_self');
    },
    setTheme(theme){
      document.body.setAttribute("class","");
      document.body.classList.add(theme);
      if(this.extends[theme]){
        document.body.classList.add(this.extends[theme])
      }
      this.currentTheme = theme;
      window.localStorage.setItem('theme',theme);
    }
  },
  beforeMount(){
    this.setTheme(this.currentTheme);
  }
}
</script>

<template>
  <header :class="inHome ? 'invisible' : ''">
    <div>
      <Logo @click="goHome" class="small" :class="{'pointer':!inGame}" v-if="!inHome"></Logo>
    </div>
    <div>
      <button v-for="theme in themes" class="themebutton" :class="{'selected':currentTheme == theme.name}" @click="()=>setTheme(theme.name,theme.extends)">
        {{ theme.icon }}&#xfe0e;
      </button>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  line-height: 1.5;
  max-height: 100vh;
  width: 100%;
  padding: 1rem 2rem;
  margin-bottom: 1.5rem;
  box-sizing: border-box;
  background-color: var(--color-brand);
  user-select: none;
}

header.invisible{
  background-color: rgba(0,0,0,0);
}

header *.pointer{
  cursor:pointer;
}

header > div{
  display:flex;
  flex-direction: row;
}

.themebutton{
  width:3rem;
  height:3rem;
  border-radius: 0;
  border-left: 1px solid white;
}

.candy .themebutton,.classic .themebutton{
  border: 1px solid white;
  border-left: none;
}

.candy .themebutton:first-child,.classic .themebutton:first-child{
  border-left: 1px solid white;
}

.themebutton:first-child{
  border-radius: 1rem 0 0 1rem;
  border-left: none;
}

.themebutton:last-child{
  border-radius: 0 1rem 1rem 0;
}
</style>
