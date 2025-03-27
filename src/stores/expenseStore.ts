// src/stores/expenseStore.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Expense } from '@/types/expense';
import { fetchExpenses, addExpense, updateExpense, deleteExpense } from '@/services/expenseService';

export const useExpenseStore = defineStore('expense', {
  state: () => ({
    expenses: ref<Expense[]>([]),
    loading: ref(false),
    error: ref<string | null>(null), // Add error state for validation errors
  }),

  actions: {
    async fetchExpenses(userId: number) { // Changed from string to number
      try {
        this.loading = true;
        this.error = null;
        this.expenses = await fetchExpenses(userId);
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch expenses';
        console.error('Failed to fetch expenses:', error);
      } finally {
        this.loading = false;
      }
    },

    async addExpense(expense: Omit<Expense, 'id'>) {
      try {
        this.error = null;
        const newExpense = await addExpense(expense);
        this.expenses.push(newExpense);
      } catch (error: any) {
        this.error = error.message || 'Failed to add expense';
        console.error('Failed to add expense:', error);
        throw error; // Re-throw to handle in the component
      }
    },

    async updateExpense(expense: Expense) {
      try {
        this.error = null;
        const updatedExpense = await updateExpense(expense);
        const index = this.expenses.findIndex((exp) => exp.id === expense.id);
        if (index !== -1) {
          this.expenses[index] = updatedExpense;
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to update expense';
        console.error('Failed to update expense:', error);
        throw error; // Re-throw to handle in the component
      }
    },

    async deleteExpense(id: string) {
      try {
        this.error = null;
        await deleteExpense(id);
        this.expenses = this.expenses.filter((exp) => exp.id !== id);
      } catch (error: any) {
        this.error = error.message || 'Failed to delete expense';
        console.error('Failed to delete expense:', error);
        throw error;
      }
    },

    resetExpenses() {
      this.expenses = [];
      this.error = null;
    },

    exportExpenses() {
      const dataStr = JSON.stringify(this.expenses);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'expenses.json';
      link.click();
      window.URL.revokeObjectURL(url);
    },

    importExpenses(event: Event) {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedExpenses = JSON.parse(e.target?.result as string) as Expense[];
            this.expenses = importedExpenses;
          } catch (error) {
            console.error('Failed to import expenses:', error);
            this.error = 'Failed to import expenses';
          }
        };
        reader.readAsText(input.files[0]);
      }
    },
  },
});