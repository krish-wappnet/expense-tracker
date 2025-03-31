<!-- src/components/ExpenseList.vue -->
<template>
  <v-card elevation="0" class="ma-4">
    <v-card-title class="headline">{{ t('expenses') }}</v-card-title>
    <v-card-text>
      <!-- Filters -->
      <v-row>
        <v-col cols="12" sm="4">
          <v-text-field
            v-model="search"
            :label="t('searchByTitle')"
            outlined
            dense
            clearable
            :aria-label="t('searchByTitle')"
          />
        </v-col>
        <v-col cols="12" sm="4">
          <v-select
            v-model="filterCategory"
            :items="categories.map(cat => ({ value: cat, text: t(`categories.${cat.toLowerCase()}`) }))"
            :label="t('filterByCategory')"
            outlined
            dense
            clearable
            :aria-label="t('filterByCategory')"
            item-title="text"
            item-value="value"
          />
        </v-col>
        <v-col cols="12" sm="4" class="d-flex align-center">
          <v-btn
            color="grey"
            text
            @click="clearFilters"
            :disabled="!search && !filterCategory"
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
        class="elevation-1"
        :custom-key="{
          'items-per-page-text': t('itemsPerPage'),
          'sort-by': t('sortBy'),
          'page-text': t('pageText', { current: '{0}', total: '{1}' }),
        }"
      >
        <template v-slot:item.amount="{ item }">
          {{ formatCurrency(item.amount) }}
        </template>
        <template v-slot:item.sharedWith="{ item }">
          {{ getSharedUsers(item) }}
        </template>
        <template v-slot:item.yourShare="{ item }">
          {{ formatCurrency(getUserShare(item)) }}
        </template>
        <template v-slot:item.actions="{ item }">
          <div class="d-flex align-center">
            <v-btn
              icon
              size="small"
              color="blue"
              @click="editExpense(item)"
              class="mr-1"
            >
              <v-icon size="18">mdi-pencil</v-icon>
              <v-tooltip activator="parent" location="top">{{ t('editExpense') }}</v-tooltip>
            </v-btn>
            <v-btn
              icon
              size="small"
              color="red"
              @click="confirmDelete(item)"
            >
              <v-icon size="18">mdi-delete</v-icon>
              <v-tooltip activator="parent" location="top">{{ t('deleteExpense') }}</v-tooltip>
            </v-btn>
          </div>
        </template>
      </v-data-table>

      <!-- Mobile View: Cards -->
      <v-row v-else>
        <v-col cols="12" v-for="expense in filteredExpenses" :key="expense.id">
          <v-card elevation="2" class="pa-4 mb-2">
            <v-row dense>
              <v-col cols="6">
                <strong>{{ t('title') }}:</strong> {{ expense.title }}
              </v-col>
              <v-col cols="6" class="text-right">
                <strong>{{ t('amount') }}:</strong> {{ formatCurrency(expense.amount) }}
              </v-col>
              <v-col cols="6">
                <strong>{{ t('date') }}:</strong> {{ expense.date }}
              </v-col>
              <v-col cols="6" class="text-right">
                <strong>{{ t('category') }}:</strong> {{ expense.category }}
              </v-col>
              <v-col cols="6">
                <strong>{{ t('paymentMethod') }}:</strong> {{ expense.paymentMethod }}
              </v-col>
              <v-col cols="6" class="text-right">
                <strong>{{ t('yourShare') }}:</strong> {{ formatCurrency(getUserShare(expense)) }}
              </v-col>
              <v-col cols="12">
                <strong>{{ t('splitWith') }}:</strong> {{ getSharedUsers(expense) }}
              </v-col>
              <v-col cols="12" class="text-right">
                <v-btn
                  icon
                  size="small"
                  color="blue"
                  @click="editExpense(expense)"
                  class="mr-1"
                >
                  <v-icon size="18">mdi-pencil</v-icon>
                  <v-tooltip activator="parent" location="top">{{ t('editExpense') }}</v-tooltip>
                </v-btn>
                <v-btn
                  icon
                  size="small"
                  color="red"
                  @click="confirmDelete(expense)"
                >
                  <v-icon size="18">mdi-delete</v-icon>
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
      <v-card>
        <v-card-title class="headline">{{ t('confirmDeletion') }}</v-card-title>
        <v-card-text v-html="t('confirmDeleteMessage', { title: expenseToDelete?.title })" />
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" text @click="deleteDialog = false">{{ t('cancel') }}</v-btn>
          <v-btn color="red" text @click="deleteExpense">{{ t('delete') }}</v-btn>
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
  selectedExpense.value = expense;
  showEditDialog.value = true;
};

// Handle expense saved event
const handleExpenseSaved = (expense: Expense) => {
  const index = store.expenses.findIndex(e => e.id === expense.id);
  if (index !== -1) {
    // Update existing expense
    store.expenses[index] = expense;
  } else {
    // Add new expense
    store.expenses.push(expense);
  }
};

// Update edit dialog state
const updateEditDialog = (value: boolean) => {
  showEditDialog.value = value;
  if (!value) {
    selectedExpense.value = undefined; // Clear selected expense
    // No need to call store.fetchExpenses() here since handleExpenseSaved updates the store
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
  store.fetchExpenses();
});

// Refresh expenses when the user changes
watch(
  () => authStore.currentUser,
  () => {
    fetchUsers();
    store.fetchExpenses();
  }
);
</script>

<style scoped>
.custom-snackbar {
  transition: all 0.3s ease;
}

.snackbar-close-btn {
  color: #ffffff !important;
}

.v-card {
  transition: all 0.3s ease;
}

.v-card strong {
  font-size: 14px;
  color: #666;
}

.v-card .text-right {
  font-size: 14px;
}
</style>