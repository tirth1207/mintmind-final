export interface UserProfile {
  monthlyIncome: number;
  monthlyExpenses: number;
  travelCost: number;
  foodSnacks: number;
  randomExpenses: number;
  sipGoal: number;
  riskLevel: 'low' | 'medium' | 'high';
  hasCompletedOnboarding: boolean;
}

export interface BudgetBreakdown {
  needs: number;
  wants: number;
  savings: number;
  dailyLimit: number;
  weeklyLimit: number;
  monthlyLimit: number;
}

export interface SIPCalculation {
  monthlyInvestment: number;
  expectedReturn: number;
  years: number;
  totalInvested: number;
  totalReturns: number;
  finalValue: number;
  yearlyBreakdown: {
    year: number;
    invested: number;
    returns: number;
    total: number;
  }[];
}

export interface EMICalculation {
  principal: number;
  interestRate: number;
  tenureMonths: number;
  emi: number;
  totalPayment: number;
  totalInterest: number;
}

export interface GoalPlan {
  targetAmount: number;
  timelineYears: number;
  currentSavings: number;
  requiredMonthlySIP: number;
  possibleLoanAmount: number;
  milestones: {
    year: number;
    amount: number;
    description: string;
  }[];
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  currency: string;
}

export type TransactionType = 'income' | 'expense';

export type ExpenseCategory =
  | 'Food'
  | 'Travel'
  | 'Shopping'
  | 'Bills'
  | 'Fuel'
  | 'Entertainment'
  | 'Medical'
  | 'Other';

export type IncomeCategory =
  | 'Salary'
  | 'Freelance'
  | 'Gift'
  | 'Refund'
  | 'Interest'
  | 'Other';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: ExpenseCategory | IncomeCategory;
  date: string;
  note?: string;
  createdAt: string;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export interface DailyExpense {
  date: string;
  amount: number;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  categoryBreakdown: CategoryBreakdown[];
  dailyExpenses: DailyExpense[];
}

// 🆕 SMART TRANSACTION INSIGHTS
export interface TransactionInsight {
  transactionId: string;
  savingsOpportunity: number; // ₹ saved if this wasn't made
  monthEndImpact: number; // updated projection after this transaction
  burnRateDrift: number; // change in avg daily spend
  categoryHealth: 'healthy' | 'warning' | 'critical'; // category overspending status
  warningMessage?: string; // alert if deviating from goals
  shouldSkip: boolean; // ML suggestion: skip unnecessary expense
  savingsIndex: number; // 1-10 rating: how much this expense deviates from category average
  momentAnalysis: string; // comparison to category average on this day
  predictiveAlert?: string; // warning if budget breach expected
}

export interface CategoryHealthScore {
  category: string;
  spent: number;
  budget: number; // percentage of monthly allocated
  percentage: number; // % of budget used
  status: 'healthy' | 'warning' | 'critical'; // green: <70%, yellow: 70-90%, red: >90%
  overspendAmount: number;
}

export interface FinancialInsightSummary {
  totalSavingsPotential: number; // sum of all savings opportunities
  highRiskCategories: CategoryHealthScore[]; // categories over 70%
  projectionAccuracy: number; // confidence % based on transaction patterns
  behaviorAlert?: string; // summary of major deviations
  recommendedActions: string[]; // top 3 actions to improve finances
}

// 🆕 ADVANCED FINANCIAL INTELLIGENCE
export interface PatternAnalysis {
  monthlyAverage: number;
  threeMonthAverage: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  volatility: number; // std dev of spending
  recurringExpenses: number; // detected subscription/bill patterns
}

export interface CategoryMomentAnalysis {
  category: string;
  currentTransactionAmount: number;
  dailyAverageForCategory: number;
  percentageAboveAverage: number;
  historicalRange: { min: number; max: number };
}

export interface SmartCategoryBudget {
  category: string;
  suggestedDailyLimit: number;
  suggestedMonthlyLimit: number;
  flexibility: 'tight' | 'balanced' | 'loose';
  reasoning: string;
}
