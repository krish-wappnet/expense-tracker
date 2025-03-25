<template>
  <v-container fluid class="pa-6" :class="{ 'dark-mode': darkMode }">
    <!-- Header -->
    <v-row align="center">
      <v-col cols="12" sm="6">
        <h1 class="display-1 font-weight-bold">Expense Tracker</h1>
      </v-col>
      <v-col cols="12" sm="6" class="d-flex justify-sm-end align-center flex-wrap gap-2">
        <v-btn
          color="primary"
          @click="showAddForm = true"
          prepend-icon="mdi-plus"
          elevation="2"
        >
          Add Expense
        </v-btn>
        <v-btn color="red" outlined @click="showClearDialog = true" class="ml-2">
          Clear All Data
        </v-btn>
        <v-btn color="secondary" @click="store.exportExpenses" class="ml-2">
          Export
        </v-btn>
        <v-btn color="secondary" class="ml-2">
          Import
          <input
            type="file"
            @change="store.importExpenses"
            style="position: absolute; opacity: 0; width: 100%; height: 100%;"
          />
        </v-btn>
        <v-switch
          v-model="darkMode"
          label="Dark Mode"
          color="primary"
          hide-details
          class="ml-2"
        />
      </v-col>
    </v-row>

    <!-- Summary Card with Pie Chart -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card elevation="2" class="pa-4">
          <v-card-title class="subtitle-1">Summary</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
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
              </v-col>
              <v-col cols="12" md="6">
                <div style="height: 200px;">
                  <Pie :data="summaryChartData" :options="summaryChartOptions" />
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Collapsible Date Range Filter -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-title>Filter by Date Range</v-expansion-panel-title>
            <v-expansion-panel-text>
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
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
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
    <ExpenseForm :show="showAddForm" @update:show="showAddForm = $event" />
    <!-- Edit Expense Form -->
    <ExpenseForm :show="showEditForm" :expense="selectedExpense" @update:show="showEditForm = $event" />

    <!-- Clear All Data Confirmation Dialog -->
    <v-dialog v-model="showClearDialog" max-width="400">
      <v-card>
        <v-card-title class="headline">Confirm Clear All Data</v-card-title>
        <v-card-text>
          Are you sure you want to clear all expenses? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" text @click="showClearDialog = false">Cancel</v-btn>
          <v-btn color="red" text @click="clearAllData">Clear</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useExpenseStore } from '@/stores/expenseStore';
import ExpenseList from '@/components/ExpenseList.vue';
import ExpenseChart from '@/components/ExpenseChart.vue';
import ExpenseForm from '@/components/ExpenseForm.vue';
import { Pie } from 'vue-chartjs';
import { Chart, registerables } from 'chart.js';
import type { ChartData, ChartOptions } from 'chart.js';
import type { Expense } from '@/types/expense';

Chart.register(...registerables);

const store = useExpenseStore();
const showAddForm = ref(false);
const showEditForm = ref(false);
const selectedExpense = ref<Expense | undefined>(undefined);
const showClearDialog = ref(false);
const darkMode = ref(false);

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

// Summary Pie Chart Data
const summaryChartData = computed<ChartData<'pie', number[], string>>(() => {
  const categoryTotals = filteredExpenses.value.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  return {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        borderColor: '#fff',
        borderWidth: 1,
      },
    ],
  };
});

const summaryChartOptions: ChartOptions<'pie'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { color: '#333', font: { size: 12 } },
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.label || '';
          const value = context.raw as number;
          return `${label}: ₹${value.toFixed(2)}`;
        },
      },
    },
  },
};

// Clear All Data
const clearAllData = () => {
  store.resetExpenses();
  showClearDialog.value = false;
};

const editExpense = (expense: Expense) => {
  selectedExpense.value = { ...expense };
  showEditForm.value = true;
};

const deleteExpense = (id: string) => {
  store.deleteExpense(id);
};
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}

.dark-mode {
  background-color: #121212 !important;
  color: #ffffff !important;
}

.dark-mode .v-card,
.dark-mode .v-chip,
.dark-mode .v-text-field,
.dark-mode .v-btn {
  background-color: #1e1e1e !important;
  color: #ffffff !important;
}

.dark-mode .v-chip {
  border: 1px solid #ffffff;
}
</style>