<!-- src/components/ExpenseForm.vue -->
<template>
  <v-dialog v-model="dialog" :max-width="dialogMaxWidth" persistent>
    <v-card elevation="6" class="mx-auto expense-form-card">
      <v-card-title class="headline primary white--text py-3">
        {{ isEdit ? t('editExpense') : t('addExpense') }}
      </v-card-title>
      <v-card-text class="pt-6">
        <!-- Custom Stepper Header -->
        <v-stepper v-model="step" flat>
          <v-stepper-header class="stepper-header">
            <v-stepper-item :value="'1'" :title="t('basicDetails')" />
            <v-divider />
            <v-stepper-item :value="'2'" :title="t('dateDetails')" />
            <v-divider />
            <v-stepper-item :value="'3'" :title="t('categoryAndPayment')" />
            <v-divider />
            <v-stepper-item :value="'4'" :title="t('reviewAndSubmit')" />
          </v-stepper-header>
        </v-stepper>

        <!-- Step 1: Basic Details -->
        <div v-if="step === '1'">
          <v-form ref="formStep1" @submit.prevent="nextStep(1)">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="form.title"
                  :label="t('title')"
                  :rules="[v => !!v || t('titleRequired'), v => v.length <= 100 || t('max100Characters')]"
                  outlined
                  dense
                  required
                  autofocus
                  :aria-label="t('title')"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model.number="form.amount"
                  :label="t('amount')"
                  type="number"
                  :rules="[v => (v !== null && v > 0) || t('amountMustBePositive')]"
                  outlined
                  dense
                  required
                  :aria-label="t('amount')"
                />
              </v-col>
            </v-row>
            <v-row class="mt-4">
              <v-col cols="12" sm="6">
                <v-btn color="grey" text @click="closeDialog" block>
                  {{ t('cancel') }}
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6">
                <v-btn color="primary" type="submit" block elevation="2">
                  {{ t('next') }}
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </div>

        <!-- Step 2: Date Details -->
        <div v-if="step === '2'">
          <v-form ref="formStep2" @submit.prevent="nextStep(2)">
            <v-row>
              <v-col cols="12">
                <v-menu
                  v-model="fromDateMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ props }">
                    <v-text-field
                      v-model="form.date"
                      :label="t('date')"
                      :rules="[v => /^\d{2}-\d{2}-\d{4}$/.test(v) || t('invalidDateFormat')]"
                      placeholder="dd-mm-yyyy"
                      outlined
                      dense
                      required
                      readonly
                      v-bind="props"
                      :aria-label="t('date')"
                    />
                  </template>
                  <v-date-picker
                    v-model="fromDate"
                    @update:modelValue="updateFromDate"
                    :max="new Date().toISOString().split('T')[0]"
                    no-title
                    @click:cancel="fromDateMenu = false"
                    @click:save="fromDateMenu = false"
                  />
                </v-menu>
              </v-col>
            </v-row>
            <v-row class="mt-4">
              <v-col cols="12" sm="6">
                <v-btn color="grey" text @click="step = '1'" block>
                  {{ t('back') }}
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6">
                <v-btn color="primary" type="submit" block elevation="2">
                  {{ t('next') }}
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </div>

        <!-- Step 3: Category, Payment, and User Selection -->
        <div v-if="step === '3'">
          <v-form ref="formStep3" @submit.prevent="nextStep(3)">
            <v-row>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="form.category"
                  :items="categories.map(cat => ({ value: cat, text: t(`categories.${cat.toLowerCase()}`) }))"
                  :label="t('category')"
                  :rules="[v => !!v || t('categoryRequired')]"
                  outlined
                  dense
                  required
                  item-title="text"
                  item-value="value"
                  :aria-label="t('category')"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="form.paymentMethod"
                  :items="paymentMethods.map(method => ({ value: method, text: t(`paymentMethods.${method.toLowerCase()}`) }))"
                  :label="t('paymentMethod')"
                  :rules="[v => !!v || t('paymentMethodRequired')]"
                  outlined
                  dense
                  required
                  item-title="text"
                  item-value="value"
                  :aria-label="t('paymentMethod')"
                />
              </v-col>
            </v-row>

            <!-- Add Shared Users -->
            <h3 class="mb-2">{{ t('splitWith') }}</h3>
            <v-row>
              <v-col cols="12" sm="9">
                <v-autocomplete
                  v-model="selectedUser"
                  :items="availableUsers"
                  :label="t('selectUser')"
                  item-title="name"
                  item-value="id"
                  outlined
                  dense
                  :aria-label="t('selectUser')"
                  return-object
                />
              </v-col>
              <v-col cols="12" sm="3">
                <v-btn
                  color="primary"
                  @click="addSharedUser"
                  :disabled="!selectedUser"
                  block
                  elevation="2"
                >
                  {{ t('add') }}
                </v-btn>
              </v-col>
            </v-row>

            <!-- Display Added Shared Users -->
            <v-list v-if="form.sharedWith.length" dense class="mt-2 shared-users-list">
              <v-list-item
                v-for="(user, index) in form.sharedWith"
                :key="index"
                class="shared-user-item"
              >
                <v-list-item-content>
                  <v-list-item-title>{{ getUserName(user.userId) }} ({{ getUserEmail(user.userId) }})</v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn icon color="red" @click="removeSharedUser(index)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list>
            <p v-else class="text-grey">{{ t('noUsersSelected') }}</p>

            <v-row class="mt-4">
              <v-col cols="12" sm="6">
                <v-btn color="grey" text @click="step = '2'" block>
                  {{ t('back') }}
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6">
                <v-btn color="primary" type="submit" block elevation="2">
                  {{ t('next') }}
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </div>

        <!-- Step 4: Review and Submit -->
        <div v-if="step === '4'">
          <v-form ref="formStep4" @submit.prevent="saveExpense">
            <v-card flat class="mb-4 review-card">
              <v-card-text>
                <h3 class="mb-2">{{ t('reviewYourExpense') }}</h3>
                <v-row>
                  <v-col cols="12" sm="6">
                    <p><strong>{{ t('title') }}:</strong> {{ form.title }}</p>
                    <p><strong>{{ t('amount') }}:</strong> {{ formatCurrency(form.amount) }}</p>
                    <p><strong>{{ t('date') }}:</strong> {{ form.date }}</p>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <p><strong>{{ t('category') }}:</strong> {{ form.category }}</p>
                    <p><strong>{{ t('paymentMethod') }}:</strong> {{ form.paymentMethod }}</p>
                    <p><strong>{{ t('yourShare') }}:</strong> {{ formatCurrency(splitAmount) }}</p>
                  </v-col>
                  <v-col cols="12">
                    <p><strong>{{ t('splitWith') }}:</strong> {{ sharedUsersDisplay }}</p>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
            <v-row class="mt-4">
              <v-col cols="12" sm="6">
                <v-btn color="grey" text @click="step = '3'" block>
                  {{ t('back') }}
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6">
                <v-btn color="primary" type="submit" block elevation="2" :loading="loading">
                  {{ t('submit') }}
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </div>
      </v-card-text>
    </v-card>

    <!-- Snackbar for Feedback -->
    <v-snackbar
      v-model="snackbar.show"
      :timeout="3000"
      :color="snackbar.color"
      class="custom-snackbar"
      :class="{ 'dark-mode': isDarkMode }"
      location="top right"
    >
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="snackbar.show = false"
          class="snackbar-close-btn"
        >
          {{ t('close') }}
        </v-btn>
      </template>
    </v-snackbar>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, watch, computed, reactive, onMounted } from 'vue';
