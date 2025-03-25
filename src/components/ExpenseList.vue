<template>
    <v-card elevation="0" class="ma-4">
      <v-card-title class="headline">Expenses</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="search"
              label="Search by Title"
              outlined
              dense
              clearable
            />
          </v-col>
          <v-col cols="12" sm="4">
            <v-select
              v-model="filterCategory"
              :items="categories"
              label="Filter by Category"
              outlined
              dense
              clearable
            />
          </v-col>
          <v-col cols="12" sm="4" class="d-flex align-center">
            <v-btn
              color="grey"
              text
              @click="clearFilters"
              :disabled="!search && !filterCategory"
            >
              Clear Filters
            </v-btn>
          </v-col>
        </v-row>
        <v-data-table
          :headers="headers"
          :items="filteredExpenses"
          :search="search"
          :sort-by="[{ key: 'date', order: 'desc' }]"
          :items-per-page="5"
          :items-per-page-options="[5, 10, 20, -1]"
          class="elevation-1"
          :mobile-breakpoint="600"
        >
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
                <v-tooltip activator="parent" location="top">Edit Expense</v-tooltip>
              </v-btn>
              <v-btn
                icon
                size="small"
                color="red"
                @click="confirmDelete(item)"
              >
                <v-icon size="18">mdi-delete</v-icon>
                <v-tooltip activator="parent" location="top">Delete Expense</v-tooltip>
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
  
      <!-- Delete Confirmation Dialog -->
      <v-dialog v-model="deleteDialog" max-width="400">
        <v-card>
          <v-card-title class="headline">Confirm Deletion</v-card-title>
          <v-card-text>
            Are you sure you want to delete the expense "<strong>{{ expenseToDelete?.title }}</strong>"? This action cannot be undone.
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="grey" text @click="deleteDialog = false">Cancel</v-btn>
            <v-btn color="red" text @click="deleteExpense">Delete</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>
  </template>
  
  <script lang="ts" setup>
  import { ref, computed } from 'vue';
  import type { Expense } from '@/types/expense';
  
  const props = defineProps<{ expenses: Expense[] }>();
  const emit = defineEmits(['edit', 'delete']);
  
  const search = ref('');
  const filterCategory = ref<string | undefined>(undefined);
  const categories = ['Food', 'Travel', 'Shopping', 'Bills', 'Others'];
  
  // Delete Confirmation Dialog
  const deleteDialog = ref(false);
  const expenseToDelete = ref<Expense | null>(null);
  
  const headers = [
    { title: 'Title', key: 'title' },
    { title: 'Amount', key: 'amount' },
    { title: 'Date', key: 'date' },
    { title: 'Category', key: 'category' },
    { title: 'Payment Method', key: 'paymentMethod' },
    { title: 'Actions', key: 'actions', sortable: false },
  ];
  
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
    }
    deleteDialog.value = false;
    expenseToDelete.value = null;
  };
  </script>