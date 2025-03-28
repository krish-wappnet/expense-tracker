<!-- src/components/Dashboard.vue -->
<template>
  <v-container fluid class="dashboard-container" :class="{ 'dark-mode': darkMode }">
    <!-- App Bar -->
    <v-app-bar app flat color="transparent" class="mb-4">
      <v-app-bar-nav-icon
        v-if="$vuetify.display.smAndDown"
        @click="drawer = !drawer"
        :aria-label="t('menu')"
      />
      <v-toolbar-title class="display-1 font-weight-bold">
        {{ t('expenseTracker') }}
      </v-toolbar-title>
      <v-spacer />
      <v-btn
        v-if="authStore.isAuthenticated"
        icon
        @click="router.push('/profile')"
        :aria-label="t('profile')"
        class="mr-2"
      >
        <v-avatar size="36">
          <img
            :src="authStore.currentUser?.profilePicture || 'https://via.placeholder.com/36'"
            alt="Profile Picture"
          />
        </v-avatar>
      </v-btn>
      <v-btn
        :icon="darkMode ? 'mdi-white-balance-sunny' : 'mdi-moon-waxing-crescent'"
        @click="toggleDarkMode"
        :aria-label="t('darkMode')"
        variant="text"
        class="mr-2"
      />
      <v-select
        v-model="locale"
        :items="languages"
        item-title="name"
        item-value="code"
        :label="t('language')"
        prepend-icon="mdi-earth"
        outlined
        dense
        class="language-select"
        :aria-label="t('language')"
        hide-details
      />
    </v-app-bar>

    <!-- Sidebar Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      :temporary="$vuetify.display.smAndDown"
      :permanent="$vuetify.display.mdAndUp"
      width="250"
      class="sidebar"
      :class="{ 'dark-mode': darkMode }"
    >
      <v-list dense>
        <v-list-item v-if="authStore.isAuthenticated">
          <v-btn
            color="primary"
            @click="showAddForm = true"
            prepend-icon="mdi-plus"
            elevation="2"
            rounded
            block
            class="mb-2"
          >
            {{ t('addExpense') }}
          </v-btn>
        </v-list-item>
        <v-list-item>
          <v-btn
            color="red"
            outlined
            @click="showClearDialog = true"
            rounded
            block
            class="mb-2"
          >
            {{ t('clearAllData') }}
          </v-btn>
        </v-list-item>
        <v-list-item>
          <v-btn
            color="secondary"
            @click="store.exportExpenses"
            rounded
            block
            class="mb-2"
          >
            {{ t('export') }}
          </v-btn>
        </v-list-item>
        <v-list-item>
          <v-btn color="secondary" rounded block class="mb-2" style="position: relative;">
            {{ t('import') }}
            <input
              type="file"
              @change="store.importExpenses"
              style="position: absolute; opacity: 0; width: 100%; height: 100%; cursor: pointer;"
            />
          </v-btn>
        </v-list-item>
        <v-list-item v-if="authStore.isAuthenticated">
          <v-btn
            color="red"
            text
            @click="logoutUser"
            rounded
            block
            class="mb-2"
          >
            {{ t('logout') }}
          </v-btn>
        </v-list-item>
        <v-list-item v-else>
          <v-btn
            color="green"
            text
            @click="router.push('/login')"
            rounded
            block
            class="mb-2"
          >
            {{ t('login') }}
          </v-btn>
        </v-list-item>
        <v-list-item v-if="!authStore.isAuthenticated">
          <v-btn
            color="blue"
            text
            @click="router.push('/signup')"
            rounded
            block
            class="mb-2"
          >
            {{ t('signup') }}
          </v-btn>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main class="main-content">
      <v-container fluid class="pa-4">
        <v-row>
          <v-col cols="12">
            <!-- Expense List -->
            <ExpenseList :expenses="filteredExpenses" @edit="editExpense" @delete="deleteExpense" />

            <!-- Filters -->
            <v-expansion-panels flat class="mt-4">
              <v-expansion-panel rounded="lg">
                <v-expansion-panel-title class="font-weight-medium">
                  {{ t('filters') }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-row align="center" dense>
                    <v-col cols="12" sm="6" md="4">
                      <v-text-field
                        v-model="searchQuery"
                        :label="t('searchExpenses')"
                        prepend-inner-icon="mdi-magnify"
                        outlined
                        clearable
                        dense
                        :aria-label="t('searchExpenses')"
                      />
                    </v-col>
                    <v-col cols="12" sm="6" md="4">
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
                            dense
                            v-bind="props"
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
                    <v-col cols="12" sm="6" md="4">
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
                            dense
                            v-bind="props"
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

            <!-- Summary Section -->
            <v-card elevation="4" class="pa-4 mt-6" rounded="lg">
              <v-card-title class="subtitle-1 font-weight-medium">{{ t('summary') }}</v-card-title>
              <v-card-text>
                <v-row dense>
                  <v-col cols="12" sm="6" md="4">
                    <v-chip color="primary" label prepend-icon="mdi-format-list-bulleted" class="mb-2">
                      {{ t('totalExpenses', { count: filteredExpenses.length }) }}
                    </v-chip>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-chip color="green" label prepend-icon="mdi-currency-inr" class="mb-2">
                      {{ t('totalAmount', { amount: totalAmount.toFixed(2) }) }}
                    </v-chip>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-chip color="orange" label prepend-icon="mdi-calculator" class="mb-2">
                      {{ t('averageAmount', { amount: averageAmount.toFixed(2) }) }}
                    </v-chip>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- Single Chart (Expense Trend) -->
            <v-card elevation="4" class="pa-4 mt-6" rounded="lg">
              <v-card-title class="subtitle-1 font-weight-medium">{{ t('expenseTrend') }}</v-card-title>
              <v-card-text>
                <div class="chart-container">
                  <ExpenseChart :expenses="filteredExpenses" />
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

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
import type { Expense } from '@/types/expense';
import { useI18n } from 'vue-i18n';
import { useDisplay } from 'vuetify';

const store = useExpenseStore();
const authStore = useAuthStore();
const router = useRouter();
const { locale, t } = useI18n();
const display = useDisplay();
const drawer = ref(true); // Default to true for visibility
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
  const savedDarkMode = localStorage.getItem('darkMode');
  darkMode.value = savedDarkMode ? JSON.parse(savedDarkMode) : false;

  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage) {
    locale.value = savedLanguage;
  }

  if (authStore.isAuthenticated && authStore.currentUser) {
    store.fetchExpenses(authStore.currentUser.id).catch((error) => {
      console.error('Failed to fetch expenses:', error);
    });
  } else {
    router.push('/login');
  }
});

