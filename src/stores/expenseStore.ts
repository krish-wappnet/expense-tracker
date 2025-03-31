// src/stores/expenseStore.ts
import { defineStore } from 'pinia';
import { onUnmounted, ref } from 'vue';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase';
import type { Expense } from '@/types/expense';
import { useAuthStore } from './auth';

export const useExpenseStore = defineStore('expense', () => {
  const authStore = useAuthStore();
  const expenses = ref<Expense[]>([]);
  let unsubscribe: (() => void) | null = null;

  // Fetch expenses from Firestore with real-time updates
  const fetchExpenses = () => {
    if (!authStore.currentUser?.id) {
      return Promise.reject(new Error('User not authenticated'));
    }

    // Stop any existing listener to prevent multiple listeners
    stopListening();

    const expensesCollection = collection(db, 'users', authStore.currentUser.id, 'expenses');

    // Return a Promise that resolves when the first snapshot is received
    return new Promise<void>((resolve, reject) => {
      unsubscribe = onSnapshot(
        expensesCollection,
        (snapshot) => {
          expenses.value = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Expense[];
          resolve(); // Resolve the Promise after the first snapshot
        },
        (error) => {
          console.error('Error listening to expenses:', error);
          reject(error); // Reject the Promise if there's an error
        }
      );
    });
  };

  // Stop the Firestore listener
  const stopListening = () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  };

  // Add a new expense
  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    if (!authStore.currentUser?.id) {
      throw new Error('User not authenticated');
    }
    const expensesCollection = collection(db, 'users', authStore.currentUser.id, 'expenses');
    const docRef = await addDoc(expensesCollection, expense);
    return docRef.id;
  };

  // Update an existing expense
  const updateExpense = async (expense: Expense) => {
    if (!authStore.currentUser?.id) {
      throw new Error('User not authenticated');
    }
    const expenseRef = doc(db, 'users', authStore.currentUser.id, 'expenses', expense.id);
    await updateDoc(expenseRef, { ...expense });
  };

  // Delete an expense
  const deleteExpense = async (expenseId: string) => {
    if (!authStore.currentUser?.id) {
      throw new Error('User not authenticated');
    }
    const expenseRef = doc(db, 'users', authStore.currentUser.id, 'expenses', expenseId);
    await deleteDoc(expenseRef);
  };

  // Method to add or update an expense in the store (used by ExpenseList.vue for immediate UI feedback)
  const updateExpenseInStore = (expense: Expense) => {
    const index = expenses.value.findIndex(e => e.id === expense.id);
    if (index !== -1) {
      expenses.value[index] = expense;
    } else {
      expenses.value.push(expense);
    }
    // Force reactivity
    expenses.value = [...expenses.value];
  };

  // Reset expenses
  const resetExpenses = () => {
    expenses.value = [];
  };

  // Export expenses to a JSON file
  const exportExpenses = () => {
    const data = JSON.stringify(expenses.value);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'expenses.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import expenses from a JSON file
  const importExpenses = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedExpenses = JSON.parse(e.target?.result as string) as Expense[];
          expenses.value = importedExpenses;
          // Sync the imported expenses with Firestore only if authenticated
          if (authStore.isAuthenticated && authStore.currentUser) {
            const userId = authStore.currentUser.id; // Guaranteed non-null due to isAuthenticated
            importedExpenses.forEach(async (expense) => {
              const expensesCollection = collection(db, 'users', userId, 'expenses');
              await addDoc(expensesCollection, { ...expense, id: undefined }); // Remove id to avoid duplication
            });
          }
        } catch (error) {
          console.error('Error importing expenses:', error);
        }
      };
      reader.readAsText(input.files[0]);
    }
  };

  // Clean up the listener when the store is destroyed
  onUnmounted(() => {
    stopListening();
  });

  return {
    expenses,
    fetchExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    updateExpenseInStore,
    resetExpenses,
    exportExpenses,
    importExpenses,
    stopListening,
  };
});