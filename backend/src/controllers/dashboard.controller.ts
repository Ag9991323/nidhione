import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../config/database';

export async function getDashboard(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;

    // Get all assets and liabilities
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

    // Calculate totals
    const stocksTotal = stocks.reduce(
      (sum: number, s: any) => sum + (s.currentValue || s.investedAmount),
      0,
    );
    const mfTotal = mutualFunds.reduce(
      (sum: number, m: any) => sum + (m.currentValue || m.investedAmount),
      0,
    );
    const bankTotal = bankAccounts.reduce((sum: number, b: any) => sum + b.balance, 0);
    const fdTotal = fixedDeposits.reduce((sum: number, f: any) => sum + f.amount, 0);
    const rdTotal = recurringDeposits.reduce((sum: number, r: any) => sum + r.maturityAmount, 0);
    const bondsTotal = bonds.reduce(
      (sum: number, b: any) => sum + (b.currentValue || b.faceValue * b.units),
      0,
    );
    // const licTotal = licPolicies.reduce((sum: number, l: any) => sum + (l.currentValue || l.sumAssured), 0); // LIC model not present
    const ppfTotal = ppfAccounts.reduce((sum: number, p: any) => sum + p.balance, 0);
    const npsTotal = npsAccounts.reduce((sum: number, n: any) => sum + n.balance, 0);
    const goldTotal = gold.reduce(
      (sum: number, g: any) =>
        sum + (g.currentValue || (g.quantityGrams || 0) * (g.averagePricePerGram || 0)),
      0,
    );
    const realEstateTotal = realEstate.reduce(
      (sum: number, r: any) => sum + (r.currentValue || r.purchasePrice),
      0,
    );
    const epfTotal = epfAccounts.reduce((sum: number, e: any) => sum + e.balance, 0);
    const cryptoTotal = crypto.reduce(
      (sum: number, c: any) => sum + (c.currentValue || c.quantity * c.averagePrice),
      0,
    );

    // Calculate liabilities
    const totalLiabilities = liabilities.reduce((sum: number, l: any) => sum + l.currentBalance, 0);

    const totalAssets =
      stocksTotal +
      mfTotal +
      bankTotal +
      fdTotal +
      rdTotal +
      bondsTotal +
      ppfTotal +
      npsTotal +
      goldTotal +
      realEstateTotal +
      epfTotal +
      cryptoTotal;
    const totalPortfolioValue = totalAssets - totalLiabilities; // Net worth = Assets - Liabilities

    // Calculate total invested
    const stocksInvested = stocks.reduce((sum: number, s: any) => sum + s.investedAmount, 0);
    const mfInvested = mutualFunds.reduce((sum: number, m: any) => sum + m.investedAmount, 0);
    const totalInvested = stocksInvested + mfInvested + fdTotal + ppfTotal + npsTotal + epfTotal;

    // Calculate total returns
    const stocksReturns = stocks.reduce((sum: number, s: any) => sum + (s.returns || 0), 0);
    const mfReturns = mutualFunds.reduce((sum: number, m: any) => sum + (m.returns || 0), 0);
    const totalReturns = stocksReturns + mfReturns;
    const totalReturnsPercentage = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

    return reply.send({
      totalPortfolioValue,
      totalAssets,
      totalLiabilities,
      totalInvested,
      totalReturns,
      totalReturnsPercentage,
      stocksValue: stocksTotal,
      mutualFundsValue: mfTotal,
      fixedDepositsValue: fdTotal,
      epfValue: epfTotal,
      cryptoValue: cryptoTotal,
      // licValue: licTotal, // LIC model not present
      assetCounts: {
        stocks: stocks.length,
        mutualFunds: mutualFunds.length,
        bankAccounts: bankAccounts.length,
        fixedDeposits: fixedDeposits.length,
        recurringDeposits: recurringDeposits.length,
        bonds: bonds.length,
        // licPolicies: licPolicies.length, // LIC model not present
        ppfAccounts: ppfAccounts.length,
        npsAccounts: npsAccounts.length,
        gold: gold.length,
        realEstate: realEstate.length,
        epfAccounts: epfAccounts.length,
        crypto: crypto.length,
        liabilities: liabilities.length,
      },
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function getAssetAllocation(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;

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
    ]);

    const allocation = [
      {
        name: 'Stocks',
        value: stocks.reduce(
          (sum: number, s: any) => sum + (s.currentValue || s.investedAmount),
          0,
        ),
      },
      {
        name: 'Mutual Funds',
        value: mutualFunds.reduce(
          (sum: number, m: any) => sum + (m.currentValue || m.investedAmount),
          0,
        ),
      },
      {
        name: 'Bank Accounts',
        value: bankAccounts.reduce((sum: number, b: any) => sum + b.balance, 0),
      },
      {
        name: 'Fixed Deposits',
        value: fixedDeposits.reduce((sum: number, f: any) => sum + f.amount, 0),
      },
      {
        name: 'Recurring Deposits',
        value: recurringDeposits.reduce((sum: number, r: any) => sum + r.maturityAmount, 0),
      },
      {
        name: 'Bonds',
        value: bonds.reduce(
          (sum: number, b: any) => sum + (b.currentValue || b.faceValue * b.units),
          0,
        ),
      },
      // { name: 'LIC', value: licPolicies.reduce((sum: number, l: any) => sum + (l.currentValue || l.sumAssured), 0) }, // LIC model not present
      { name: 'PPF', value: ppfAccounts.reduce((sum: number, p: any) => sum + p.balance, 0) },
      { name: 'NPS', value: npsAccounts.reduce((sum: number, n: any) => sum + n.balance, 0) },
      {
        name: 'Gold',
        value: gold.reduce(
          (sum: number, g: any) =>
            sum + (g.currentValue || (g.quantityGrams || 0) * (g.averagePricePerGram || 0)),
          0,
        ),
      },
      {
        name: 'Real Estate',
        value: realEstate.reduce(
          (sum: number, r: any) => sum + (r.currentValue || r.purchasePrice),
          0,
        ),
      },
      { name: 'EPF', value: epfAccounts.reduce((sum: number, e: any) => sum + e.balance, 0) },
      {
        name: 'Crypto',
        value: crypto.reduce(
          (sum: number, c: any) => sum + (c.currentValue || c.quantity * c.averagePrice),
          0,
        ),
      },
    ].filter(item => item.value > 0);

    return reply.send({ allocation });
  } catch (error) {
    console.error('Get asset allocation error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function getPerformance(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;

    const [
      stocks,
      mutualFunds,
      fixedDeposits,
      epfAccounts,
      crypto,
      realEstate,
      gold,
      ppfAccounts,
      npsAccounts,
    ] = await Promise.all([
      prisma.stock.findMany({ where: { userId } }),
      prisma.mutualFund.findMany({ where: { userId } }),
      prisma.fixedDeposit.findMany({ where: { userId } }),
      prisma.ePF.findMany({ where: { userId } }),
      prisma.crypto.findMany({ where: { userId } }),
      prisma.realEstate.findMany({ where: { userId } }),
      prisma.gold.findMany({ where: { userId } }),
      prisma.pPF.findMany({ where: { userId } }),
      prisma.nPS.findMany({ where: { userId } }),
    ]);

    const performance = [
      {
        name: 'Stocks',
        invested: stocks.reduce((sum: number, s: any) => sum + s.investedAmount, 0),
        current: stocks.reduce(
          (sum: number, s: any) => sum + (s.currentValue || s.investedAmount),
          0,
        ),
        returns: stocks.reduce((sum: number, s: any) => sum + (s.returns || 0), 0),
        returnsPercentage:
          stocks.length > 0
            ? stocks.reduce((sum: number, s: any) => sum + (s.returnsPercentage || 0), 0) /
              stocks.length
            : 0,
      },
      {
        name: 'Mutual Funds',
        invested: mutualFunds.reduce((sum: number, m: any) => sum + m.investedAmount, 0),
        current: mutualFunds.reduce(
          (sum: number, m: any) => sum + (m.currentValue || m.investedAmount),
          0,
        ),
        returns: mutualFunds.reduce((sum: number, m: any) => sum + (m.returns || 0), 0),
        returnsPercentage:
          mutualFunds.length > 0
            ? mutualFunds.reduce((sum: number, m: any) => sum + (m.returnsPercentage || 0), 0) /
              mutualFunds.length
            : 0,
      },
      {
        name: 'Crypto',
        invested: crypto.reduce((sum: number, c: any) => sum + c.quantity * c.averagePrice, 0),
        current: crypto.reduce(
          (sum: number, c: any) => sum + (c.currentValue || c.quantity * c.averagePrice),
          0,
        ),
        returns: crypto.reduce((sum: number, c: any) => {
          const invested = c.quantity * c.averagePrice;
          const current = c.currentValue || invested;
          return sum + (current - invested);
        }, 0),
        returnsPercentage:
          crypto.length > 0
            ? crypto.reduce((sum: number, c: any) => {
                const invested = c.quantity * c.averagePrice;
                const current = c.currentValue || invested;
                return sum + (invested > 0 ? ((current - invested) / invested) * 100 : 0);
              }, 0) / crypto.length
            : 0,
      },
      {
        name: 'Real Estate',
        invested: realEstate.reduce((sum: number, r: any) => sum + r.purchasePrice, 0),
        current: realEstate.reduce(
          (sum: number, r: any) => sum + (r.currentValue || r.purchasePrice),
          0,
        ),
        returns: realEstate.reduce((sum: number, r: any) => {
          const current = r.currentValue || r.purchasePrice;
          return sum + (current - r.purchasePrice);
        }, 0),
        returnsPercentage:
          realEstate.length > 0
            ? realEstate.reduce((sum: number, r: any) => {
                const current = r.currentValue || r.purchasePrice;
                return (
                  sum +
                  (r.purchasePrice > 0 ? ((current - r.purchasePrice) / r.purchasePrice) * 100 : 0)
                );
              }, 0) / realEstate.length
            : 0,
      },
      {
        name: 'Gold',
        invested: gold.reduce(
          (sum: number, g: any) => sum + (g.quantityGrams || 0) * (g.averagePricePerGram || 0),
          0,
        ),
        current: gold.reduce(
          (sum: number, g: any) =>
            sum + (g.currentValue || (g.quantityGrams || 0) * (g.averagePricePerGram || 0)),
          0,
        ),
        returns: gold.reduce((sum: number, g: any) => {
          const invested = (g.quantityGrams || 0) * (g.averagePricePerGram || 0);
          const current = g.currentValue || invested;
          return sum + (current - invested);
        }, 0),
        returnsPercentage:
          gold.length > 0
            ? gold.reduce((sum: number, g: any) => {
                const invested = (g.quantityGrams || 0) * (g.averagePricePerGram || 0);
                const current = g.currentValue || invested;
                return sum + (invested > 0 ? ((current - invested) / invested) * 100 : 0);
              }, 0) / gold.length
            : 0,
      },
      {
        name: 'Fixed Deposits',
        invested: fixedDeposits.reduce((sum: number, f: any) => sum + f.amount, 0),
        current: fixedDeposits.reduce((sum: number, f: any) => sum + f.amount, 0),
        returns: 0,
        returnsPercentage: 0,
      },
      {
        name: 'EPF',
        invested: epfAccounts.reduce((sum: number, e: any) => sum + e.balance, 0),
        current: epfAccounts.reduce((sum: number, e: any) => sum + e.balance, 0),
        returns: 0,
        returnsPercentage: 0,
      },
      {
        name: 'PPF',
        invested: ppfAccounts.reduce((sum: number, p: any) => sum + p.balance, 0),
        current: ppfAccounts.reduce((sum: number, p: any) => sum + p.balance, 0),
        returns: 0,
        returnsPercentage: 0,
      },
      {
        name: 'NPS',
        invested: npsAccounts.reduce((sum: number, n: any) => sum + n.balance, 0),
        current: npsAccounts.reduce((sum: number, n: any) => sum + n.balance, 0),
        returns: 0,
        returnsPercentage: 0,
      },
    ].filter(item => item.invested > 0 || item.current > 0);

    return reply.send({ performance });
  } catch (error) {
    console.error('Get performance error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}
