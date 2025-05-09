<!-- src/components/Dashboard.vue -->
<template>
  <v-container fluid class="dashboard-container" :class="{ 'dark-mode': darkMode }">
    <!-- App Bar -->
    <v-app-bar app flat color="transparent" class="app-bar">
      <v-app-bar-nav-icon
        v-if="$vuetify.display.smAndDown"
        @click="drawer = !drawer"
        :aria-label="t('menu')"
        color="primary"
      />
      <v-toolbar-title class="text-h5 font-weight-bold">
        {{ t('expenseTracker') }}
      </v-toolbar-title>
      <v-spacer />
      <v-btn
        v-if="authStore.isAuthenticated"
        icon
        @click="router.push('/profile')"
        :aria-label="t('profile')"
        class="profile-btn mr-2"
      >
        <v-avatar size="40" class="elevation-2">
          <img
            :src="profilePic || 'https://via.placeholder.com/150'"
            alt="Profile Picture"
            @error="$event.target && (($event.target as HTMLImageElement).src = 'https://via.placeholder.com/150')"
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
      <v-list dense class="sidebar-list">
        <!-- Main Action Buttons -->
        <v-list-item v-if="authStore.isAuthenticated" class="mb-3">
          <v-btn
            color="primary"
            @click="showAddForm = true"
            prepend-icon="mdi-plus"
            rounded="lg"
            block
            class="sidebar-btn primary-btn"
          >
            {{ t('addExpense') }}
          </v-btn>
        </v-list-item>
        <v-list-item class="mb-3">
          <v-btn
            color="primary"
            @click="store.exportExpenses"
            rounded="lg"
            block
            class="sidebar-btn primary-btn"
          >
            {{ t('export') }}
          </v-btn>
        </v-list-item>
        <v-list-item class="mb-3">
          <v-btn
            color="primary"
            rounded="lg"
            block
            class="sidebar-btn primary-btn"
            style="position: relative;"
          >
            {{ t('import') }}
            <input
              type="file"
              @change="store.importExpenses"
              style="position: absolute; opacity: 0; width: 100%; height: 100%; cursor: pointer;"
            />
          </v-btn>
        </v-list-item>
        <v-list-item v-if="!authStore.isAuthenticated" class="mb-3">
          <v-btn
            color="primary"
            @click="router.push('/login')"
            rounded="lg"
            block
            class="sidebar-btn primary-btn"
          >
            {{ t('login') }}
          </v-btn>
        </v-list-item>
        <v-list-item v-if="!authStore.isAuthenticated" class="mb-3">
          <v-btn
            color="primary"
            @click="router.push('/signup')"
            rounded="lg"
            block
            class="sidebar-btn primary-btn"
          >
            {{ t('signup') }}
          </v-btn>
        </v-list-item>

        <!-- Spacer and Secondary Actions -->
        <v-divider v-if="authStore.isAuthenticated" class="my-4 sidebar-divider" />
        <v-list-item v-if="authStore.isAuthenticated" class="mb-3">
          <v-btn
            color="grey"
            variant="outlined"
            @click="showClearDialog = true"
            rounded="lg"
            block
            class="sidebar-btn secondary-btn"
          >
            {{ t('clearAllData') }}
          </v-btn>
        </v-list-item>
        <v-list-item v-if="authStore.isAuthenticated" class="mb-3">
          <v-btn
            color="grey"
            variant="outlined"
            @click="logoutUser"
            rounded="lg"
            block
            class="sidebar-btn secondary-btn"
          >
            {{ t('logout') }}
          </v-btn>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main class="main-content">
      <v-container fluid class="pa-6">
        <v-row>
          <v-col cols="12">
            <!-- Expense List -->
            <ExpenseList :expenses="filteredExpenses" @edit="editExpense" @delete="deleteExpense" />

            <!-- Filters -->
            <v-expansion-panels flat class="mt-6">
              <v-expansion-panel rounded="lg" class="elevation-2">
                <v-expansion-panel-title class="font-weight-medium text-h6">
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
                        class="rounded-lg"
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
                            class="rounded-lg"
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
                            class="rounded-lg"
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
            <v-card elevation="4" class="pa-6 mt-6" rounded="lg">
              <v-card-title class="text-h6 font-weight-medium">{{ t('summary') }}</v-card-title>
              <v-card-text>
                <v-row dense>
                  <v-col cols="12" sm="6" md="4" class="mb-4">
                    <v-chip color="primary" label prepend-icon="mdi-format-list-bulleted" class="summary-chip">
                      {{ t('totalExpenses', { count: filteredExpenses.length }) }}
                    </v-chip>
                  </v-col>
                  <v-col cols="12" sm="6" md="4" class="mb-4">
                    <v-chip color="green" label prepend-icon="mdi-currency-inr" class="summary-chip">
                      {{ t('totalAmount', { amount: totalAmount.toFixed(2) }) }}
                    </v-chip>
                  </v-col>
                  <v-col cols="12" sm="6" md="4" class="mb-4">
                    <v-chip color="orange" label prepend-icon="mdi-calculator" class="summary-chip">
                      {{ t('averageAmount', { amount: averageAmount.toFixed(2) }) }}
                    </v-chip>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- Centered Chart Section -->
            <v-row justify="center" class="mt-6">
              <v-col cols="12" md="8" lg="6">
                <v-card elevation="4" class="pa-6 chart-card" rounded="lg">
                  <v-card-title class="text-h6 font-weight-medium text-center">
                    {{ t('expenseTrend') }}
                  </v-card-title>
                  <v-card-text>
                    <v-progress-circular
                      v-if="!filteredExpenses.length"
                      indeterminate
                      color="primary"
                      class="mx-auto d-block"
                    />
                    <transition name="fade">
                      <div v-if="filteredExpenses.length" class="chart-container">
                        <ExpenseChart :expenses="filteredExpenses" />
                      </div>
                    </transition>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- Forms and Dialogs -->
    <ExpenseForm :show="showAddForm" @update:show="showAddForm = $event" />
    <ExpenseForm :show="showEditForm" :expense="selectedExpense" @update:show="showEditForm = $event" />
    <v-dialog v-model="showClearDialog" max-width="400">
      <v-card rounded="lg">
        <v-card-title class="text-h6">{{ t('confirmClearAllData') }}</v-card-title>
        <v-card-text>{{ t('clearAllDataMessage') }}</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="showClearDialog = false">{{ t('cancel') }}</v-btn>
          <v-btn color="red" variant="text" @click="clearAllData">{{ t('clear') }}</v-btn>
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
import ExpenseList from '@/components/ExpenseList.vue';
import ExpenseChart from '@/components/ExpenseChart.vue';
import ExpenseForm from '@/components/ExpenseForm.vue';
import type { Expense } from '@/types/expense';
import { useI18n } from 'vue-i18n';
import { useDisplay } from 'vuetify';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Initialize stores and router
const store = useExpenseStore();
const authStore = useAuthStore();
const router = useRouter();
const { locale, t } = useI18n();
const display = useDisplay();