const toggleDarkMode = () => {
  darkMode.value = !darkMode.value;
  localStorage.setItem('darkMode', JSON.stringify(darkMode.value));
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
        exp.title.toLowerCase(),
        exp.category.toLowerCase(),
        exp.amount.toString(),
        exp.date.toLowerCase(),
        exp.paymentMethod.toLowerCase(),
      ].some((field) => field.includes(query))
    );
  }
  return result;
});

// Summary Calculations
const totalAmount = computed(() => {
  return Number(filteredExpenses.value.reduce((sum, exp) => sum + exp.amount, 0));
});

const averageAmount = computed(() =>
  filteredExpenses.value.length ? totalAmount.value / filteredExpenses.value.length : 0
);

// Removed sharedExpensesCount, highestExpense, and topCategory as they are no longer needed
// const sharedExpensesCount = computed(() =>
//   filteredExpenses.value.filter((exp) => exp.sharedWith && exp.sharedWith.length > 0).length
// );
//
// const highestExpense = computed(() =>
//   filteredExpenses.value.length
//     ? Math.max(...filteredExpenses.value.map((exp) => exp.amount))
//     : 0
// );
//
// const topCategory = computed(() => {
//   const categoryTotals = filteredExpenses.value.reduce((acc, exp) => {
//     acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
//     return acc;
//   }, {} as Record<string, number>);
//   const top = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
//   return top ? t(`categories.${top[0].toLowerCase()}`, top[0]) : t('noData');
// });

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
.dashboard-container {
  background-color: #f5f5f5;
  color: #333;
  transition: background-color 0.3s ease;
  min-height: 100vh; /* Ensure full viewport height */
  padding: 0 !important;
  display: flex;
  flex-direction: column;
}

.sidebar {
  background-color: #ffffff;
  padding: 16px;
  border-right: 1px solid #e0e0e0;
  height: 100%; /* Full height of container */
}

.dark-mode .sidebar {
  background-color: #1e1e1e;
  border-right: 1px solid #333;
}

.main-content {
  flex: 1; /* Take remaining space */
  overflow-y: auto; /* Allow scrolling if content overflows */
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

.dark-mode h1 {
  color: #ffffff !important;
}

.language-select {
  max-width: 200px;
  min-width: 120px;
  font-size: 14px;
}

.language-select .v-select__selection {
  font-size: 14px;
}

.chart-container {
  position: relative;
  height: 300px; /* Fixed height for visibility */
  width: 100%;
}

.v-snackbar {
  font-weight: medium;
}

/* Responsive Adjustments */
@media (max-width: 600px) {
  .v-toolbar-title {
    font-size: 1.25rem !important;
  }

  .language-select {
    min-width: 100px;
  }

  .v-chip {
    font-size: 12px;
    padding: 0 8px;
  }

  .chart-container {
    height: 250px;
  }

  /* Improve table display on mobile */
  .v-data-table {
    font-size: 12px;
  }

  .v-data-table-header th {
    padding: 4px !important;
    font-size: 10px !important;
  }

  .v-data-table td {
    padding: 4px !important;
    font-size: 12px !important;
  }
}

@media (min-width: 960px) {
  .main-content {
    margin-left: 20px; /* Match sidebar width */
  }
}
</style>