export type TxnType = "INCOME" | "EXPENSE";
export type RecurringRule = "DAILY" | "WEEKLY" | "MONTHLY";
export type Role = "USER" | "ADMIN";

export interface ApiResponse<T> {
  message: string;
  data: T;
  meta?: { total?: number; page?: number; limit?: number; [key: string]: unknown };
}

export interface User {
  id: string;
  name: string;
  email: string;
  currency: string;
  role: Role;
  isActive: boolean;
}

export interface AuthData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Category {
  id: string;
  name: string;
  type: TxnType;
  icon?: string | null;
  color?: string | null;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TxnType;
  note?: string | null;
  date: string;
  tags: string[];
  receiptUrl?: string | null;
  isRecurring: boolean;
  recurringRule?: RecurringRule | null;
  createdAt?: string;
  categoryId: string;
  category?: Category;
}

export interface TransactionFilters {
  type?: TxnType;
  category?: string;
  from?: string;
  to?: string;
  tag?: string;
  page?: number;
  limit?: number;
  sortBy?: "date" | "amount" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface Budget {
  id: string;
  limit: number;
  alertThreshold: number;
  month: number;
  year: number;
  categoryId: string;
  categoryName?: string;
  spent?: number;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  progressPercent?: number;
}

export interface MonthlyReport {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
}

export type TrendPoint = {
  date: string
  income: number
  expense: number
}

export type CategoryBreakdownPoint = {
  categoryId: string
  categoryName: string
  amount: number
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  role: Role;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
}
