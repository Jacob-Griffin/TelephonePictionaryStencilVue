import { createApp } from 'vue';
import { TPStore, BYFOFirebaseAdapter } from 'byfo-utils/rollup';
import App from './App.vue';
import router from './router';
import { firebaseConfig } from '../firebase.secrets';

import 'byfo-components/css/global-styles';
import './outer.css';

const store = new TPStore();

const firebase = new BYFOFirebaseAdapter(firebaseConfig);

import { defineByfoElements } from '@component/loader';
const loaderInstalled = defineByfoElements({firebase,store});

import { injectThemes } from 'byfo-themes';
injectThemes();

const app = createApp(App, {firebase,store});

app.use(router);

loaderInstalled.then(()=>app.mount('#app'))
