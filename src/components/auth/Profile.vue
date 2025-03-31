<!-- src/components/auth/Profile.vue -->
<template>
  <v-container class="profile-container">
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
            >
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
          </v-col>
          <v-col>
            <h1 class="text-h3 font-weight-medium">
              {{ t('profile') }}
            </h1>
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
        <v-card v-else rounded="lg" elevation="3" class="pa-6 pa-sm-8 profile-card">
          <v-row>
            <!-- Profile Picture Column -->
            <v-col cols="12" sm="4" md="3" class="text-center">
              <v-avatar :size="avatarSize" class="profile-avatar mb-6">
                <img
                  :src="isEditing ? (tempProfilePic || profilePic || 'https://via.placeholder.com/150') : (profilePic || 'https://via.placeholder.com/150')"
                  alt="Profile Picture"
                />
              </v-avatar>
              <div v-if="isEditing" class="mb-6">
                <v-btn color="primary" outlined class="mb-3" block>
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
                  outlined
                  block
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
                <v-row>
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
                <v-row>
                  <v-col cols="12" class="text-right">
                    <v-btn
                      color="primary"
                      class="edit-profile-btn"
                      rounded
                      large
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
                <v-row>
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
                      :rules="[v => !v || /^\+?[1-9]\d{1,14}$/.test(v) || t('phoneInvalid')]"
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
                <v-row class="mt-6">
                  <v-col cols="12" sm="6" md="3" class="mb-3 mb-sm-0">
                    <v-btn
                      color="grey"
                      outlined
                      block
                      rounded
                      large
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
                      rounded
                      large
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
        <v-btn color="white" text @click="snackbar = false">
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
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { deleteField } from 'firebase/firestore';
import type { VForm } from 'vuetify/components';
import axios from 'axios';

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const { smAndDown, mdAndDown } = useDisplay();

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

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Computed properties for responsive design
const avatarSize = computed(() => {
  if (smAndDown.value) return '120'; // Mobile
  if (mdAndDown.value) return '150'; // Tablet
  return '180'; // Laptop
});

const textareaRows = computed(() => {
  if (smAndDown.value) return 3; // Mobile
  return 4; // Tablet and Laptop
});

// Fetch user profile on mount
onMounted(async () => {
  if (!authStore.isAuthenticated || !authStore.currentUser) {
    router.push('/login');
    return;
  }

  // Set initial user data
  email.value = authStore.currentUser.email || '';

  // Fetch profile data from Firestore
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

      // Set temp values for editing
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
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      showSnackbar(t('fileTooLarge'), 'error');
      return;
    }
    tempProfilePicFile.value = file;
    tempProfilePic.value = URL.createObjectURL(file); // Preview the new image
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
    return response.data.secure_url; // Return the secure URL of the uploaded image
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

    // Upload new profile picture to Cloudinary if selected
    let newProfilePicUrl: string | null = profilePic.value;
    if (tempProfilePicFile.value) {
      newProfilePicUrl = await uploadToCloudinary(tempProfilePicFile.value);
    } else if (tempProfilePic.value === null && profilePic.value !== null) {
      newProfilePicUrl = null; // User removed the profile picture
    }

    // Prepare the update data
    const updateData: { [key: string]: any } = {
      displayName: tempName.value,
      phoneNumber: tempPhoneNumber.value,
      address: tempAddress.value,
      about: tempAbout.value,
    };

    // Only include profilePicture in the update if it’s explicitly changed
    if (newProfilePicUrl === null) {
      updateData.profilePicture = deleteField(); // Remove the field from Firestore
    } else if (newProfilePicUrl) {
      updateData.profilePicture = newProfilePicUrl;
    }

    // Update user data in Firestore
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, updateData);

    // Update local state
    name.value = tempName.value;
    phoneNumber.value = tempPhoneNumber.value;
    address.value = tempAddress.value;
    about.value = tempAbout.value;
    profilePic.value = newProfilePicUrl;

    // Update authStore if necessary
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
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff; /* Pure white background */
  padding: 1.5rem;
}

.profile-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.profile-avatar {
  border: 3px solid #e0e0e0;
}

.profile-details {
  padding: 1rem 0;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  word-break: break-word;
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

.edit-form .v-text-field,
.edit-form .v-textarea {
  background-color: #fafafa;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.v-text-field[readonly] {
  background-color: #f5f5f5;
  color: #444;
}

.v-btn {
  border-radius: 10px;
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0.5px;
  padding: 0 20px;
}

.edit-profile-btn {
  background-color: #1976d2 !important; /* Vuetify primary color */
  color: white !important;
  padding: 0 24px;
  height: 48px;
}

.text-h3 {
  color: #333;
}

/* Responsive Design */
@media (max-width: 599px) { /* xs */
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

  .v-col {
    padding: 6px;
  }

  .detail-value {
    font-size: 0.95rem;
  }

  .detail-label {
    font-size: 0.9rem;
  }

  .edit-profile-btn {
    height: 40px;
    padding: 0 16px;
  }
}

@media (min-width: 600px) and (max-width: 959px) { /* sm */
  .profile-container {
    padding: 1.5rem;
  }

  .profile-card {
    padding: 2rem;
  }

  .text-h3 {
    font-size: 1.75rem;
  }

  .v-btn {
    font-size: 0.9375rem;
  }

  .v-col {
    padding: 8px;
  }
}

@media (min-width: 960px) and (max-width: 1263px) { /* md */
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

@media (min-width: 1264px) { /* lg and up */
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