import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import HostModal from './components/HostModal.vue';
import JoinModal from './components/JoinModal.vue';
import ResultModal from './components/ResultModal.vue';

import './assets/main.css';

import { firebaseConfig } from '../firebase.secrets';
import { setFirebaseConfig } from 'byfo-utils/firebase';

import { injectThemes } from 'byfo-themes';
injectThemes();

setFirebaseConfig(firebaseConfig);

const app = createApp(App);

app.use(router);
app.component('HostModal', HostModal);
app.component('JoinModal', JoinModal);
app.component('ResultModal', ResultModal);

app.mount('#app');
