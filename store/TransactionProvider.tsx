import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionType, ExpenseCategory, IncomeCategory } from '@/types';
import {
  getMonthlyTransactions,
  getTotalExpenses,
  getTotalIncome,
  getCategoryBreakdown,
  getDailyExpenses,
  calculateRemainingBudget,
} from '@/lib/finance/transactions';

const STORAGE_KEY = 'transactions';

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
  };
});

export function useRemainingBudget(dailyLimit: number, weeklyLimit: number, monthlyLimit: number) {
  const { transactions } = useTransactions();
  
  return useMemo(
    () => calculateRemainingBudget(dailyLimit, weeklyLimit, monthlyLimit, transactions),
    [transactions, dailyLimit, weeklyLimit, monthlyLimit]
  );
}
