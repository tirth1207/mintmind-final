import {
  getCategoryBreakdown,
  getDailyExpenses,
  getMonthlyTransactions,
  getTotalExpenses,
  getTotalIncome,
  calculateTransactionInsight,
  getCategoryHealthScores,
  generateFinancialInsights,
  calculateAccurateBurnRate,
  analyzeSpendingPatterns,
  generateSmartCategoryBudgets,
  predictBudgetBreach,
  buildFinanceEngine,
  FinanceEngine,
} from '@/lib/finance/transactions';
import { ExpenseCategory, IncomeCategory, Transaction, TransactionType, TransactionInsight, FinancialInsightSummary } from '@/types';
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

  // 🔥 CORE FINANCE ENGINE - Accurate calculations from ALL transactions
  const monthlyTransactions = useMemo(
    () => getMonthlyTransactions(transactions),
    [transactions]
  );

  const finance = useMemo<FinanceEngine>(() => {
    return buildFinanceEngine(monthlyTransactions);
  }, [monthlyTransactions]);

  // Extract all values from finance engine
  const monthlyIncome = finance.monthlyIncome;
  const monthlyExpenses = finance.monthlyExpenses;
  const remainingMonthlyBudget = finance.remainingMonthlyBudget;
  const burnRate = finance.burnRate;
  const projectedMonthEnd = finance.projectedMonthEnd;
  const expenseCategoryBreakdown = finance.categoryBreakdown;

  const dailyExpenseData = useMemo(
    () => getDailyExpenses(monthlyTransactions, 7),
    [monthlyTransactions]
  );

  // 🆕 COMPUTE TRANSACTION INSIGHTS FOR EACH EXPENSE
  const transactionInsights = useMemo((): Map<string, TransactionInsight> => {
    const insights = new Map<string, TransactionInsight>();
    
    monthlyTransactions.forEach((transaction) => {
      const insight = calculateTransactionInsight(
        transaction,
        monthlyTransactions,
        4000,
        monthlyIncome
      );
      insights.set(transaction.id, insight);
    });

    return insights;
  }, [monthlyTransactions, monthlyIncome]);

  // 🆕 COMPUTE CATEGORY HEALTH SCORES
  const categoryHealthScores = useMemo(
    () => getCategoryHealthScores(monthlyTransactions, 4000),
    [monthlyTransactions]
  );

  // 🆕 GENERATE FINANCIAL INSIGHT SUMMARY
  const financialInsights = useMemo(
    () => generateFinancialInsights(transactions, monthlyTransactions, monthlyIncome, 4000, burnRate),
    [transactions, monthlyTransactions, monthlyIncome, burnRate]
  );

  // 🆕 GET INSIGHT FOR SPECIFIC TRANSACTION
  function getTransactionInsight(transactionId: string): TransactionInsight | undefined {
    return transactionInsights.get(transactionId);
  }

  // 🆕 INTERNAL BUDGET STATUS
  const budgetStatus = useMemo((): BudgetStatus => {
    const today = new Date();
    const weekStart = new Date();
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const isSameDay = (a: string, b: Date) =>
      new Date(a).toDateString() === b.toDateString();

    const dailySpent = transactions
      .filter((t) => t.type === 'expense' && isSameDay(t.date, today))
      .reduce((s, t) => s + t.amount, 0);

    const weeklySpent = transactions
      .filter((t) => t.type === 'expense' && new Date(t.date) >= weekStart)
      .reduce((s, t) => s + t.amount, 0);

    return {
      dailySpent: Math.round(dailySpent * 100) / 100,
      weeklySpent: Math.round(weeklySpent * 100) / 100,
      monthlySpent: monthlyExpenses,
      dailyRemaining: 0,
      weeklyRemaining: 0,
      monthlyRemaining: 0,
      burnRate,
      projectedMonthEnd,
    };
  }, [transactions, monthlyExpenses, burnRate, projectedMonthEnd]);

  // 🆕 EXPORTED FUNCTION - SMARTER BUDGET CALCULATION
  function getRemainingBudget(
    dailyLimit: number,
    weeklyLimit: number,
    monthlyLimit: number
  ): BudgetStatus {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const remainingDaysInMonth = daysInMonth - now.getDate();
    
    const budgetRemainingForMonth = monthlyLimit - monthlyExpenses;
    const suggestedDailyBudgetForRemaining = remainingDaysInMonth > 0 
      ? Math.round((budgetRemainingForMonth / remainingDaysInMonth) * 100) / 100
      : 0;

    return {
      ...budgetStatus,
      dailyRemaining: Math.max(0, suggestedDailyBudgetForRemaining),
      weeklyRemaining: Math.round((weeklyLimit - budgetStatus.weeklySpent) * 100) / 100,
      monthlyRemaining: Math.round((monthlyLimit - monthlyExpenses) * 100) / 100,
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
    getRemainingBudget,
    // 🆕 INTELLIGENCE EXPORTS
    transactionInsights,
    categoryHealthScores,
    financialInsights,
    getTransactionInsight,
    // 🆕 ADVANCED ANALYSIS EXPORTS
    analyzeSpendingPatterns,
    generateSmartCategoryBudgets,
    predictBudgetBreach,
  };
});

// ❌ REMOVE THE OLD useRemainingBudget FUNCTION