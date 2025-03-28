<!-- src/components/ExpenseChart.vue -->
<template>
  <v-card elevation="0" class="ma-4" :class="{ 'dark-mode': darkMode }">
    <v-tabs v-model="activeTab" color="primary" grow>
      <v-tab :value="'category'">{{ t('categorySpending') }}</v-tab>
      <v-tab :value="'payment'">{{ t('paymentMethodSpending') }}</v-tab>
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
import { useDisplay } from 'vuetify';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const props = defineProps<{ expenses: Expense[] }>();

// Active tab state
const activeTab = ref('category');

// Use i18n for translations
const { t } = useI18n();

// Use Vuetify display for responsive logic
const display = useDisplay();

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
      position: display.smAndDown ? 'bottom' : 'top', // Move legend to bottom on mobile
      labels: {
        color: darkMode.value ? '#fff' : '#333',
        font: { size: display.smAndDown ? 12 : 14 }, // Smaller font on mobile
        padding: display.smAndDown ? 10 : 20, // Adjust padding for mobile
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
        font: { size: display.smAndDown ? 10 : 12 }, // Smaller ticks on mobile
        maxRotation: display.smAndDown ? 45 : 0, // Rotate labels on mobile
        minRotation: display.smAndDown ? 45 : 0,
      },
      grid: {
        display: false, // Hide vertical grid lines
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
</script>

<style scoped>
.chart-container {
  width: 100%;
  max-width: 600px; /* Limit width on laptops for a more compact look */
  height: 300px; /* Reduced height for laptops */
  margin: 0 auto; /* Center the chart */
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
  font-size: 16px; /* Default font size for tabs */
}

.v-card-text {
  padding: 16px;
}

/* Responsive Adjustments */
@media (max-width: 960px) {
  .chart-container {
    max-width: 500px; /* Slightly smaller width on medium screens */
    height: 300px; /* Same height as laptop for consistency */
  }

  .v-tab {
    font-size: 14px; /* Smaller tab font on medium screens */
  }

  .v-card-text {
    padding: 12px; /* Reduce padding on medium screens */
  }
}

@media (max-width: 600px) {
  .chart-container {
    max-width: 100%; /* Full width on mobile */
    height: 250px; /* Further reduce height on small screens */
  }

  .v-tab {
    font-size: 12px; /* Even smaller tab font on mobile */
    padding: 8px; /* Reduce padding for better tap area */
  }

  .v-card-text {
    padding: 8px; /* Minimal padding on mobile */
  }

  .v-tabs {
    flex-direction: column; /* Stack tabs vertically on mobile */
  }

  .v-tab {
    width: 100%; /* Full-width tabs on mobile */
  }
}

/* Adjust chart in sidebar */
@media (min-width: 960px) {
  .chart-container {
    max-width: 100%; /* Full width within sidebar */
    height: 200px; /* Match sidebar-chart height */
  }

  .v-tab {
    font-size: 12px; /* Smaller tabs in sidebar */
  }

  .v-card-text {
    padding: 8px; /* Reduced padding in sidebar */
  }
}
</style>