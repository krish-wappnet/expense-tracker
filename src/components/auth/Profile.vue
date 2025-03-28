<!-- src/components/auth/Profile.vue -->
<template>
  <v-container class="profile-container">
    <v-row justify="center">
      <v-col cols="12" sm="10" md="8" lg="6">
        <!-- Header with Back Button -->
        <v-row align="center" class="mb-4">
          <v-col cols="auto">
            <v-btn
              icon
              color="primary"
              @click="goToDashboard"
              :aria-label="t('backToDashboard')"
            >
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
          </v-col>
          <v-col>
            <h1 class="text-h4 font-weight-bold primary--text">
              {{ t('profile') }}
            </h1>
          </v-col>
        </v-row>

        <!-- Loading Spinner -->
        <v-progress-circular
          v-if="isLoading"
          indeterminate
          color="primary"
          size="50"
          class="d-block mx-auto my-8"
        />

        <!-- Profile Card -->
        <v-card v-else rounded="lg" elevation="6" class="pa-4 pa-sm-6 profile-card">
          <v-row>
            <!-- Profile Picture Column -->
            <v-col cols="12" sm="4" class="text-center">
              <v-avatar :size="avatarSize" class="profile-avatar elevation-4 mb-4">
                <img
                  :src="isEditing ? (tempProfilePic || profilePic || 'https://via.placeholder.com/150') : (profilePic || 'https://via.placeholder.com/150')"
                  alt="Profile Picture"
                />
              </v-avatar>
              <div v-if="isEditing" class="mb-4">
                <v-btn color="primary" outlined class="mb-2">
                  {{ t('changeProfilePicture') }}
                  <input
                    type="file"
                    accept="image/*"
                    @change="handleProfilePictureChange"
                    style="position: absolute; opacity: 0; width: 100%; height: 100%; cursor: pointer;"
                  />
                </v-btn>
                <v-btn
                  v-if="tempProfilePic"
                  color="red"
                  outlined
                  @click="removeProfilePicture"
                >
                  {{ t('remove') }}
                </v-btn>
              </div>
            </v-col>

            <!-- Profile Details Column -->
            <v-col cols="12" sm="8">
              <!-- Display Mode -->
              <div v-if="!isEditing">
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      :label="t('email')"
                      :value="email"
                      prepend-inner-icon="mdi-email"
                      readonly
                      outlined
                      dense
                      class="rounded-lg"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      :label="t('name')"
                      :value="name"
                      prepend-inner-icon="mdi-account"
                      readonly
                      outlined
                      dense
                      class="rounded-lg"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-textarea
                      :label="t('about')"
                      :value="about"
                      prepend-inner-icon="mdi-information"
                      readonly
                      outlined
                      dense
                      :rows="textareaRows"
                      class="rounded-lg"
                    />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" class="text-center">
                    <v-btn
                      color="primary"
                      outlined
                      @click="isEditing = true"
                    >
                      <v-icon left>mdi-pencil</v-icon>
                      {{ t('editProfile') }}
                    </v-btn>
                  </v-col>
                </v-row>
              </div>

              <!-- Edit Mode -->
              <v-form v-else @submit.prevent="updateProfile">
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      :label="t('email')"
                      :value="email"
                      prepend-inner-icon="mdi-email"
                      readonly
                      outlined
                      dense
                      class="rounded-lg"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="tempName"
                      :label="t('name')"
                      prepend-inner-icon="mdi-account"
                      outlined
                      dense
                      :rules="[v => !!v || t('nameRequired')]"
                      class="rounded-lg"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-textarea
                      v-model="tempAbout"
                      :label="t('about')"
                      prepend-inner-icon="mdi-information"
                      outlined
                      dense
                      :rows="textareaRows"
                      class="rounded-lg"
                    />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-btn
                      color="grey"
                      outlined
                      block
                      @click="cancelEdit"
                    >
                      {{ t('cancel') }}
                    </v-btn>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-btn
                      color="primary"
                      type="submit"
                      block
                      :loading="loading"
                    >
                      {{ t('save') }}
                    </v-btn>
                  </v-col>
                </v-row>
              </v-form>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar for Feedback -->
    <v-snackbar
      v-model="snackbar"
      :timeout="3000"
      :color="snackbarColor"
      rounded="pill"
      elevation="4"
      class="snackbar-custom"
    >
      {{ snackbarMessage }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbar = false">
          {{ t('close') }}
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useI18n } from 'vue-i18n';
import { useDisplay } from 'vuetify';

// Explicitly type the authStore to include initializeAuth
interface AuthStore {
  currentUser: { id: number; email: string; profilePicture?: string } | null;
  token: string | null;
  isAuthenticated: boolean;
  initializeAuth: () => Promise<void>;
  logout: () => void;
}

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore() as unknown as AuthStore;
const { smAndDown, mdAndDown } = useDisplay();

// Reactive state for user data
const email = ref('');
const name = ref('');
const about = ref('');
const profilePic = ref<string | undefined>(undefined);

// Temporary state for editing
const tempName = ref('');
const tempAbout = ref('');
const tempProfilePic = ref<string | undefined>(undefined);
const tempProfilePicFile = ref<File | null>(null);

// UI state
const isEditing = ref(false);
const isLoading = ref(true);
const loading = ref(false);
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');

