import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/game/:gameid",
      name: "game",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/Gameplay.vue"),
    },
    {
      path: "/lobby/:gameid",
      name: "lobby",
      component: () => import("../views/Lobby.vue"),
    },
  ],
});

export default router;
