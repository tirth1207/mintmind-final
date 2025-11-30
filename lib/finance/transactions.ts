import { Transaction, CategoryBreakdown, DailyExpense, TransactionSummary } from '@/types';

export function filterTransactionsByDateRange(
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): Transaction[] {
  return transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return transactionDate >= startDate && transactionDate <= endDate;
  });
}

export function getTotalIncome(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getTotalExpenses(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getCategoryBreakdown(
  transactions: Transaction[],
  type: 'income' | 'expense'
): CategoryBreakdown[] {
  const filtered = transactions.filter((t) => t.type === type);
  const total = filtered.reduce((sum, t) => sum + t.amount, 0);

  const categoryMap = new Map<string, number>();

  filtered.forEach((t) => {
    const current = categoryMap.get(t.category) || 0;
    categoryMap.set(t.category, current + t.amount);
  });

  const breakdown = Array.from(categoryMap.entries()).map(([category, amount]) => ({
    category,
    amount,
    percentage: total > 0 ? (amount / total) * 100 : 0,
  }));

  return breakdown.sort((a, b) => b.amount - a.amount);
}

export function getDailyExpenses(transactions: Transaction[], days: number = 7): DailyExpense[] {
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');
  const dailyMap = new Map<string, number>();

  expenseTransactions.forEach((t) => {
    const dateKey = t.date.split('T')[0];
    const current = dailyMap.get(dateKey) || 0;
    dailyMap.set(dateKey, current + t.amount);
  });

  const result: DailyExpense[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    
    result.push({
      date: dateKey,
      amount: dailyMap.get(dateKey) || 0,
    });
  }

  return result;
}

export function getTransactionSummary(
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): TransactionSummary {
  const filtered = filterTransactionsByDateRange(transactions, startDate, endDate);
  
  return {
    totalIncome: getTotalIncome(filtered),
    totalExpenses: getTotalExpenses(filtered),
    balance: getTotalIncome(filtered) - getTotalExpenses(filtered),
    categoryBreakdown: getCategoryBreakdown(filtered, 'expense'),
    dailyExpenses: getDailyExpenses(filtered, 7),
  };
}

export function getMonthlyTransactions(transactions: Transaction[]): Transaction[] {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  
  return filterTransactionsByDateRange(transactions, startOfMonth, endOfMonth);
}

export function getWeeklyTransactions(transactions: Transaction[]): Transaction[] {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return filterTransactionsByDateRange(transactions, startOfWeek, endOfWeek);
}

export function getTodayTransactions(transactions: Transaction[]): Transaction[] {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  
  return filterTransactionsByDateRange(transactions, startOfDay, endOfDay);
}

export function calculateRemainingBudget(
  dailyLimit: number,
  weeklyLimit: number,
  monthlyLimit: number,
  transactions: Transaction[]
): {
  dailyRemaining: number;
  weeklyRemaining: number;
  monthlyRemaining: number;
  dailySpent: number;
  weeklySpent: number;
  monthlySpent: number;
} {
  const todayExpenses = getTotalExpenses(getTodayTransactions(transactions));
  const weekExpenses = getTotalExpenses(getWeeklyTransactions(transactions));
  const monthExpenses = getTotalExpenses(getMonthlyTransactions(transactions));

  return {
    dailySpent: todayExpenses,
    weeklySpent: weekExpenses,
    monthlySpent: monthExpenses,
    dailyRemaining: dailyLimit - todayExpenses,
    weeklyRemaining: weeklyLimit - weekExpenses,
    monthlyRemaining: monthlyLimit - monthExpenses,
  };
}
