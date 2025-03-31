<!-- src/components/ExpenseForm.vue -->
<template>
  <v-dialog v-model="dialog" :max-width="dialogMaxWidth" persistent>
    <v-card rounded="lg" class="expense-form-card">
      <v-card-title class="text-h5 font-weight-bold primary--text">
        {{ isEdit ? t('editExpense') : t('addExpense') }}
        <v-spacer />
        <v-btn icon @click="closeDialog" :aria-label="t('close')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="pt-4">
        <v-form ref="form" @submit.prevent="saveExpense">
          <!-- Basic Details Section -->
          <v-row>
            <v-col cols="12">
              <h3 class="text-subtitle-1 font-weight-medium mb-3">{{ t('basicDetails') }}</h3>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="title"
                :label="t('title')"
                :rules="[v => !!v || t('titleRequired'), v => v.length <= 100 || t('titleTooLong')]"
                outlined
                dense
                prepend-inner-icon="mdi-text"
                class="rounded-lg"
                @input="logInput('title', $event)"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="amount"
                :label="t('amount')"
                type="number"
                :rules="[v => (typeof v === 'number' && v > 0) || t('amountPositive')]"
                outlined
                dense
                prepend-inner-icon="mdi-currency-inr"
                class="rounded-lg"
                @input="logInput('amount', $event)"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="date"
                :label="t('date')"
                :rules="[v => /^\d{2}-\d{2}-\d{4}$/.test(v.trim()) || t('dateFormat')]"
                placeholder="dd-mm-yyyy"
                prepend-inner-icon="mdi-calendar"
                outlined
                dense
                readonly
                class="rounded-lg"
                @click:prepend-inner="fromDateMenu = true"
                @input="logInput('date', $event)"
              />
              <v-menu v-model="fromDateMenu" :close-on-content-click="false">
                <template v-slot:activator="{ props }">
                  <span v-bind="props" style="display: none;"></span>
                </template>
                <v-date-picker
                  v-model="fromDate"
                  @update:modelValue="updateFromDate"
                  :max="new Date().toISOString().split('T')[0]"
                  no-title
                />
              </v-menu>
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="category"
                :items="categories"
                :label="t('category')"
                :rules="[v => !!v || t('categoryRequired')]"
                outlined
                dense
                prepend-inner-icon="mdi-tag"
                class="rounded-lg"
                @update:modelValue="logInput('category', $event)"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="paymentMethod"
                :items="paymentMethods"
                :label="t('paymentMethod')"
                :rules="[v => !!v || t('paymentMethodRequired')]"
                outlined
                dense
                prepend-inner-icon="mdi-credit-card"
                class="rounded-lg"
                @update:modelValue="logInput('paymentMethod', $event)"
              />
            </v-col>
          </v-row>

          <!-- Share With Section -->
          <v-row class="mt-4">
            <v-col cols="12">
              <h3 class="text-subtitle-1 font-weight-medium mb-3">{{ t('shareWith') }}</h3>
            </v-col>
            <v-col cols="12" class="d-flex align-center flex-wrap">
              <v-autocomplete
                v-model="selectedUser"
                :items="availableUsers"
                item-title="displayName"
                item-value="id"
                :label="t('selectUser')"
                outlined
                dense
                prepend-inner-icon="mdi-account-plus"
                class="rounded-lg user-select"
                clearable
                @update:modelValue="logInput('selectedUser', $event)"
              />
              <v-btn
                color="primary"
                rounded
                :disabled="!selectedUser"
                @click="addSharedUser"
                class="add-user-btn ml-3"
              >
                {{ t('addUser') }}
              </v-btn>
            </v-col>
            <v-col cols="12">
              <v-list v-if="sharedWith.length" class="shared-users-list">
                <v-list-item v-for="(user, index) in sharedWith" :key="user.userId" class="shared-user-item">
                  <v-list-item-title class="d-flex align-center">
                    <v-icon left color="primary" class="mr-2">mdi-account</v-icon>
                    <span class="user-name">{{ getUserName(user.userId) }}</span>
                    <span class="ml-2 text-grey-darken-1">{{ formatCurrency(splitAmount) }}</span>
                  </v-list-item-title>
                  <v-list-item-action>
                    <v-btn icon color="error" class="delete-user-btn">
                      <v-icon @click="removeSharedUser(index)">mdi-trash-can</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
              <p v-else class="text-body-2 text-grey-darken-1">{{ t('noUsersSelected') }}</p>
            </v-col>
          </v-row>

          <!-- Actions -->
          <v-row class="mt-6">
            <v-col cols="12" sm="6">
              <v-btn
                color="primary"
                type="submit"
                block
                rounded
                large
                :loading="loading"
                class="action-btn"
              >
                {{ t('save') }}
              </v-btn>
            </v-col>
            <v-col cols="12" sm="6">
              <v-btn
                color="grey darken-1"
                outlined
                block
                rounded
                large
                @click="closeDialog"
                class="action-btn"
              >
                {{ t('cancel') }}
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :timeout="3000"
      :color="snackbar.color"
      location="top right"
      rounded="pill"
      elevation="4"
    >
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbar.show = false">{{ t('close') }}</v-btn>
      </template>
    </v-snackbar>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { addExpense, updateExpense } from '@/services/expenseService';
