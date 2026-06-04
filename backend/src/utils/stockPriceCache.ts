import prisma from '../config/database';
import { getStockPrice } from './yahooFinance';

function isFreshToday(updatedAt: Date): boolean {
  return updatedAt.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
}

export async function warmStockPriceCache(prices: Map<string, number>): Promise<void> {
  await Promise.all(
    Array.from(prices.entries()).map(([symbol, price]) =>
      prisma.dailyStockPrice.upsert({
        where: { symbol },
        update: { price, source: 'api' },
        create: { symbol, price, source: 'api' },
      }),
    ),
  );
}

export async function getDailyStockPrice(symbol: string): Promise<number | null> {
  const existing = await prisma.dailyStockPrice.findUnique({ where: { symbol } });
  if (existing && isFreshToday(existing.updatedAt)) return existing.price;

  const price = await getStockPrice(symbol);
  if (price == null) return null;

  await prisma.dailyStockPrice.upsert({
    where: { symbol },
    update: { price, source: 'api' },
    create: { symbol, price, source: 'api' },
  });
  return price;
}
