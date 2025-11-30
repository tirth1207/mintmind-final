import { EMICalculation } from '@/types';

export function calculateEMI(
  principal: number,
  annualInterestRate: number,
  tenureYears: number
): EMICalculation {
  const monthlyRate = annualInterestRate / 100 / 12;
  const tenureMonths = tenureYears * 12;

  let emi = 0;
  if (monthlyRate === 0) {
    emi = principal / tenureMonths;
  } else {
    emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
      (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  }

  const totalPayment = emi * tenureMonths;
  const totalInterest = totalPayment - principal;

  return {
    principal,
    interestRate: annualInterestRate,
    tenureMonths,
    emi: Math.round(emi),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
  };
}

export function calculateMaxEMI(monthlyIncome: number): number {
  return Math.round(monthlyIncome * 0.4);
}

export function calculateMaxLoanAmount(
  monthlyIncome: number,
  annualInterestRate: number,
  tenureYears: number
): number {
  const maxEMI = calculateMaxEMI(monthlyIncome);
  const monthlyRate = annualInterestRate / 100 / 12;
  const tenureMonths = tenureYears * 12;

  if (monthlyRate === 0) {
    return maxEMI * tenureMonths;
  }

  const principal =
    (maxEMI * (Math.pow(1 + monthlyRate, tenureMonths) - 1)) /
    (monthlyRate * Math.pow(1 + monthlyRate, tenureMonths));

  return Math.round(principal);
}