import type { Expense } from '@/types/expense';
import type { VForm } from 'vuetify/components';
import { useI18n } from 'vue-i18n';
import { useDisplay } from 'vuetify';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';

// Define props and emits
const props = defineProps<{
  show: boolean;
  expense?: Expense;
}>();
const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
  (e: 'expense-saved', expense: Expense): void;
}>();

// Stores and Services
const authStore = useAuthStore();
const dialog = ref(props.show);

// Use i18n and display
const { t, locale } = useI18n();
const { smAndDown, mdAndDown } = useDisplay();

// Form state as individual refs
const title = ref('');
const amount = ref(1);
const date = ref('');
const category = ref<Expense['category']>('Food');
const paymentMethod = ref<Expense['paymentMethod']>('Cash');
const userId = ref(authStore.currentUser?.id || '');
const sharedWith = ref<{ userId: string; name: string; share: number }[]>([]);

// Refs
const selectedUser = ref<string | null>(null);
const formRef = ref<VForm | null>(null);
const fromDateMenu = ref(false);
const fromDate = ref<Date | null>(null);
const snackbar = ref({ show: false, message: '', color: 'success' });
const loading = ref(false);

// Options
const categories: Array<Expense['category']> = ['Food', 'Travel', 'Shopping', 'Bills', 'Others'];
const paymentMethods: Array<Expense['paymentMethod']> = ['Cash', 'Card', 'Online'];
const isEdit = computed(() => !!props.expense);

// Fetch users
const users = ref<{ id: string; email: string; displayName?: string }[]>([]);
const fetchUsers = async () => {
  try {
    const usersCollection = collection(db, 'users');
    const querySnapshot = await getDocs(usersCollection);
    users.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      email: doc.data().email,
      displayName: doc.data().displayName || '',
    }));
  } catch (error: any) {
    console.error('Error fetching users:', error);
    snackbar.value = { show: true, message: t('fetchUsersFailed'), color: 'error' };
  }
};

// Computed properties
const availableUsers = computed(() => {
  return users.value.filter(
    (user) => user.id !== userId.value && !sharedWith.value.some((shared) => shared.userId === user.id)
  );
});

const splitAmount = computed(() => {
  const totalUsers = sharedWith.value.length + 1;
  return amount.value / totalUsers;
});

const dialogMaxWidth = computed(() => {
  if (smAndDown.value) return '90%';
  if (mdAndDown.value) return '700';
  return '800';
});

// Utility functions
const getUserName = (userId: string) => users.value.find(u => u.id === userId)?.displayName || 'Unknown';
const getUserEmail = (userId: string) => users.value.find(u => u.id === userId)?.email || 'Unknown';

const addSharedUser = () => {
  if (selectedUser.value) {
    const userName = getUserName(selectedUser.value);
    sharedWith.value.push({ userId: selectedUser.value, name: userName, share: 0 });
    selectedUser.value = null;
  }
};

const removeSharedUser = (index: number) => {
  sharedWith.value.splice(index, 1);
};

const formatDate = (dateObj: Date | null): string => {
  if (!dateObj) return '';
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat(locale.value, { style: 'currency', currency: 'INR' }).format(value);
};

const updateFromDate = (selectedDate: Date | null) => {
  date.value = formatDate(selectedDate);
  fromDateMenu.value = false;
};

// Debug input changes
const logInput = (field: string, value: any) => {
  console.log(`${field} updated to:`, value);
};

// Manual validation check
const manualValidate = () => {
  const errors: string[] = [];

  if (!title.value) errors.push('Title is required');
  if (title.value.length > 100) errors.push('Title must be 100 characters or less');
  if (typeof amount.value !== 'number' || amount.value <= 0) errors.push('Amount must be a positive number');
  if (!/^\d{2}-\d{2}-\d{4}$/.test(date.value.trim())) errors.push('Date must be in dd-mm-yyyy format');
  if (!category.value) errors.push('Category is required');
  if (!paymentMethod.value) errors.push('Payment Method is required');

  return { valid: errors.length === 0, errors };
};

// Reset form with default valid values
const resetForm = () => {
  title.value = '';
  amount.value = 1;
  const today = new Date();
  date.value = formatDate(today);
  fromDate.value = today;
  category.value = 'Food';
  paymentMethod.value = 'Cash';
  userId.value = authStore.currentUser?.id || '';
  sharedWith.value = [];
};

