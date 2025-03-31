<!-- src/components/ExpenseList.vue -->
<template>
  <v-card elevation="4" class="ma-4 expense-list-card" rounded="lg">
    <v-card-title class="text-h5 font-weight-bold primary--text">
      {{ t('expenses') }}
    </v-card-title>
    <v-card-text class="pt-4">
      <!-- Filters -->
      <v-row>
        <v-col cols="12" sm="6" md="4">
          <v-text-field
            v-model="search"
            :label="t('searchByTitle')"
            outlined
            dense
            clearable
            prepend-inner-icon="mdi-magnify"
            class="rounded-lg"
            :aria-label="t('searchByTitle')"
          />
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-select
            v-model="filterCategory"
            :items="categories.map(cat => ({ value: cat, text: t(`categories.${cat.toLowerCase()}`) }))"
            :label="t('filterByCategory')"
            outlined
            dense
            clearable
            prepend-inner-icon="mdi-filter"
            class="rounded-lg"
            :aria-label="t('filterByCategory')"
            item-title="text"
            item-value="value"
          />
        </v-col>
        <v-col cols="12" sm="6" md="4" class="d-flex align-center">
          <v-btn
            color="grey darken-1"
            outlined
            rounded
            @click="clearFilters"
            :disabled="!search && !filterCategory"
            class="clear-filters-btn"
          >
            {{ t('clearFilters') }}
          </v-btn>
        </v-col>
      </v-row>

      <!-- Desktop View: Table -->
      <v-data-table
        v-if="$vuetify.display.mdAndUp"
        :headers="translatedHeaders"
        :items="filteredExpenses"
        :search="search"
        :sort-by="[{ key: 'date', order: 'desc' }]"
        :items-per-page="5"
        :items-per-page-options="[5, 10, 20, -1]"
        class="elevation-2 expense-table"
        :custom-key="{
          'items-per-page-text': t('itemsPerPage'),
          'sort-by': t('sortBy'),
          'page-text': t('pageText', { current: '{0}', total: '{1}' }),
        }"
      >
        <template v-slot:item.amount="{ item }">
          <span class="font-weight-medium">{{ formatCurrency(item.amount) }}</span>
        </template>
        <template v-slot:item.sharedWith="{ item }">
          <span class="text-grey-darken-1">{{ getSharedUsers(item) }}</span>
        </template>
        <template v-slot:item.yourShare="{ item }">
          <span class="font-weight-medium primary--text">{{ formatCurrency(getUserShare(item)) }}</span>
        </template>
        <template v-slot:item.actions="{ item }">
          <div class="d-flex align-center">
            <v-btn
              icon
              size="small"
              color="primary"
              @click="editExpense(item)"
              class="mr-2 action-btn"
            >
              <v-icon size="20">mdi-pencil</v-icon>
              <v-tooltip activator="parent" location="top">{{ t('editExpense') }}</v-tooltip>
            </v-btn>
            <v-btn
              icon
              size="small"
              color="error"
              @click="confirmDelete(item)"
              class="action-btn"
            >
              <v-icon size="20">mdi-trash-can</v-icon>
              <v-tooltip activator="parent" location="top">{{ t('deleteExpense') }}</v-tooltip>
            </v-btn>
          </div>
        </template>
      </v-data-table>

      <!-- Mobile View: Cards -->
      <v-row v-else>
        <v-col cols="12" v-for="expense in filteredExpenses" :key="expense.id">
          <v-card elevation="3" class="pa-4 mb-3 expense-card" rounded="lg">
            <v-row dense>
              <v-col cols="6">
                <div class="label">{{ t('title') }}</div>
                <div class="value font-weight-medium">{{ expense.title }}</div>
              </v-col>
              <v-col cols="6" class="text-right">
                <div class="label">{{ t('amount') }}</div>
                <div class="value font-weight-medium">{{ formatCurrency(expense.amount) }}</div>
              </v-col>
              <v-col cols="6">
                <div class="label">{{ t('date') }}</div>
                <div class="value">{{ expense.date }}</div>
              </v-col>
              <v-col cols="6" class="text-right">
                <div class="label">{{ t('category') }}</div>
                <div class="value">{{ t(`categories.${expense.category.toLowerCase()}`) }}</div>
              </v-col>
              <v-col cols="6">
                <div class="label">{{ t('paymentMethod') }}</div>
                <div class="value">{{ expense.paymentMethod }}</div>
              </v-col>
              <v-col cols="6" class="text-right">
                <div class="label">{{ t('yourShare') }}</div>
                <div class="value font-weight-medium primary--text">{{ formatCurrency(getUserShare(expense)) }}</div>
              </v-col>
              <v-col cols="12">
                <div class="label">{{ t('splitWith') }}</div>
                <div class="value text-grey-darken-1">{{ getSharedUsers(expense) }}</div>
              </v-col>
              <v-col cols="12" class="text-right mt-2">
                <v-btn
                  icon
                  size="small"
                  color="primary"
                  @click="editExpense(expense)"
                  class="mr-2 action-btn"
                >
                  <v-icon size="20">mdi-pencil</v-icon>
                  <v-tooltip activator="parent" location="top">{{ t('editExpense') }}</v-tooltip>
                </v-btn>
                <v-btn
                  icon
                  size="small"
                  color="error"
                  @click="confirmDelete(expense)"
                  class="action-btn"
                >
                  <v-icon size="20">mdi-trash-can</v-icon>
                  <v-tooltip activator="parent" location="top">{{ t('deleteExpense') }}</v-tooltip>
                </v-btn>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card rounded="lg">
        <v-card-title class="text-h6 font-weight-bold">{{ t('confirmDeletion') }}</v-card-title>
        <v-card-text v-html="t('confirmDeleteMessage', { title: expenseToDelete?.title })" class="text-body-1" />
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey darken-1" text @click="deleteDialog = false">{{ t('cancel') }}</v-btn>
          <v-btn color="error" text @click="deleteExpense">{{ t('delete') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar for Delete Confirmation -->
    <v-snackbar
      v-model="showSnackbar"
      :timeout="2000"
      color="success"
      class="custom-snackbar"
      :class="{ 'dark-mode': isDarkMode }"
      location="top right"
      rounded="pill"
      elevation="4"
    >
      {{ t('expenseDeleted') }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="showSnackbar = false"
          class="snackbar-close-btn"
        >
          {{ t('close') }}
        </v-btn>
      </template>
    </v-snackbar>

    <!-- Edit Dialog -->
    <expense-form
      :show="showEditDialog"
      :expense="selectedExpense"
      @update:show="updateEditDialog"
      @expense-saved="handleExpenseSaved"
    />
  </v-card>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useExpenseStore } from '@/stores/expenseStore';
import { useAuthStore } from '@/stores/auth';
import type { Expense } from '@/types/expense';
import { useI18n } from 'vue-i18n';
import ExpenseForm from './ExpenseForm.vue';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';

// Stores
const store = useExpenseStore();
const authStore = useAuthStore();

// Use i18n for translations
const { t, locale } = useI18n();

const search = ref('');
const filterCategory = ref<Expense['category'] | undefined>(undefined);
const categories = ['Food', 'Travel', 'Shopping', 'Bills', 'Others'];

// Delete Confirmation Dialog
const deleteDialog = ref(false);
const expenseToDelete = ref<Expense | null>(null);

// Snackbar State
const showSnackbar = ref(false);

// Edit Dialog State
const showEditDialog = ref(false);
const selectedExpense = ref<Expense | undefined>(undefined);

// Fetch users to map userId to name
const users = ref<{ id: string; displayName?: string }[]>([]);
const fetchUsers = async () => {
  try {
    const usersCollection = collection(db, 'users');
    const querySnapshot = await getDocs(usersCollection);
    users.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      displayName: doc.data().displayName || '',
    }));
  } catch (error: any) {
    console.error('Error fetching users:', error);
  }
};

