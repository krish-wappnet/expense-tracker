// src/stores/expenseStore.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import type { Expense } from '@/types/expense';
import { useAuthStore } from './auth';

export const useExpenseStore = defineStore('expense', () => {
  const authStore = useAuthStore();
  const expenses = ref<Expense[]>([]);
  let unsubscribe: (() => void) | null = null;

  // Fetch expenses from Firestore
  const fetchExpenses = () => {
    if (!authStore.currentUser?.id) return;
    
    try {
      const expensesCollection = collection(db, 'users', authStore.currentUser.id, 'expenses');

      // Subscribe to Firestore updates
      unsubscribe = onSnapshot(expensesCollection, (snapshot) => {
        expenses.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Expense[];
      });
    } catch (error: any) {
      console.error('Error fetching expenses:', error);
    }
  };

  // Add a new expense
  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    if (!authStore.currentUser?.id) throw new Error('User not authenticated');
    const expensesCollection = collection(db, 'users', authStore.currentUser.id, 'expenses');
    const docRef = await addDoc(expensesCollection, expense);
    const newExpense = { ...expense, id: docRef.id };
    expenses.value.push(newExpense);
    return docRef.id;
  };

  // Update an existing expense
  const updateExpense = async (expense: Expense) => {
    if (!authStore.currentUser?.id) throw new Error('User not authenticated');
    const expenseRef = doc(db, 'users', authStore.currentUser.id, 'expenses', expense.id);
    await updateDoc(expenseRef, { ...expense });
    const index = expenses.value.findIndex(e => e.id === expense.id);
    if (index !== -1) {
      expenses.value[index] = expense;
    }
  };

  // Delete an expense
  const deleteExpense = async (expenseId: string) => {
    if (!authStore.currentUser?.id) throw new Error('User not authenticated');
    const expenseRef = doc(db, 'users', authStore.currentUser.id, 'expenses', expenseId);
    await deleteDoc(expenseRef);
    expenses.value = expenses.value.filter(expense => expense.id !== expenseId);
  };

  // Method to add or update an expense in the store (used by ExpenseList.vue)
  const updateExpenseInStore = (expense: Expense) => {
    const index = expenses.value.findIndex(e => e.id === expense.id);
    if (index !== -1) {
      expenses.value[index] = expense;
    } else {
      expenses.value.push(expense);
    }
  };

  return {
    expenses,
    fetchExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    updateExpenseInStore,
  };
});