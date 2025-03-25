// src/stores/expenseStore.ts
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import type { Expense } from '@/types/expense';

export const useExpenseStore = defineStore('expense', () => {
  // Load expenses from localStorage on initialization
  const initialExpenses: Expense[] = (() => {
    const savedExpenses = localStorage.getItem('expenses');
    return savedExpenses ? JSON.parse(savedExpenses) : [];
  })();

  const expenses = ref<Expense[]>(initialExpenses);

  // Watch for changes to expenses and save to localStorage
  watch(
    expenses,
    (newExpenses) => {
      localStorage.setItem('expenses', JSON.stringify(newExpenses));
    },
    { deep: true }
  );

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = { ...expense, id: crypto.randomUUID() };
    expenses.value.push(newExpense);
  };

  const updateExpense = (id: string, updatedExpense: Partial<Expense>) => {
    const index = expenses.value.findIndex((exp) => exp.id === id);
    if (index !== -1) {
      expenses.value[index] = { ...expenses.value[index], ...updatedExpense };
    }
  };

  const deleteExpense = (id: string) => {
    expenses.value = expenses.value.filter((exp) => exp.id !== id);
  };

  return { expenses, addExpense, updateExpense, deleteExpense };
});