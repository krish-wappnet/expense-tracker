<template>
  <v-card elevation="0" class="ma-4">
    <v-card-title class="headline">{{ t('expenses') }}</v-card-title>
    <v-card-text>
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
      <v-data-table
        :headers="translatedHeaders"
        :items="filteredExpenses"
        :search="search"
        :sort-by="[{ key: 'date', order: 'desc' }]"
        :items-per-page="5"
        :items-per-page-options="[5, 10, 20, -1]"
        class="elevation-1"
        :mobile-breakpoint="600"
        :custom-key="{
          'items-per-page-text': t('itemsPerPage'),
          'sort-by': t('sortBy'),
          'page-text': t('pageText', { current: '{0}', total: '{1}' }),
        }"
      >
        <template v-slot:item.amount="{ item }">
          {{ formatCurrency(item.amount) }}
        </template>
        <template v-slot:item.actions="{ item }">
          <div class="d-flex align-center">
            <v-btn
              icon
              size="small"
              color="blue"
              @click="emit('edit', item)"
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
  </v-card>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import type { Expense } from '@/types/expense';
import { useI18n } from 'vue-i18n';

const props = defineProps<{ expenses: Expense[] }>();
const emit = defineEmits<{
  (e: 'edit', expense: Expense): void;
  (e: 'delete', id: string): void;
}>();

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

// Check if dark mode is enabled
const isDarkMode = computed(() => document.documentElement.classList.contains('dark-mode'));

// Table headers with translations
const translatedHeaders = computed(() => [
  { title: t('title'), key: 'title' },
  { title: t('amount'), key: 'amount' },
  { title: t('date'), key: 'date' },
  { title: t('category'), key: 'category' },
  { title: t('paymentMethod'), key: 'paymentMethod' },
  { title: t('actions'), key: 'actions', sortable: false },
]);

// Filter expenses based on the original category values
const filteredExpenses = computed(() => {
  let result = props.expenses;
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

// Confirm and emit the delete event
const deleteExpense = () => {
  if (expenseToDelete.value && expenseToDelete.value.id) {
    emit('delete', expenseToDelete.value.id);
    showSnackbar.value = true; // Show snackbar on successful delete
  }
  deleteDialog.value = false;
  expenseToDelete.value = null;
};

// Format the amount with the currency symbol based on the locale
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: 'INR', // You can make this dynamic based on user settings
  }).format(value);
};
</script>

<style scoped>
.custom-snackbar {
  transition: all 0.3s ease;
}

.snackbar-close-btn {
  color: #ffffff !important; /* Ensure the "Close" button text is white for visibility */
}
</style>