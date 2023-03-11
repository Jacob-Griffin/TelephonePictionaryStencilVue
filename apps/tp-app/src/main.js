import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import HostModal from "./components/HostModal.vue";
import JoinModal from "./components/JoinModal.vue";
import ResultModal from "./components/ResultModal.vue";
import Logo from "./components/Logo.vue";
import BYFOFooter from "./components/BYFOFooter.vue";

import "./assets/main.css";

const app = createApp(App);

app.use(router);
app.component("HostModal", HostModal);
app.component("JoinModal", JoinModal);
app.component("ResultModal", ResultModal);
app.component("Logo", Logo);
app.component("BYFOFooter", BYFOFooter);

app.mount("#app");
