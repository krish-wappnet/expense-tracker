<!-- src/components/ExpenseChart.vue -->
<template>
  <v-card elevation="0" class="ma-4" :class="{ 'dark-mode': darkMode }">
    <v-tabs
      v-model="activeTab"
      color="primary"
      grow
      aria-label="Expense chart type selection"
      class="sticky-tabs"
    >
      <v-tab :value="'category'" :aria-label="t('categorySpending')">{{ t('categorySpending') }}</v-tab>
      <v-tab :value="'payment'" :aria-label="t('paymentMethodSpending')">{{ t('paymentMethodSpending') }}</v-tab>
    </v-tabs>
    <v-tabs-window v-model="activeTab">
      <v-tabs-window-item value="category">
        <v-card-text>
          <v-progress-circular
            v-if="!props.expenses.length"
            indeterminate
            color="primary"
            class="mx-auto d-block"
          />
          <transition name="fade" v-else>
            <div class="chart-container pie-chart" v-if="activeTab === 'category'">
              <Pie :data="categoryChartData" :options="categoryChartOptions" />
            </div>
          </transition>
        </v-card-text>
      </v-tabs-window-item>
      <v-tabs-window-item value="payment">
        <v-card-text>
          <v-progress-circular
            v-if="!props.expenses.length"
            indeterminate
            color="primary"
            class="mx-auto d-block"
          />
          <transition name="fade" v-else>
            <div class="chart-container bar-chart" v-if="activeTab === 'payment'">
              <Bar :data="paymentChartData" :options="paymentChartOptions" />
            </div>
          </transition>
        </v-card-text>
      </v-tabs-window-item>
    </v-tabs-window>
    <v-card-actions class="justify-end">
      <v-btn variant="text" color="primary" @click="downloadChart(activeTab === 'category' ? 'pie' : 'bar')">
        {{ t('downloadChart') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { Pie, Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import type { Expense } from '@/types/expense';
import { useI18n } from 'vue-i18n';
import { useDisplay, useTheme } from 'vuetify';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const props = defineProps<{ expenses: Expense[] }>();

// Active tab state
const activeTab = ref('category');

// Use i18n for translations
const { t } = useI18n();

// Use Vuetify display and theme
const display = useDisplay();
const theme = useTheme();

// Dark mode state
const darkMode = computed(() => {
  const savedDarkMode = localStorage.getItem('darkMode');
  return savedDarkMode ? JSON.parse(savedDarkMode) : false;
});

// Category Spending (Pie Chart)
const categoryChartData = computed<ChartData<'pie', number[], string>>(() => {
  const categoryTotals = props.expenses.reduce((acc, exp) => {
    const amount = typeof exp.amount === 'number' ? exp.amount : parseFloat(exp.amount) || 0;
    acc[exp.category] = (acc[exp.category] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);

  return {
    labels: labels.length
      ? labels.map((category) => t(`categories.${category.toLowerCase()}`, category))
      : [t('noData')],
    datasets: [
      {
        data: data.length ? data : [1],
        backgroundColor: data.length
          ? [
              theme.current.value.colors.primary,
              theme.current.value.colors.secondary,
              theme.current.value.colors.accent,
              theme.current.value.colors.info,
              theme.current.value.colors.success,
            ]
          : ['#E0E0E0'],
        borderColor: darkMode.value ? '#333' : '#fff',
        borderWidth: 2,
      },
    ],
  };
});

const categoryChartOptions = computed<ChartOptions<'pie'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: {
      display: true,
      text: t('categorySpending'),
      color: darkMode.value ? '#fff' : '#333',
      font: { size: display.smAndDown ? 14 : 16 },
    },
    legend: {
      position: display.smAndDown ? 'bottom' : 'top',
      labels: {
        color: darkMode.value ? '#fff' : '#333',
        font: { size: display.smAndDown ? 12 : 14 },
        padding: display.smAndDown ? 10 : 20,
      },
    },
    tooltip: {
      backgroundColor: darkMode.value ? '#333' : '#fff',
      titleColor: darkMode.value ? '#fff' : '#333',
      bodyColor: darkMode.value ? '#fff' : '#333',
      titleFont: { size: display.smAndDown ? 12 : 14 },
      bodyFont: { size: display.smAndDown ? 12 : 14 },
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

// Payment Method Spending (Bar Chart)
const paymentChartData = computed<ChartData<'bar', number[], string>>(() => {
  const paymentTotals = props.expenses.reduce((acc, exp) => {
    const amount = typeof exp.amount === 'number' ? exp.amount : parseFloat(exp.amount) || 0;
    acc[exp.paymentMethod] = (acc[exp.paymentMethod] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);

  const labels = Object.keys(paymentTotals);
  const data = Object.values(paymentTotals);

  return {
    labels: labels.length
      ? labels.map((method) => t(`paymentMethods.${method.toLowerCase()}`, method))
      : [t('noData')],
    datasets: [
      {
        label: t('spendingByPaymentMethod'),
        data: data.length ? data : [0],
        backgroundColor: data.length
          ? [theme.current.value.colors.primary, theme.current.value.colors.secondary, theme.current.value.colors.accent]
          : ['#E0E0E0'],
        borderColor: data.length
          ? [theme.current.value.colors.primary, theme.current.value.colors.secondary, theme.current.value.colors.accent]
          : ['#E0E0E0'],
        borderWidth: 1,
      },
    ],
  };
});

const paymentChartOptions = computed<ChartOptions<'bar'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: {
      display: true,
      text: t('paymentMethodSpending'),
      color: darkMode.value ? '#fff' : '#333',
      font: { size: display.smAndDown ? 14 : 16 },
    },
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: darkMode.value ? '#333' : '#fff',
      titleColor: darkMode.value ? '#fff' : '#333',
      bodyColor: darkMode.value ? '#fff' : '#333',
      titleFont: { size: display.smAndDown ? 12 : 14 },
      bodyFont: { size: display.smAndDown ? 12 : 14 },
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
  scales: {
    x: {
      title: {
        display: true,
        text: t('paymentMethodAxis'),
        color: darkMode.value ? '#fff' : '#333',
        font: { size: display.smAndDown ? 12 : 14 },
      },
      ticks: {
        color: darkMode.value ? '#fff' : '#333',
        font: { size: display.smAndDown ? 10 : 12 },
        maxRotation: display.smAndDown ? 45 : 0,
        minRotation: display.smAndDown ? 45 : 0,
      },
      grid: {
        display: false,
      },
    },
    y: {
      title: {
        display: true,
        text: t('amountAxis'),
        color: darkMode.value ? '#fff' : '#333',
        font: { size: display.smAndDown ? 12 : 14 },
      },
      ticks: {
        color: darkMode.value ? '#fff' : '#333',
        font: { size: display.smAndDown ? 10 : 12 },
        callback: (value) => `₹${value}`,
      },
      beginAtZero: true,
      grid: {
        color: darkMode.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      },
    },
  },
}));

// Download chart functionality
const downloadChart = (type: 'pie' | 'bar') => {
  const chartCanvas = document.querySelector(`.${type}-chart canvas`) as HTMLCanvasElement;
  if (chartCanvas) {
    const link = document.createElement('a');
    link.href = chartCanvas.toDataURL('image/png');
    link.download = `${type}-chart-${new Date().toISOString()}.png`;
    link.click();
  }
};
</script>

<style scoped>
.chart-container {
  width: 100%;
  max-width: 600px;
  height: clamp(200px, 50vh, 400px); /* Dynamic height */
  margin: 0 auto;
}

.v-card {
  background-color: #ffffff;
  transition: background-color 0.3s ease;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.dark-mode .v-card {
  background-color: #1e1e1e;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.v-tabs {
  border-bottom: 1px solid #e0e0e0;
}

.dark-mode .v-tabs {
  border-bottom: 1px solid #333;
}

.sticky-tabs {
  position: sticky;
  top: 0;
  z-index: 1;
  background: inherit;
}

.v-tab {
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
  font-size: 16px;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.v-tab:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.dark-mode .v-tab:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.v-card-text {
  padding: 24px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive Adjustments */
@media (max-width: 960px) {
  .chart-container {
    max-width: 500px;
  }
  .v-tab {
    font-size: 14px;
  }
  .v-card-text {
    padding: 12px;
  }
}

@media (max-width: 600px) {
  .chart-container {
    max-width: 100%;
    height: clamp(150px, 40vh, 300px); /* Smaller on mobile */
  }
  .v-tab {
    font-size: 12px;
    padding: 8px;
  }
  .v-card-text {
    padding: 8px;
  }
  .v-tabs {
    flex-direction: column;
  }
  .v-tab {
    width: 100%;
  }
}

/* Sidebar adjustments */
@media (min-width: 960px) {
  .chart-container {
    max-width: 100%;
    height: 200px;
  }
  .v-tab {
    font-size: 12px;
  }
  .v-card-text {
    padding: 8px;
  }
}
</style>