// Reactive variables
const drawer = ref(true);
const showAddForm = ref(false);
const showEditForm = ref(false);
const selectedExpense = ref<Expense | undefined>(undefined);
const showClearDialog = ref(false);
const showSnackbar = ref(false);
const darkMode = ref(false);
const searchQuery = ref<string>('');
const profilePic = ref<string | null>(null);

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
const toggleDarkMode = () => {
  darkMode.value = !darkMode.value;
  localStorage.setItem('darkMode', JSON.stringify(darkMode.value));
};

// Sync auth state and initialize component
onMounted(async () => {
  const savedDarkMode = localStorage.getItem('darkMode');
  darkMode.value = savedDarkMode ? JSON.parse(savedDarkMode) : false;

  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage) {
    locale.value = savedLanguage;
  }

  try {
    await authStore.initializeAuth();
    if (authStore.isAuthenticated && authStore.currentUser) {
      await store.fetchExpenses();
      const userId = authStore.currentUser.id;
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        profilePic.value = data.profilePicture || null;
        if (authStore.currentUser) {
          authStore.currentUser.profilePicture = profilePic.value || undefined;
        }
      }
    } else {
      router.push('/login');
    }
  } catch (error) {
    console.error('Error during initialization:', error);
    router.push('/login');
  }
});

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

