import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components'; // Import stable components
import * as directives from 'vuetify/directives'; // Import stable directives
import 'vuetify/styles'; // Import Vuetify styles
import VueTelInputVuetify from 'vue-tel-input-vuetify';
import '@mdi/font/css/materialdesignicons.css'; // Import Material Design Icons
import i18n from './i18n';
import './styles/globals.css'; // Import global styles

const app = createApp(App);

// Create Vuetify instance
const vuetify = createVuetify({
  components: {
    ...components,
    VueTelInputVuetify, // Register vue-tel-input-vuetify as a Vuetify component
  },
  directives,
  theme: {
    defaultTheme: 'light', // Default theme
    themes: {
      light: {
        colors: {
          primary: '#1976D2', // Default Vuetify primary blue
          'primary-darken-1': '#1565C0', // Darker shade for gradients
          secondary: '#424242',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FB8C00',
          'grey-darken-1': '#616161', // Used in Dashboard secondary buttons
          'grey-lighten-1': '#B0BEC5', // Used in dark mode secondary buttons
        },
      },
      dark: {
        colors: {
          primary: '#42A5F5', // Lighter blue for dark mode
          'primary-darken-1': '#1976D2', // Darker shade for gradients
          secondary: '#B0BEC5',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FB8C00',
          'grey-darken-1': '#B0BEC5', // Adjusted for dark mode
          'grey-lighten-1': '#E0E0E0', // Lighter grey for dark mode
        },
      },
    },
  },
});

// Create Pinia instance
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(vuetify);
app.use(i18n);

// const authStore = useAuthStore();
// authStore.initializeAuth();

app.mount('#app');