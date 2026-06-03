import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import prisma from '../config/database';
import { getMultipleStockPrices } from '../utils/yahooFinance';
import { calculateSimpleReturns } from '../utils/xirr';
import { getDailyMutualFundNav } from '../utils/mutualFundNavCache';
import { searchMutualFund } from '../utils/amfiAPI';

const stockImportSchema = z.object({
  symbol: z.string(),
  companyName: z.string(),
  exchange: z.enum(['NSE', 'BSE']),
  quantity: z.number().positive(),
  averagePrice: z.number().positive(),
  goalId: z.string().optional(),
});

const mfImportSchema = z.object({
  schemeCode: z.string().optional(),
  schemeName: z.string(),
  amcName: z.string().optional(),
  units: z.number().positive(),
  averageNav: z.number().positive(),
  goalId: z.string().optional(),
});

const importSchema = z.object({
  stocks: z.array(stockImportSchema).optional(),
  mutualFunds: z.array(mfImportSchema).optional(),
});

async function resolveSchemeCode(schemeName: string) {
  const results = await searchMutualFund(schemeName);
  if (!results.length) return null;
  const exact = results.find(r => r.schemeName.toLowerCase() === schemeName.trim().toLowerCase());
  return exact || results[0];
}

export async function importHoldings(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const payload = importSchema.parse(request.body);

    const stocks = payload.stocks || [];
    const mutualFunds = payload.mutualFunds || [];

    const errors: Array<{ type: 'stock' | 'mutualFund'; index: number; message: string }> = [];

    const symbols = Array.from(new Set(stocks.map(s => s.symbol)));
    const priceMap = symbols.length
      ? await getMultipleStockPrices(symbols)
      : new Map<string, number>();

    let createdStocks = 0;
    for (let i = 0; i < stocks.length; i += 1) {
      const stock = stocks[i];
      try {
        const currentPrice = priceMap.get(stock.symbol) ?? null;
        const investedAmount = stock.quantity * stock.averagePrice;
        const currentValue = currentPrice ? stock.quantity * currentPrice : investedAmount;
        const { returns, returnsPercentage } = calculateSimpleReturns(investedAmount, currentValue);

        await prisma.stock.create({
          data: {
            userId,
            symbol: stock.symbol,
            companyName: stock.companyName,
            exchange: stock.exchange,
            quantity: stock.quantity,
            averagePrice: stock.averagePrice,
            currentPrice,
            investedAmount,
            currentValue,
            returns,
            returnsPercentage,
            goalId: stock.goalId,
            lastUpdated: currentPrice ? new Date() : null,
          },
        });
        createdStocks += 1;
      } catch (error) {
        errors.push({ type: 'stock', index: i, message: 'Failed to import stock row' });
      }
    }

    let createdMFs = 0;
    for (let i = 0; i < mutualFunds.length; i += 1) {
      const mf = mutualFunds[i];
      try {
        let schemeCode = mf.schemeCode;
        let schemeName = mf.schemeName;
        const amcName = mf.amcName;

        if (!schemeCode) {
          const resolved = await resolveSchemeCode(mf.schemeName);
          if (!resolved) {
            errors.push({ type: 'mutualFund', index: i, message: 'Scheme code not found' });
            continue;
          }
          schemeCode = resolved.schemeCode;
          schemeName = resolved.schemeName;
        }

        const currentNav = await getDailyMutualFundNav(schemeCode);
        const investedAmount = mf.units * mf.averageNav;
        const currentValue = currentNav ? mf.units * currentNav : investedAmount;
        const { returns, returnsPercentage } = calculateSimpleReturns(investedAmount, currentValue);

        await prisma.mutualFund.create({
          data: {
            userId,
            schemeCode,
            schemeName,
            amcName,
            units: mf.units,
            averageNav: mf.averageNav,
            currentNav,
            investedAmount,
            currentValue,
            returns,
            returnsPercentage,
            goalId: mf.goalId,
            lastUpdated: currentNav ? new Date() : null,
          },
        });
        createdMFs += 1;
      } catch (error) {
        errors.push({ type: 'mutualFund', index: i, message: 'Failed to import mutual fund row' });
      }
    }

    return reply.send({
      created: { stocks: createdStocks, mutualFunds: createdMFs },
      errors,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ error: error.errors });
    }
    console.error('Import holdings error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}
