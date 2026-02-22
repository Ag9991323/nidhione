import prisma from '../config/database';
import { getStockPrice } from './yahooFinance';

/**
 * Get today's date at midnight (for DB lookup)
 */
function getTodayDate(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Fetch daily stock price from DB or API (caching, 1 call per stock per day)
 */
export async function getDailyStockPrice(symbol: string): Promise<number | null> {
  const today = getTodayDate();
  // 1. Check if price exists in DB for today
  const existing = await prisma.dailyStockPrice.findUnique({
    where: { symbol_date: { symbol, date: today } },
  });
  if (existing) return existing.price;

  // 2. Fetch from API
  const price = await getStockPrice(symbol);
  if (price == null) return null;

  // 3. Store in DB using upsert to avoid race condition
  await prisma.dailyStockPrice.upsert({
    where: { symbol_date: { symbol, date: today } },
    update: { price, source: 'api', updatedAt: new Date() },
    create: { symbol, date: today, price, source: 'api' },
  });
  return price;
}
