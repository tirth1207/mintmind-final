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
