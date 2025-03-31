// src/services/expenseService.ts
import { db } from '@/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { useAuthStore } from '@/stores/auth';
import type { Expense } from '@/types/expense';

export const validateExpense = (expense: Partial<Expense>): string[] => {
  const errors: string[] = [];
  if (!expense.title || expense.title.length > 100) errors.push('Title must be 1-100 characters.');
  if (!expense.amount || expense.amount <= 0) errors.push('Amount must be positive.');
  if (!expense.date || !/^\d{2}-\d{2}-\d{4}$/.test(expense.date)) errors.push('Date must be in dd-mm-yyyy format.');
  if (expense.category === null || expense.category === undefined || !['Food', 'Travel', 'Shopping', 'Bills', 'Others'].includes(expense.category)) errors.push('Invalid category.');
  if (expense.paymentMethod === null || expense.paymentMethod === undefined || !['Cash', 'Card', 'Online'].includes(expense.paymentMethod)) errors.push('Invalid payment method.');
  return errors;
};

// Remove undefined values from an object
const removeUndefined = (obj: Record<string, any>): Record<string, any> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined)
  );
};

export const fetchExpenses = async (): Promise<Expense[]> => {
  const authStore = useAuthStore();
  if (!authStore.isAuthenticated) throw new Error('User not authenticated');

  try {
    const expensesRef = collection(db, `users/${authStore.currentUser!.id}/expenses`);
    const querySnapshot = await getDocs(expensesRef);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Expense));
  } catch (error: any) {
    console.error('Error fetching expenses:', error);
    throw new Error(error.message || 'Failed to fetch expenses');
  }
};

export const addExpense = async (expense: Omit<Expense, 'id'>): Promise<Expense> => {
  const authStore = useAuthStore();
  if (!authStore.isAuthenticated) throw new Error('User not authenticated');

  const errors = validateExpense(expense);
  if (errors.length > 0) throw new Error(errors.join(' '));

  try {
    const expensesRef = collection(db, `users/${authStore.currentUser!.id}/expenses`);
    const cleanExpense = removeUndefined({
      ...expense,
      createdAt: new Date().toISOString(),
    });
    console.log('Saving expense:', cleanExpense); // Debug log
    const docRef = await addDoc(expensesRef, cleanExpense);
    return { id: docRef.id, ...expense };
  } catch (error: any) {
    console.error('Error adding expense:', error);
    throw new Error(error.message || 'Failed to add expense');
  }
};

export const updateExpense = async (expense: Expense): Promise<Expense> => {
  const authStore = useAuthStore();
  if (!authStore.isAuthenticated) throw new Error('User not authenticated');

  const errors = validateExpense(expense);
  if (errors.length > 0) throw new Error(errors.join(' '));

  try {
    const expenseRef = doc(db, `users/${authStore.currentUser!.id}/expenses`, expense.id);
    const cleanExpense = removeUndefined({ ...expense });
    await updateDoc(expenseRef, cleanExpense);
    return expense;
  } catch (error: any) {
    console.error('Error updating expense:', error);
    throw new Error(error.message || 'Failed to update expense');
  }
};

export const deleteExpense = async (id: string): Promise<void> => {
  const authStore = useAuthStore();
  if (!authStore.isAuthenticated) throw new Error('User not authenticated');

  try {
    const expenseRef = doc(db, `users/${authStore.currentUser!.id}/expenses`, id);
    await deleteDoc(expenseRef);
  } catch (error: any) {
    console.error('Error deleting expense:', error);
    throw new Error(error.message || 'Failed to delete expense');
  }
};