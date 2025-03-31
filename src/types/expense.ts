export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string; // dd-mm-yyyy
  category: 'Food' | 'Travel' | 'Shopping' | 'Bills' | 'Others';
  paymentMethod: 'Cash' | 'Card' | 'Online';
  userId: string;
  sharedWith: { userId: string; name: string; share: number }[];
  createdAt?: string; 
}

export interface SharedUser {
  userId: string;
  name: string; 
  email: string; 
  share: number;
}