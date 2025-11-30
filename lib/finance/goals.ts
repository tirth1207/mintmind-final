import { GoalPlan } from '@/types';
import { calculateTargetSIP } from './sip';
import { calculateMaxLoanAmount } from './emi';

export function createGoalPlan(
  targetAmount: number,
  timelineYears: number,
  currentSavings: number,
  monthlyIncome: number,
  expectedReturnPercent: number = 12,
  loanInterestRate: number = 8.5
): GoalPlan {
  const remainingAmount = targetAmount - currentSavings;

  const requiredMonthlySIP = calculateTargetSIP(
    remainingAmount,
    timelineYears,
    expectedReturnPercent
  );

  const possibleLoanAmount = calculateMaxLoanAmount(
    monthlyIncome,
    loanInterestRate,
    Math.min(timelineYears, 20)
  );

  const milestones: GoalPlan['milestones'] = [];
  const monthlyRate = expectedReturnPercent / 100 / 12;

  for (let year = 1; year <= timelineYears; year++) {
    const months = year * 12;
    let accumulatedValue = currentSavings;

    if (monthlyRate === 0) {
      accumulatedValue += requiredMonthlySIP * months;
    } else {
      const sipValue =
        requiredMonthlySIP *
        ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
        (1 + monthlyRate);
      accumulatedValue += sipValue;
    }

    const percentage = (accumulatedValue / targetAmount) * 100;
    let description = '';

    if (percentage >= 100) {
      description = 'Goal achieved!';
    } else if (percentage >= 75) {
      description = 'Almost there!';
    } else if (percentage >= 50) {
      description = 'Halfway to your goal';
    } else if (percentage >= 25) {
      description = 'Good progress';
    } else {
      description = 'Building momentum';
    }

    milestones.push({
      year,
      amount: Math.round(accumulatedValue),
      description,
    });
  }

  return {
    targetAmount,
    timelineYears,
    currentSavings,
    requiredMonthlySIP,
    possibleLoanAmount,
    milestones,
  };
}
