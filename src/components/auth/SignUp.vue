<!-- src/components/SignUp.vue -->
<template>
  <v-container fluid class="fill-height signup-container">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card class="pa-6 pa-md-8 signup-card" elevation="10" rounded="xl">
          <!-- Header with Logo and Title -->
          <div class="text-center mb-6">
            <v-avatar size="80" color="primary" class="mb-3">
              <v-icon size="48" color="white">mdi-account-plus</v-icon>
            </v-avatar>
            <h1 class="text-h4 font-weight-bold primary-text">{{ t('signUp') }}</h1>
            <p class="text-body-2 mt-2 grey-text">Create your account to get started.</p>
          </div>

          <!-- Signup Form -->
          <v-form @submit.prevent="handleSignUp" ref="signupForm">
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
              v-model="form.displayName"
              :label="t('displayName')"
              type="text"
              outlined
              dense
              clearable
              prepend-inner-icon="mdi-account"
              :error-messages="errors.displayName"
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
              {{ t('signUp') }}
            </v-btn>
          </v-form>

          <!-- Login Link -->
          <div class="text-center mt-6">
            <span class="grey-text">{{ t('alreadyHaveAccount') }}</span>
            <v-btn text color="primary" class="ml-1 font-weight-medium" @click="router.push('/login')">
              {{ t('login') }}
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
import { ref, defineExpose } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  email: '',
  displayName: '',
  password: '',
});

const errors = ref({
  email: '',
  displayName: '',
  password: '',
});

const loading = ref(false);
const showPassword = ref(false);

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
});

const handleSignUp = async () => {
  loading.value = true;
  errors.value = { email: '', displayName: '', password: '' };

  // Basic validation
  if (!form.value.email) {
    errors.value.email = t('emailRequired');
  } else if (!/\S+@\S+\.\S+/.test(form.value.email)) {
    errors.value.email = t('emailInvalid');
  }
  if (!form.value.displayName) {
    errors.value.displayName = t('displayNameRequired');
  } else if (form.value.displayName.length > 50) {
    errors.value.displayName = t('displayNameTooLong');
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
    await authStore.signUp(form.value.email, form.value.password, form.value.displayName);
    snackbar.value = {
      show: true,
      message: t('signupSuccess'),
      color: 'success',
    };
    setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
  } catch (error: any) {
    let message = t('signUpFailed');
    if (error.code === 'auth/email-already-in-use') {
      message = t('emailInUse');
    } else if (error.code === 'auth/invalid-email') {
      message = t('emailInvalid');
    } else if (error.code === 'auth/weak-password') {
      message = t('passwordTooShort');
    } else if (error.message) {
      message = error.message;
    }
    snackbar.value = {
      show: true,
      message,
      color: 'error',
    };
  } finally {
    loading.value = false;
  }
};

// Expose reactive properties for testing
defineExpose({
  loading,
  snackbar,
});
</script>

<style scoped>
/* Background */
.signup-container {
  background: linear-gradient(135deg, #2a5298 0%, #1e3c72 100%);
  min-height: 100vh;
  padding: 0;
  overflow: hidden;
  position: relative;
}

/* Animated Background Effect */
.signup-container::before {
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
.signup-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  z-index: 1;
}

.signup-card:hover {
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