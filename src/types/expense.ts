export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string; // Format: dd-mm-yyyy
  category: 'Food' | 'Travel' | 'Shopping' | 'Bills' | 'Others';
  paymentMethod: 'Cash' | 'Card' | 'Online';
  userId: number; // Add userId to associate with a user
  sharedWith: { name: string; email: string; share: number }[];
}