import { useExpenseStore } from '@/stores/expenseStore';
import { useAuthStore } from '@/stores/auth';
import type { Expense } from '@/types/expense';
import type { VForm } from 'vuetify/components';
import { useI18n } from 'vue-i18n';
import { useDisplay } from 'vuetify';

// Define props and emits
const props = defineProps<{
  show: boolean;
  expense?: Expense;
}>();
const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
}>();

// Stores
const store = useExpenseStore();
const authStore = useAuthStore();
const dialog = ref(props.show);

// Use i18n for translations
const { t, locale } = useI18n();
const { smAndDown, mdAndDown } = useDisplay();

// Use `reactive()` for form state
const form = reactive({
  title: '',
  amount: 0,
  date: '',
  category: null as Expense['category'] | null,
  paymentMethod: null as Expense['paymentMethod'] | null,
  userId: authStore.currentUser?.id || 0,
  sharedWith: [] as { userId: string; share: number }[],
});

// Selected user for adding to sharedWith
const selectedUser = ref<any>(null);

// Form References for Validation
const formStep1 = ref<VForm | null>(null);
const formStep2 = ref<VForm | null>(null);
const formStep3 = ref<VForm | null>(null);
const formStep4 = ref<VForm | null>(null);

// Stepper State
const step = ref('1');

