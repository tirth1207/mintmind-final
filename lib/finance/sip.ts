import { SIPCalculation } from '@/types';

export function calculateSIP(
  monthlyInvestment: number,
  expectedReturnPercent: number,
  years: number
): SIPCalculation {
  const monthlyRate = expectedReturnPercent / 100 / 12;
  const months = years * 12;

  let futureValue = 0;
  if (monthlyRate === 0) {
    futureValue = monthlyInvestment * months;
  } else {
    futureValue =
      monthlyInvestment *
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
      (1 + monthlyRate);
  }

  const totalInvested = monthlyInvestment * months;
  const totalReturns = futureValue - totalInvested;

  const yearlyBreakdown: SIPCalculation['yearlyBreakdown'] = [];
  for (let year = 1; year <= years; year++) {
    const monthsElapsed = year * 12;
    let valueAtYear = 0;
    if (monthlyRate === 0) {
      valueAtYear = monthlyInvestment * monthsElapsed;
    } else {
      valueAtYear =
        monthlyInvestment *
        ((Math.pow(1 + monthlyRate, monthsElapsed) - 1) / monthlyRate) *
        (1 + monthlyRate);
    }
    const investedAtYear = monthlyInvestment * monthsElapsed;
    const returnsAtYear = valueAtYear - investedAtYear;

    yearlyBreakdown.push({
      year,
      invested: Math.round(investedAtYear),
      returns: Math.round(returnsAtYear),
      total: Math.round(valueAtYear),
    });
  }

  return {
    monthlyInvestment,
    expectedReturn: expectedReturnPercent,
    years,
    totalInvested: Math.round(totalInvested),
    totalReturns: Math.round(totalReturns),
    finalValue: Math.round(futureValue),
    yearlyBreakdown,
  };
}

export function calculateRecommendedSIP(
  monthlyIncome: number,
  monthlyExpenses: number,
  riskLevel: 'low' | 'medium' | 'high'
): number {
  const surplus = monthlyIncome - monthlyExpenses;

  if (surplus <= 0) return 0;

  const riskMultipliers = {
    low: 0.2,
    medium: 0.35,
    high: 0.5,
  };

  const recommendedSIP = surplus * riskMultipliers[riskLevel];
  return Math.round(recommendedSIP);
}

export function calculateTargetSIP(
  targetAmount: number,
  years: number,
  expectedReturnPercent: number
): number {
  const monthlyRate = expectedReturnPercent / 100 / 12;
  const months = years * 12;

  if (monthlyRate === 0) {
    return targetAmount / months;
  }

  const monthlyInvestment =
    targetAmount /
    (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
      (1 + monthlyRate));

  return Math.round(monthlyInvestment);
}
