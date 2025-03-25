<template>
    <v-card elevation="0" class="ma-4">
      <v-tabs v-model="activeTab" color="primary" grow>
        <v-tab value="category">Category Spending</v-tab>
        <v-tab value="payment">Payment Method Spending</v-tab>
      </v-tabs>
      <v-tabs-window v-model="activeTab">
        <v-tabs-window-item value="category">
          <v-card-text>
            <Pie :data="categoryChartData" :options="categoryChartOptions" />
          </v-card-text>
        </v-tabs-window-item>
        <v-tabs-window-item value="payment">
          <v-card-text>
            <Bar :data="paymentChartData" :options="paymentChartOptions" />
          </v-card-text>
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card>
  </template>
  
  <script lang="ts" setup>
  import { ref, computed } from 'vue';
  import { Pie, Bar } from 'vue-chartjs';
  import { Chart, registerables } from 'chart.js';
  import type { ChartData, ChartOptions } from 'chart.js';
  import type { Expense } from '@/types/expense';
  Chart.register(...registerables);
  
  const props = defineProps<{ expenses: Expense[] }>();
  
  // Active tab state
  const activeTab = ref('category');
  
  // Category Spending (Pie Chart)
  const categoryChartData = computed<ChartData<'pie', number[], string>>(() => {
    const categoryTotals = props.expenses.reduce((acc, exp) => {
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
          borderWidth: 2,
        },
      ],
    };
  });
  
  const categoryChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#333', font: { size: 14 } },
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
  
  // Payment Method Spending (Bar Chart)
  const paymentChartData = computed<ChartData<'bar', number[], string>>(() => {
    const paymentTotals = props.expenses.reduce((acc, exp) => {
      acc[exp.paymentMethod] = (acc[exp.paymentMethod] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);
  
    return {
      labels: Object.keys(paymentTotals),
      datasets: [
        {
          label: 'Spending by Payment Method',
          data: Object.values(paymentTotals),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
          borderColor: ['#FF6384', '#36A2EB', '#FFCE56'],
          borderWidth: 1,
        },
      ],
    };
  });
  
  const paymentChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend for bar chart since we have only one dataset
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
    scales: {
      x: {
        title: {
          display: true,
          text: 'Payment Method',
          color: '#333',
          font: { size: 14 },
        },
        ticks: { color: '#333' },
      },
      y: {
        title: {
          display: true,
          text: 'Amount (₹)',
          color: '#333',
          font: { size: 14 },
        },
        ticks: {
          color: '#333',
          callback: (value) => `₹${value}`,
        },
        beginAtZero: true,
      },
    },
  };
  </script>