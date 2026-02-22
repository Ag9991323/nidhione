import prisma from '../config/database';
import { getNAVBySchemeCode } from './amfiAPI';

function getTodayDate(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Fetch daily mutual fund NAV from DB or API (caching, 1 call per scheme per day)
 */
export async function getDailyMutualFundNav(schemeCode: string): Promise<number | null> {
  const today = getTodayDate();
  // 1. Check if NAV exists in DB for today

  // Use correct Prisma model name: dailyMutualFundNav -> dailyMutualFundNav (should be DailyMutualFundNav)
  const existing = await prisma.dailyMutualFundNav.findUnique({
    where: { schemeCode_date: { schemeCode, date: today } },
  });
  if (existing) return existing.nav;

  // 2. Fetch from API
  const nav = await getNAVBySchemeCode(schemeCode);
  if (nav == null) return null;

  // 3. Store in DB using upsert to avoid race condition
  await prisma.dailyMutualFundNav.upsert({
    where: { schemeCode_date: { schemeCode, date: today } },
    update: { nav, source: 'api', updatedAt: new Date() },
    create: { schemeCode, date: today, nav, source: 'api' },
  });
  return nav;
}
