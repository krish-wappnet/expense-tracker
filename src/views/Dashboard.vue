<!-- src/components/Dashboard.vue -->
<template>
  <v-container fluid class="pa-6" :class="{ 'dark-mode': darkMode }">
    <!-- Header -->
    <v-row align="center" class="mb-4">
      <v-col cols="12" sm="6">
        <h1 class="display-1 font-weight-bold">{{ t('expenseTracker') }}</h1>
      </v-col>
      <v-col cols="12" sm="6" class="d-flex justify-sm-end align-center flex-wrap gap-2">
        <v-btn
          color="primary"
          @click="showAddForm = true"
          prepend-icon="mdi-plus"
          elevation="2"
          rounded
        >
          {{ t('addExpense') }}
        </v-btn>
        <v-btn color="red" outlined @click="showClearDialog = true" class="ml-2" rounded>
          {{ t('clearAllData') }}
        </v-btn>
        <v-btn color="secondary" @click="store.exportExpenses" class="ml-2" rounded>
          {{ t('export') }}
        </v-btn>
        <v-btn color="secondary" class="ml-2" rounded style="position: relative;">
          {{ t('import') }}
          <input
            type="file"
            @change="store.importExpenses"
            style="position: absolute; opacity: 0; width: 100%; height: 100%; cursor: pointer;"
          />
        </v-btn>
        <!-- Conditional Rendering for Profile and Logout Buttons -->
        <v-btn
          v-if="authStore.isAuthenticated"
          icon
          @click="router.push('/profile')"
          class="ml-2"
          :aria-label="t('profile')"
        >
          <v-avatar size="36">
            <img
              :src="authStore.currentUser?.profilePicture || 'https://via.placeholder.com/36'"
              alt="Profile Picture"
            />
          </v-avatar>
        </v-btn>
        <v-btn
          v-if="authStore.isAuthenticated"
          color="red"
          text
          @click="logoutUser"
          class="ml-2"
          rounded
        >
          {{ t('logout') }}
        </v-btn>
        <v-btn
          :icon="darkMode ? 'mdi-white-balance-sunny' : 'mdi-moon-waxing-crescent'"
          class="ml-2"
          @click="toggleDarkMode"
          :aria-label="t('darkMode')"
          variant="text"
        />
        <v-select
          v-model="locale"
          :items="languages"
          item-title="name"
          item-value="code"
          :label="t('language')"
          prepend-icon="mdi-earth"
          outlined
          class="ml-2 language-select"
          style="max-width: 200px; min-width: 180px;"
          :aria-label="t('language')"
          hide-details
        />
      </v-col>
    </v-row>

    <!-- Summary Card with Pie Chart -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card elevation="4" class="pa-4" rounded="lg">
          <v-card-title class="subtitle-1 font-weight-medium">{{ t('summary') }}</v-card-title>
          <v-card-text>
            <v-row align="center">
              <v-col cols="12" md="6">
                <v-row class="gap-2">
                  <v-col cols="12" sm="4">
                    <v-chip color="primary" label prepend-icon="mdi-format-list-bulleted">
                      {{ t('totalExpenses', { count: filteredExpenses.length }) }}
                    </v-chip>
                  </v-col>
                  <v-col cols="12" sm="4">
                    <v-chip color="green" label prepend-icon="mdi-currency-inr">
                      {{ t('totalAmount', { amount: totalAmount.toFixed(2) }) }}
                    </v-chip>
                  </v-col>
                  <v-col cols="12" sm="4">
                    <v-chip color="orange" label prepend-icon="mdi-calculator">
                      {{ t('averageAmount', { amount: averageAmount.toFixed(2) }) }}
                    </v-chip>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="12" md="6">
                <div style="height: 220px;">
                  <Pie :data="summaryChartData" :options="summaryChartOptions" />
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters: Date Range and Search -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-expansion-panels flat>
          <v-expansion-panel rounded="lg">
            <v-expansion-panel-title class="font-weight-medium">
              {{ t('filters') }}
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row align="center">
                <v-col cols="12" sm="4">
                  <v-text-field
                    v-model="searchQuery"
                    :label="t('searchExpenses')"
                    prepend-inner-icon="mdi-magnify"
                    outlined
                    clearable
                    background-color="white"
                    :aria-label="t('searchExpenses')"
                  />
                </v-col>
                <v-col cols="12" sm="4">
                  <v-menu
                    v-model="startDateMenu"
                    :close-on-content-click="false"
                    transition="scale-transition"
                  >
                    <template v-slot:activator="{ props }">
                      <v-text-field
                        v-model="startDate"
                        :label="t('startDate')"
                        prepend-inner-icon="mdi-calendar"
                        readonly
                        outlined
                        clearable
                        v-bind="props"
                        background-color="white"
                        :aria-label="t('startDate')"
                      />
                    </template>
                    <v-date-picker
                      v-model="startDateRaw"
                      @update:modelValue="updateStartDate"
                      :max="endDateRaw ? endDateRaw.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]"
                      no-title
                    />
                  </v-menu>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-menu
                    v-model="endDateMenu"
                    :close-on-content-click="false"
                    transition="scale-transition"
                  >
                    <template v-slot:activator="{ props }">
                      <v-text-field
                        v-model="endDate"
                        :label="t('endDate')"
                        prepend-inner-icon="mdi-calendar"
                        readonly
                        outlined
                        clearable
                        v-bind="props"
                        background-color="white"
                        :aria-label="t('endDate')"
                      />
                    </template>
                    <v-date-picker
                      v-model="endDateRaw"
                      @update:modelValue="updateEndDate"
                      :min="startDateRaw ? startDateRaw.toISOString().split('T')[0] : undefined"
                      :max="new Date().toISOString().split('T')[0]"
                      no-title
                    />
                  </v-menu>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>

    <!-- Expense List and Chart -->
    <v-row class="mt-6">
      <v-col cols="12" lg="6">
        <ExpenseList :expenses="filteredExpenses" @edit="editExpense" @delete="deleteExpense" />
      </v-col>
      <v-col cols="12" lg="6">
        <ExpenseChart :expenses="filteredExpenses" />
      </v-col>
    </v-row>

    <!-- Forms and Dialogs -->
    <ExpenseForm :show="showAddForm" @update:show="showAddForm = $event" />
    <ExpenseForm :show="showEditForm" :expense="selectedExpense" @update:show="showEditForm = $event" />
    <v-dialog v-model="showClearDialog" max-width="400">
      <v-card rounded="lg">
        <v-card-title class="headline">{{ t('confirmClearAllData') }}</v-card-title>
        <v-card-text>{{ t('clearAllDataMessage') }}</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" text @click="showClearDialog = false">{{ t('cancel') }}</v-btn>
          <v-btn color="red" text @click="clearAllData">{{ t('clear') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="showSnackbar" :timeout="2000" color="success" rounded="pill">
      {{ t('languageChanged') }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="showSnackbar = false">{{ t('close') }}</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useExpenseStore } from '@/stores/expenseStore';
import { useAuthStore } from '@/stores/auth';
import { logout } from '@/services/authService';
import ExpenseList from '@/components/ExpenseList.vue';
import ExpenseChart from '@/components/ExpenseChart.vue';
import ExpenseForm from '@/components/ExpenseForm.vue';
import { Pie } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, type ChartData, type ChartOptions } from 'chart.js';
import type { Expense } from '@/types/expense';
import { useI18n } from 'vue-i18n';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const store = useExpenseStore();
const authStore = useAuthStore();
const router = useRouter();
const { locale, t } = useI18n();
const showAddForm = ref(false);
const showEditForm = ref(false);
const selectedExpense = ref<Expense | undefined>(undefined);
const showClearDialog = ref(false);
const showSnackbar = ref(false);
const darkMode = ref(false);
const searchQuery = ref<string>('');

// Date Range
const startDateMenu = ref(false);
const endDateMenu = ref(false);
const startDateRaw = ref<Date | null>(null);
const endDateRaw = ref<Date | null>(null);
const startDate = ref<string | null>(null);
const endDate = ref<string | null>(null);

// Language Options
const languages = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
];

