<!-- src/components/SignUp.vue -->
<template>
  <v-container fluid class="fill-height signup-container">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="pa-6 signup-card" elevation="8">
          <!-- Logo/Icon -->
          <div class="text-center mb-4">
            <v-icon size="64" color="primary">mdi-account-plus</v-icon>
            <h1 class="text-h5 font-weight-bold mt-2">{{ t('signUp') }}</h1>
          </div>

          <!-- Form -->
          <v-form @submit.prevent="handleSignUp">
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
              v-model="form.displayName"
              :label="t('displayName')"
              type="text"
              outlined
              dense
              required
              prepend-inner-icon="mdi-account"
              :error-messages="errors.displayName"
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
              {{ t('signUp') }}
            </v-btn>
          </v-form>

          <!-- Link to Login -->
          <div class="text-center mt-4">
            <span>{{ t('alreadyHaveAccount') }}</span>
            <v-btn text color="primary" @click="router.push('/login')">
              {{ t('login') }}
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

  if (Object.values(errors.value).some(error => error)) {
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
.signup-container {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  padding: 0;
}

.signup-card {
  border-radius: 12px;
  background: #ffffff;
  transition: all 0.3s ease;
}

.signup-card:hover {
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