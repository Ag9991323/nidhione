/**
 * Calculate current value of a Recurring Deposit as of today
 * Current value includes:
 * - Principal deposited so far
 * - Interest accrued on those deposits till today
 *
 * @param startDate - When RD was started
 * @param monthlyAmount - Monthly deposit amount
 * @param interestRate - Annual interest rate (%)
 * @param tenure - Total tenure in months
 * @returns Current value of the RD
 */
export function calculateCurrentRDValue(
  startDate: Date,
  monthlyAmount: number,
  interestRate: number,
  tenure: number,
): number {
  const today = new Date();

  // If start date is in the future, current value is 0
  if (startDate > today) {
    return 0;
  }

  // Calculate months passed since start date
  const diffTime = today.getTime() - startDate.getTime();
  const daysPassed = diffTime / (1000 * 60 * 60 * 24);
  const monthsPassed = Math.floor(daysPassed / 30.44); // Average days per month

  // If tenure is complete, return maturity amount
  const monthsRemaining = tenure - monthsPassed;
  if (monthsRemaining <= 0) {
    // RD has matured, calculate maturity amount
    const n = tenure;
    const r = interestRate;
    const P = monthlyAmount;
    return P * n + (P * n * (n + 1) * r) / (2 * 12 * 100);
  }

  // Calculate current value for ongoing RD
  // Using RD formula for partial period
  const n = monthsPassed; // Number of months completed
  const r = interestRate;
  const P = monthlyAmount;

  // Current value = Principal deposited + Interest accrued
  const principalDeposited = P * n;

  // Interest accrued using RD formula: P * n * (n + 1) * r / (2 * 12 * 100)
  const interestAccrued = (P * n * (n + 1) * r) / (2 * 12 * 100);

  return principalDeposited + interestAccrued;
}

/**
 * Calculate maturity amount of a Recurring Deposit
 *
 * @param monthlyAmount - Monthly deposit amount
 * @param interestRate - Annual interest rate (%)
 * @param tenure - Total tenure in months
 * @returns Maturity amount at the end of tenure
 */
export function calculateMaturityAmount(
  monthlyAmount: number,
  interestRate: number,
  tenure: number,
): number {
  const n = tenure;
  const r = interestRate;
  const P = monthlyAmount;

  // RD Maturity Amount = P * n + P * n * (n + 1) * r / (2 * 12 * 100)
  return P * n + (P * n * (n + 1) * r) / (2 * 12 * 100);
}
