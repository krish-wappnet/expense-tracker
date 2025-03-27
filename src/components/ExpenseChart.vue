<!-- src/components/ExpenseChart.vue -->
<template>
  <v-card elevation="0" class="ma-4" :class="{ 'dark-mode': darkMode }">
    <v-tabs v-model="activeTab" color="primary" grow>
      <v-tab value="category">{{ t('categorySpending') }}</v-tab>
      <v-tab value="payment">{{ t('paymentMethodSpending') }}</v-tab>
    </v-tabs>
    <v-tabs-window v-model="activeTab">
      <v-tabs-window-item value="category">
        <v-card-text>
          <div class="chart-container">
            <Pie :data="categoryChartData" :options="categoryChartOptions" />
          </div>
        </v-card-text>
      </v-tabs-window-item>
      <v-tabs-window-item value="payment">
        <v-card-text>
          <div class="chart-container">
            <Bar :data="paymentChartData" :options="paymentChartOptions" />
          </div>
        </v-card-text>
      </v-tabs-window-item>
    </v-tabs-window>
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

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const props = defineProps<{ expenses: Expense[] }>();

// Active tab state
const activeTab = ref('category');

// Use i18n for translations
const { t } = useI18n();

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
        data: data.length ? data : [1], // Fallback to [1] to avoid empty chart
        backgroundColor: data.length
          ? ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
          : ['#E0E0E0'], // Gray color for "No Data"
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
    legend: {
      position: 'top',
      labels: {
        color: darkMode.value ? '#fff' : '#333',
        font: { size: 14 },
      },
    },
    tooltip: {
      backgroundColor: darkMode.value ? '#333' : '#fff',
      titleColor: darkMode.value ? '#fff' : '#333',
      bodyColor: darkMode.value ? '#fff' : '#333',
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
        data: data.length ? data : [0], // Fallback to [0] to avoid empty chart
        backgroundColor: data.length
          ? ['#FF6384', '#36A2EB', '#FFCE56']
          : ['#E0E0E0'], // Gray color for "No Data"
        borderColor: data.length
          ? ['#FF6384', '#36A2EB', '#FFCE56']
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
    legend: {
      display: false, // Hide legend for bar chart since we have only one dataset
    },
    tooltip: {
      backgroundColor: darkMode.value ? '#333' : '#fff',
      titleColor: darkMode.value ? '#fff' : '#333',
      bodyColor: darkMode.value ? '#fff' : '#333',
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
        font: { size: 14 },
      },
      ticks: { color: darkMode.value ? '#fff' : '#333' },
      grid: {
        display: false, // Hide vertical grid lines
      },
    },
    y: {
      title: {
        display: true,
        text: t('amountAxis'),
        color: darkMode.value ? '#fff' : '#333',
        font: { size: 14 },
      },
      ticks: {
        color: darkMode.value ? '#fff' : '#333',
        callback: (value) => `₹${value}`,
      },
      beginAtZero: true,
      grid: {
        color: darkMode.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      },
    },
  },
}));
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 400px; /* Fixed height to prevent layout shifts */
}

.v-card {
  background-color: #ffffff;
  transition: background-color 0.3s ease;
}

.dark-mode .v-card {
  background-color: #1e1e1e;
}

.v-tabs {
  border-bottom: 1px solid #e0e0e0;
}

.dark-mode .v-tabs {
  border-bottom: 1px solid #333;
}

.v-tab {
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
}

.v-card-text {
  padding: 16px;
}
</style>