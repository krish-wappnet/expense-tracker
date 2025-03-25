import type { Expense } from '@/types/expense';

export const validateExpense = (expense: Partial<Expense>): string[] => {
  const errors: string[] = [];
  if (!expense.title || expense.title.length > 100) errors.push('Title must be 1-100 characters.');
  if (!expense.amount || expense.amount <= 0) errors.push('Amount must be positive.');
  if (!expense.date || !/^\d{2}-\d{2}-\d{4}$/.test(expense.date)) errors.push('Date must be in dd-mm-yyyy format.');
  if (!['Food', 'Travel', 'Shopping', 'Bills', 'Others'].includes(expense.category as any)) errors.push('Invalid category.');
  if (!['Cash', 'Card', 'Online'].includes(expense.paymentMethod as any)) errors.push('Invalid payment method.');
  return errors;
};