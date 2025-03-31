<!-- src/components/auth/Profile.vue -->
<template>
  <v-container fluid class="profile-container" :class="{ 'dark-mode': darkMode }">
    <v-row justify="center">
      <v-col cols="12" sm="10" md="9" lg="8">
        <!-- Header with Back Button -->
        <v-row align="center" class="mb-8">
          <v-col cols="auto">
            <v-btn
              icon
              color="primary"
              @click="goToDashboard"
              :aria-label="t('backToDashboard')"
              class="back-btn"
            >
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
          </v-col>
          <v-col>
            <h1 class="text-h3 font-weight-medium">{{ t('profile') }}</h1>
          </v-col>
        </v-row>

        <!-- Loading Spinner -->
        <v-progress-circular
          v-if="isLoading"
          indeterminate
          color="primary"
          size="60"
          class="d-block mx-auto my-10"
        />

        <!-- Profile Card -->
        <v-card v-else rounded="lg" elevation="4" class="pa-6 pa-sm-8 profile-card">
          <v-row>
            <!-- Profile Picture Column -->
            <v-col cols="12" sm="4" md="3" class="text-center">
              <v-avatar :size="avatarSize" class="profile-avatar mb-6">
                <img
                  :src="isEditing ? (tempProfilePic || profilePic || 'https://via.placeholder.com/150') : (profilePic || 'https://via.placeholder.com/150')"
                  alt="Profile Picture"
                />
              </v-avatar>
              <div v-if="isEditing" class="profile-pic-actions">
                <v-btn color="primary" class="mb-3" block rounded="lg" style="position: relative;">
                  {{ t('changeProfilePicture') }}
                  <input
                    type="file"
                    accept="image/*"
                    @change="handleProfilePictureChange"
                    style="position: absolute; opacity: 0; width: 100%; height: 100%; cursor: pointer;"
                  />
                </v-btn>
                <v-btn
                  v-if="tempProfilePic || profilePic"
                  color="error"
                  variant="outlined"
                  block
                  rounded="lg"
                  @click="removeProfilePicture"
                >
                  {{ t('remove') }}
                </v-btn>
              </div>
            </v-col>

            <!-- Profile Details Column -->
            <v-col cols="12" sm="8" md="9">
              <!-- Display Mode -->
              <div v-if="!isEditing" class="profile-details">
                <v-row dense>
                  <v-col cols="12" sm="6" class="mb-4">
                    <div class="detail-item">
                      <v-icon left color="primary" class="mr-3">mdi-email</v-icon>
                      <div class="detail-content">
                        <span class="detail-label">{{ t('email') }}</span>
                        <span class="detail-value">{{ email || 'Not provided' }}</span>
                      </div>
                    </div>
                  </v-col>
                  <v-col cols="12" sm="6" class="mb-4">
                    <div class="detail-item">
                      <v-icon left color="primary" class="mr-3">mdi-account</v-icon>
                      <div class="detail-content">
                        <span class="detail-label">{{ t('name') }}</span>
                        <span class="detail-value">{{ name || 'Not provided' }}</span>
                      </div>
                    </div>
                  </v-col>
                  <v-col cols="12" sm="6" class="mb-4">
                    <div class="detail-item">
                      <v-icon left color="primary" class="mr-3">mdi-phone</v-icon>
                      <div class="detail-content">
                        <span class="detail-label">{{ t('phoneNumber') }}</span>
                        <span class="detail-value">{{ phoneNumber || 'Not provided' }}</span>
                      </div>
                    </div>
                  </v-col>
                  <v-col cols="12" sm="6" class="mb-4">
                    <div class="detail-item">
                      <v-icon left color="primary" class="mr-3">mdi-map-marker</v-icon>
                      <div class="detail-content">
                        <span class="detail-label">{{ t('address') }}</span>
                        <span class="detail-value">{{ address || 'Not provided' }}</span>
                      </div>
                    </div>
                  </v-col>
                  <v-col cols="12" class="mb-4">
                    <div class="detail-item">
                      <v-icon left color="primary" class="mr-3">mdi-information</v-icon>
                      <div class="detail-content">
                        <span class="detail-label">{{ t('about') }}</span>
                        <span class="detail-value">{{ about || 'Not provided' }}</span>
                      </div>
                    </div>
                  </v-col>
                </v-row>
                <v-row justify="end">
                  <v-col cols="12" sm="auto">
                    <v-btn
                      color="primary"
                      class="edit-profile-btn"
                      rounded="lg"
                      size="large"
                      @click="isEditing = true"
                    >
                      <v-icon left>mdi-pencil</v-icon>
                      {{ t('editProfile') }}
                    </v-btn>
                  </v-col>
                </v-row>
              </div>

              <!-- Edit Mode -->
              <v-form v-else ref="form" @submit.prevent="updateProfile" class="edit-form">
                <v-row dense>
                  <v-col cols="12" sm="6">
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
                  <v-col cols="12" sm="6">
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
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="tempPhoneNumber"
                      :label="t('phoneNumber')"
                      prepend-inner-icon="mdi-phone"
                      outlined
                      dense
                      :rules="phoneRules"
                      class="rounded-lg"
                    />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="tempAddress"
                      :label="t('address')"
                      prepend-inner-icon="mdi-map-marker"
                      outlined
                      dense
                      :rules="[v => (v ? v.length <= 200 : true) || t('addressTooLong')]"
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
                      :rules="[v => (v ? v.length <= 500 : true) || t('aboutTooLong')]"
                      class="rounded-lg"
                    />
                  </v-col>
                </v-row>
                <v-row justify="center" class="mt-6">
                  <v-col cols="12" sm="6" md="3" class="mb-3 mb-sm-0">
                    <v-btn
                      color="grey"
                      variant="outlined"
                      block
                      rounded="lg"
                      size="large"
                      @click="cancelEdit"
                    >
                      {{ t('cancel') }}
                    </v-btn>
                  </v-col>
                  <v-col cols="12" sm="6" md="3">
                    <v-btn
                      color="primary"
                      type="submit"
                      block
                      rounded="lg"
                      size="large"
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
import { useDisplay, useTheme } from 'vuetify';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { deleteField } from 'firebase/firestore';
import type { VForm } from 'vuetify/components';
import axios from 'axios';

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const { smAndDown, mdAndDown } = useDisplay();
const theme = useTheme();

