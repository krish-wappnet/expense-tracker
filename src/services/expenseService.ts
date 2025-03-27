// src/services/expenseService.ts
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import type { Expense } from '@/types/expense';

const API_URL = 'http://localhost:3000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  const token = authStore.getToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const validateExpense = (expense: Partial<Expense>): string[] => {
  const errors: string[] = [];
  if (!expense.title || expense.title.length > 100) errors.push('Title must be 1-100 characters.');
  if (!expense.amount || expense.amount <= 0) errors.push('Amount must be positive.');
  if (!expense.date || !/^\d{2}-\d{2}-\d{4}$/.test(expense.date)) errors.push('Date must be in dd-mm-yyyy format.');
  if (!['Food', 'Travel', 'Shopping', 'Bills', 'Others'].includes(expense.category as any)) errors.push('Invalid category.');
  if (!['Cash', 'Card', 'Online'].includes(expense.paymentMethod as any)) errors.push('Invalid payment method.');
  return errors;
};

export const fetchExpenses = async (): Promise<Expense[]> => {
  try {
    const response = await axiosInstance.get('/expenses'); // Removed userId query param
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch expenses';
    console.error('Error fetching expenses:', message);
    throw new Error(message);
  }
};

export const addExpense = async (expense: Omit<Expense, 'id'>): Promise<Expense> => {
  const errors = validateExpense(expense);
  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }

  try {
    const response = await axiosInstance.post('/expenses', expense);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to add expense';
    console.error('Error adding expense:', message);
    throw new Error(message);
  }
};

export const updateExpense = async (expense: Expense): Promise<Expense> => {
  const errors = validateExpense(expense);
  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }

  try {
    const response = await axiosInstance.put(`/expenses/${expense.id}`, expense);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to update expense';
    console.error('Error updating expense:', message);
    throw new Error(message);
  }
};

export const deleteExpense = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/expenses/${id}`);
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to delete expense';
    console.error('Error deleting expense:', message);
    throw new Error(message);
  }
};