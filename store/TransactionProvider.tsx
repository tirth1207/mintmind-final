import {
  getCategoryBreakdown,
  getDailyExpenses,
  getMonthlyTransactions,
  getTotalExpenses,
  getTotalIncome
} from '@/lib/finance/transactions';
import { ExpenseCategory, IncomeCategory, Transaction, TransactionType } from '@/types';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'transactions';

interface BudgetStatus {
  dailySpent: number;
  weeklySpent: number;
  monthlySpent: number;
  dailyRemaining: number;
  weeklyRemaining: number;
  monthlyRemaining: number;
  burnRate: number; // avg daily expense
  projectedMonthEnd: number; // projected balance at month end
}

export const [TransactionProvider, useTransactions] = createContextHook(() => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  async function loadTransactions() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setTransactions(parsed);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function saveTransactions(newTransactions: Transaction[]) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTransactions));
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  }

  async function addTransaction(
    type: TransactionType,
    amount: number,
    category: ExpenseCategory | IncomeCategory,
    date: string,
    note?: string
  ) {
    const newTransaction: Transaction = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      amount,
      category,
      date,
      note,
      createdAt: new Date().toISOString(),
    };

    const updated = [newTransaction, ...transactions];
    setTransactions(updated);
    await saveTransactions(updated);
  }

  async function deleteTransaction(id: string) {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    await saveTransactions(updated);
  }

  async function updateTransaction(
    id: string,
    updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>
  ) {
    const updated = transactions.map((t) =>
      t.id === id ? { ...t, ...updates } : t
    );
    setTransactions(updated);
    await saveTransactions(updated);
  }

  const monthlyTransactions = useMemo(
    () => getMonthlyTransactions(transactions),
    [transactions]
  );

  const monthlyIncome = useMemo(
    () => getTotalIncome(monthlyTransactions),
    [monthlyTransactions]
  );

  const monthlyExpenses = useMemo(
    () => getTotalExpenses(monthlyTransactions),
    [monthlyTransactions]
  );

  const expenseCategoryBreakdown = useMemo(
    () => getCategoryBreakdown(monthlyTransactions, 'expense'),
    [monthlyTransactions]
  );

  const dailyExpenseData = useMemo(
    () => getDailyExpenses(monthlyTransactions, 7),
    [monthlyTransactions]
  );

  const remainingMonthlyBudget = useMemo(
    () => monthlyIncome - monthlyExpenses,
    [monthlyIncome, monthlyExpenses]
  );

  // ...existing code...

  // 🆕 COMPUTE BURN RATE (avg daily expense for current month)
  const burnRate = useMemo(() => {
    if (monthlyTransactions.length === 0) return 0;
    
    const now = new Date();
    const daysIntoMonth = now.getDate();
    const dailyAverage = monthlyExpenses / daysIntoMonth;
    
    return Math.round(dailyAverage * 100) / 100; // 2 decimals
  }, [monthlyExpenses, monthlyTransactions]);

  // 🆕 PROJECT MONTH-END BALANCE
  const projectedMonthEnd = useMemo(() => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const remainingDaysInMonth = daysInMonth - now.getDate();
    
    const projectedRemainingExpense = burnRate * remainingDaysInMonth;
    const projected = remainingMonthlyBudget - projectedRemainingExpense;
    
    return Math.round(projected);
  }, [burnRate, remainingMonthlyBudget]);

  // 🆕 INTERNAL BUDGET STATUS (moved from separate hook)
  const budgetStatus = useMemo((): BudgetStatus => {
    const today = new Date();
    const weekStart = new Date();
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);

    const isSameDay = (a: string, b: Date) =>
      new Date(a).toDateString() === b.toDateString();

    const dailySpent = transactions
      .filter((t) => t.type === 'expense' && isSameDay(t.date, today))
      .reduce((s, t) => s + t.amount, 0);

    const weeklySpent = transactions
      .filter((t) => t.type === 'expense' && new Date(t.date) >= weekStart)
      .reduce((s, t) => s + t.amount, 0);

    const monthlySpent = monthlyExpenses; // Already computed above

    return {
      dailySpent: Math.round(dailySpent * 100) / 100,
      weeklySpent: Math.round(weeklySpent * 100) / 100,
      monthlySpent: Math.round(monthlySpent * 100) / 100,
      dailyRemaining: 0, // will be set by caller with dailyLimit
      weeklyRemaining: 0,
      monthlyRemaining: 0,
      burnRate,
      projectedMonthEnd,
    };
  }, [transactions, monthlyExpenses, burnRate, projectedMonthEnd]);

  // 🆕 EXPORTED FUNCTION - SMARTER BUDGET CALCULATION
  // Suggests daily savings needed to match monthly budget even if overspent today
  function getRemainingBudget(
    dailyLimit: number,
    weeklyLimit: number,
    monthlyLimit: number
  ): BudgetStatus {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const remainingDaysInMonth = daysInMonth - now.getDate();
    
    // Smart daily remaining: budget needs to be spread across remaining days
    // If you overspent today, you need to save more on other days
    const budgetRemainingForMonth = monthlyLimit - budgetStatus.monthlySpent;
    const suggestedDailyBudgetForRemaining = remainingDaysInMonth > 0 
      ? Math.round((budgetRemainingForMonth / remainingDaysInMonth) * 100) / 100
      : 0;

    return {
      ...budgetStatus,
      dailyRemaining: Math.max(0, suggestedDailyBudgetForRemaining),
      weeklyRemaining: Math.round((weeklyLimit - budgetStatus.weeklySpent) * 100) / 100,
      monthlyRemaining: Math.round((monthlyLimit - budgetStatus.monthlySpent) * 100) / 100,
    };
  }

  return {
    transactions,
    isLoading,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    monthlyTransactions,
    monthlyIncome,
    monthlyExpenses,
    expenseCategoryBreakdown,
    dailyExpenseData,
    remainingMonthlyBudget,
    burnRate,
    projectedMonthEnd,
    budgetStatus,
    getRemainingBudget, // 🆕 NEW METHOD
  };
});

// ❌ REMOVE THE OLD useRemainingBudget FUNCTION