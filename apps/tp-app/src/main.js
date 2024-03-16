import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import 'byfo-components/css/global-styles';
import './outer.css';

import { injectThemes } from 'byfo-themes';
injectThemes();

const app = createApp(App);

app.use(router);

app.mount('#app');
