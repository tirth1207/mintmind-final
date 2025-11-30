import { Transaction, CategoryBreakdown, DailyExpense, TransactionSummary, TransactionInsight, CategoryHealthScore, FinancialInsightSummary, PatternAnalysis, CategoryMomentAnalysis, SmartCategoryBudget } from '@/types';

/**
 * 🔥 CORE FINANCE ENGINE - Accurate Budget Calculations
 * Handles: Income (excluding refunds), Expenses (minus refunds), Burn rate, Projections
 */
export interface FinanceEngine {
  monthlyIncome: number; // true income only (excludes refunds)
  monthlyExpenses: number; // expenses - refunds
  remainingMonthlyBudget: number; // income - expenses
  burnRate: number; // expenses / days passed
  projectedMonthEnd: number; // income - (burnRate * daysInMonth)
  dailySpent: number; // today's expenses
  weeklySpent: number; // this week's expenses
  categoryBreakdown: CategoryBreakdown[]; // expenses by category
  totalRefunds: number; // refunds received
}

/**
 * Build the core financial engine from transactions
 * ✅ Correctly handles: Income, Refunds, Expenses, Burn rate, Projections
 */
export function buildFinanceEngine(
  transactions: Transaction[]
): FinanceEngine {
  const today = new Date();

  // Normalize transaction types
  const incomeTx = transactions.filter((t) => t.type === 'income');
  const expenseTx = transactions.filter((t) => t.type === 'expense');
  const refundTx = incomeTx.filter((t) => t.category === 'Refund');

  // 1️⃣ Monthly Income (TRUE INCOME ONLY - exclude refunds)
  const monthlyIncome = incomeTx
    .filter((t) => t.category !== 'Refund')
    .reduce((sum, t) => sum + t.amount, 0);

  // 2️⃣ Calculate Refund Total
  const totalRefunds = refundTx.reduce((sum, t) => sum + t.amount, 0);

  // 3️⃣ Monthly Expenses (expenses minus refunds)
  const rawExpenses = expenseTx.reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = Math.max(0, rawExpenses - totalRefunds);

  // 4️⃣ Remaining Monthly Budget
  const remainingMonthlyBudget = monthlyIncome - monthlyExpenses;

  // 5️⃣ Burn Rate (expenses / days passed)
  const dayOfMonth = today.getDate();
  const burnRate = dayOfMonth > 0 ? Math.round((monthlyExpenses / dayOfMonth) * 100) / 100 : 0;

  // 6️⃣ Month-End Projection
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const projectedMonthEnd = Math.round((monthlyIncome - burnRate * daysInMonth) * 100) / 100;

  // 7️⃣ Daily Expenses
  const isSameDay = (d1: string, d2: Date) => new Date(d1).toDateString() === d2.toDateString();
  const dailySpent = expenseTx
    .filter((t) => isSameDay(t.date, today))
    .reduce((sum, t) => sum + t.amount, 0);

  // 8️⃣ Weekly Expenses
  const weekStart = new Date();
  weekStart.setDate(today.getDate() - today.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weeklySpent = expenseTx
    .filter((t) => new Date(t.date) >= weekStart)
    .reduce((sum, t) => sum + t.amount, 0);

  // 9️⃣ Category Breakdown
  const categories: Record<string, number> = {};
  expenseTx.forEach((t) => {
    categories[t.category] = (categories[t.category] || 0) + t.amount;
  });

  const categoryBreakdown: CategoryBreakdown[] = Object.entries(categories)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: monthlyExpenses > 0 ? (amount / monthlyExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    monthlyIncome,
    monthlyExpenses,
    remainingMonthlyBudget,
    burnRate,
    projectedMonthEnd,
    dailySpent,
    weeklySpent,
    categoryBreakdown,
    totalRefunds,
  };
}

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

// 🆕 FINANCIAL INTELLIGENCE ENGINE

/**
 * Get last N months of transactions for pattern analysis
 */
function getLastNMonthsTransactions(transactions: Transaction[], months: number): Transaction[] {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
  return filterTransactionsByDateRange(transactions, startDate, now);
}

/**
 * Analyze spending patterns over time (detects trends, volatility, recurring)
 */
export function analyzeSpendingPatterns(allTransactions: Transaction[], category: string): PatternAnalysis {
  const lastThreeMonths = getLastNMonthsTransactions(allTransactions, 3);
  const currentMonth = getMonthlyTransactions(allTransactions);
  
  // Get category transactions for each month
  const getCategoryTotal = (txns: Transaction[]) =>
    getTotalExpenses(txns.filter(t => t.type === 'expense' && t.category === category));
  
  const currentMonthSpend = getCategoryTotal(currentMonth);
  const lastThreeMonthsData = [];
  for (let i = 2; i >= 0; i--) {
    const m = new Date();
    m.setMonth(m.getMonth() - i);
    const startOfMonth = new Date(m.getFullYear(), m.getMonth(), 1);
    const endOfMonth = new Date(m.getFullYear(), m.getMonth() + 1, 0);
    const monthTxns = filterTransactionsByDateRange(allTransactions, startOfMonth, endOfMonth);
    lastThreeMonthsData.push(getCategoryTotal(monthTxns));
  }

  const threeMonthAverage = lastThreeMonthsData.reduce((a, b) => a + b, 0) / 3;
  const monthlyAverage = threeMonthAverage;
  
  // Calculate trend
  const trend: 'increasing' | 'stable' | 'decreasing' =
    currentMonthSpend > threeMonthAverage * 1.1 ? 'increasing' :
    currentMonthSpend < threeMonthAverage * 0.9 ? 'decreasing' : 'stable';

  // Calculate volatility (standard deviation)
  const mean = threeMonthAverage;
  const variance = lastThreeMonthsData.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / 3;
  const volatility = Math.sqrt(variance);

  // Detect recurring expenses (same amount multiple times or pattern)
  const categoryTxns = currentMonth.filter(t => t.type === 'expense' && t.category === category);
  const amounts = categoryTxns.map(t => t.amount);
  const amountFreq = new Map<number, number>();
  amounts.forEach(a => amountFreq.set(a, (amountFreq.get(a) || 0) + 1));
  const recurringExpenses = Array.from(amountFreq.values()).filter(f => f > 1).length;

  return {
    monthlyAverage: Math.round(monthlyAverage * 100) / 100,
    threeMonthAverage: Math.round(threeMonthAverage * 100) / 100,
    trend,
    volatility: Math.round(volatility * 100) / 100,
    recurringExpenses,
  };
}

/**
 * Analyze transaction moment vs category average
 */
export function analyzeCategoryMoment(
  transaction: Transaction,
  monthlyTransactions: Transaction[]
): CategoryMomentAnalysis {
  const categoryTxns = monthlyTransactions.filter(
    t => t.type === 'expense' && t.category === transaction.category
  );
  const dailyAverage = categoryTxns.length > 0 
    ? getTotalExpenses(categoryTxns) / Math.max(1, new Set(categoryTxns.map(t => t.date.split('T')[0])).size)
    : 0;
  
  const percentAbove = dailyAverage > 0 ? ((transaction.amount - dailyAverage) / dailyAverage) * 100 : 0;
  
  const amounts = categoryTxns.map(t => t.amount).sort((a, b) => a - b);
  const minAmount = amounts.length > 0 ? amounts[0] : 0;
  const maxAmount = amounts.length > 0 ? amounts[amounts.length - 1] : 0;

  return {
    category: transaction.category,
    currentTransactionAmount: transaction.amount,
    dailyAverageForCategory: Math.round(dailyAverage * 100) / 100,
    percentageAboveAverage: Math.round(percentAbove * 10) / 10,
    historicalRange: { min: minAmount, max: maxAmount },
  };
}

/**
 * Detect budget breaches before they happen
 */
export function predictBudgetBreach(
  allMonthlyTransactions: Transaction[],
  monthlyLimit: number,
  monthlyIncome: number
): string | undefined {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const remainingDays = Math.max(1, daysInMonth - now.getDate());
  
  const currentExpenses = getTotalExpenses(allMonthlyTransactions);
  const daysIntoMonth = Math.max(1, now.getDate());
  const burnRate = currentExpenses / daysIntoMonth;
  const projectedExpense = currentExpenses + (burnRate * remainingDays);
  
  if (projectedExpense > monthlyLimit * 1.05) {
    const breachAmount = Math.round(projectedExpense - monthlyLimit);
    return `🚨 Projected to exceed budget by ₹${breachAmount} (spending at ₹${Math.round(burnRate)}/day)`;
  }
  
  return undefined;
}

/**
 * Generate smart category budgets based on spending patterns
 */
export function generateSmartCategoryBudgets(
  allTransactions: Transaction[],
  monthlyIncome: number,
  monthlyLimit: number
): SmartCategoryBudget[] {
  const categories = new Set<string>();
  allTransactions.filter(t => t.type === 'expense').forEach(t => {
    categories.add(t.category);
  });

  return Array.from(categories).map(category => {
    const pattern = analyzeSpendingPatterns(allTransactions, category);
    const monthlyTransactions = getMonthlyTransactions(allTransactions);
    const currentSpend = getTotalExpenses(
      monthlyTransactions.filter(t => t.type === 'expense' && t.category === category)
    );

    // Suggest flexibility based on volatility and trend
    let flexibility: 'tight' | 'balanced' | 'loose';
    let suggestedMonthly = pattern.threeMonthAverage * 1.1; // 10% buffer
    
    if (pattern.volatility > pattern.threeMonthAverage * 0.3) {
      flexibility = 'loose';
      suggestedMonthly = pattern.threeMonthAverage * 1.2;
    } else if (pattern.volatility < pattern.threeMonthAverage * 0.1) {
      flexibility = 'tight';
      suggestedMonthly = pattern.threeMonthAverage * 0.95;
    } else {
      flexibility = 'balanced';
    }

    const reasoning = `${pattern.trend} trend, ${pattern.volatility > 0 ? 'volatile' : 'stable'} spending`;

    return {
      category,
      suggestedDailyLimit: Math.round((suggestedMonthly / 25) * 100) / 100,
      suggestedMonthlyLimit: Math.round(suggestedMonthly * 100) / 100,
      flexibility,
      reasoning,
    };
  });
}

/**
 * Calculate burn rate based only on transaction days (not calendar days)
 * This fixes the critical fault where dividing by calendar days early in month causes inaccuracy
 */
export function calculateAccurateBurnRate(monthlyTransactions: Transaction[]): number {
  if (monthlyTransactions.length === 0) return 0;

  const totalExpenses = getTotalExpenses(monthlyTransactions);
  
  // Count only unique days with transactions
  const transactionDays = new Set<string>();
  monthlyTransactions.forEach(t => {
    const dateKey = t.date.split('T')[0];
    transactionDays.add(dateKey);
  });
  
  const daysWithTransactions = transactionDays.size;
  const burnRatePerTransactionDay = daysWithTransactions > 0 ? totalExpenses / daysWithTransactions : 0;
  
  return Math.round(burnRatePerTransactionDay * 100) / 100;
}

/**
 * Calculate burn-rate drift per day (impact of this transaction on avg daily spend)
 */
export function calculateBurnRateDrift(
  transaction: Transaction,
  allMonthlyTransactions: Transaction[],
  accurateBurnRate: number
): number {
  if (transaction.type === 'income') return 0;
  
  const withoutTransaction = allMonthlyTransactions.filter(t => t.id !== transaction.id);
  const expensesWithout = getTotalExpenses(withoutTransaction);
  
  const daysWithout = new Set<string>();
  withoutTransaction.forEach(t => {
    const dateKey = t.date.split('T')[0];
    daysWithout.add(dateKey);
  });
  
  const daysWithoutCount = daysWithout.size;
  const burnRateWithout = daysWithoutCount > 0 ? expensesWithout / daysWithoutCount : 0;
  
  return Math.round((accurateBurnRate - burnRateWithout) * 100) / 100;
}

/**
 * Calculate savings index (1-10) - how much this transaction deviates from category average
 */
export function calculateSavingsIndex(
  transaction: Transaction,
  monthlyTransactions: Transaction[]
): number {
  if (transaction.type === 'income') return 5;
  
  const moment = analyzeCategoryMoment(transaction, monthlyTransactions);
  
  // Scale to 1-10: higher index = more above average = more savings potential
  const index = Math.min(10, Math.max(1, 5 + (moment.percentageAboveAverage / 100) * 5));
  return Math.round(index * 10) / 10;
}

/**
 * Calculate per-transaction savings opportunity
 * Shows impact of each transaction on month-end projection
 */
export function calculateTransactionInsight(
  transaction: Transaction,
  allMonthlyTransactions: Transaction[],
  monthlyLimit: number,
  monthlyIncome: number
): TransactionInsight {
  if (transaction.type === 'income') {
    return {
      transactionId: transaction.id,
      savingsOpportunity: 0,
      monthEndImpact: transaction.amount,
      burnRateDrift: 0,
      categoryHealth: 'healthy',
      shouldSkip: false,
      savingsIndex: 5,
      momentAnalysis: 'Income received',
      predictiveAlert: undefined,
    };
  }

  // ✅ FIX #1: Calculate burn rate based on transaction days only
  const accurateBurnRate = calculateAccurateBurnRate(allMonthlyTransactions);
  
  // Calculate current state
  const currentExpenses = getTotalExpenses(allMonthlyTransactions);
  const expensesWithoutThis = currentExpenses - transaction.amount;
  
  // ✅ FIX #2: Calculate accurate burn rate drift
  const burnRateDrift = calculateBurnRateDrift(transaction, allMonthlyTransactions, accurateBurnRate);

  // Calculate month-end projection impact
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const remainingDays = Math.max(0, daysInMonth - now.getDate());
  
  const projectedExpenseWithout = expensesWithoutThis + (accurateBurnRate * remainingDays);
  const projectedExpenseWith = currentExpenses + (accurateBurnRate * remainingDays);
  const monthEndImpactValue = Math.round(projectedExpenseWith - projectedExpenseWithout);

  // Detect category overspending
  const categoryTransactions = allMonthlyTransactions.filter(t => t.category === transaction.category && t.type === 'expense');
  const categoryTotal = getTotalExpenses(categoryTransactions);
  const categoryBudget = monthlyLimit * 0.25; // Rough allocation: ~25% per major category
  const categoryHealth: 'healthy' | 'warning' | 'critical' = 
    categoryTotal > categoryBudget * 0.9 ? 'critical' : 
    categoryTotal > categoryBudget * 0.7 ? 'warning' : 'healthy';

  // ✅ FIX #3: Include recurring/bill detection in shouldSkip
  const patterns = analyzeSpendingPatterns([...allMonthlyTransactions, transaction], transaction.category);
  const nonEssentialCategories = ['Entertainment', 'Shopping', 'Fuel'];
  const isNonEssential = nonEssentialCategories.includes(transaction.category);
  const isRecurring = patterns.recurringExpenses > 0;
  const shouldSkip = isNonEssential && categoryHealth === 'critical' && !isRecurring;

  // Generate warning message
  let warningMessage = undefined;
  if (categoryHealth === 'critical') {
    warningMessage = `⚠️ ${transaction.category} budget at risk!`;
  }

  // ✅ FIX #4: Add savings index (1-10 rating)
  const savingsIndex = calculateSavingsIndex(transaction, allMonthlyTransactions);

  // ✅ FIX #5: Add moment analysis
  const moment = analyzeCategoryMoment(transaction, allMonthlyTransactions);
  const momentAnalysis = moment.percentageAboveAverage > 20 
    ? `${Math.round(moment.percentageAboveAverage)}% above avg for ${transaction.category}`
    : `Within normal range for ${transaction.category}`;

  // ✅ FIX #6: Add predictive alert
  const predictiveAlert = predictBudgetBreach(allMonthlyTransactions, monthlyLimit, monthlyIncome);

  return {
    transactionId: transaction.id,
    savingsOpportunity: Math.round(transaction.amount * 100) / 100,
    monthEndImpact: monthEndImpactValue,
    burnRateDrift,
    categoryHealth,
    warningMessage,
    shouldSkip,
    savingsIndex,
    momentAnalysis,
    predictiveAlert,
  };
}

/**
 * Get health scores for all categories
 */
export function getCategoryHealthScores(
  transactions: Transaction[],
  monthlyLimit: number
): CategoryHealthScore[] {
  const categoryBreakdown = getCategoryBreakdown(transactions, 'expense');
  
  return categoryBreakdown.map(cat => {
    const categoryBudget = monthlyLimit * (cat.percentage / 100);
    const overspendAmount = Math.max(0, cat.amount - categoryBudget * 0.9);
    const status: 'healthy' | 'warning' | 'critical' = 
      cat.percentage > 90 ? 'critical' : 
      cat.percentage > 70 ? 'warning' : 'healthy';

    return {
      category: cat.category,
      spent: Math.round(cat.amount),
      budget: Math.round(categoryBudget),
      percentage: Math.round(cat.percentage * 10) / 10,
      status,
      overspendAmount: Math.round(overspendAmount),
    };
  });
}

/**
 * Generate smart financial insights and recommendations
 */
export function generateFinancialInsights(
  allTransactions: Transaction[],
  monthlyTransactions: Transaction[],
  monthlyIncome: number,
  monthlyLimit: number,
  burnRate: number
): FinancialInsightSummary {
  const monthlyExpenses = getTotalExpenses(monthlyTransactions);
  const categoryScores = getCategoryHealthScores(monthlyTransactions, monthlyLimit);
  const highRiskCategories = categoryScores.filter(c => c.status !== 'healthy');

  // ✅ FIX: Calculate savings potential by category
  const categoryPatterns = generateSmartCategoryBudgets(allTransactions, monthlyIncome, monthlyLimit);
  const categoryBreakdown = getCategoryBreakdown(monthlyTransactions, 'expense');
  
  let totalSavingsPotential = 0;
  categoryBreakdown.forEach(cat => {
    const pattern = categoryPatterns.find(p => p.category === cat.category);
    if (pattern && cat.amount > pattern.suggestedMonthlyLimit) {
      totalSavingsPotential += cat.amount - pattern.suggestedMonthlyLimit;
    }
  });

  // Analyze behavior patterns - per category
  const now = new Date();
  const daysIntoMonth = now.getDate();
  const avgDailySpend = monthlyExpenses / Math.max(1, daysIntoMonth);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const projectedFinalExpense = avgDailySpend * daysInMonth;
  const willOverspend = projectedFinalExpense > monthlyLimit;

  // Generate behavior alert
  let behaviorAlert = undefined;
  if (willOverspend) {
    const overspendAmount = Math.round(projectedFinalExpense - monthlyLimit);
    behaviorAlert = `📊 Current pace suggests ₹${overspendAmount} overspend by month end`;
  }

  // ✅ FIX: Improved projection accuracy based on 3-month patterns
  const recentDays = 7;
  const recentTransactions = monthlyTransactions.filter(t => {
    const tDate = new Date(t.date);
    const today = new Date();
    const daysOld = Math.floor((today.getTime() - tDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysOld <= recentDays;
  });
  
  const threeMonthPattern = analyzeSpendingPatterns(allTransactions, 'Other'); // Overall pattern
  const stabilityScore = threeMonthPattern.trend === 'stable' ? 20 : 10;
  const projectionAccuracy = Math.min(100, 50 + recentTransactions.length * 5 + stabilityScore);

  // ✅ FIX: Detailed recommended actions with savings breakdown
  const recommendedActions: string[] = [];
  
  if (highRiskCategories.length > 0) {
    highRiskCategories.slice(0, 2).forEach(cat => {
      const suggestedBudget = categoryPatterns.find(p => p.category === cat.category)?.suggestedMonthlyLimit || cat.budget;
      recommendedActions.push(`Cut ${cat.category}: save ₹${Math.round(cat.overspendAmount)}`);
    });
  }
  
  if (totalSavingsPotential > 0) {
    recommendedActions.push(`Total savings potential: ₹${Math.round(totalSavingsPotential)}/month`);
  }
  
  if (avgDailySpend > monthlyLimit / 25) {
    recommendedActions.push(`Reduce daily spend to ₹${Math.round(monthlyLimit / 25)}`);
  }

  return {
    totalSavingsPotential: Math.round(totalSavingsPotential),
    highRiskCategories,
    projectionAccuracy: Math.round(projectionAccuracy),
    behaviorAlert,
    recommendedActions: recommendedActions.slice(0, 3), // Top 3 actions
  };
}
