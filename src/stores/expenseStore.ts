// src/stores/expenseStore.ts
import { defineStore } from 'pinia';
import { ref, watch, type Ref } from 'vue';
import type { Expense } from '@/types/expense';

// Define the interface for the store
interface ExpenseStore {
  expenses: Ref<Expense[]>; // Use Ref<Expense[]> to match the reactive ref
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, updatedExpense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  resetExpenses: () => void;
  exportExpenses: () => void;
  importExpenses: (event: Event) => void;
}

export const useExpenseStore = defineStore<'expense', ExpenseStore>('expense', () => {
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

  const resetExpenses = () => {
    expenses.value = [];
    localStorage.removeItem('expenses');
  };

  const exportExpenses = () => {
    const dataStr = JSON.stringify(expenses.value);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'expenses.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importExpenses = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        expenses.value = JSON.parse(text);
      };
      reader.readAsText(input.files[0]);
    }
  };

  return { expenses, addExpense, updateExpense, deleteExpense, resetExpenses, exportExpenses, importExpenses };
});