// Form reference
const form = ref<VForm | null>(null);

// Reactive state for user data
const email = ref('');
const name = ref('');
const phoneNumber = ref('');
const address = ref('');
const about = ref('');
const profilePic = ref<string | null>(null);

// Temporary state for editing
const tempName = ref('');
const tempPhoneNumber = ref('');
const tempAddress = ref('');
const tempAbout = ref('');
const tempProfilePic = ref<string | null>(null);
const tempProfilePicFile = ref<File | null>(null);

// UI state
const isEditing = ref(false);
const isLoading = ref(true);
const loading = ref(false);
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');

// Dark mode state
const darkMode = computed(() => theme.global.current.value.dark);

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Computed properties for responsive design
const avatarSize = computed(() => {
  if (smAndDown.value) return '120';
  if (mdAndDown.value) return '150';
  return '180';
});

const textareaRows = computed(() => {
  if (smAndDown.value) return 3;
  return 4;
});

// Phone number validation rules
const phoneRules = [
  (v: string) => !v || /^\d{10}$/.test(v) || t('phoneInvalid'), // Optional, must be 10 digits if provided
];

// Fetch user profile on mount
onMounted(async () => {
  if (!authStore.isAuthenticated || !authStore.currentUser) {
    router.push('/login');
    return;
  }

  email.value = authStore.currentUser.email || '';
  try {
    const userId = authStore.currentUser.id;
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      name.value = data.displayName || '';
      phoneNumber.value = data.phoneNumber || '';
      address.value = data.address || '';
      about.value = data.about || '';
      profilePic.value = data.profilePicture || null;

      tempName.value = name.value;
      tempPhoneNumber.value = phoneNumber.value;
      tempAddress.value = address.value;
      tempAbout.value = about.value;
      tempProfilePic.value = null;
    } else {
      throw new Error('User document does not exist');
    }
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
    if (file.size > 5 * 1024 * 1024) {
      showSnackbar(t('fileTooLarge'), 'error');
      return;
    }
    tempProfilePicFile.value = file;
    tempProfilePic.value = URL.createObjectURL(file);
  }
};

// Remove profile picture
const removeProfilePicture = () => {
  profilePic.value = null;
  tempProfilePic.value = null;
  tempProfilePicFile.value = null;
};

// Upload image to Cloudinary
const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData
    );
    return response.data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

