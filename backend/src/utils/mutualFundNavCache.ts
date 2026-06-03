import prisma from '../config/database';
import { getNAVBySchemeCode } from './amfiAPI';

function isFreshToday(updatedAt: Date): boolean {
  return updatedAt.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
}

export async function getDailyMutualFundNav(schemeCode: string): Promise<number | null> {
  const existing = await prisma.dailyMutualFundNav.findUnique({ where: { schemeCode } });
  if (existing && isFreshToday(existing.updatedAt)) return existing.nav;

  const nav = await getNAVBySchemeCode(schemeCode);
  if (nav == null) return null;

  await prisma.dailyMutualFundNav.upsert({
    where: { schemeCode },
    update: { nav, source: 'api' },
    create: { schemeCode, nav, source: 'api' },
  });
  return nav;
}
