import axios from 'axios';
import prisma from '../config/database';

const GOLD_API_URL = 'https://www.goldapi.io/api/XAU/INR';
const FALLBACK_GOLD_PRICE = 7300; // per gram, 24K INR

export interface GoldPrice {
  price24K: number;
  price22K: number;
  price18K: number;
  timestamp: Date;
}

function calculatePriceByPurity(price24K: number, purity: string): number {
  const purityMap: Record<string, number> = {
    '24K': 1.0,
    '22K': 22 / 24,
    '18K': 18 / 24,
    '14K': 14 / 24,
  };
  return price24K * (purityMap[purity] || 1.0);
}

function isFreshToday(updatedAt: Date): boolean {
  return updatedAt.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
}

export async function getLiveGoldPrice(): Promise<GoldPrice> {
  try {
    const existing = await prisma.dailyGoldPrice.findUnique({
      where: { source: 'api' },
    });
    if (existing && isFreshToday(existing.updatedAt)) {
      return {
        price24K: existing.price24K,
        price22K: existing.price22K,
        price18K: existing.price18K,
        timestamp: existing.updatedAt,
      };
    }

    let goldPricePerGram = FALLBACK_GOLD_PRICE;
    let source = 'fallback';

    try {
      const response = await axios.get(GOLD_API_URL, {
        headers: {
          'x-access-token': process.env.GOLD_API_KEY || '',
        },
        timeout: 5000,
      });
      const pricePerOunce = response.data?.price || 0;
      if (pricePerOunce > 0) {
        goldPricePerGram = pricePerOunce / 31.1035;
        source = 'api';
      }
    } catch {
      // fall through to fallback price
    }

    const price24K = goldPricePerGram;
    const price22K = calculatePriceByPurity(goldPricePerGram, '22K');
    const price18K = calculatePriceByPurity(goldPricePerGram, '18K');

    const saved = await prisma.dailyGoldPrice.upsert({
      where: { source },
      update: { price24K, price22K, price18K },
      create: { price24K, price22K, price18K, source },
    });

    return {
      price24K: saved.price24K,
      price22K: saved.price22K,
      price18K: saved.price18K,
      timestamp: saved.updatedAt,
    };
  } catch (error) {
    console.error('Error in getLiveGoldPrice:', error);
    return {
      price24K: FALLBACK_GOLD_PRICE,
      price22K: calculatePriceByPurity(FALLBACK_GOLD_PRICE, '22K'),
      price18K: calculatePriceByPurity(FALLBACK_GOLD_PRICE, '18K'),
      timestamp: new Date(),
    };
  }
}

export async function getGoldPriceByPurity(purity: string): Promise<number> {
  const prices = await getLiveGoldPrice();
  switch (purity) {
    case '24K':
      return prices.price24K;
    case '22K':
      return prices.price22K;
    case '18K':
      return prices.price18K;
    default:
      return calculatePriceByPurity(prices.price24K, purity);
  }
}

export async function calculateGoldValue(grams: number, purity: string = '24K'): Promise<number> {
  return grams * (await getGoldPriceByPurity(purity));
}