// Sync dialog with props
watch(
  () => props.show,
  (newVal) => {
    dialog.value = newVal;
    if (newVal) {
      if (props.expense) {
        title.value = props.expense.title;
        amount.value = props.expense.amount;
        date.value = props.expense.date;
        category.value = props.expense.category;
        paymentMethod.value = props.expense.paymentMethod;
        userId.value = props.expense.userId;
        sharedWith.value = props.expense.sharedWith ? [...props.expense.sharedWith] : [];
        if (props.expense.date) {
          const [day, month, year] = props.expense.date.split('-').map(Number);
          fromDate.value = new Date(year, month - 1, day);
        }
      } else {
        resetForm();
      }
      formRef.value?.resetValidation();
    }
  },
);

watch(dialog, (val) => emit('update:show', val));

// Save Expense
const saveExpense = async () => {
  if (!authStore.isAuthenticated) {
    snackbar.value = { show: true, message: t('notAuthenticated'), color: 'error' };
    return;
  }

  const validation = await formRef.value?.validate();
  console.log('Vuetify Validation result:', validation);

  const manualValidation = manualValidate();
  console.log('Manual Validation result:', manualValidation);

  if (!validation?.valid) {
    console.log('Falling back to manual validation due to Vuetify validation failure');
    if (!manualValidation.valid) {
      console.log('Manual validation errors:', manualValidation.errors);
      snackbar.value = { show: true, message: t('formIncomplete'), color: 'error' };
      return;
    }
  }

  const totalUsers = sharedWith.value.length + 1;
  const sharePerUser = amount.value / totalUsers;
  const sharedWithData = sharedWith.value.map((user) => ({
    userId: user.userId,
    name: user.name,
    share: sharePerUser,
  }));

  const expenseData: Omit<Expense, 'id'> = {
    title: title.value,
    amount: amount.value,
    date: date.value,
    category: category.value,
    paymentMethod: paymentMethod.value,
    userId: userId.value,
    sharedWith: sharedWithData,
  };

  console.log('Expense data before saving:', expenseData);

  loading.value = true;
  try {
    let savedExpense: Expense;
    if (isEdit.value && props.expense?.id) {
      savedExpense = { ...expenseData, id: props.expense.id };
      await updateExpense(savedExpense);
      snackbar.value = { show: true, message: t('expenseUpdated'), color: 'success' };
    } else {
      savedExpense = await addExpense(expenseData);
      snackbar.value = { show: true, message: t('expenseAdded'), color: 'success' };
    }
    emit('expense-saved', savedExpense);
    closeDialog();
  } catch (error: any) {
    snackbar.value = { show: true, message: error.message || t('operationFailed'), color: 'error' };
  } finally {
    loading.value = false;
  }
};

const closeDialog = () => {
  dialog.value = false;
  emit('update:show', false);
};

onMounted(() => {
  fetchUsers();
  resetForm();
});
</script>

<style scoped>
.expense-form-card {
  background: #ffffff;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.v-card-title {
  background: #f7f9fc;
  border-bottom: 1px solid #e0e0e0;
  padding: 16px 24px;
}

.v-text-field,
.v-select,
.v-autocomplete {
  background-color: #fafafa;
  border-radius: 8px;
}

.user-select {
  flex: 1;
  min-width: 200px;
}

.add-user-btn {
  height: 40px !important;
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0.5px;
  min-width: 120px;
}

.shared-users-list {
  background: #f7f9fc;
  border-radius: 8px;
  padding: 8px;
}

.shared-user-item {
  border-bottom: 1px solid #e0e0e0;
  padding: 8px 0;
  display: flex;
  align-items: center;
}

.shared-user-item:last-child {
  border-bottom: none;
}

.user-name {
  font-weight: 500;
  color: #333;
}

.delete-user-btn {
  background-color: #ff5252 !important;
  color: white !important;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  min-width: 32px;
}

.action-btn {
  height: 48px !important;
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* Responsive Design */
@media (max-width: 599px) {
  .v-card-title {
    padding: 12px 16px;
  }

  .text-h5 {
    font-size: 1.25rem !important;
  }

  .text-subtitle-1 {
    font-size: 0.95rem !important;
  }

  .v-text-field,
  .v-select,
  .v-autocomplete {
    font-size: 0.875rem;
  }

  .user-select {
    min-width: 100%;
    margin-bottom: 8px;
  }

  .add-user-btn {
    width: 100%;
    min-width: 100%;
    height: 40px !important;
    font-size: 0.875rem;
  }

  .action-btn {
    height: 40px !important;
    font-size: 0.875rem;
  }

  .shared-user-item {
    padding: 6px 0;
  }

  .delete-user-btn {
    width: 28px;
    height: 28px;
    min-width: 28px;
  }

  .user-name {
    font-size: 0.9rem;
  }
}

@media (min-width: 600px) and (max-width: 959px) {
  .v-card-title {
    padding: 14px 20px;
  }

  .text-h5 {
    font-size: 1.5rem !important;
  }

  .user-select {
    min-width: 250px;
  }

  .add-user-btn {
    height: 40px !important;
  }
}
</style>