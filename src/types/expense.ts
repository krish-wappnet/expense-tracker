// src/types/expense.ts
export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: 'Food' | 'Travel' | 'Shopping' | 'Bills' | 'Others';
  paymentMethod: 'Cash' | 'Card' | 'Online';
  userId: number;
  sharedWith: { userId: string; share: number }[];
}

export interface SharedUser {
  userId: string;
  name: string; // Add name
  email: string; // Add email
  share: number;
}