<template>
  <v-container fluid class="fill-height login-container">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card class="pa-6 pa-md-8 login-card" elevation="10" rounded="xl">
          <!-- Header with Logo and Title -->
          <div class="text-center mb-6">
            <v-avatar size="80" color="primary" class="mb-3">
              <v-icon size="48" color="white">mdi-login</v-icon>
            </v-avatar>
            <h1 class="text-h4 font-weight-bold primary-text">{{ t('login') }}</h1>
            <p class="text-body-2 mt-2 grey-text">Welcome back! Please sign in.</p>
          </div>

          <!-- Login Form -->
          <v-form @submit.prevent="handleLogin" ref="loginForm">
            <v-text-field
              v-model="form.email"
              :label="t('email')"
              type="email"
              outlined
              dense
              clearable
              prepend-inner-icon="mdi-email"
              :error-messages="errors.email"
              class="rounded-lg mb-4"
              variant="outlined"
              color="primary"
            />
            <v-text-field
              v-model="form.password"
              :label="t('password')"
              :type="showPassword ? 'text' : 'password'"
              outlined
              dense
              clearable
              prepend-inner-icon="mdi-lock"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
              :error-messages="errors.password"
              class="rounded-lg mb-4"
              variant="outlined"
              color="primary"
            />
            <v-btn
              type="submit"
              color="primary"
              block
              large
              :disabled="loading"
              :loading="loading"
              class="mt-4 rounded-lg font-weight-bold"
              elevation="2"
            >
              {{ t('login') }}
            </v-btn>
          </v-form>

          <!-- Divider -->
          <v-row class="my-6">
            <v-col>
              <v-divider />
            </v-col>
            <v-col cols="auto" class="text-body-2 grey-text">OR</v-col>
            <v-col>
              <v-divider />
            </v-col>
          </v-row>

          <!-- Google Sign-In Button -->
          <v-btn
            block
            class="google-btn mb-4"
            @click="handleGoogleSignIn"
            :disabled="loading"
            :loading="loading"
            outlined
            large
            rounded
          >
            <v-icon left class="google-icon mr-2">mdi-google</v-icon>
            {{ t('Sign in with Google') }}
          </v-btn>

          <!-- Signup Link -->
          <div class="text-center mt-4">
            <span class="grey-text">{{ t('dontHaveAccount') }}</span>
            <v-btn text color="primary" class="ml-1 font-weight-medium" @click="router.push('/signup')">
              {{ t('signUp') }}
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar for Feedback -->
    <v-snackbar
      v-model="snackbar.show"
      :timeout="3000"
      :color="snackbar.color"
      location="top"
      elevation="6"
      rounded="pill"
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

  if (!form.value.email) errors.value.email = t('emailRequired');
  else if (!/\S+@\S+\.\S+/.test(form.value.email)) errors.value.email = t('emailInvalid');
  if (!form.value.password) errors.value.password = t('passwordRequired');
  else if (form.value.password.length < 6) errors.value.password = t('passwordTooShort');

  if (Object.values(errors.value).some((error) => error)) {
    loading.value = false;
    return;
  }

  try {
    await authStore.login(form.value.email, form.value.password);
    snackbar.value = {
      show: true,
      message: t('loginSuccess'),
      color: 'success',
    };
    setTimeout(() => router.push('/dashboard'), 1000);
  } catch (error: any) {
    snackbar.value = {
      show: true,
      message: error.message || t('loginFailed'),
      color: 'error',
    };
  } finally {
    loading.value = false;
  }
};

const handleGoogleSignIn = async () => {
  loading.value = true;
  try {
    await authStore.loginWithGoogle();
    snackbar.value = {
      show: true,
      message: t('loginSuccess'),
      color: 'success',
    };
    setTimeout(() => router.push('/dashboard'), 1000);
  } catch (error: any) {
    snackbar.value = {
      show: true,
      message: error.message || t('googleSignInFailed'),
      color: 'error',
    };
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Background */
.login-container {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  min-height: 100vh;
  padding: 0;
  overflow: hidden;
  position: relative;
}

/* Animated Background Effect */
.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 10%, transparent 70%);
  animation: pulse 15s infinite ease-in-out;
  z-index: 0;
}

/* Card Styling */
.login-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  z-index: 1;
}

.login-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

/* Typography */
.primary-text {
  color: #1e3c72;
  letter-spacing: 0.5px;
}

.grey-text {
  color: #666;
}

/* Buttons */
.v-btn {
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.google-btn {
  background: #ffffff;
  color: #555;
  border: 2px solid #ea4335;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.google-btn:hover {
  background: #ea4335;
  color: #ffffff;
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(234, 67, 53, 0.3);
}

.google-icon {
  color: #ea4335;
  transition: color 0.3s ease;
}

.google-btn:hover .google-icon {
  color: #ffffff;
}

/* Input Fields */
.v-text-field {
  transition: all 0.3s ease;
}

.v-text-field:hover {
  transform: translateY(-2px);
}

/* Animation */
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.2;
  }
  100% {
    transform: scale(1);
    opacity: 0.5;
  }
}
</style>