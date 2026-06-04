import cron from 'node-cron';
import prisma from '../config/database';
import { getMultipleStockPrices } from '../utils/yahooFinance';
import { warmStockPriceCache } from '../utils/stockPriceCache';
import { fetchAllNAVs } from '../utils/amfiAPI';
import { getGoldPriceByPurity } from '../utils/goldAPI';
import { calculateSimpleReturns } from '../utils/xirr';
import { config } from '../config';
import type { Stock, MutualFund, Gold } from '@prisma/client';

export function startPriceUpdateCron() {
  console.log('Starting price update cron job...');
  cron.schedule(config.cron.priceUpdate, async () => {
    console.log('Running price update job...');
    try {
      // Update stock prices
      await updateStockPrices();
      // Update mutual fund NAVs
      await updateMutualFundNAVs();
      // Update gold prices
      await updateGoldPrices();
      console.log('Price update completed successfully');
    } catch (error) {
      console.error('Error in price update cron:', error);
    }
  });
}

async function updateStockPrices() {
  try {
    const stocks = await prisma.stock.findMany();
    if (stocks.length === 0) return;

    const symbols = [...new Set(stocks.map((s: Stock) => s.symbol))];
    const priceMap = await getMultipleStockPrices(symbols as string[]);

    const updatePromises = stocks.map(async (stock: Stock) => {
      const currentPrice = priceMap.get(stock.symbol);
      if (currentPrice) {
        const currentValue = stock.quantity * currentPrice;
        const { returns, returnsPercentage } = calculateSimpleReturns(
          stock.investedAmount,
          currentValue,
        );
        await prisma.stock.update({
          where: { id: stock.id },
          data: {
            currentPrice,
            currentValue,
            returns,
            returnsPercentage,
            lastUpdated: new Date(),
          },
        });
      }
    });

    await Promise.all(updatePromises);

    // Also warm the daily cache so portfolio views don't hit Yahoo again today
    await warmStockPriceCache(priceMap);

    console.log(`Updated ${stocks.length} stock prices`);
  } catch (error) {
    console.error('Error updating stock prices:', error);
  }
}

async function updateMutualFundNAVs() {
  try {
    const mutualFunds = await prisma.mutualFund.findMany();
    if (mutualFunds.length === 0) return;

    const navMap = await fetchAllNAVs();

    const updatePromises = mutualFunds.map(async (mf: MutualFund) => {
      const navData = navMap.get(mf.schemeCode);
      if (navData) {
        const currentValue = mf.units * navData.nav;
        const { returns, returnsPercentage } = calculateSimpleReturns(
          mf.investedAmount,
          currentValue,
        );
        await prisma.mutualFund.update({
          where: { id: mf.id },
          data: {
            currentNav: navData.nav,
            currentValue,
            returns,
            returnsPercentage,
            lastUpdated: new Date(),
          },
        });
      }
    });

    await Promise.all(updatePromises);
    console.log(`Updated ${mutualFunds.length} mutual fund NAVs`);
  } catch (error) {
    console.error('Error updating mutual fund NAVs:', error);
  }
}

async function updateGoldPrices() {
  try {
    const goldAssets = await prisma.gold.findMany();
    if (goldAssets.length === 0) return;

    // Update physical and digital gold prices
    const physicalDigitalGold = goldAssets.filter(
      (g: Gold) => g.type === 'physical' || g.type === 'digital',
    );
    const goldETFs = goldAssets.filter((g: Gold) => g.type === 'etf');

    // Update physical/digital gold prices
    const physicalDigitalPromises = physicalDigitalGold.map(async (gold: Gold) => {
      const goldData = gold as any;
      if (gold.quantityGrams && goldData.purity) {
        const currentPricePerGram = await getGoldPriceByPurity(goldData.purity);
        const currentValue = gold.quantityGrams * currentPricePerGram;
        await prisma.gold.update({
          where: { id: gold.id },
          data: {
            currentPricePerGram,
            currentValue,
            lastUpdated: new Date(),
          },
        });
      }
    });

    // Update Gold ETF prices using Yahoo Finance
    const etfSymbols = goldETFs
      .filter((g: Gold) => (g as any).schemeCode)
      .map((g: Gold) => (g as any).schemeCode!);

    let etfPriceMap = new Map<string, number>();
    if (etfSymbols.length > 0) {
      etfPriceMap = await getMultipleStockPrices(etfSymbols);
    }

    const etfPromises = goldETFs.map(async (gold: Gold) => {
      const goldData = gold as any;
      if (goldData.schemeCode && goldData.units) {
        const currentNav = etfPriceMap.get(goldData.schemeCode);
        if (currentNav) {
          const currentValue = goldData.units * currentNav;
          await prisma.gold.update({
            where: { id: gold.id },
            data: {
              currentValue,
              lastUpdated: new Date(),
            },
          });
        }
      }
    });

    await Promise.all([...physicalDigitalPromises, ...etfPromises]);
    console.log(
      `Updated ${goldAssets.length} gold prices (${physicalDigitalGold.length} physical/digital, ${goldETFs.length} ETFs)`,
    );
  } catch (error) {
    console.error('Error updating gold prices:', error);
  }
}
