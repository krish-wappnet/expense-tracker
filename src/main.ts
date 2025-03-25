import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components'; // Import stable components
import * as directives from 'vuetify/directives'; // Import stable directives
import 'vuetify/styles'; // Import Vuetify styles
import '@mdi/font/css/materialdesignicons.css'; // Import Material Design Icons

const app = createApp(App);

// Create Vuetify instance
const vuetify = createVuetify({
  components,
  directives,
});

// Create Pinia instance
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(vuetify);
app.mount('#app');