// Dark Mode Handling
onMounted(() => {
  // Load dark mode preference from localStorage
  const savedDarkMode = localStorage.getItem('darkMode');
  darkMode.value = savedDarkMode ? JSON.parse(savedDarkMode) : false;

  // Load language preference from localStorage
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage) {
    locale.value = savedLanguage;
  }

  // Fetch expenses for the authenticated user
  if (authStore.isAuthenticated && authStore.currentUser) {
    store.fetchExpenses(authStore.currentUser.id).catch((error) => {
      console.error('Failed to fetch expenses:', error);
    });
  } else {
    router.push('/login'); // Redirect to login if not authenticated
  }
});

const toggleDarkMode = () => {
  darkMode.value = !darkMode.value;
  localStorage.setItem('darkMode', JSON.stringify(darkMode.value));
  // Optionally update Vuetify theme if using Vuetify's theme system
  // if (vuetify) {
  //   vuetify.theme.global.name.value = darkMode.value ? 'dark' : 'light';
  // }
};

// Language Persistence
watch(locale, (newLocale) => {
  localStorage.setItem('language', newLocale);
  showSnackbar.value = true;
});

// Date Handling
const formatDate = (date: Date | null): string | null => {
  if (!date) return null;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const parseDate = (dateStr: string | null): Date | null => {
  if (!dateStr || !/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) return null;
  const [day, month, year] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const updateStartDate = (date: Date | null) => {
  startDate.value = formatDate(date);
  startDateRaw.value = date;
  startDateMenu.value = false;
};

const updateEndDate = (date: Date | null) => {
  endDate.value = formatDate(date);
  endDateRaw.value = date;
  endDateMenu.value = false;
};

// Filtering Logic
const expenses = computed(() => store.expenses);

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
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter((exp) =>
      [
        exp.title.toLowerCase(), // Added title to search
        exp.category.toLowerCase(),
        exp.amount.toString(),
        exp.date.toLowerCase(),
        exp.paymentMethod.toLowerCase(), // Added paymentMethod to search
      ].some((field) => field.includes(query))
    );
  }
  return result;
});