// Actions
const clearAllData = async () => {
  try {
    await store.resetExpenses();
    showClearDialog.value = false;
  } catch (error) {
    console.error('Failed to clear data:', error);
  }
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

const logoutUser = async () => {
  try {
    await authStore.logout();
    profilePic.value = null;
    router.push('/login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
</script>

<style scoped>
.dashboard-container {
  background-color: #f7f9fc;
  color: #333;
  transition: background-color 0.3s ease;
  min-height: 100vh;
  padding: 0 !important;
  display: flex;
  flex-direction: column;
}

.app-bar {
  background: #ffffff !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06) !important;
  padding: 0 16px;
  border-radius: 0 0 12px 12px;
}

.sidebar {
  background-color: #ffffff;
  padding: 24px 16px;
  border-right: 1px solid #e0e0e0;
  height: 100%;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.dark-mode .sidebar {
  background-color: #1e1e1e;
  border-right: 1px solid #333;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.2);
}

.sidebar-list {
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-btn {
  height: 48px !important;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
  text-transform: none;
  transition: all 0.3s ease;
}

.primary-btn {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, var(--v-theme-primary), var(--v-theme-primary-darken-1));
  color: white !important;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, var(--v-theme-primary-darken-1), var(--v-theme-primary));
}

.secondary-btn {
  background: transparent;
  color: var(--v-theme-grey-darken-1) !important;
  border: 1px solid var(--v-theme-grey-darken-1);
}

.secondary-btn:hover {
  background: rgba(var(--v-theme-grey-darken-1), 0.1);
  transform: translateY(-2px);
}

.dark-mode .primary-btn {
  background: linear-gradient(135deg, var(--v-theme-primary-darken-1), var(--v-theme-primary));
}

.dark-mode .primary-btn:hover {
  background: linear-gradient(135deg, var(--v-theme-primary), var(--v-theme-primary-darken-1));
}

.dark-mode .secondary-btn {
  color: var(--v-theme-grey-lighten-1) !important;
  border: 1px solid var(--v-theme-grey-lighten-1);
}

.dark-mode .secondary-btn:hover {
  background: rgba(var(--v-theme-grey-lighten-1), 0.2);
}

.sidebar-divider {
  border-color: rgba(0, 0, 0, 0.12);
}

.dark-mode .sidebar-divider {
  border-color: rgba(255, 255, 255, 0.12);
}

.main-content {
  flex: 1;
  overflow-y: auto;
}

.v-card,
.v-chip,
.v-text-field {
  background-color: #ffffff;
  transition: background-color 0.3s ease, box-shadow 0.2s ease;
  border-radius: 12px;
}

.chart-card {
  transition: transform 0.3s ease;
}

.chart-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.dark-mode {
  background-color: #121212;
}

.dark-mode .app-bar {
  background: #1e1e1e !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2) !important;
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

.dark-mode h1,
.dark-mode .text-h5,
.dark-mode .text-h6 {
  color: #ffffff !important;
}

.profile-btn .v-avatar {
  border: 2px solid #e0e0e0;
  transition: transform 0.2s ease;
}

.profile-btn:hover .v-avatar {
  transform: scale(1.1);
}

.language-select {
  max-width: 200px;
  min-width: 120px;
  font-size: 14px;
}

.summary-chip {
  font-size: 1rem;
  padding: 0 16px;
  height: 40px;
  transition: transform 0.2s ease;
}

.summary-chip:hover {
  transform: scale(1.05);
}

.chart-container {
  position: relative;
  height: 350px;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.v-snackbar {
  font-weight: 500;
}

/* Responsive Adjustments */
@media (max-width: 600px) {
  .text-h5 {
    font-size: 1.25rem !important;
  }

  .language-select {
    min-width: 100px;
  }

  .sidebar-btn {
    height: 40px !important;
    font-size: 0.875rem;
  }

  .summary-chip {
    font-size: 0.875rem;
    padding: 0 12px;
    height: 36px;
  }

  .chart-container {
    height: 250px;
  }
}

@media (min-width: 960px) {
  .main-content {
    margin-left: 20px;
  }
}
</style>