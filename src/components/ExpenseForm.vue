<!-- src/components/ExpenseForm.vue -->
<template>
  <v-dialog v-model="dialog" :max-width="dialogMaxWidth" persistent>
    <v-card>
      <v-card-title class="headline">
        {{ isEdit ? t('editExpense') : t('addExpense') }}
      </v-card-title>
      <v-card-text>
        <v-form ref="form" @submit.prevent="saveExpense">
          <!-- Basic Details -->
          <v-text-field
            v-model="title"
            :label="t('title')"
            :rules="[v => !!v || t('titleRequired'), v => v.length <= 100 || t('titleTooLong')]"
            outlined
            @input="logInput('title', $event)"
          />
          <v-text-field
            v-model.number="amount"
            :label="t('amount')"
            type="number"
            :rules="[v => (typeof v === 'number' && v > 0) || t('amountPositive')]"
            outlined
            @input="logInput('amount', $event)"
          />
          <v-text-field
            v-model="date"
            :label="t('date')"
            :rules="[v => /^\d{2}-\d{2}-\d{4}$/.test(v.trim()) || t('dateFormat')]"
            placeholder="dd-mm-yyyy"
            prepend-inner-icon="mdi-calendar"
            @click:prepend-inner="fromDateMenu = true"
            outlined
            @input="logInput('date', $event)"
          />
          <v-menu v-model="fromDateMenu" :close-on-content-click="false">
            <template v-slot:activator="{ props }">
              <span v-bind="props" style="display: none;"></span>
            </template>
            <v-date-picker v-model="fromDate" @update:modelValue="updateFromDate" />
          </v-menu>

          <!-- Category -->
          <v-select
            v-model="category"
            :items="categories"
            :label="t('category')"
            :rules="[v => !!v || t('categoryRequired')]"
            outlined
            @update:modelValue="logInput('category', $event)"
          />

          <!-- Payment Method -->
          <v-select
            v-model="paymentMethod"
            :items="paymentMethods"
            :label="t('paymentMethod')"
            :rules="[v => !!v || t('paymentMethodRequired')]"
            outlined
            @update:modelValue="logInput('paymentMethod', $event)"
          />

          <!-- Share With -->
          <v-autocomplete
            v-model="selectedUser"
            :items="availableUsers"
            item-title="displayName"
            item-value="id"
            :label="t('selectUser')"
            outlined
            clearable
            @update:modelValue="logInput('selectedUser', $event)"
          />
          <v-btn color="primary" @click="addSharedUser" :disabled="!selectedUser">{{ t('addUser') }}</v-btn>
          <v-list v-if="sharedWith.length">
            <v-list-item v-for="(user, index) in sharedWith" :key="user.userId">
              <v-list-item-title>
                {{ getUserName(user.userId) }} - {{ formatCurrency(splitAmount) }}
              </v-list-item-title>
              <v-list-item-action>
                <v-btn icon @click="removeSharedUser(index)"><v-icon>mdi-delete</v-icon></v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
          <p v-else>{{ t('noUsersSelected') }}</p>

          <!-- Actions -->
          <v-btn color="primary" type="submit" :loading="loading">{{ t('save') }}</v-btn>
          <v-btn text @click="closeDialog">{{ t('cancel') }}</v-btn>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :timeout="3000"
      :color="snackbar.color"
      location="top right"
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
      savedExpense = await addExpense(expenseData); // addExpense returns an Expense object
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
.headline {
  font-size: 1.5rem;
  font-weight: bold;
}
</style>