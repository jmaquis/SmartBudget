export interface Account {
  id: string;
  name: string;
  balance: number;
  type: 'checking' | 'savings' | 'credit';
  currency: string;
  userId?: string;
  updatedAt?: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  type: 'income' | 'expense';
  goalId?: string;
  userId?: string;
  updatedAt?: string;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
  color: string;
  userId?: string;
  updatedAt?: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  limit: number;
  color: string;
  userId?: string;
  updatedAt?: string;
}