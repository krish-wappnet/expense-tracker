<template>
  <v-container fluid class="pa-6" style="background-color: #f5f5f5;">
    <v-row align="center">
      <v-col cols="12" md="6">
        <h1 class="display-1 font-weight-bold">Expense Tracker</h1>
      </v-col>
      <v-col cols="12" md="6" class="text-md-right">
        <v-btn
          color="primary"
          @click="showAddForm = true"
          prepend-icon="mdi-plus"
          elevation="2"
        >
          Add Expense
        </v-btn>
      </v-col>
    </v-row>

    <!-- Summary Card -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card elevation="2" class="pa-4">
          <v-card-title class="subtitle-1">Summary</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="4">
                <v-chip color="primary" label>
                  Total Expenses: {{ filteredExpenses.length }}
                </v-chip>
              </v-col>
              <v-col cols="12" sm="4">
                <v-chip color="green" label>
                  Total Amount: ₹ {{ totalAmount.toFixed(2) }}
                </v-chip>
              </v-col>
              <v-col cols="12" sm="4">
                <v-chip color="orange" label>
                  Average Amount: ₹ {{ averageAmount.toFixed(2) }}
                </v-chip>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Date Range Filter -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card elevation="2" class="pa-4">
          <v-card-title class="subtitle-1">Filter by Date Range</v-card-title>
          <v-card-text>
            <v-row align="center">
              <v-col cols="12" sm="6" md="4">
                <v-menu
                  v-model="startDateMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ props }">
                    <v-text-field
                      v-model="startDate"
                      label="Start Date (dd-mm-yyyy)"
                      prepend-icon="mdi-calendar"
                      readonly
                      outlined
                      dense
                      clearable
                      v-bind="props"
                      background-color="white"
                    />
                  </template>
                  <v-date-picker
                    v-model="startDateRaw"
                    @update:modelValue="updateStartDate"
                    :max="endDateRaw ? endDateRaw.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]"
                    no-title
                    @click:cancel="startDateMenu = false"
                    @click:save="startDateMenu = false"
                  />
                </v-menu>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-menu
                  v-model="endDateMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ props }">
                    <v-text-field
                      v-model="endDate"
                      label="End Date (dd-mm-yyyy)"
                      prepend-icon="mdi-calendar"
                      readonly
                      outlined
                      dense
                      clearable
                      v-bind="props"
                      background-color="white"
                    />
                  </template>
                  <v-date-picker
                    v-model="endDateRaw"
                    @update:modelValue="updateEndDate"
                    :min="startDateRaw ? startDateRaw.toISOString().split('T')[0] : undefined"
                    :max="new Date().toISOString().split('T')[0]"
                    no-title
                    @click:cancel="endDateMenu = false"
                    @click:save="endDateMenu = false"
                  />
                </v-menu>
              </v-col>
              <v-col cols="12" md="4" class="d-flex align-center">
                <v-btn
                  color="grey"
                  text
                  @click="clearDates"
                  :disabled="!startDate && !endDate"
                >
                  Clear Dates
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Expense List and Chart -->
    <v-row class="mt-6">
      <v-col cols="12" md="6">
        <ExpenseList :expenses="filteredExpenses" @edit="editExpense" @delete="deleteExpense" />
      </v-col>
      <v-col cols="12" md="6">
        <ExpenseChart :expenses="filteredExpenses" />
      </v-col>
    </v-row>

    <!-- Add Expense Form -->
    <ExpenseForm
      :show="showAddForm"
      @update:show="showAddForm = $event"
    />
    <!-- Edit Expense Form -->
    <ExpenseForm
      :show="showEditForm"
      :expense="selectedExpense"
      @update:show="showEditForm = $event"
    />
  </v-container>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useExpenseStore } from '@/stores/expenseStore';
import ExpenseList from '@/components/ExpenseList.vue';
import ExpenseChart from '@/components/ExpenseChart.vue';
import ExpenseForm from '@/components/ExpenseForm.vue';
import type { Expense } from '@/types/expense';

const store = useExpenseStore();
const showAddForm = ref(false);
const showEditForm = ref(false);
const selectedExpense = ref<Expense | undefined>(undefined);

// Date Range Filter
const startDateMenu = ref(false);
const endDateMenu = ref(false);
const startDateRaw = ref<Date | null>(null);
const endDateRaw = ref<Date | null>(null);
const startDate = ref<string | null>(null);
const endDate = ref<string | null>(null);

// Format date to dd-mm-yyyy
const formatDate = (date: Date | null): string | null => {
  if (!date) return null;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Parse date string (dd-mm-yyyy) to Date object
const parseDate = (dateStr: string | null): Date | null => {
  if (!dateStr || !/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) return null;
  const [day, month, year] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

// Update Start Date
const updateStartDate = (date: Date | null) => {
  startDate.value = formatDate(date);
  startDateRaw.value = date;
  startDateMenu.value = false;
};

// Update End Date
const updateEndDate = (date: Date | null) => {
  endDate.value = formatDate(date);
  endDateRaw.value = date;
  endDateMenu.value = false;
};

// Clear Dates
const clearDates = () => {
  startDate.value = null;
  endDate.value = null;
  startDateRaw.value = null;
  endDateRaw.value = null;
};

// Computed expenses from store
const expenses = computed(() => store.expenses);

// Filtered expenses based on date range
const filteredExpenses = computed(() => {
  let result = expenses.value;
  if (startDate.value) {
    const start = parseDate(startDate.value);
    if (start) {
      result = result.filter((exp) => {
        const expDate = parseDate(exp.date);
        return expDate && expDate >= start;
      });
    }
  }
  if (endDate.value) {
    const end = parseDate(endDate.value);
    if (end) {
      result = result.filter((exp) => {
        const expDate = parseDate(exp.date);
        return expDate && expDate <= end;
      });
    }
  }
  return result;
});

// Summary Calculations
const totalAmount = computed(() => {
  return filteredExpenses.value.reduce((sum, exp) => sum + exp.amount, 0);
});

const averageAmount = computed(() => {
  return filteredExpenses.value.length ? totalAmount.value / filteredExpenses.value.length : 0;
});

const editExpense = (expense: Expense) => {
  selectedExpense.value = { ...expense };
  showEditForm.value = true;
};

const deleteExpense = (id: string) => {
  store.deleteExpense(id);
};
</script>