// Check if dark mode is enabled
const isDarkMode = computed(() => document.documentElement.classList.contains('dark-mode'));

// Table headers with translations
const translatedHeaders = computed(() => [
  { title: t('title'), key: 'title' },
  { title: t('amount'), key: 'amount' },
  { title: t('date'), key: 'date' },
  { title: t('category'), key: 'category' },
  { title: t('paymentMethod'), key: 'paymentMethod' },
  { title: t('splitWith'), key: 'sharedWith' },
  { title: t('yourShare'), key: 'yourShare' },
  { title: t('actions'), key: 'actions', sortable: false },
]);

// Filter expenses based on category
const filteredExpenses = computed(() => {
  let result = store.expenses;
  if (filterCategory.value) {
    result = result.filter((exp) => exp.category === filterCategory.value);
  }
  return result;
});

const clearFilters = () => {
  search.value = '';
  filterCategory.value = undefined;
};

// Show the delete confirmation dialog
const confirmDelete = (expense: Expense) => {
  expenseToDelete.value = expense;
  deleteDialog.value = true;
};

// Confirm and delete the expense
const deleteExpense = async () => {
  if (expenseToDelete.value && expenseToDelete.value.id) {
    await store.deleteExpense(expenseToDelete.value.id);
    // Update the store directly after deletion
    store.expenses = store.expenses.filter(exp => exp.id !== expenseToDelete.value!.id);
    showSnackbar.value = true;
  }
  deleteDialog.value = false;
  expenseToDelete.value = null;
};