// Summary Calculations
const totalAmount = computed(() =>
  filteredExpenses.value.reduce((sum, exp) => sum + exp.amount, 0)
);

const averageAmount = computed(() =>
  filteredExpenses.value.length ? totalAmount.value / filteredExpenses.value.length : 0
);

// Pie Chart Data
const summaryChartData = computed<ChartData<'pie'>>(() => {
  const categoryTotals = filteredExpenses.value.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);

  return {
    labels: labels.length
      ? labels.map((cat) => t(`categories.${cat.toLowerCase()}`, cat))
      : [t('noData')],
    datasets: [
      {
        data: data.length ? data : [1], // Fallback to [1] to avoid empty chart
        backgroundColor: data.length
          ? ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
          : ['#E0E0E0'], // Gray color for "No Data"
        borderColor: '#fff',
        borderWidth: 1,
      },
    ],
  };
});

const summaryChartOptions = computed<ChartOptions<'pie'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { color: darkMode.value ? '#fff' : '#333', font: { size: 12 } },
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.label || '';
          const value = context.raw as number;
          if (label === t('noData')) return label;
          return `${label}: ₹${value.toFixed(2)}`;
        },
      },
    },
  },
}));

// Actions
const clearAllData = () => {
  store.resetExpenses();
  showClearDialog.value = false;
};

const editExpense = (expense: Expense) => {
  selectedExpense.value = { ...expense };
  showEditForm.value = true;
};

const deleteExpense = async (id: string) => {
  try {
    await store.deleteExpense(id);
  } catch (error) {
    console.error('Failed to delete expense:', error);
  }
};

const logoutUser = () => {
  logout();
  router.push('/login');
};
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}

.v-container {
  background-color: #f5f5f5;
  color: #333;
  transition: background-color 0.3s ease;
}

.v-card,
.v-chip,
.v-text-field {
  background-color: #ffffff;
  transition: background-color 0.3s ease;
}

.dark-mode {
  background-color: #121212;
}

.dark-mode .v-card,
.dark-mode .v-chip,
.dark-mode .v-text-field {
  background-color: #1e1e1e;
  color: #ffffff;
}

.dark-mode .v-expansion-panel-title,
.dark-mode .v-expansion-panel-text {
  background-color: #1e1e1e;
  color: #ffffff;
}

/* Fix for heading color in dark mode */
.dark-mode h1 {
  color: #ffffff !important;
}

.language-select {
  max-width: 200px;
  min-width: 180px;
  font-size: 16px; /* Larger text for readability */
}

.language-select .v-select__selection {
  font-size: 16px; /* Ensure selected text is readable */
}

.v-snackbar {
  font-weight: medium;
}
</style>