// Date Picker State
const fromDateMenu = ref(false);
const fromDate = ref<Date | null>(null);

// Snackbar State
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
});

// Loading State
const loading = ref(false);

// Dropdown Options
const categories: Array<Expense['category']> = ['Food', 'Travel', 'Shopping', 'Bills', 'Others'];
const paymentMethods: Array<Expense['paymentMethod']> = ['Cash', 'Card', 'Online'];
const isEdit = computed(() => !!props.expense);

// Use store.users instead of local users
const availableUsers = computed(() => {
  return store.users.filter(
    (user) =>
      user.id !== String(form.userId) &&
      !form.sharedWith.some((shared) => shared.userId === user.id)
  );
});

// Computed properties for user selection
const sharedUsersDisplay = computed(() => {
  if (!form.sharedWith.length) return t('noUsersSelected');
  return form.sharedWith.map((user) => `${store.getUserName(user.userId)} (${store.getUserEmail(user.userId)})`).join(', ');
});

const splitAmount = computed(() => {
  const totalUsers = form.sharedWith.length + 1; // Include current user
  return form.amount / totalUsers;
});

// Responsive dialog width
const dialogMaxWidth = computed(() => {
  if (smAndDown.value) return '90%'; // Mobile
  if (mdAndDown.value) return '700'; // Tablet
  return '800'; // Laptop
});

// Get user name and email from store
const getUserName = (userId: string) => store.getUserName(userId);
const getUserEmail = (userId: string) => store.getUserEmail(userId);

// Add a shared user
const addSharedUser = () => {
  if (selectedUser.value) {
    form.sharedWith.push({
      userId: String(selectedUser.value.id),
      share: 0, // Will be calculated when saving
    });
    selectedUser.value = null;
  }
};

// Remove a shared user
const removeSharedUser = (index: number) => {
  form.sharedWith.splice(index, 1);
};

// Check if dark mode is enabled
const isDarkMode = computed(() => document.documentElement.classList.contains('dark-mode'));

// Format date to dd-mm-yyyy
const formatDate = (date: Date | null): string => {
  if (!date) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Format the amount with the currency symbol based on the locale
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: 'INR',
  }).format(value);
};

// Update From Date
const updateFromDate = (date: Date | null) => {
  form.date = formatDate(date);
  fromDateMenu.value = false;
};

// Sync dialog with props.show and reset form
watch(
  () => props.show,
  (newVal) => {
    dialog.value = newVal;
    if (newVal) {
      if (props.expense) {
        Object.assign(form, {
          title: props.expense.title,
          amount: props.expense.amount,
          date: props.expense.date,
          category: props.expense.category,
          paymentMethod: props.expense.paymentMethod,
          userId: props.expense.userId,
          sharedWith: props.expense.sharedWith || [],
        });
        if (props.expense.date) {
          const [day, month, year] = props.expense.date.split('-').map(Number);
          fromDate.value = new Date(year, month - 1, day);
        }
      } else {
        Object.assign(form, {
          title: '',
          amount: 0,
          date: '',
          category: null,
          paymentMethod: null,
          userId: authStore.currentUser?.id || 0,
          sharedWith: [],
        });
        fromDate.value = null;
      }
      step.value = '1';
      formStep1.value?.resetValidation();
      formStep2.value?.resetValidation();
      formStep3.value?.resetValidation();
      formStep4.value?.resetValidation();
    }
  },
);

// Emit dialog state changes to parent
watch(dialog, (val) => {
  emit('update:show', val);
});

// Navigate to next step after validation
const nextStep = async (currentStep: number) => {
  let formRef: VForm | null = null;
  if (currentStep === 1) formRef = formStep1.value;
  else if (currentStep === 2) formRef = formStep2.value;
  else if (currentStep === 3) formRef = formStep3.value;

  if (!formRef) {
    console.error(`Form reference for step ${currentStep} is undefined`);
    return;
  }

  const { valid } = await formRef.validate();
  if (!valid) return;

  step.value = String(currentStep + 1);
};