// API base URL
const API_BASE_URL = 'http://localhost:3000';

// Computed properties for responsive design
const avatarSize = computed(() => {
  if (smAndDown.value) return '100'; // Mobile
  if (mdAndDown.value) return '120'; // Tablet
  return '150'; // Laptop
});

const textareaRows = computed(() => {
  if (smAndDown.value) return 2; // Mobile
  return 3; // Tablet and Laptop
});

// Fetch user profile on mount
onMounted(async () => {
  if (!authStore.isAuthenticated || !authStore.currentUser) {
    router.push('/login');
    return;
  }

  

  if (!authStore.isAuthenticated || !authStore.currentUser) {
    router.push('/login');
    return;
  }

  // Set initial user data
  email.value = authStore.currentUser.email;

  // Fetch profile data from API
  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    const data = await response.json();
    name.value = data.name || '';
    about.value = data.about || '';
    profilePic.value = data.profilePic || authStore.currentUser.profilePicture;

    // Set temp values for editing
    tempName.value = name.value;
    tempAbout.value = about.value;
    tempProfilePic.value = undefined; // Ensure tempProfilePic starts as undefined
  } catch (error) {
    console.error('Error fetching user profile:', error);
    showSnackbar(t('fetchProfileFailed'), 'error');
  } finally {
    isLoading.value = false;
  }
});

// Handle profile picture change
const handleProfilePictureChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    tempProfilePicFile.value = file;
    tempProfilePic.value = URL.createObjectURL(file); // Preview the new image
  }
};

// Remove profile picture
const removeProfilePicture = () => {
  tempProfilePic.value = undefined;
  tempProfilePicFile.value = null;
};

// Update profile
const updateProfile = async () => {
  if (!tempName.value) {
    showSnackbar(t('nameRequired'), 'error');
    return;
  }

  try {
    loading.value = true;

    // Prepare FormData for the PUT request
    const formData = new FormData();
    formData.append('name', tempName.value);
    formData.append('about', tempAbout.value);
    formData.append('email', email.value);
    if (tempProfilePicFile.value) {
      formData.append('profilePic', tempProfilePicFile.value);
    }

    // Update profile data via API
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    const data = await response.json();

    // Update local state
    name.value = data.name;
    about.value = data.about;
    profilePic.value = data.profilePic;

    // Update authStore if necessary
    if (authStore.currentUser) {
      authStore.currentUser.profilePicture = data.profilePic;
    }

    showSnackbar(t('profileUpdated'), 'success');
    isEditing.value = false;
  } catch (error) {
    console.error('Error updating profile:', error);
    showSnackbar(t('updateProfileFailed'), 'error');
  } finally {
    loading.value = false;
    tempProfilePicFile.value = null;
    tempProfilePic.value = undefined;
  }
};

// Cancel editing
const cancelEdit = () => {
  isEditing.value = false;
  tempName.value = name.value;
  tempAbout.value = about.value;
  tempProfilePic.value = undefined;
  tempProfilePicFile.value = null;
};

// Navigate to dashboard
const goToDashboard = () => {
  router.push('/dashboard');
};

// Show snackbar
const showSnackbar = (message: string, color: string) => {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
};
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff; /* Plain white background */
  padding: 1rem;
}

.profile-card {
  background: #ffffff;
  border-radius: 16px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.profile-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.profile-avatar {
  border: 4px solid #e0e0e0;
  transition: border-color 0.3s ease;
}

.profile-avatar:hover {
  border-color: #1976d2;
}

.v-text-field,
.v-textarea {
  transition: all 0.3s ease;
}

.v-text-field[readonly] {
  background-color: #f9f9f9;
  color: #666;
}

.v-btn {
  border-radius: 8px;
  text-transform: none;
  font-weight: 500;
}

.snackbar-custom {
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.primary--text {
  color: #1976d2 !important;
}

/* Mobile (xs and sm) */
@media (max-width: 959px) {
  .profile-container {
    padding: 0.5rem;
  }

  .profile-card {
    padding: 1rem;
  }

  .text-h4 {
    font-size: 1.5rem !important;
  }

  .v-btn {
    font-size: 0.875rem;
    padding: 0 12px;
  }

  .v-row {
    margin: 0 -8px;
  }

  .v-col {
    padding: 0 8px;
  }

  .mb-4 {
    margin-bottom: 1rem !important;
  }

  .mb-6 {
    margin-bottom: 1.5rem !important;
  }
}

/* Tablet (md) */
@media (min-width: 960px) and (max-width: 1279px) {
  .profile-container {
    padding: 1rem;
  }

  .profile-card {
    padding: 1.5rem;
  }

  .text-h4 {
    font-size: 1.75rem !important;
  }

  .v-btn {
    font-size: 0.9375rem;
  }

  .v-row {
    margin: 0 -12px;
  }

  .v-col {
    padding: 0 12px;
  }
}

/* Laptop (lg and up) */
@media (min-width: 1280px) {
  .profile-container {
    padding: 2rem;
  }

  .profile-card {
    padding: 2rem;
  }

  .text-h4 {
    font-size: 2rem !important;
  }

  .v-btn {
    font-size: 1rem;
  }

  .v-row {
    margin: 0 -16px;
  }

  .v-col {
    padding: 0 16px;
  }
}
</style>