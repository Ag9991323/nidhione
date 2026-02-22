import axios from 'axios';
import prisma from '../config/database';

// Using GoldAPI.io for live gold prices
// Free tier: 500 requests/month (sufficient with daily caching)
// Alternative: https://www.goldapi.io (requires API key in .env: GOLD_API_KEY)
const GOLD_API_URL = 'https://www.goldapi.io/api/XAU/INR'; // Gold in INR
const FALLBACK_GOLD_PRICE = 7300; // Fallback price per gram in INR (24K) - Updated Jan 2026

export interface GoldPrice {
  price24K: number; // Price per gram for 24K gold in INR
  price22K: number; // Price per gram for 22K gold in INR
  price18K: number; // Price per gram for 18K gold in INR
  timestamp: Date;
}

/**
 * Calculate gold price based on purity
 */
function calculatePriceByPurity(price24K: number, purity: string): number {
  const purityMap: Record<string, number> = {
    '24K': 1.0,
    '22K': 22/24,
    '18K': 18/24,
    '14K': 14/24,
  };
  
  return price24K * (purityMap[purity] || 1.0);
}

/**
 * Get today's date at midnight (for DB lookup)
 */
function getTodayDate(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Fetch live gold price from API and store in DB (daily caching)
 * Only makes 1 API call per day for all users
 */
export async function getLiveGoldPrice(): Promise<GoldPrice> {
  const today = getTodayDate();

  try {
    // Step 1: Check if price exists in DB for today
    const existingPrice = await prisma.dailyGoldPrice.findUnique({
      where: { date: today },
    });

    if (existingPrice) {
      // Return price from DB if already fetched today
      return {
        price24K: existingPrice.price24K,
        price22K: existingPrice.price22K,
        price18K: existingPrice.price18K,
        timestamp: existingPrice.createdAt,
      };
    }

    // Step 2: Price not in DB, fetch from API
    let goldPricePerGram = FALLBACK_GOLD_PRICE;
    let source = 'fallback';

    try {
      const response = await axios.get(GOLD_API_URL, {
        headers: {
          'x-access-token': process.env.GOLD_API_KEY || '',
        },
        timeout: 5000,
      });

      console.log('Gold API Response:', JSON.stringify(response.data, null, 2));

      // GoldAPI.io returns price per troy ounce, convert to grams
      // 1 troy ounce = 31.1035 grams
      const pricePerOunce = response.data?.price || 0;
      console.log('Price per ounce:', pricePerOunce);
      
      if (pricePerOunce > 0) {
        goldPricePerGram = pricePerOunce / 31.1035;
        console.log('Price per gram (calculated):', goldPricePerGram);
        source = 'api';
      }
    } catch (apiError) {
      console.error('Error fetching gold price from API:', apiError);
      // Continue with fallback price
    }

    // Step 3: Store in DB for today
    const price24K = goldPricePerGram;
    const price22K = calculatePriceByPurity(goldPricePerGram, '22K');
    const price18K = calculatePriceByPurity(goldPricePerGram, '18K');

    const savedPrice = await prisma.dailyGoldPrice.create({
      data: {
        date: today,
        price24K,
        price22K,
        price18K,
        source,
      },
    });

    return {
      price24K: savedPrice.price24K,
      price22K: savedPrice.price22K,
      price18K: savedPrice.price18K,
      timestamp: savedPrice.createdAt,
    };
  } catch (error) {
    console.error('Error in getLiveGoldPrice:', error);
    
    // Last resort: return fallback prices without DB
    return {
      price24K: FALLBACK_GOLD_PRICE,
      price22K: calculatePriceByPurity(FALLBACK_GOLD_PRICE, '22K'),
      price18K: calculatePriceByPurity(FALLBACK_GOLD_PRICE, '18K'),
      timestamp: new Date(),
    };
  }
}

/**
 * Get gold price for specific purity
 */
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

/**
 * Calculate current value for physical/digital gold
 */
export async function calculateGoldValue(grams: number, purity: string = '24K'): Promise<number> {
  const pricePerGram = await getGoldPriceByPurity(purity);
  return grams * pricePerGram;
}