// Save Expense
const saveExpense = async () => {
  if (!authStore.getToken) {
    snackbar.value = {
      show: true,
      message: t('notAuthenticated'),
      color: 'error',
    };
    return;
  }

  // Calculate the share for each user
  const totalUsers = form.sharedWith.length + 1; // Include current user
  const sharePerUser = form.amount / totalUsers;

  // Update sharedWith with calculated shares
  const sharedWith = form.sharedWith.map((user) => ({
    ...user,
    share: sharePerUser,
  }));

  const expenseData: Omit<Expense, 'id'> = {
    title: form.title!,
    amount: form.amount!,
    date: form.date!,
    category: form.category!,
    paymentMethod: form.paymentMethod!,
    userId: Number(form.userId),
    sharedWith,
  };

  loading.value = true;
  try {
    if (isEdit.value && props.expense?.id) {
      await store.updateExpense({ ...expenseData, id: props.expense.id });
      snackbar.value = {
        show: true,
        message: t('expenseUpdated'),
        color: 'success',
      };
    } else {
      await store.addExpense(expenseData);
      snackbar.value = {
        show: true,
        message: t('expenseAdded'),
        color: 'success',
      };
    }
    closeDialog();
  } catch (error: any) {
    snackbar.value = {
      show: true,
      message: error.message || t('operationFailed'),
      color: 'error',
    };
  } finally {
    loading.value = false;
  }
};

// Close Dialog and Reset Form
const closeDialog = () => {
  dialog.value = false;
  emit('update:show', false);
};

// Fetch users when component mounts using store
onMounted(() => {
  store.fetchUsers();
});
</script>

<style scoped>
.expense-form-card {
  border-radius: 12px;
  background: #ffffff;
  transition: all 0.3s ease;
}

.expense-form-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stepper-header {
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.5rem;
}

.v-stepper-item {
  flex: 1;
  text-align: center;
  padding: 0.5rem;
  font-size: 0.9rem;
  white-space: normal;
  word-wrap: break-word;
}

.v-divider {
  flex: 0 0 auto;
  margin: 0 0.5rem;
}

.v-text-field,
.v-select,
.v-autocomplete {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.v-btn {
  border-radius: 8px;
  text-transform: none;
  font-weight: 500;
}

.review-card {
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.shared-users-list {
  max-height: 150px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 0.5rem;
}

.shared-user-item {
  border-bottom: 1px solid #e0e0e0;
  padding: 0.5rem 0;
}

.custom-snackbar {
  transition: all 0.3s ease;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.snackbar-close-btn {
  color: #ffffff !important;
}

/* Mobile (xs and sm) */
@media (max-width: 959px) {
  .expense-form-card {
    padding: 0.5rem;
  }

  .v-card-title {
    font-size: 1.25rem !important;
  }

  .stepper-header {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding: 0 0.5rem;
  }

  .v-stepper-item {
    font-size: 0.75rem;
    padding: 0.25rem;
    min-width: 80px;
    white-space: nowrap;
  }

  .v-divider {
    display: none;
  }

  .v-text-field,
  .v-select,
  .v-autocomplete {
    font-size: 0.875rem;
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

  .shared-users-list {
    max-height: 120px;
  }

  .review-card {
    padding: 0.5rem;
  }

  h3 {
    font-size: 1rem !important;
  }

  p {
    font-size: 0.875rem;
  }
}

/* Tablet (md) */
@media (min-width: 960px) and (max-width: 1279px) {
  .expense-form-card {
    padding: 1rem;
  }

  .v-card-title {
    font-size: 1.5rem !important;
  }

  .v-stepper-item {
    font-size: 0.85rem;
    padding: 0.5rem;
    min-width: 120px;
  }

  .v-divider {
    margin: 0 0.25rem;
  }

  .v-text-field,
  .v-select,
  .v-autocomplete {
    font-size: 0.9375rem;
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

  .shared-users-list {
    max-height: 140px;
  }

  h3 {
    font-size: 1.125rem !important;
  }

  p {
    font-size: 0.9375rem;
  }
}

/* Laptop (lg and up) */
@media (min-width: 1280px) {
  .expense-form-card {
    padding: 1.5rem;
  }

  .v-card-title {
    font-size: 1.75rem !important;
  }

  .v-stepper-item {
    font-size: 0.9rem;
    padding: 0.5rem;
    min-width: 150px;
  }

  .v-divider {
    margin: 0 0.5rem;
  }

  .v-text-field,
  .v-select,
  .v-autocomplete {
    font-size: 1rem;
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

  .shared-users-list {
    max-height: 150px;
  }

  h3 {
    font-size: 1.25rem !important;
  }

  p {
    font-size: 1rem;
  }
}
</style>