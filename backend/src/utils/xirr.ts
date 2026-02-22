export function calculateXIRR(transactions: { date: Date; amount: number }[]): number {
  // Simple XIRR calculation using Newton-Raphson method
  // For MVP, we'll use a simplified version
  
  if (transactions.length < 2) return 0;
  
  const sortedTransactions = transactions.sort((a, b) => a.date.getTime() - b.date.getTime());
  const firstDate = sortedTransactions[0].date;
  
  // Newton-Raphson method to find IRR
  let rate = 0.1; // Initial guess 10%
  const maxIterations = 100;
  const tolerance = 0.0001;
  
  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let derivative = 0;
    
    for (const txn of sortedTransactions) {
      const years = (txn.date.getTime() - firstDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      const factor = Math.pow(1 + rate, years);
      npv += txn.amount / factor;
      derivative -= (years * txn.amount) / (factor * (1 + rate));
    }
    
    const newRate = rate - npv / derivative;
    
    if (Math.abs(newRate - rate) < tolerance) {
      return newRate * 100; // Return as percentage
    }
    
    rate = newRate;
  }
  
  return rate * 100;
}

export function calculateSimpleReturns(investedAmount: number, currentValue: number): {
  returns: number;
  returnsPercentage: number;
} {
  const returns = currentValue - investedAmount;
  const returnsPercentage = (returns / investedAmount) * 100;
  
  return {
    returns,
    returnsPercentage,
  };
}