// Update profile
const updateProfile = async () => {
  const validation = await form.value?.validate();
  if (!validation?.valid) {
    showSnackbar(t('formIncomplete'), 'error');
    return;
  }

  try {
    loading.value = true;
    const userId = authStore.currentUser?.id;
    if (!userId) throw new Error('User ID not available');

    let newProfilePicUrl: string | null = profilePic.value;
    if (tempProfilePicFile.value) {
      newProfilePicUrl = await uploadToCloudinary(tempProfilePicFile.value);
    } else if (tempProfilePic.value === null && profilePic.value !== null) {
      newProfilePicUrl = null;
    }

    const updateData: { [key: string]: any } = {
      displayName: tempName.value,
      phoneNumber: tempPhoneNumber.value,
      address: tempAddress.value,
      about: tempAbout.value,
    };

    if (newProfilePicUrl === null) {
      updateData.profilePicture = deleteField();
    } else if (newProfilePicUrl) {
      updateData.profilePicture = newProfilePicUrl;
    }

    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, updateData);

    name.value = tempName.value;
    phoneNumber.value = tempPhoneNumber.value;
    address.value = tempAddress.value;
    about.value = tempAbout.value;
    profilePic.value = newProfilePicUrl;

    if (authStore.currentUser) {
      authStore.currentUser.displayName = tempName.value;
      authStore.currentUser.profilePicture = newProfilePicUrl || undefined;
    }

    showSnackbar(t('profileUpdated'), 'success');
    isEditing.value = false;
  } catch (error) {
    console.error('Error updating profile:', error);
    showSnackbar(t('updateProfileFailed'), 'error');
  } finally {
    loading.value = false;
    tempProfilePicFile.value = null;
    tempProfilePic.value = null;
  }
};

// Cancel editing
const cancelEdit = () => {
  isEditing.value = false;
  tempName.value = name.value;
  tempPhoneNumber.value = phoneNumber.value;
  tempAddress.value = address.value;
  tempAbout.value = about.value;
  tempProfilePic.value = null;
  tempProfilePicFile.value = null;
  form.value?.resetValidation();
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
  background: #f7f9fc;
  padding: 2rem;
  transition: background-color 0.3s ease;
}

.dark-mode.profile-container {
  background: #121212;
}

.profile-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.profile-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.dark-mode .profile-card {
  background: #1e1e1e;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.dark-mode .profile-card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}

.profile-avatar {
  border: 3px solid #e0e0e0;
  transition: transform 0.3s ease;
}

.profile-avatar:hover {
  transform: scale(1.05);
}

.profile-pic-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 200px;
  margin: 0 auto;
}

.profile-details {
  padding: 1rem 0;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  word-break: break-word;
  margin-bottom: 1rem;
}

.detail-content {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-weight: 600;
  color: #555;
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.detail-value {
  color: #333;
  font-size: 1.1rem;
}

.dark-mode .detail-label {
  color: #bbb;
}

.dark-mode .detail-value {
  color: #fff;
}

.edit-form .v-text-field,
.edit-form .v-textarea {
  background-color: #fafafa;
  border-radius: 8px;
  margin-bottom: 1rem;
  transition: background-color 0.3s ease;
}

.dark-mode .edit-form .v-text-field,
.dark-mode .edit-form .v-textarea {
  background-color: #2a2a2a;
  color: #fff;
}

.v-text-field[readonly] {
  background-color: #f5f5f5;
  color: #444;
}

.dark-mode .v-text-field[readonly] {
  background-color: #333;
  color: #ccc;
}

.v-btn {
  border-radius: 10px;
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0.5px;
  padding: 0 20px;
  transition: all 0.3s ease;
}

.v-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.edit-profile-btn {
  background: linear-gradient(135deg, var(--v-theme-primary), var(--v-theme-primary-darken-1));
  color: white !important;
  padding: 0 24px;
  height: 48px;
}

.back-btn {
  background: rgba(var(--v-theme-primary), 0.1);
}

.text-h3 {
  color: #333;
}

.dark-mode .text-h3 {
  color: #fff;
}

/* Responsive Design */
@media (max-width: 599px) {
  .profile-container {
    padding: 1rem;
  }

  .profile-card {
    padding: 1.5rem;
  }

  .text-h3 {
    font-size: 1.5rem;
  }

  .v-btn {
    font-size: 0.875rem;
    min-height: 40px;
  }

  .profile-pic-actions {
    max-width: 150px;
  }
}

@media (min-width: 600px) and (max-width: 959px) {
  .profile-container {
    padding: 1.5rem;
  }

  .profile-card {
    padding: 2rem;
  }

  .text-h3 {
    font-size: 1.75rem;
  }
}

@media (min-width: 960px) and (max-width: 1263px) {
  .profile-container {
    padding: 2rem;
  }

  .profile-card {
    padding: 2.5rem;
  }

  .text-h3 {
    font-size: 2rem;
  }
}

@media (min-width: 1264px) {
  .profile-container {
    padding: 2.5rem;
  }

  .profile-card {
    padding: 3rem;
  }

  .text-h3 {
    font-size: 2.25rem;
  }
}
</style>