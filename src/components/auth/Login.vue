<!-- src/components/Login.vue -->
<template>
    <v-container fluid class="fill-height login-container">
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="4">
          <v-card class="pa-6 login-card" elevation="8">
            <!-- Logo/Icon -->
            <div class="text-center mb-4">
              <v-icon size="64" color="primary">mdi-login</v-icon>
              <h1 class="text-h5 font-weight-bold mt-2">{{ t('login') }}</h1>
            </div>
  
            <!-- Form -->
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="form.email"
                :label="t('email')"
                type="email"
                outlined
                dense
                required
                prepend-inner-icon="mdi-email"
                :error-messages="errors.email"
                class="mb-2"
              />
              <v-text-field
                v-model="form.password"
                :label="t('password')"
                :type="showPassword ? 'text' : 'password'"
                outlined
                dense
                required
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                :error-messages="errors.password"
                class="mb-2"
              />
              <v-btn
                type="submit"
                color="primary"
                block
                :disabled="loading"
                :loading="loading"
                class="mt-4"
              >
                {{ t('login') }}
              </v-btn>
            </v-form>
  
            <!-- Link to Sign Up -->
            <div class="text-center mt-4">
              <span>{{ t('dontHaveAccount') }}</span>
              <v-btn text color="primary" @click="router.push('/signup')">
                {{ t('signUp') }}
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
  
      <!-- Snackbar for feedback -->
      <v-snackbar
        v-model="snackbar.show"
        :timeout="3000"
        :color="snackbar.color"
        location="top right"
      >
        {{ snackbar.message }}
        <template v-slot:actions>
          <v-btn color="white" variant="text" @click="snackbar.show = false">
            {{ t('close') }}
          </v-btn>
        </template>
      </v-snackbar>
    </v-container>
  </template>
  
  <script lang="ts" setup>
  import { ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRouter } from 'vue-router';
  import { login } from '@/services/authService';
  import { useAuthStore } from '@/stores/auth';
  
  const { t } = useI18n();
  const router = useRouter();
  const authStore = useAuthStore();
  
  const form = ref({
    email: '',
    password: '',
  });
  
  const errors = ref({
    email: '',
    password: '',
  });
  
  const loading = ref(false);
  const showPassword = ref(false);
  
  const snackbar = ref({
    show: false,
    message: '',
    color: 'success',
  });
  
  const handleLogin = async () => {
    loading.value = true;
    errors.value = { email: '', password: '' };
  
    // Client-side validation
    if (!form.value.email) {
      errors.value.email = t('emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(form.value.email)) {
      errors.value.email = t('emailInvalid');
    }
    if (!form.value.password) {
      errors.value.password = t('passwordRequired');
    } else if (form.value.password.length < 6) {
      errors.value.password = t('passwordTooShort');
    }
  
    if (Object.values(errors.value).some((error) => error)) {
      loading.value = false;
      return;
    }
  
    try {
      const response = await login(form.value);
      // Use the login action from authStore instead of setAuth
      await authStore.login(form.value.email, form.value.password);
      snackbar.value = {
        show: true,
        message: t('loginSuccess'),
        color: 'success',
      };
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (error: any) {
      let errorMessage = t('loginFailed');
      if (error.message) {
        errorMessage = error.message; // Use the error message from authService
      } else if (error.response?.status === 401) {
        errorMessage = t('invalidCredentials');
      }
      snackbar.value = {
        show: true,
        message: errorMessage,
        color: 'error',
      };
      // Handle server-side validation errors if any
      if (error.response?.data?.errors) {
        const serverErrors = error.response.data.errors;
        errors.value.email = serverErrors.email || '';
        errors.value.password = serverErrors.password || '';
      }
    } finally {
      loading.value = false;
    }
  };
  </script>
  
  <style scoped>
  .login-container {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    min-height: 100vh;
    padding: 0;
  }
  
  .login-card {
    border-radius: 12px;
    background: #ffffff;
    transition: all 0.3s ease;
  }
  
  .login-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1) !important;
  }
  
  .v-btn {
    text-transform: none;
    font-weight: 500;
  }
  
  .text-h5 {
    color: #333;
  }
  </style>