import { createApp } from 'vue';
import { TPStore, BYFOFirebaseAdapter } from 'byfo-utils/rollup';
import App from './App.vue';
import router from './router';
import { firebaseConfig } from '../firebase.secrets';
import { defineByfoElements, ByfoContext } from '@component';
import { injectThemes } from 'byfo-themes';

import 'byfo-components/css/global-styles';
import './outer.css';


const store = new TPStore();
const firebase = new BYFOFirebaseAdapter(firebaseConfig);
const context = new ByfoContext({firebase,store});

defineByfoElements();
injectThemes();

const app = createApp(App, {firebase,store});

app.use(router);

app.mount('#app');