// Edit expense
const editExpense = (expense: Expense) => {
  selectedExpense.value = { ...expense }; // Create a copy to avoid mutating the original
  showEditDialog.value = true;
};

// Handle expense saved event
const handleExpenseSaved = (expense: Expense) => {
  const index = store.expenses.findIndex(e => e.id === expense.id);
  if (index !== -1) {
    // Update existing expense
    store.expenses[index] = { ...expense };
  } else {
    // Add new expense
    store.expenses.push({ ...expense });
  }
  // Force reactivity by reassigning the array
  store.expenses = [...store.expenses];
};

// Update edit dialog state
const updateEditDialog = (value: boolean) => {
  showEditDialog.value = value;
  if (!value) {
    selectedExpense.value = undefined; // Clear selected expense
  }
};

// Format the amount with the currency symbol based on the locale
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: 'INR',
  }).format(value);
};

// Get shared users for display
const getSharedUsers = (expense: Expense): string => {
  if (!expense.sharedWith?.length) return t('noUsersSelected');
  return expense.sharedWith
    .map(user => {
      const userName = user.name || 'Unknown';
      return userName;
    })
    .join(', ');
};

// Get the current user's share
const getUserShare = (expense: Expense): number => {
  const userId = authStore.currentUser?.id || '';

  if (expense.userId === userId) {
    const totalUsers = (expense.sharedWith?.length || 0) + 1;
    return expense.amount / totalUsers;
  }

  const sharedEntry = expense.sharedWith?.find(user => user.userId === userId);
  if (sharedEntry) {
    return sharedEntry.share;
  }

  return 0;
};

// Fetch expenses on mount
onMounted(() => {
  fetchUsers();
  store.fetchExpenses(); // No parameter needed
});

// Refresh expenses when the user changes
watch(
  () => authStore.currentUser,
  () => {
    fetchUsers();
    store.fetchExpenses(); // No parameter needed
  }
);
</script>

<style scoped>
.expense-list-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.v-card-title {
  background: #f7f9fc;
  border-bottom: 1px solid #e0e0e0;
  padding: 16px 24px;
}

.v-text-field,
.v-select {
  background-color: #fafafa;
  border-radius: 8px;
}

.clear-filters-btn {
  height: 40px !important;
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.expense-table {
  border-radius: 8px;
  overflow: hidden;
}

.expense-table th {
  background-color: #f7f9fc !important;
  color: #333 !important;
  font-weight: 600 !important;
}

.expense-table td {
  padding: 12px !important;
  font-size: 0.95rem;
}

.action-btn {
  transition: transform 0.2s ease;
}

.action-btn:hover {
  transform: scale(1.1);
}

.expense-card {
  background: #ffffff;
  border-radius: 8px;
  transition: transform 0.2s ease;
}

.expense-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1) !important;
}

.label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.value {
  font-size: 1rem;
  color: #333;
}

.custom-snackbar {
  transition: all 0.3s ease;
}

.snackbar-close-btn {
  color: #ffffff !important;
}

/* Responsive Design */
@media (max-width: 599px) {
  .v-card-title {
    padding: 12px 16px;
  }

  .text-h5 {
    font-size: 1.25rem !important;
  }

  .v-text-field,
  .v-select {
    font-size: 0.875rem;
  }

  .clear-filters-btn {
    height: 36px !important;
    font-size: 0.875rem;
  }

  .expense-card {
    padding: 12px !important;
  }

  .label {
    font-size: 0.85rem;
  }

  .value {
    font-size: 0.9rem;
  }

  .action-btn {
    width: 36px;
    height: 36px;
  }
}

@media (min-width: 600px) and (max-width: 959px) {
  .v-card-title {
    padding: 14px 20px;
  }

  .text-h5 {
    font-size: 1.5rem !important;
  }
}
</style>