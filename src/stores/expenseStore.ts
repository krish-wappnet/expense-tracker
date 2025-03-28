// src/stores/expenseStore.ts
import { defineStore } from 'pinia';
import type { Expense } from '@/types/expense';
import { fetchExpenses, addExpense, updateExpense, deleteExpense } from '@/services/expenseService';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

export interface User {
  id: string; // Consistent with your store
  name: string;
  email?: string;
}

export const useExpenseStore = defineStore('expense', {
  state: () => ({
    expenses: [] as Expense[],
    users: [] as User[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchUsers() {
      const authStore = useAuthStore();
      if (!authStore.getToken) {
        this.error = 'Not authenticated';
        return;
      }

      try {
        this.loading = true;
        this.error = null;
        const response = await axios.get('http://localhost:3000/auth/users', {
          headers: {
            Authorization: `Bearer ${authStore.getToken}`,
          },
        });
        this.users = response.data.map((user: any) => ({
          id: String(user.id),
          name: user.name,
          email: user.email,
        }));
        console.log('Fetched users:', this.users);
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch users';
        console.error('Failed to fetch users:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchExpenses(userId: string) { // Add userId parameter
      const authStore = useAuthStore();
      if (!authStore.getToken) {
        this.error = 'Not authenticated';
        return;
      }

      try {
        this.loading = true;
        this.error = null;
        const response = await axios.get(`http://localhost:3000/api/expenses?userId=${userId}`, {
          headers: {
            Authorization: `Bearer ${authStore.getToken}`,
          },
        });
        this.expenses = response.data;
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch expenses';
        console.error('Failed to fetch expenses:', error);
        throw error; // Throw to allow catching in Dashboard.vue
      } finally {
        this.loading = false;
      }
    },

    async addExpense(expense: Omit<Expense, 'id'>) {
      try {
        this.error = null;
        const newExpense = await addExpense(expense);
        this.expenses.push(newExpense);
        return newExpense;
      } catch (error: any) {
        this.error = error.message || 'Failed to add expense';
        console.error('Failed to add expense:', error);
        throw error;
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
        return updatedExpense;
      } catch (error: any) {
        this.error = error.message || 'Failed to update expense';
        console.error('Failed to update expense:', error);
        throw error;
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

  getters: {
    getUserName: (state) => (userId: string) => {
      const user = state.users.find((u) => u.id === userId);
      return user ? user.name : 'Unknown';
    },
    getUserEmail: (state) => (userId: string) => {
      const user = state.users.find((u) => u.id === userId);
      return user ? user.email || 'Unknown' : 'Unknown';
    },
  },
});