import prisma from '../config/database';

function getFirstDayOfMonth(): Date {
  const now = new Date();
  // Use local year/month with Date.UTC so Prisma stores the correct date.
  // setHours(0,0,0,0) gives local midnight which is the previous day in UTC for IST (+5:30).
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
}

async function computeSnapshot(userId: string) {
  const [
    stocks,
    mutualFunds,
    bankAccounts,
    fixedDeposits,
    recurringDeposits,
    bonds,
    ppfAccounts,
    npsAccounts,
    gold,
    realEstate,
    epfAccounts,
    crypto,
    liabilities,
  ] = await Promise.all([
    prisma.stock.findMany({ where: { userId } }),
    prisma.mutualFund.findMany({ where: { userId } }),
    prisma.bankAccount.findMany({ where: { userId } }),
    prisma.fixedDeposit.findMany({ where: { userId } }),
    prisma.recurringDeposit.findMany({ where: { userId } }),
    prisma.bond.findMany({ where: { userId } }),
    prisma.pPF.findMany({ where: { userId } }),
    prisma.nPS.findMany({ where: { userId } }),
    prisma.gold.findMany({ where: { userId } }),
    prisma.realEstate.findMany({ where: { userId } }),
    prisma.ePF.findMany({ where: { userId } }),
    prisma.crypto.findMany({ where: { userId } }),
    prisma.liability.findMany({ where: { userId } }),
  ]);

  const breakdown = {
    stocks: stocks.reduce((s: number, x: any) => s + (x.currentValue || x.investedAmount), 0),
    mutualFunds: mutualFunds.reduce(
      (s: number, x: any) => s + (x.currentValue || x.investedAmount),
      0,
    ),
    bankAccounts: bankAccounts.reduce((s: number, x: any) => s + x.balance, 0),
    fixedDeposits: fixedDeposits.reduce((s: number, x: any) => s + x.amount, 0),
    recurringDeposits: recurringDeposits.reduce((s: number, x: any) => s + x.maturityAmount, 0),
    bonds: bonds.reduce((s: number, x: any) => s + (x.currentValue || x.faceValue * x.units), 0),
    ppf: ppfAccounts.reduce((s: number, x: any) => s + x.balance, 0),
    nps: npsAccounts.reduce((s: number, x: any) => s + x.balance, 0),
    gold: gold.reduce(
      (s: number, x: any) =>
        s + (x.currentValue || (x.quantityGrams || 0) * (x.averagePricePerGram || 0)),
      0,
    ),
    realEstate: realEstate.reduce(
      (s: number, x: any) => s + (x.currentValue || x.purchasePrice),
      0,
    ),
    epf: epfAccounts.reduce((s: number, x: any) => s + x.balance, 0),
    crypto: crypto.reduce(
      (s: number, x: any) => s + (x.currentValue || x.quantity * x.averagePrice),
      0,
    ),
  };

  const totalAssets = Object.values(breakdown).reduce((s, v) => s + v, 0);
  const totalLiabilities = liabilities.reduce((s: number, x: any) => s + x.currentBalance, 0);
  const netWorth = totalAssets - totalLiabilities;

  return { netWorth, totalAssets, totalLiabilities, breakdown };
}

// Always upserts the current month snapshot so it stays fresh.
// Past month snapshots are never touched — only the current month's record is updated.
export async function syncCurrentMonthSnapshot(userId: string): Promise<void> {
  const snapshotDate = getFirstDayOfMonth();
  const { netWorth, totalAssets, totalLiabilities, breakdown } = await computeSnapshot(userId);

  await prisma.trackRecord.upsert({
    where: { userId_snapshotDate: { userId, snapshotDate } },
    create: { userId, snapshotDate, netWorth, totalAssets, totalLiabilities, breakdown },
    update: { netWorth, totalAssets, totalLiabilities, breakdown },
  });
}
