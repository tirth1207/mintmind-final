import { BudgetBreakdown } from '@/types';

export function calculate503020Budget(monthlyIncome: number): BudgetBreakdown {
  const needs = monthlyIncome * 0.5;
  const wants = monthlyIncome * 0.3;
  const savings = monthlyIncome * 0.2;

  const monthlyLimit = needs + wants;
  const weeklyLimit = monthlyLimit / 4.33;
  const dailyLimit = monthlyLimit / 30;

  return {
    needs: Math.round(needs),
    wants: Math.round(wants),
    savings: Math.round(savings),
    dailyLimit: Math.round(dailyLimit),
    weeklyLimit: Math.round(weeklyLimit),
    monthlyLimit: Math.round(monthlyLimit),
  };
}

export function calculateCustomBudget(
  monthlyIncome: number,
  needsPercent: number,
  wantsPercent: number,
  savingsPercent: number
): BudgetBreakdown {
  const needs = (monthlyIncome * needsPercent) / 100;
  const wants = (monthlyIncome * wantsPercent) / 100;
  const savings = (monthlyIncome * savingsPercent) / 100;

  const monthlyLimit = needs + wants;
  const weeklyLimit = monthlyLimit / 4.33;
  const dailyLimit = monthlyLimit / 30;

  return {
    needs: Math.round(needs),
    wants: Math.round(wants),
    savings: Math.round(savings),
    dailyLimit: Math.round(dailyLimit),
    weeklyLimit: Math.round(weeklyLimit),
    monthlyLimit: Math.round(monthlyLimit),
  };
}

export function calculateEmergencyFund(monthlyExpenses: number): number {
  return Math.round(monthlyExpenses * 6);
}
